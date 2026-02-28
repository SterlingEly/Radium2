module.exports = [
{
“type”: “heading”,
“defaultValue”: “Radium”
},
{
“type”: “text”,
“defaultValue”: “Customize your watchface colors and health goals.”
},

// ── Colors ───────────────────────────────────────────────
{
“type”: “section”,
“items”: [
{
“type”: “heading”,
“defaultValue”: “Colors”
},
{
“type”: “color”,
“messageKey”: “BackgroundColor”,
“defaultValue”: “0x000000”,
“label”: “Background”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “TextColor”,
“defaultValue”: “0xFFFFFF”,
“label”: “Time & Date Text”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “BatteryColor”,
“defaultValue”: “0xAAAAAA”,
“label”: “Battery Arc”,
“description”: “Right side outer ring”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “StepsColor”,
“defaultValue”: “0x00AAFF”,
“label”: “Steps Arc”,
“description”: “Left side outer ring”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “TickHourColor”,
“defaultValue”: “0xFFFFFF”,
“label”: “Hour Ticks”,
“description”: “Left half inner ring”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “TickMinuteColor”,
“defaultValue”: “0x00AAFF”,
“label”: “Minute Ticks”,
“description”: “Right half inner ring”,
“sunlight”: true,
“capabilities”: [“COLOR”]
},
{
“type”: “color”,
“messageKey”: “RingEmptyColor”,
“defaultValue”: “0x555555”,
“label”: “Empty Ring Track”,
“description”: “Unfilled portions of all rings”,
“sunlight”: true,
“capabilities”: [“COLOR”]
}
]
},

// ── Health ───────────────────────────────────────────────
{
“type”: “section”,
“items”: [
{
“type”: “heading”,
“defaultValue”: “Health”
},
{
“type”: “slider”,
“messageKey”: “StepGoal”,
“defaultValue”: 10000,
“label”: “Daily Step Goal”,
“description”: “Left arc fills as you approach this target”,
“min”: 1000,
“max”: 30000,
“step”: 1000
}
]
},

{
“type”: “submit”,
“defaultValue”: “Save Settings”
}
];