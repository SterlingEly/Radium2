module.exports = {
  buildUrl: function(platform, currentSettings) {

    var presets = [
      { label: 'Radium',   bg: '#000000', timeText: '#ffffff', dateText: '#aaaaaa', litH: '#aaffaa', litM: '#aaffaa', litB: '#aaffaa', litS: '#aaffaa', dimT: '#005500', dimR: '#005500' },
      { label: 'Midnight', bg: '#000000', timeText: '#ffffff', dateText: '#aaaaaa', litH: '#00aaaa', litM: '#00aaaa', litB: '#00aaaa', litS: '#00aaaa', dimT: '#005555', dimR: '#005555' },
      { label: 'Ember',    bg: '#000000', timeText: '#ffffff', dateText: '#aa5500', litH: '#ff5500', litM: '#ff5500', litB: '#ff5500', litS: '#ff5500', dimT: '#550000', dimR: '#550000' },
      { label: 'Volt',     bg: '#000000', timeText: '#ffffff', dateText: '#aaaa00', litH: '#aaff00', litM: '#aaff00', litB: '#aaff00', litS: '#aaff00', dimT: '#555500', dimR: '#555500' },
      { label: 'Ice',      bg: '#000055', timeText: '#ffffff', dateText: '#5555aa', litH: '#00aaff', litM: '#00aaff', litB: '#00aaff', litS: '#00aaff', dimT: '#0055aa', dimR: '#0055aa' },
      { label: 'Dusk',     bg: '#000000', timeText: '#ffffff', dateText: '#aa55aa', litH: '#aa00ff', litM: '#aa00ff', litB: '#aa00ff', litS: '#aa00ff', dimT: '#550055', dimR: '#550055' },
      { label: 'Steel',    bg: '#000000', timeText: '#aaaaaa', dateText: '#555555', litH: '#aaaaaa', litM: '#aaaaaa', litB: '#aaaaaa', litS: '#aaaaaa', dimT: '#555555', dimR: '#555555' },
      { label: 'Cobalt',   bg: '#000000', timeText: '#ffffff', dateText: '#5555aa', litH: '#0055ff', litM: '#0055ff', litB: '#0055ff', litS: '#0055ff', dimT: '#000055', dimR: '#000055' },
      // -- Light backgrounds --
      { label: 'Paper',    bg: '#ffffff', timeText: '#000000', dateText: '#555555', litH: '#000000', litM: '#000000', litB: '#000000', litS: '#000000', dimT: '#aaaaaa', dimR: '#aaaaaa' },
      { label: 'Sepia',    bg: '#ffffaa', timeText: '#000000', dateText: '#aa5500', litH: '#550000', litM: '#550000', litB: '#550000', litS: '#550000', dimT: '#ffaa55', dimR: '#ffaa55' },
      { label: 'Ivory',    bg: '#ffffff', timeText: '#000000', dateText: '#005555', litH: '#00aaaa', litM: '#00aaaa', litB: '#00aaaa', litS: '#00aaaa', dimT: '#aaaaaa', dimR: '#aaaaaa' },
      { label: 'Slate',    bg: '#aaaaaa', timeText: '#000000', dateText: '#000055', litH: '#000055', litM: '#000055', litB: '#000055', litS: '#000055', dimT: '#555555', dimR: '#555555' },
      { label: 'Mint',     bg: '#aaffaa', timeText: '#000000', dateText: '#005500', litH: '#005500', litM: '#005500', litB: '#005500', litS: '#005500', dimT: '#55aa55', dimR: '#55aa55' },
      { label: 'Rose',     bg: '#ffaaaa', timeText: '#550000', dateText: '#550000', litH: '#550000', litM: '#550000', litB: '#550000', litS: '#550000', dimT: '#ff5555', dimR: '#ff5555' },
      { label: 'Iris',     bg: '#aaaaff', timeText: '#000000', dateText: '#5500aa', litH: '#5500aa', litM: '#5500aa', litB: '#5500aa', litS: '#5500aa', dimT: '#5555aa', dimR: '#5555aa' },
      { label: 'Lemon',    bg: '#ffff55', timeText: '#000000', dateText: '#555500', litH: '#555500', litM: '#555500', litB: '#555500', litS: '#555500', dimT: '#aaaa55', dimR: '#aaaa55' },
      // -- Colored backgrounds --
      { label: 'Teal',     bg: '#00aaaa', timeText: '#ffffff', dateText: '#ffffff', litH: '#ffffff', litM: '#ffffff', litB: '#ffffff', litS: '#ffffff', dimT: '#005555', dimR: '#005555' },
      { label: 'Flame',    bg: '#ff5500', timeText: '#ffffff', dateText: '#ffffff', litH: '#ffffff', litM: '#ffffff', litB: '#ffffff', litS: '#ffffff', dimT: '#aa5500', dimR: '#aa5500' },
      { label: 'Plum',     bg: '#550055', timeText: '#ffffff', dateText: '#ff55ff', litH: '#ff55ff', litM: '#ff55ff', litB: '#ff55ff', litS: '#ff55ff', dimT: '#aa55aa', dimR: '#aa55aa' },
      { label: 'Forest',   bg: '#005500', timeText: '#ffffff', dateText: '#55ff00', litH: '#55ff00', litM: '#55ff00', litB: '#55ff00', litS: '#55ff00', dimT: '#55aa00', dimR: '#55aa00' },
      { label: 'Navy',     bg: '#000055', timeText: '#ffffff', dateText: '#aaaaff', litH: '#00ffff', litM: '#00ffff', litB: '#00ffff', litS: '#00ffff', dimT: '#0055aa', dimR: '#0055aa' },
      { label: 'Brass',    bg: '#aa5500', timeText: '#ffffff', dateText: '#ffffff', litH: '#ffff00', litM: '#ffff00', litB: '#ffff00', litS: '#ffff00', dimT: '#555500', dimR: '#555500' },
      { label: 'Crimson',  bg: '#550000', timeText: '#ffffff', dateText: '#ff55aa', litH: '#ff5555', litM: '#ff5555', litB: '#ff5555', litS: '#ff5555', dimT: '#aa0000', dimR: '#aa0000' },
      { label: 'Azure',    bg: '#00aaff', timeText: '#ffffff', dateText: '#ffffff', litH: '#ffffff', litM: '#ffffff', litB: '#ffffff', litS: '#ffffff', dimT: '#0055aa', dimR: '#0055aa' },
    ];

    // Official Pebble SDK 64-color palette, spectrum-ordered by hue then brightness
    // Row 1: grayscale + dark reds. Rows 2-8: full chromatic spectrum dark->light
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

    var presetRows = [
      { label: 'Dark', presets: presets.slice(0, 8) },
      { label: 'Light', presets: presets.slice(8, 16) },
      { label: 'Color', presets: presets.slice(16, 24) },
    ];
    var presetsHtml = presetRows.map(function(row) {
      var rowItems = row.presets.map(function(p, j) {
        var i = presets.indexOf(p);
        return '<div class="preset" onclick="applyPreset(' + i + ')" style="background:' + p.bg + ';border:2px solid ' + p.litM + '">'
          + '<div class="preset-pip" style="background:' + p.litM + '"></div>'
          + '<div class="preset-label" style="color:' + p.timeText + '">' + p.label + '</div>'
          + '</div>';
      }).join('');
      return '<div class="preset-row-label">' + row.label + '</div>'
        + '<div class="preset-row">' + rowItems + '</div>';
    }).join('');

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
      // color swatch button
      + '.swatch{width:36px;height:28px;border-radius:5px;cursor:pointer;border:2px solid #333;flex-shrink:0}'
      // expand rows
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
      // radio
      + '.radio-group{display:flex;gap:6px;padding:10px 14px}'
      + '.radio-group label{flex:1;text-align:center;padding:8px 4px;border-radius:7px;background:#242424;font-size:13px;cursor:pointer;color:#aaa;border:2px solid transparent}'
      + '.radio-group input{display:none}'
      + '.radio-group input:checked+label{background:#aaffaa;color:#000;font-weight:bold}'
      // presets
      + '.presets{padding:4px 14px 10px}'
      + '.preset-row-label{font-size:10px;text-transform:uppercase;letter-spacing:0.08em;color:#888;padding:8px 0 4px}'
      + '.preset-row{display:flex;gap:6px;margin-bottom:4px}'
      + '.preset{flex:1;border-radius:8px;padding:8px 2px;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:5px}'
      + '.preset:active{opacity:0.7}'
      + '.preset-pip{width:20px;height:3px;border-radius:2px}'
      + '.preset-label{font-size:10px}'
      // toggle
      + '.toggle{position:relative;width:44px;height:26px;flex-shrink:0}'
      + '.toggle input{opacity:0;width:0;height:0}'
      + '.knob{position:absolute;cursor:pointer;top:0;left:0;right:0;bottom:0;background:#333;border-radius:13px;transition:.2s}'
      + '.knob:before{content:"";position:absolute;width:20px;height:20px;left:3px;bottom:3px;background:#666;border-radius:50%;transition:.2s}'
      + 'input:checked+.knob{background:#aaffaa}'
      + 'input:checked+.knob:before{transform:translateX(18px);background:#000}'
      // slider
      + '.slider-wrap{padding:10px 14px}'
      + '.slider-lbl{font-size:15px;color:#ddd;display:flex;justify-content:space-between;margin-bottom:8px}'
      + '.slider-lbl span{color:#aaffaa;font-weight:bold}'
      + 'input[type=range]{width:100%;accent-color:#aaffaa}'
      + '.note{font-size:12px;color:#444;padding:4px 14px 10px;display:block}'
      // palette picker modal
      + '.modal-bg{display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.8);z-index:100;align-items:center;justify-content:center}'
      + '.modal-bg.open{display:flex}'
      + '.modal{background:#1a1a1a;border-radius:12px;padding:16px;width:90%;max-width:340px}'
      + '.modal h3{margin:0 0 12px;font-size:14px;color:#aaa;text-transform:uppercase;letter-spacing:1px}'
      + '.palette{display:grid;grid-template-columns:repeat(8,1fr);gap:4px}'
      + '.pal-swatch{width:100%;aspect-ratio:1;border-radius:3px;cursor:pointer;border:2px solid transparent}'
      + '.pal-swatch:hover,.pal-swatch.selected{border-color:#fff}'
      + '.modal-cancel{margin-top:12px;width:100%;padding:10px;background:#333;color:#aaa;border:none;border-radius:7px;font-size:14px;cursor:pointer}'
      // save button
      + 'button.save{display:block;width:100%;padding:14px;background:#aaffaa;color:#000;border:none;border-radius:8px;font-size:17px;font-weight:bold;cursor:pointer;margin-top:24px}'
      + 'button.save:active{opacity:0.8}'
      + '</style></head><body>'

      + '<h1>Radium <span>2</span></h1><p class="sub">Watchface Configuration</p>'

      + '<h2>Overlay</h2><div class="card">'
      + '<div class="radio-group">'
      + '<input type="radio" name="overlay" id="ov0" value="0" checked><label for="ov0">Always On</label>'
      + '<input type="radio" name="overlay" id="ov1" value="1"><label for="ov1">Always Off</label>'
      + '<input type="radio" name="overlay" id="ov2" value="2"><label for="ov2">Shake</label>'
      + '</div></div>'

      + '<div id="color-section">'
      + '<h2>Presets</h2><div class="card">'
      + '<div class="presets">' + presetsHtml + '</div>'
      + '</div>'

      + '<h2>Colors</h2><div class="card">'
      + '<div class="row"><label>Background</label><div class="right"><div class="swatch" id="sw-BackgroundColor" onclick="openPicker(\'BackgroundColor\')"></div></div></div>'
      + '<div class="expand-row" onclick="toggle(\'text\')">'
      + '<label>Text</label>'
      + '<div class="right"><div class="swatch" id="sw-TimeTextColor" onclick="openPicker(\'TimeTextColor\');event.stopPropagation()"></div><span class="expand-btn" id="btn-text">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-text">'
      + '<div class="sub-row"><label>Time</label><div class="swatch" id="sw-TimeTextColor2" onclick="openPicker(\'TimeTextColor\')"></div></div>'
      + '<div class="sub-row"><label>Date &amp; Day</label><div class="swatch" id="sw-DateTextColor" onclick="openPicker(\'DateTextColor\')"></div></div>'
      + '</div>'
      + '<div class="expand-row" onclick="toggle(\'lit\')">'
      + '<label>Lit</label>'
      + '<div class="right"><div class="swatch" id="sw-LitHourColor" onclick="openPicker(\'LitHourColor\');event.stopPropagation()"></div><span class="expand-btn" id="btn-lit">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-lit">'
      + '<div class="sub-row"><label>Hour ticks</label><div class="swatch" id="sw-LitHourColor2" onclick="openPicker(\'LitHourColor\')"></div></div>'
      + '<div class="sub-row"><label>Minute ticks</label><div class="swatch" id="sw-LitMinuteColor" onclick="openPicker(\'LitMinuteColor\')"></div></div>'
      + '<div class="sub-row"><label>Battery bar</label><div class="swatch" id="sw-LitBatteryColor" onclick="openPicker(\'LitBatteryColor\')"></div></div>'
      + '<div class="sub-row"><label>Step bar</label><div class="swatch" id="sw-LitStepsColor" onclick="openPicker(\'LitStepsColor\')"></div></div>'
      + '</div>'
      + '<div class="expand-row" onclick="toggle(\'dim\')">'
      + '<label>Dim</label>'
      + '<div class="right"><div class="swatch" id="sw-DimTickColor" onclick="openPicker(\'DimTickColor\');event.stopPropagation()"></div><span class="expand-btn" id="btn-dim">+</span></div>'
      + '</div>'
      + '<div class="sub-rows" id="sub-dim">'
      + '<div class="sub-row"><label>Tick tracks</label><div class="swatch" id="sw-DimTickColor2" onclick="openPicker(\'DimTickColor\')"></div></div>'
      + '<div class="sub-row"><label>Outer ring</label><div class="swatch" id="sw-DimRingColor" onclick="openPicker(\'DimRingColor\')"></div></div>'
      + '</div>'
      + '</div>' // end colors card
      + '</div>' // end color-section

      + '<div id="bw-section">'
      + '<h2>Display</h2><div class="card">'
      + '<div class="row"><label>Invert (white bg, black ticks)</label>'
      + '<label class="toggle"><input type="checkbox" id="InvertBW"><span class="knob"></span></label></div>'
      + '</div></div>'

      + '<h2>Health</h2><div class="card">'
      + '<div class="slider-wrap">'
      + '<div class="slider-lbl">Daily Step Goal <span id="goalVal">10,000</span></div>'
      + '<input type="range" id="StepGoal" min="1000" max="30000" step="500" value="10000"'
      + ' oninput="document.getElementById(\'goalVal\').textContent=parseInt(this.value).toLocaleString()">'
      + '</div></div>'

      + '<button class="save" onclick="save()">Save to Watch</button>'

      // Palette picker modal
      + '<div class="modal-bg" id="modal"><div class="modal">'
      + '<h3 id="modal-title">Pick a color</h3>'
      + '<div class="palette" id="palette-grid"></div>'
      + '<button class="modal-cancel" onclick="closePicker()">Cancel</button>'
      + '</div></div>'

      + '<script>'
      + platformData
      + presetsData
      + paletteData

      // Color store: key -> hex
      + 'var colors={'
      + 'BackgroundColor:"#000000",'
      + 'TimeTextColor:"#ffffff",'
      + 'DateTextColor:"#aaaaaa",'
      + 'LitHourColor:"#aaffaa",'
      + 'LitMinuteColor:"#aaffaa",'
      + 'LitBatteryColor:"#aaffaa",'
      + 'LitStepsColor:"#aaffaa",'
      + 'DimTickColor:"#1a2a1a",'
      + 'DimRingColor:"#111111"'
      + '};'

      // Swatch aliases: some swatches mirror another key
      + 'var aliases={'
      + '"sw-TimeTextColor2":"TimeTextColor",'
      + '"sw-LitHourColor2":"LitHourColor",'
      + '"sw-DimTickColor2":"DimTickColor"'
      + '};'

      // Update all swatches for a key
      + 'function updateSwatches(key,hex){'
      + 'colors[key]=hex;'
      + 'var swIds=["sw-"+key];'
      + 'Object.keys(aliases).forEach(function(sid){if(aliases[sid]===key)swIds.push(sid);});'
      + 'swIds.forEach(function(sid){'
      + 'var el=document.getElementById(sid);'
      + 'if(el)el.style.background=hex;'
      + '});}'

      // Init all swatches
      + 'function initSwatches(){'
      + 'Object.keys(colors).forEach(function(k){updateSwatches(k,colors[k]);});}'

      // Load current settings from watch
      + 'function loadSettings(){'
      + 'try{'
      + 'if(!CURRENT)return;'
      + 'Object.keys(CURRENT).forEach(function(k){'
      + 'if(k==="OverlayMode"){var el=document.getElementById("ov"+CURRENT[k]);if(el)el.checked=true;}'
      + 'else if(k==="InvertBW"){document.getElementById("InvertBW").checked=!!CURRENT[k];}'
      + 'else if(k==="StepGoal"){var el=document.getElementById("StepGoal");el.value=CURRENT[k];document.getElementById("goalVal").textContent=parseInt(CURRENT[k]).toLocaleString();}'
      + 'else if(colors[k]!==undefined){var hex="#"+(CURRENT[k]>>>0).toString(16).padStart(6,"0");updateSwatches(k,hex);}'
      + '});'
      + '}catch(e){}}'

      // Platform detection: hide color section on B&W, hide invert on color
      + 'function applyPlatform(){'
      + 'var isColor=(PLATFORM!=="bw");'
      + 'document.getElementById("color-section").style.display=isColor?"":"none";'
      + 'document.getElementById("bw-section").style.display=isColor?"none":"";'
      + '}'  // fail gracefully in simulator

      // Expand/collapse
      + 'function toggle(id){'
      + 'var sub=document.getElementById("sub-"+id);'
      + 'var btn=document.getElementById("btn-"+id);'
      + 'var open=sub.classList.toggle("open");'
      + 'btn.classList.toggle("open",open);}'

      // Palette picker
      + 'var pickerTarget=null;'
      + 'function openPicker(key){'
      + 'pickerTarget=key;'
      + 'document.getElementById("modal-title").textContent=key.replace(/([A-Z])/g," $1").trim();'
      + 'var grid=document.getElementById("palette-grid");'
      + 'grid.innerHTML="";'
      + 'PALETTE.forEach(function(hex){'
      + 'var d=document.createElement("div");'
      + 'd.className="pal-swatch"+(colors[key]===hex?" selected":"");'
      + 'd.style.background=hex;'
      + 'd.title=PALETTE_NAMES[hex]||hex;'
      + 'd.onclick=function(){pickColor(hex);};'
      + 'grid.appendChild(d);});'
      + 'document.getElementById("modal").classList.add("open");}'

      + 'function pickColor(hex){'
      + 'if(!pickerTarget)return;'
      + 'updateSwatches(pickerTarget,hex);'
      + 'closePicker();}'

      + 'function closePicker(){'
      + 'document.getElementById("modal").classList.remove("open");'
      + 'pickerTarget=null;}'

      // Apply preset
      + 'function applyPreset(i){'
      + 'var p=PRESETS[i];'
      + 'updateSwatches("BackgroundColor",p.bg);'
      + 'updateSwatches("TimeTextColor",p.timeText);'
      + 'updateSwatches("DateTextColor",p.dateText);'
      + 'updateSwatches("LitHourColor",p.litH);'
      + 'updateSwatches("LitMinuteColor",p.litM);'
      + 'updateSwatches("LitBatteryColor",p.litB);'
      + 'updateSwatches("LitStepsColor",p.litS);'
      + 'updateSwatches("DimTickColor",p.dimT);'
      + 'updateSwatches("DimRingColor",p.dimR);}'

      + 'function h(hex){return parseInt(hex.slice(1),16);}'
      + 'function tog(id){return document.getElementById(id).checked?1:0;}'

      + 'function save(){'
      + 'var ov=parseInt(document.querySelector(\'input[name="overlay"]:checked\').value);'
      + 'var s={'
      + 'OverlayMode:ov,'
      + 'BackgroundColor:h(colors.BackgroundColor),'
      + 'TimeTextColor:h(colors.TimeTextColor),'
      + 'DateTextColor:h(colors.DateTextColor),'
      + 'LitHourColor:h(colors.LitHourColor),'
      + 'LitMinuteColor:h(colors.LitMinuteColor),'
      + 'LitBatteryColor:h(colors.LitBatteryColor),'
      + 'LitStepsColor:h(colors.LitStepsColor),'
      + 'DimTickColor:h(colors.DimTickColor),'
      + 'DimRingColor:h(colors.DimRingColor),'
      + 'InvertBW:tog("InvertBW"),'
      + 'StepGoal:parseInt(document.getElementById("StepGoal").value)'
      + '};'
      + 'window.location="pebblejs://close#"+encodeURIComponent(JSON.stringify(s));}'

      // Boot
      + 'loadSettings();'
      + 'initSwatches();'
      + 'applyPlatform();'
      + '</script></body></html>';
    return 'data:text/html,' + encodeURIComponent(html);
  }
};
