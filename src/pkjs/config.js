module.exports = {
  buildUrl: function(platform, currentSettings) {

    // -------------------------------------------------------------------------
    // PRESET SCHEMA (v2.1b)
    // All 12 color slots defined per preset:
    //   bg, obg                    — base (background, overlay bg)
    //   timeText, dateText         — text
    //   litH, litM, litB, litS     — lit (hours, minutes, battery, steps)
    //   dimH, dimM, dimB, dimS     — unlit (hours, minutes, battery, steps)
    // -------------------------------------------------------------------------
    // Helper: build preset object. Standard patterns:
    //   std1: black bg, dark grey dim, single active color, white text
    //   std2: black bg, dark-color dim, light-color lit, white text
    //   std3: white bg, light grey dim, color lit, black text
    //   std4: white bg, light-color dim, dark-color lit, black text
    //   std5: color bg, light-match dim, white lit, white text
    function p(label, bg, obg, tt, dt, lH, lM, lB, lS, dH, dM, dB, dS) {
      return { label:label, bg:bg, obg:obg, timeText:tt, dateText:dt,
               litH:lH, litM:lM, litB:lB, litS:lS,
               dimH:dH, dimM:dM, dimB:dB, dimS:dS };
    }

    var presets = [
      // ---- DARK (8): black bg, single or paired active colors ----
      // Radium: brighter, more radioactive lime-green glow
      p('Radium',    '#000000','#000000','#ffffff','#aaffaa', '#55ff00','#55ff00','#55ff00','#55ff00', '#005500','#005500','#005500','#005500'),
      // Ember: warm orange, grey dim — the classic
      p('Ember',     '#000000','#000000','#ffffff','#aaaaaa', '#ff5500','#ff5500','#ff5500','#ff5500', '#555555','#555555','#555555','#555555'),
      // Cobalt: pure blue, grey dim
      p('Cobalt',    '#000000','#000000','#ffffff','#aaaaaa', '#0055ff','#0055ff','#0055ff','#0055ff', '#555555','#555555','#555555','#555555'),
      // Slate: neutral white/grey — understated, easy to read
      p('Slate',     '#000000','#000000','#ffffff','#aaaaaa', '#ffffff','#aaaaaa','#aaaaaa','#aaaaaa', '#555555','#555555','#555555','#555555'),
      // Radium+: pure green, deep green dim — deeper in the reactor
      p('Radium+',   '#000000','#000000','#ffffff','#55aa55', '#00ff00','#00ff00','#00ff00','#00ff00', '#005500','#005500','#005500','#005500'),
      // Crimson: the beloved red (kept exactly)
      p('Crimson',   '#000000','#000000','#ffffff','#aa5555', '#ff5555','#ff5555','#ff5555','#ff5555', '#550000','#550000','#550000','#550000'),
      // Ocean: cerulean blue, cobalt dim
      p('Ocean',     '#000000','#000000','#ffffff','#0055aa', '#00aaff','#00aaff','#00aaff','#00aaff', '#0055aa','#0055aa','#0055aa','#0055aa'),
      // Volt: electric yellow, dark yellow dim
      p('Volt',      '#000000','#000000','#ffffff','#aaaa55', '#ffff00','#ffff00','#ffff00','#ffff00', '#555500','#555500','#555500','#555500'),

      // ---- DARK+ (8): color theory pairs on black ----
      // Dusk: monochrome magenta/purple
      p('Dusk',      '#000000','#000000','#ffffff','#aa00aa', '#ff55ff','#ff55ff','#ff55ff','#ff55ff', '#550055','#550055','#550055','#550055'),
      // Horizon: complementary blue/orange — hours vs minutes
      p('Horizon',   '#000000','#0000aa','#ffaa55','#aaaaaa', '#0055ff','#ff5500','#0055aa','#aa5500', '#0000aa','#550000','#0000aa','#550000'),
      // Reactor: complementary cyan/red — high energy
      p('Reactor',   '#000000','#000000','#ffffff','#aaaaaa', '#00ffff','#ff0000','#00aaff','#ff5500', '#005555','#550000','#005555','#550000'),
      // Venom: complementary chartreuse/violet
      p('Venom',     '#000000','#000000','#ffffff','#aaaaaa', '#aaff00','#aa00ff','#55ff00','#5500aa', '#005500','#550055','#005500','#550055'),
      // Blossom: split-complementary — mint hours, rose minutes (flanks of red, base=green)
      p('Blossom',   '#000000','#000000','#ffffff','#aaaaaa', '#aaffaa','#ff55aa','#55ffaa','#ff0055', '#005500','#550055','#005500','#aa0055'),
      // Solar: analogous warm arc — orange→yellow→chartreuse across elements
      p('Solar',     '#000000','#000000','#ffffff','#ffaa00', '#ff5500','#ffaa00','#ffff00','#aaff00', '#550000','#555500','#555500','#005500'),
      // Aurora: analogous cool arc — cyan→springgreen→blue
      p('Aurora',    '#000000','#000000','#ffffff','#aaffff', '#00ffff','#00ff55','#00aaff','#aaffaa', '#005555','#005500','#005555','#005500'),
      // Neon: complementary green/magenta with cyan battery, pink steps
      p('Neon',      '#000000','#000000','#ffffff','#aaaaaa', '#00ff00','#ff00ff','#00ffff','#ff55ff', '#005500','#550055','#005555','#550055'),

      // ---- LIGHT (8): white/light bg ----
      // std3: white bg, light grey dim, dark/color active, black text
      p('Paper',     '#ffffff','#ffffff','#000000','#555555', '#000000','#000000','#000000','#000000', '#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa'),
      p('Jade',      '#ffffff','#ffffff','#000000','#555555', '#00aa55','#00aa55','#00aa55','#00aa55', '#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa'),
      p('Sapphire',  '#ffffff','#ffffff','#000000','#555555', '#0055aa','#0055aa','#0055aa','#0055aa', '#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa'),
      p('Ruby',      '#ffffff','#ffffff','#000000','#555555', '#aa0000','#aa0000','#aa0000','#aa0000', '#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa'),
      // std4: white bg, light-color dim, dark active, black text
      p('Mint',      '#ffffff','#ffffff','#000000','#005500', '#005500','#005500','#005500','#005500', '#aaffaa','#aaffaa','#aaffaa','#aaffaa'),
      p('Rose',      '#ffffff','#ffffff','#550000','#550000', '#550000','#550000','#550000','#550000', '#ffaaaa','#ffaaaa','#ffaaaa','#ffaaaa'),
      p('Sky',       '#ffffff','#ffffff','#000000','#0000aa', '#0000aa','#0000aa','#0000aa','#0000aa', '#aaaaff','#aaaaff','#aaaaff','#aaaaff'),
      p('Sepia',     '#ffffaa','#ffffaa','#000000','#aa5500', '#550000','#550000','#550000','#550000', '#ffaa55','#ffaa55','#ffaa55','#ffaa55'),

      // ---- COLOR (8): saturated/dark backgrounds ----
      p('Teal',      '#00aaaa','#00aaaa','#ffffff','#ffffff', '#ffffff','#ffffff','#ffffff','#ffffff', '#005555','#005555','#005555','#005555'),
      p('Flame',     '#ff5500','#ff5500','#ffffff','#ffffff', '#ffffff','#ffffff','#ffffff','#ffffff', '#aa5500','#aa5500','#aa5500','#aa5500'),
      p('Plum',      '#550055','#550055','#ffffff','#ff55ff', '#ff55ff','#ff55ff','#ff55ff','#ff55ff', '#aa00aa','#aa00aa','#aa00aa','#aa00aa'),
      p('Forest',    '#005500','#005500','#ffffff','#55ff00', '#55ff00','#55ff00','#55ff00','#55ff00', '#55aa00','#55aa00','#55aa00','#55aa00'),
      // Midnight: deep navy bg, cyan lit, cobalt dim — monochromatic blue
      p('Midnight',  '#0000aa','#0000aa','#aaaaff','#aaaaff', '#00ffff','#aaaaff','#00aaff','#aaaaff', '#0055aa','#0055aa','#0055aa','#0055aa'),
      // Cinnabar: dark red bg, amber/orange lit — smoldering
      p('Cinnabar',  '#550000','#550000','#ffffff','#ffaa55', '#ffaa55','#ff5500','#ffaa00','#ff5500', '#aa0000','#aa0000','#aa5500','#aa0000'),
      // Ultraviolet: deep violet bg, violet/magenta lit — high-energy UV
      p('Ultraviolet','#550055','#550055','#ffffff','#ff55ff', '#aa00ff','#ff00ff','#ff55ff','#aa00ff', '#5500aa','#550055','#5500aa','#550055'),
      // Ash: mid-grey bg — calm, neutral, unobtrusive
      p('Ash',       '#555555','#555555','#ffffff','#ffffff', '#ffffff','#ffffff','#ffffff','#ffffff', '#aaaaaa','#aaaaaa','#aaaaaa','#aaaaaa'),

      // ---- SPECIAL (8): full 12-color and themed ----
      // Nest Heat: orange/amber spectrum, warm text — thermostat inspired
      p('Hearth'  , '#000000','#000000','#ffaa55','#aa5500', '#ff5500','#ff5500','#ffaa00','#ffaa00', '#550000','#550000','#aa5500','#550000'),
      // Nest Cool: cyan/blue spectrum, dark navy overlay — thermostat cool mode
      p('Boreal'  , '#000000','#0000aa','#aaaaff','#0055aa', '#00aaff','#55ffff','#00ffff','#55aaff', '#0000aa','#005555','#005555','#0000aa'),
      // GoldenEye: white time, green overlay+ring, orange/blue hours/minutes, green date
      p('GoldEye',   '#000000','#005500','#ffffff','#00ff00', '#ff5500','#00aaff','#00ff00','#00ff00', '#550000','#0000aa','#005500','#005500'),
      // Viper: cold 12-color — cyan hours, springgreen mins, blue batt, mint steps
      p('Viper',     '#000000','#0000aa','#ffffff','#aaffff', '#00ffff','#00ff55','#0055ff','#aaffaa', '#005555','#005500','#0000aa','#005500'),
      // Inferno: ascending heat spectrum — red→orange→yellow→chartreuse
      p('Inferno',   '#000000','#000000','#ffffff','#ffaa00', '#ff0000','#ff5500','#ffaa00','#aaff00', '#550000','#550000','#555500','#005500'),
      // Cosmos: deep space — violet hours, magenta mins, rose batt, pink steps, navy bg
      p('Cosmos',    '#0000aa','#0000aa','#aaaaff','#ff55ff', '#aa00ff','#ff00ff','#ff55aa','#ff0055', '#550055','#550055','#550055','#550000'),
      // Triadic: primary triad — red hours, blue mins, green batt, violet steps
      p('Triadic',   '#000000','#000000','#ffffff','#aaaaaa', '#ff0000','#0055ff','#00ff00','#aa00ff', '#550000','#0000aa','#005500','#550055'),
      // Rainbow: every element a distinct hue — full spectrum chaos
      p('Rainbow',   '#000000','#000000','#ffffff','#aaaaaa', '#ff0000','#ffaa00','#00ff00','#00ffff', '#550000','#aa5500','#005500','#005555'),
    ];

    // -------------------------------------------------------------------------
    // PALETTE
    // -------------------------------------------------------------------------
    var palette = [
      '#000000','#555555','#aaaaaa','#ffffff','#550000','#aa5555','#aa0000','#ffaaaa',
      '#ff5555','#ff0000','#aa5500','#ffaa55','#ff5500','#ffaa00','#555500','#aaaa55',
      '#aaaa00','#ffffaa','#ffff55','#ffff00','#55aa00','#aaff55','#55ff00','#aaff00',
      '#005500','#55aa55','#00aa00','#aaffaa','#55ff55','#00ff00','#00aa55','#55ffaa',
      '#00ff55','#00ffaa','#005555','#55aaaa','#00aaaa','#aaffff','#55ffff','#00ffff',
      '#0055aa','#55aaff','#0055ff','#00aaff','#000055','#5555aa','#0000aa','#aaaaff',
      '#5555ff','#0000ff','#5500aa','#aa55ff','#5500ff','#aa00ff','#550055','#aa55aa',
      '#aa00aa','#ffaaff','#ff55ff','#ff00ff','#aa0055','#ff55aa','#ff0055','#ff00aa',
    ];
    var paletteNames = {
      '#000000':'GColorBlack','#000055':'GColorOxfordBlue','#0000aa':'GColorDukeBlue','#0000ff':'GColorBlue',
      '#005500':'GColorDarkGreen','#005555':'GColorMidnightGreen','#0055aa':'GColorCobaltBlue','#0055ff':'GColorBlueMoon',
      '#00aa00':'GColorIslamicGreen','#00aa55':'GColorJaegerGreen','#00aaaa':'GColorTiffanyBlue','#00aaff':'GColorVividCerulean',
      '#00ff00':'GColorGreen','#00ff55':'GColorMalachite','#00ffaa':'GColorMediumSpringGreen','#00ffff':'GColorCyan',
      '#550000':'GColorBulgarianRose','#550055':'GColorImperialPurple','#5500aa':'GColorIndigo','#5500ff':'GColorElectricUltramarine',
      '#555500':'GColorArmyGreen','#555555':'GColorDarkGray','#5555aa':'GColorLiberty','#5555ff':'GColorVeryLightBlue',
      '#55aa00':'GColorKellyGreen','#55aa55':'GColorMayGreen','#55aaaa':'GColorCadetBlue','#55aaff':'GColorPictonBlue',
      '#55ff00':'GColorBrightGreen','#55ff55':'GColorScreaminGreen','#55ffaa':'GColorMediumAquamarine','#55ffff':'GColorElectricBlue',
      '#aa0000':'GColorDarkCandyAppleRed','#aa0055':'GColorJazzberryJam','#aa00aa':'GColorPurple','#aa00ff':'GColorVividViolet',
      '#aa5500':'GColorWindsorTan','#aa5555':'GColorRoseVale','#aa55aa':'GColorPurpureus','#aa55ff':'GColorLavenderIndigo',
      '#aaaa00':'GColorLimerick','#aaaa55':'GColorBrass','#aaaaaa':'GColorLightGray','#aaaaff':'GColorBabyBlueEyes',
      '#aaff00':'GColorSpringBud','#aaff55':'GColorInchworm','#aaffaa':'GColorMintGreen','#aaffff':'GColorCeleste',
      '#ff0000':'GColorRed','#ff0055':'GColorFolly','#ff00aa':'GColorFashionMagenta','#ff00ff':'GColorMagenta',
      '#ff5500':'GColorOrange','#ff5555':'GColorSunsetOrange','#ff55aa':'GColorBrilliantRose','#ff55ff':'GColorShockingPink',
      '#ffaa00':'GColorChromeYellow','#ffaa55':'GColorRajah','#ffaaaa':'GColorMelon','#ffaaff':'GColorRichBrilliantLavender',
      '#ffff00':'GColorYellow','#ffff55':'GColorIcterine','#ffffaa':'GColorPastelYellow','#ffffff':'GColorWhite'
    };

    var platformData = 'var PLATFORM=' + JSON.stringify(platform || 'color') + ';'
      + 'var CURRENT=' + JSON.stringify(currentSettings || null) + ';';
    var presetsData = 'var PRESETS=' + JSON.stringify(presets) + ';';
    var paletteData = 'var PALETTE=' + JSON.stringify(palette) + ';var PALETTE_NAMES=' + JSON.stringify(paletteNames) + ';';

    // Preset rows: 8 each, 3 rows
    var presetRows = [
      { label: 'Dark',    presets: presets.slice(0,  8)  },
      { label: 'Dark+',   presets: presets.slice(8,  16) },
      { label: 'Light',   presets: presets.slice(16, 24) },
      { label: 'Color',   presets: presets.slice(24, 32) },
      { label: 'Special', presets: presets.slice(32, 40) },
    ];
    var presetsHtml = presetRows.map(function(row) {
      var rowItems = row.presets.map(function(p) {
        var i = presets.indexOf(p);
        var pipBg = (p.litH === p.litM)
          ? p.litH
          : 'linear-gradient(90deg,' + p.litH + ' 50%,' + p.litM + ' 50%)';
        return '<div class="preset" onclick="applyPreset(' + i + ')" style="background:' + p.bg + ';border:2px solid ' + p.litM + '">'
          + '<div class="preset-pip" style="background:' + pipBg + '"></div>'
          + '<div class="preset-label" style="color:' + p.timeText + '">' + p.label + '</div>'
          + '</div>';
      }).join('');
      return '<div class="preset-row-label">' + row.label + '</div>'
        + '<div class="preset-row">' + rowItems + '</div>';
    }).join('');

    // -------------------------------------------------------------------------
    // HTML
    // -------------------------------------------------------------------------
    var html = '<!DOCTYPE html><html><head>'
      + '<meta name="viewport" content="width=device-width,initial-scale=1">'
      + '<title>Radium 2</title>'
      + '<style>'
      + '*{box-sizing:border-box}'
      + 'body{font-family:sans-serif;background:#111;color:#fff;margin:0;padding:16px;max-width:480px}'
      + 'h1{font-size:24px;margin:0 0 2px;letter-spacing:-0.5px}'
      + 'h1 span{color:#aaffaa}'
      + 'p.sub{color:#555;font-size:13px;margin:0 0 20px}'
      + 'h2{font-size:11px;text-transform:uppercase;color:#555;letter-spacing:1.5px;margin:20px 0 6px}'
      + '.card{background:#1a1a1a;border-radius:10px;overflow:hidden;margin-bottom:8px}'
      + '.row{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid #222}'
      + '.row:last-child{border-bottom:none}'
      + '.row label{font-size:15px;color:#ddd;flex:1}'
      + '.row .right{display:flex;align-items:center;gap:8px}'
      + '.swatch{width:36px;height:28px;border-radius:5px;cursor:pointer;border:2px solid #333;flex-shrink:0}'
      // Level 1 expand
      + '.expand-row{display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-bottom:1px solid #222;cursor:pointer;user-select:none}'
      + '.expand-row:last-child{border-bottom:none}'
      + '.expand-row label{font-size:15px;color:#ddd;flex:1;cursor:pointer}'
      + '.expand-row .right{display:flex;align-items:center;gap:8px}'
      + '.expand-btn{font-size:18px;color:#555;line-height:1;width:24px;text-align:center;transition:transform .2s}'
      + '.expand-btn.open{transform:rotate(45deg);color:#aaffaa}'
      + '.sub-rows{display:none;background:#141414}'
      + '.sub-rows.open{display:block}'
      + '.sub-row{display:flex;align-items:center;justify-content:space-between;padding:9px 14px 9px 28px;border-bottom:1px solid #1e1e1e}'
      + '.sub-row:last-child{border-bottom:none}'
      + '.sub-row label{font-size:14px;color:#aaa;flex:1}'
      // Level 2 expand
      + '.sub-expand-row{display:flex;align-items:center;justify-content:space-between;padding:9px 14px 9px 28px;border-bottom:1px solid #1e1e1e;cursor:pointer;user-select:none}'
      + '.sub-expand-row label{font-size:14px;color:#aaa;flex:1;cursor:pointer}'
      + '.sub-expand-row .right{display:flex;align-items:center;gap:8px}'
      + '.sub-expand-btn{font-size:15px;color:#444;line-height:1;width:20px;text-align:center;transition:transform .15s}'
      + '.sub-expand-btn.open{transform:rotate(45deg);color:#aaffaa}'
      + '.sub-sub-rows{display:none;background:#0e0e0e}'
      + '.sub-sub-rows.open{display:block}'
      + '.sub-sub-row{display:flex;align-items:center;justify-content:space-between;padding:8px 14px 8px 42px;border-bottom:1px solid #181818}'
      + '.sub-sub-row:last-child{border-bottom:none}'
      + '.sub-sub-row label{font-size:13px;color:#888;flex:1}'
      // Radio
      + '.radio-group{display:flex;gap:6px;padding:10px 14px}'
      + '.radio-group label{flex:1;text-align:center;padding:8px 4px;border-radius:7px;background:#242424;font-size:13px;cursor:pointer;color:#aaa;border:2px solid transparent}'
      + '.radio-group input{display:none}'
      + '.radio-group input:checked+label{background:#aaffaa;color:#000;font-weight:bold}'
      // Toggle
      + '.toggle{position:relative;width:44px;height:26px;flex-shrink:0}'
      + '.toggle input{opacity:0;width:0;height:0}'
      + '.knob{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#333;border-radius:13px;transition:.2s}'
      + '.knob:before{content:"";position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#666;border-radius:50%;transition:.2s}'
      + 'input:checked+.knob{background:#aaffaa}'
      + 'input:checked+.knob:before{transform:translateX(18px);background:#000}'
      // Slider
      + '.slider-wrap{padding:10px 14px}'
      + '.slider-lbl{font-size:15px;color:#ddd;display:flex;justify-content:space-between;margin-bottom:8px}'
      + '.slider-lbl span{color:#aaffaa;font-weight:bold}'
      + 'input[type=range]{width:100%;accent-color:#aaffaa}'
      + '.note{font-size:12px;color:#444;padding:4px 14px 10px;display:block}'
      // Presets
      + '.presets{padding:4px 14px 10px}'
      + '.preset-row-label{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#888;padding:8px 0 4px}'
      + '.preset-row{display:flex;gap:6px;margin-bottom:4px}'
      + '.preset{flex:1;border-radius:8px;padding:8px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px}'
      + '.preset:active{opacity:0.7}'
      + '.preset-pip{width:20px;height:3px;border-radius:2px}'
      + '.preset-label{font-size:10px}'
      // Modal
      + '.modal-bg{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);z-index:100;align-items:center;justify-content:center}'
      + '.modal-bg.open{display:flex}'
      + '.modal{background:#1a1a1a;border-radius:12px;padding:16px;width:90%;max-width:340px}'
      + '.modal h3{margin:0 0 12px;font-size:14px;color:#aaa;text-transform:uppercase;letter-spacing:1px}'
      + '.palette{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}'
      + '.pal-swatch{width:100%;aspect-ratio:1;border-radius:3px;cursor:pointer;border:2px solid transparent}'
      + '.pal-swatch:hover,.pal-swatch.selected{border-color:#fff}'
      + '.modal-cancel{margin-top:12px;width:100%;padding:10px;background:#333;color:#aaa;border:none;border-radius:7px;font-size:14px;cursor:pointer}'
      // Save
      + 'button.save{display:block;width:100%;padding:14px;background:#aaffaa;color:#000;border:none;border-radius:8px;font-size:17px;font-weight:bold;cursor:pointer;margin-top:24px}'
      + 'button.save:active{opacity:0.8}'
      + '</style></head><body>'

      + '<h1>Radium <span>2</span></h1><p class="sub">Watchface Configuration</p>'

      // OVERLAY
      + '<h2>Overlay</h2><div class="card">'
      + '<div class="radio-group">'
      + '<input type="radio" name="overlay" id="ov0" value="0" checked><label for="ov0">Always On</label>'
      + '<input type="radio" name="overlay" id="ov1" value="1"><label for="ov1">Always Off</label>'
      + '<input type="radio" name="overlay" id="ov2" value="2"><label for="ov2">Shake</label>'
      + '</div></div>'

      // COLOR SECTION
      + '<div id="color-section">'
      + '<h2>Presets</h2><div class="card"><div class="presets">' + presetsHtml + '</div></div>'

      + '<h2>Colors</h2><div class="card">'

      // TEXT: Time / Date & Day
      + '<div class="expand-row" onclick="toggle(\'text\')">'
      + '<label>Text</label>'
      + '<div class="right"><div class="swatch" id="sw-TextAll" onclick="openPicker(\'TextAll\');event.stopPropagation()"></div><span class="expand-btn" id="btn-text">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-text">'
      + '<div class="sub-row"><label>Time</label><div class="swatch" id="sw-TimeTextColor" onclick="openPicker(\'TimeTextColor\')"></div></div>'
      + '<div class="sub-row"><label>Date &amp; Day</label><div class="swatch" id="sw-DateTextColor" onclick="openPicker(\'DateTextColor\')"></div></div>'
      + '</div>'

      // LIT: Time Ticks → Hours/Minutes; Outer Ring → Battery/Steps
      + '<div class="expand-row" onclick="toggle(\'lit\')">'
      + '<label>Lit</label>'
      + '<div class="right"><div class="swatch" id="sw-LitAll" onclick="openPicker(\'LitAll\');event.stopPropagation()"></div><span class="expand-btn" id="btn-lit">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-lit">'
      + '<div class="sub-expand-row" onclick="toggle2(\'litticks\')">'
      + '<label>Time Ticks</label>'
      + '<div class="right"><div class="swatch" id="sw-LitTicks" onclick="openPicker(\'LitTicks\');event.stopPropagation()"></div><span class="sub-expand-btn" id="btn2-litticks">+</span></div>'
      + '</div>'
      + '<div class="sub-sub-rows" id="sub2-litticks">'
      + '<div class="sub-sub-row"><label>Hours</label><div class="swatch" id="sw-LitHourColor" onclick="openPicker(\'LitHourColor\')"></div></div>'
      + '<div class="sub-sub-row"><label>Minutes</label><div class="swatch" id="sw-LitMinuteColor" onclick="openPicker(\'LitMinuteColor\')"></div></div>'
      + '</div>'
      + '<div class="sub-expand-row" onclick="toggle2(\'litring\')">'
      + '<label>Outer Ring</label>'
      + '<div class="right"><div class="swatch" id="sw-LitRing" onclick="openPicker(\'LitRing\');event.stopPropagation()"></div><span class="sub-expand-btn" id="btn2-litring">+</span></div>'
      + '</div>'
      + '<div class="sub-sub-rows" id="sub2-litring">'
      + '<div class="sub-sub-row"><label>Battery</label><div class="swatch" id="sw-LitBatteryColor" onclick="openPicker(\'LitBatteryColor\')"></div></div>'
      + '<div class="sub-sub-row"><label>Steps</label><div class="swatch" id="sw-LitStepsColor" onclick="openPicker(\'LitStepsColor\')"></div></div>'
      + '</div>'
      + '</div>'

      // UNLIT: Time Ticks → Hours/Minutes; Outer Ring → Battery/Steps
      + '<div class="expand-row" onclick="toggle(\'dim\')">'
      + '<label>Unlit</label>'
      + '<div class="right"><div class="swatch" id="sw-DimAll" onclick="openPicker(\'DimAll\');event.stopPropagation()"></div><span class="expand-btn" id="btn-dim">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-dim">'
      + '<div class="sub-expand-row" onclick="toggle2(\'dimticks\')">'
      + '<label>Time Ticks</label>'
      + '<div class="right"><div class="swatch" id="sw-DimTicks" onclick="openPicker(\'DimTicks\');event.stopPropagation()"></div><span class="sub-expand-btn" id="btn2-dimticks">+</span></div>'
      + '</div>'
      + '<div class="sub-sub-rows" id="sub2-dimticks">'
      + '<div class="sub-sub-row"><label>Hours</label><div class="swatch" id="sw-DimHourColor" onclick="openPicker(\'DimHourColor\')"></div></div>'
      + '<div class="sub-sub-row"><label>Minutes</label><div class="swatch" id="sw-DimMinuteColor" onclick="openPicker(\'DimMinuteColor\')"></div></div>'
      + '</div>'
      + '<div class="sub-expand-row" onclick="toggle2(\'dimring\')">'
      + '<label>Outer Ring</label>'
      + '<div class="right"><div class="swatch" id="sw-DimRing" onclick="openPicker(\'DimRing\');event.stopPropagation()"></div><span class="sub-expand-btn" id="btn2-dimring">+</span></div>'
      + '</div>'
      + '<div class="sub-sub-rows" id="sub2-dimring">'
      + '<div class="sub-sub-row"><label>Battery</label><div class="swatch" id="sw-DimBatteryColor" onclick="openPicker(\'DimBatteryColor\')"></div></div>'
      + '<div class="sub-sub-row"><label>Steps</label><div class="swatch" id="sw-DimStepsColor" onclick="openPicker(\'DimStepsColor\')"></div></div>'
      + '</div>'
      + '</div>'

      // BASE: Overlay / Background (overlay first — matches watchface layer order)
      + '<div class="expand-row" onclick="toggle(\'base\')">'
      + '<label>Base</label>'
      + '<div class="right"><div class="swatch" id="sw-BaseAll" onclick="openPicker(\'BaseAll\');event.stopPropagation()"></div><span class="expand-btn" id="btn-base">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-base">'
      + '<div class="sub-row"><label>Overlay</label><div class="swatch" id="sw-OverlayBgColor" onclick="openPicker(\'OverlayBgColor\')"></div></div>'
      + '<div class="sub-row"><label>Background</label><div class="swatch" id="sw-BackgroundColor" onclick="openPicker(\'BackgroundColor\')"></div></div>'
      + '</div>'

      + '</div>'  // end colors card
      + '</div>'  // end color-section

      // B&W SECTION
      + '<div id="bw-section">'
      + '<h2>Display</h2><div class="card">'
      + '<div class="row"><label>Invert (white bg, black ticks)</label>'
      + '<label class="toggle"><input type="checkbox" id="InvertBW"><span class="knob"></span></label></div>'
      + '</div></div>'

      // RING TOGGLE
      + '<h2>Outer Ring</h2><div class="card">'
      + '<div class="row"><label>Show battery &amp; steps ring</label>'
      + '<label class="toggle"><input type="checkbox" id="ShowRing" checked><span class="knob"></span></label></div>'
      + '<span class="note">When hidden, tick art extends to the screen edge</span>'
      + '</div>'

      // HEALTH
      + '<h2>Health</h2><div class="card">'
      + '<div class="slider-wrap">'
      + '<div class="slider-lbl">Daily Step Goal <span id="goalVal">10,000</span></div>'
      + '<input type="range" id="StepGoal" min="1000" max="30000" step="500" value="10000"'
      + ' oninput="document.getElementById(\'goalVal\').textContent=parseInt(this.value).toLocaleString()">'
      + '</div></div>'

      + '<button class="save" onclick="save()">Save to Watch</button>'

      // Modal
      + '<div class="modal-bg" id="modal"><div class="modal">'
      + '<h3 id="modal-title">Pick a color</h3>'
      + '<div class="palette" id="palette-grid"></div>'
      + '<button class="modal-cancel" onclick="closePicker()">Cancel</button>'
      + '</div></div>'

      + '<script>'
      + platformData + presetsData + paletteData

      // Color store
      + 'var colors={'
      + 'BackgroundColor:"#000000",'
      + 'OverlayBgColor:"#000000",'
      + 'TimeTextColor:"#ffffff",'
      + 'DateTextColor:"#aaaaaa",'
      + 'LitHourColor:"#aaffaa",'
      + 'LitMinuteColor:"#aaffaa",'
      + 'LitBatteryColor:"#aaffaa",'
      + 'LitStepsColor:"#aaffaa",'
      + 'DimHourColor:"#555555",'
      + 'DimMinuteColor:"#555555",'
      + 'DimBatteryColor:"#555555",'
      + 'DimStepsColor:"#555555"'
      + '};'

      // Aliases: swatch-id -> canonical key (for mirror swatches at deeper levels)
      + 'var aliases={};'

      // updateSwatches: sets swatch colors + syncs parent summary swatches
      + 'function updateSwatches(key,hex){'
      + 'colors[key]=hex;'
      + 'var ids=["sw-"+key];'
      + 'var parentSync={'
      + '"LitHourColor":["sw-LitAll","sw-LitTicks"],'
      + '"LitMinuteColor":["sw-LitAll","sw-LitTicks"],'
      + '"LitBatteryColor":["sw-LitAll","sw-LitRing"],'
      + '"LitStepsColor":["sw-LitAll","sw-LitRing"],'
      + '"DimHourColor":["sw-DimAll","sw-DimTicks"],'
      + '"DimMinuteColor":["sw-DimAll","sw-DimTicks"],'
      + '"DimBatteryColor":["sw-DimAll","sw-DimRing"],'
      + '"DimStepsColor":["sw-DimAll","sw-DimRing"],'
      + '"TimeTextColor":["sw-TextAll"],'
      + '"DateTextColor":["sw-TextAll"],'
      + '"BackgroundColor":["sw-BaseAll"],'
      + '"OverlayBgColor":["sw-BaseAll"]'
      + '};'
      + 'if(parentSync[key])ids=ids.concat(parentSync[key]);'
      // Set flat color on leaf swatch; compute split/quad gradients for parent swatches
      + 'var el=document.getElementById("sw-"+key);if(el)el.style.background=hex;'
      + 'function setSplit(id,a,b){var e=document.getElementById(id);if(e)e.style.background="linear-gradient(135deg,"+a+" 50%,"+b+" 50%)"}'
      + 'function setQuad(id,a,b,c,d){var e=document.getElementById(id);if(e)e.style.background="conic-gradient("+a+" 0 25%,"+b+" 0 50%,"+c+" 0 75%,"+d+" 0 100%)"}'
      + 'setSplit("sw-LitTicks", colors.LitHourColor, colors.LitMinuteColor);'
      + 'setSplit("sw-LitRing",  colors.LitBatteryColor, colors.LitStepsColor);'
      + 'setQuad("sw-LitAll",  colors.LitHourColor, colors.LitMinuteColor, colors.LitBatteryColor, colors.LitStepsColor);'
      + 'setSplit("sw-DimTicks", colors.DimHourColor, colors.DimMinuteColor);'
      + 'setSplit("sw-DimRing",  colors.DimBatteryColor, colors.DimStepsColor);'
      + 'setQuad("sw-DimAll",  colors.DimHourColor, colors.DimMinuteColor, colors.DimBatteryColor, colors.DimStepsColor);'
      + 'setSplit("sw-TextAll", colors.TimeTextColor, colors.DateTextColor);'
      + 'setSplit("sw-BaseAll", colors.BackgroundColor, colors.OverlayBgColor);'
      + '}'

      // cascadeMap: parent trigger keys cascade to their real leaf keys
      // Leaf keys (LitHourColor etc) are not in cascadeMap -- they set only themselves
      + 'var cascadeMap={'
      + '"LitAll":["LitHourColor","LitMinuteColor","LitBatteryColor","LitStepsColor"],'
      + '"LitTicks":["LitHourColor","LitMinuteColor"],'
      + '"LitRing":["LitBatteryColor","LitStepsColor"],'
      + '"DimAll":["DimHourColor","DimMinuteColor","DimBatteryColor","DimStepsColor"],'
      + '"DimTicks":["DimHourColor","DimMinuteColor"],'
      + '"DimRing":["DimBatteryColor","DimStepsColor"],'
      + '"TextAll":["TimeTextColor","DateTextColor"],'
      + '"BaseAll":["BackgroundColor","OverlayBgColor"]'
      + '};'

      // openPicker now uses cascade targets when relevant
      + 'var pickerTarget=null;'
      + 'var pickerKeys=null;'  // array of keys to set on pick

      + 'function openPicker(key){'
      + 'pickerTarget=key;'
      + 'pickerKeys=cascadeMap[key]||[key];'
      + 'var labels={"LitAll":"Lit","LitTicks":"Time Ticks","LitRing":"Outer Ring","DimAll":"Unlit","DimTicks":"Time Ticks","DimRing":"Outer Ring","TextAll":"Text","BaseAll":"Base"};'
      + 'var label=labels[key]||key.replace(/([A-Z])/g," $1").trim();'
      + 'document.getElementById("modal-title").textContent=label;'
      + 'var grid=document.getElementById("palette-grid");'
      + 'grid.innerHTML="";'
      + 'PALETTE.forEach(function(hex){'
      + 'var d=document.createElement("div");'
      + 'var curColor=colors[pickerTarget]||(pickerKeys&&colors[pickerKeys[0]]);'
      + 'd.className="pal-swatch"+(curColor===hex?" selected":"");'
      + 'd.style.background=hex;'
      + 'd.title=PALETTE_NAMES[hex]||hex;'
      + 'd.onclick=function(){pickColor(hex);};'
      + 'grid.appendChild(d);});'
      + 'document.getElementById("modal").classList.add("open");}'

      + 'function pickColor(hex){'
      + 'if(!pickerKeys)return;'
      + 'pickerKeys.forEach(function(k){updateSwatches(k,hex);});'
      + 'closePicker();}'

      + 'function closePicker(){'
      + 'document.getElementById("modal").classList.remove("open");'
      + 'pickerTarget=null;pickerKeys=null;}'

      // initSwatches: populate all swatches from colors store
      + 'function initSwatches(){'
      + 'Object.keys(colors).forEach(function(k){updateSwatches(k,colors[k]);});}'

      // loadSettings: restore from watch state
      + 'function loadSettings(){'
      + 'try{'
      + 'if(!CURRENT)return;'
      + 'Object.keys(CURRENT).forEach(function(k){'
      + 'if(k==="OverlayMode"){var el=document.getElementById("ov"+CURRENT[k]);if(el)el.checked=true;}'
      + 'else if(k==="InvertBW"){document.getElementById("InvertBW").checked=!!CURRENT[k];}'
      + 'else if(k==="ShowRing"){document.getElementById("ShowRing").checked=!!CURRENT[k];}'
      + 'else if(k==="StepGoal"){var el=document.getElementById("StepGoal");el.value=CURRENT[k];document.getElementById("goalVal").textContent=parseInt(CURRENT[k]).toLocaleString();}'
      + 'else if(colors[k]!==undefined){var hex="#"+(CURRENT[k]>>>0).toString(16).padStart(6,"0");updateSwatches(k,hex);}'
      + '});'
      + '}catch(e){}}'

      + 'function applyPlatform(){'
      + 'var isColor=(PLATFORM!=="bw");'
      + 'document.getElementById("color-section").style.display=isColor?"":"none";'
      + 'document.getElementById("bw-section").style.display=isColor?"none":"";}'

      // toggle: level 1 expand
      + 'function toggle(id){'
      + 'var sub=document.getElementById("sub-"+id);'
      + 'var btn=document.getElementById("btn-"+id);'
      + 'var open=sub.classList.toggle("open");'
      + 'btn.classList.toggle("open",open);}'

      // toggle2: level 2 expand
      + 'function toggle2(id){'
      + 'var sub=document.getElementById("sub2-"+id);'
      + 'var btn=document.getElementById("btn2-"+id);'
      + 'var open=sub.classList.toggle("open");'
      + 'btn.classList.toggle("open",open);}'

      // applyPreset: sets all 12 colors
      + 'function applyPreset(i){'
      + 'var p=PRESETS[i];'
      + 'updateSwatches("BackgroundColor",p.bg);'
      + 'updateSwatches("OverlayBgColor",p.obg);'
      + 'updateSwatches("TimeTextColor",p.timeText);'
      + 'updateSwatches("DateTextColor",p.dateText);'
      + 'updateSwatches("LitHourColor",p.litH);'
      + 'updateSwatches("LitMinuteColor",p.litM);'
      + 'updateSwatches("LitBatteryColor",p.litB);'
      + 'updateSwatches("LitStepsColor",p.litS);'
      + 'updateSwatches("DimHourColor",p.dimH);'
      + 'updateSwatches("DimMinuteColor",p.dimM);'
      + 'updateSwatches("DimBatteryColor",p.dimB);'
      + 'updateSwatches("DimStepsColor",p.dimS);}'

      + 'function h(hex){return parseInt(hex.slice(1),16);}'
      + 'function tog(id){return document.getElementById(id).checked?1:0;}'

      + 'function save(){'
      + 'var ov=parseInt(document.querySelector(\'input[name="overlay"]:checked\').value);'
      + 'var s={'
      + 'OverlayMode:ov,'
      + 'BackgroundColor:h(colors.BackgroundColor),'
      + 'OverlayBgColor:h(colors.OverlayBgColor),'
      + 'TimeTextColor:h(colors.TimeTextColor),'
      + 'DateTextColor:h(colors.DateTextColor),'
      + 'LitHourColor:h(colors.LitHourColor),'
      + 'LitMinuteColor:h(colors.LitMinuteColor),'
      + 'LitBatteryColor:h(colors.LitBatteryColor),'
      + 'LitStepsColor:h(colors.LitStepsColor),'
      + 'DimHourColor:h(colors.DimHourColor),'
      + 'DimMinuteColor:h(colors.DimMinuteColor),'
      + 'DimBatteryColor:h(colors.DimBatteryColor),'
      + 'DimStepsColor:h(colors.DimStepsColor),'
      + 'InvertBW:tog("InvertBW"),'
      + 'ShowRing:tog("ShowRing"),'
      + 'StepGoal:parseInt(document.getElementById("StepGoal").value)'
      + '};'
      + 'window.location="pebblejs://close#"+encodeURIComponent(JSON.stringify(s));}'

      + 'loadSettings();initSwatches();applyPlatform();'
      + '</script></body></html>';
    return 'data:text/html,' + encodeURIComponent(html);
  }
};
