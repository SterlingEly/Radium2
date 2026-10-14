var Settings = require('./config');

// ============================================================
// ENVIRONMENT FETCH -- Open-Meteo (free, no API key required)
//
// One location lookup, then two requests, then ONE AppMessage:
//   1. Forecast API:    temperature (C and F), WMO weather code, UV index,
//                       today's sunrise/sunset + tomorrow's sunrise (solar ring)
//   2. Air-quality API: US AQI (0-500)
//
// Called once on ready, then every 30 minutes. If either request fails the other's data is
// still sent. UV / AQI are simply omitted when unavailable; the watch hides them after 3h.
// Solar timestamps are Unix integers (int32-safe through 2038).
//
// Attribution: air-quality data is CAMS ENSEMBLE via Open-Meteo -- credit it in store/README copy.
// ============================================================
function getJSON(url, onOk, onFail) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function() {
    var data;
    try { data = JSON.parse(this.responseText); } catch (e) { onFail('parse: ' + e); return; }
    onOk(data);
  };
  xhr.onerror = function() { onFail('network error'); };
  xhr.open('GET', url);
  xhr.send();
}

function fetchEnvironment() {
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      var lat = pos.coords.latitude;
      var lon = pos.coords.longitude;
      var msg = {};
      var haveData = false;

      var forecastUrl = 'https://api.open-meteo.com/v1/forecast'
        + '?latitude='  + lat
        + '&longitude=' + lon
        + '&current=temperature_2m,weather_code,uv_index'
        + '&daily=sunrise,sunset'
        + '&temperature_unit=celsius'
        + '&timezone=auto'
        + '&forecast_days=2';

      var aqiUrl = 'https://air-quality-api.open-meteo.com/v1/air-quality'
        + '?latitude='  + lat
        + '&longitude=' + lon
        + '&current=us_aqi'
        + '&timezone=auto';

      function send() {
        if (!haveData) return;
        Pebble.sendAppMessage(msg, function() {
          console.log('Environment sent: ' + JSON.stringify(msg));
        }, function(e) {
          console.log('Environment send error: ' + e.error.message);
        });
      }

      function fetchAqi() {
        getJSON(aqiUrl, function(d) {
          if (d.current && d.current.us_aqi !== undefined && d.current.us_aqi !== null) {
            msg.AqiIndex = Math.round(d.current.us_aqi);
            haveData = true;
          }
          send();
        }, function(err) {
          console.log('AQI fetch error: ' + err);
          send();
        });
      }

      getJSON(forecastUrl, function(data) {
        try {
          // Current weather
          var tempC = Math.round(data.current.temperature_2m);
          msg.WeatherTempC = tempC;
          msg.WeatherTempF = Math.round(tempC * 9 / 5 + 32);
          msg.WeatherCode  = data.current.weather_code;
          haveData = true;

          // UV index (0 is a real reading; omit only when the API gave nothing)
          var uv = data.current.uv_index;
          if (uv !== undefined && uv !== null) msg.UvIndex = Math.round(uv);

          // Solar times -- Open-Meteo returns ISO strings like "2026-04-07T06:23".
          // JS Date parses these as local time, which matches timezone=auto.
          var daily = data.daily;
          if (daily && daily.sunrise && daily.sunset && daily.sunrise.length > 1) {
            var sunriseTime     = Math.round(new Date(daily.sunrise[0]).getTime() / 1000);
            var sunsetTime      = Math.round(new Date(daily.sunset[0]).getTime()  / 1000);
            var sunriseTomorrow = Math.round(new Date(daily.sunrise[1]).getTime() / 1000);
            if (sunriseTime > 0) {
              msg.SunriseTime     = sunriseTime;
              msg.SunsetTime      = sunsetTime;
              msg.SunriseTomorrow = sunriseTomorrow;
            }
          }
        } catch (err) {
          console.log('Forecast parse error: ' + err);
        }
        fetchAqi();
      }, function(err) {
        console.log('Forecast fetch error: ' + err);
        fetchAqi();
      });
    },
    function(err) {
      console.log('Geolocation error: ' + err.message);
    },
    { timeout: 15000, maximumAge: 300000 }
  );
}

// ============================================================
// PEBBLEKIT JS LIFECYCLE
// ============================================================
Pebble.addEventListener('ready', function() {
  console.log('PebbleKit JS ready');
  fetchEnvironment();
  // Refresh weather + solar + UV + AQI every 30 minutes
  setInterval(fetchEnvironment, 30 * 60 * 1000);
});

Pebble.addEventListener('showConfiguration', function() {
  // Detect platform to show the appropriate config UI.
  // 'aplite' -- B&W, no health
  // 'bw'     -- B&W with health (diorite, flint)
  // 'emery'  -- large overlay toggle (Pebble Time 2)
  // 'gabbro' -- large overlay toggle (Pebble Round 2)
  // 'color'  -- default (basalt, chalk -- chalk is the small original Time Round)
  var platform = 'color';
  try {
    if (Pebble.getActiveWatchInfo) {
      var info = Pebble.getActiveWatchInfo();
      var bwPlatforms = ['aplite', 'diorite', 'flint'];
      if (bwPlatforms.indexOf(info.platform) >= 0) {
        platform = (info.platform === 'aplite') ? 'aplite' : 'bw';
      } else if (info.platform === 'emery' || info.platform === 'gabbro') {
        platform = info.platform;  // large-overlay platforms
      }
    }
  } catch(e) {}
  var saved = localStorage.getItem('radium2_settings');
  Pebble.openURL(Settings.buildUrl(platform, saved ? JSON.parse(saved) : null));
});

Pebble.addEventListener('webviewclosed', function(e) {
  if (e.response && e.response !== 'CANCELLED') {
    var settings = JSON.parse(decodeURIComponent(e.response));
    localStorage.setItem('radium2_settings', JSON.stringify(settings));
    Pebble.sendAppMessage(settings, function() {
      console.log('Settings sent successfully');
    }, function(err) {
      console.log('Error sending settings: ' + err.error.message);
    });
  }
});
