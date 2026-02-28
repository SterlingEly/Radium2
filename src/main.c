#include <pebble.h>

// ============================================================
// CONFIGURATION (defaults, overridden by user settings)
// ============================================================
#define DEFAULT_STEP_GOAL 10000

static int s_step_goal = DEFAULT_STEP_GOAL;

// ============================================================
// STATE
// ============================================================
static Window *s_window;
static Layer  *s_canvas_layer;

static int s_hour    = 0;
static int s_minute  = 0;
static int s_battery = 100;
static int s_steps   = 0;

static char s_time_buffer[16];
static char s_day_buffer[16];
static char s_date_buffer[16];

// ============================================================
// COLORS  (gracefully degrade to B&W on Aplite/Diorite/Flint)
// ============================================================
static GColor COLOR_BACKGROUND;
static GColor COLOR_TEXT;
static GColor COLOR_OUTER_EMPTY;
static GColor COLOR_BATTERY_FILLED;
static GColor COLOR_STEPS_FILLED;
static GColor COLOR_TICK_EMPTY;
static GColor COLOR_TICK_HOUR;
static GColor COLOR_TICK_MINUTE;

static void init_colors(void) {
#if defined(PBL_COLOR)
COLOR_BACKGROUND     = GColorBlack;
COLOR_TEXT           = GColorWhite;
COLOR_OUTER_EMPTY    = GColorDarkGray;
COLOR_BATTERY_FILLED = GColorLightGray;
COLOR_STEPS_FILLED   = GColorTiffanyBlue;
COLOR_TICK_EMPTY     = GColorDarkGray;
COLOR_TICK_HOUR      = GColorWhite;
COLOR_TICK_MINUTE    = GColorTiffanyBlue;
#else
// B&W platforms: Aplite (OG Pebble), Diorite (Pebble 2), Flint (Pebble 2 Duo)
COLOR_BACKGROUND     = GColorBlack;
COLOR_TEXT           = GColorWhite;
COLOR_OUTER_EMPTY    = GColorDarkGray;
COLOR_BATTERY_FILLED = GColorWhite;
COLOR_STEPS_FILLED   = GColorWhite;
COLOR_TICK_EMPTY     = GColorDarkGray;
COLOR_TICK_HOUR      = GColorWhite;
COLOR_TICK_MINUTE    = GColorWhite;
#endif
}

// ============================================================
// HELPERS
// ============================================================
static const char* get_day_name(int wday) {
// tm_wday: 0=Sunday … 6=Saturday
switch (wday) {
case 0: return “SUNDAY”;
case 1: return “MONDAY”;
case 2: return “TUESDAY”;
case 3: return “WEDNESDAY”;
case 4: return “THURSDAY”;
case 5: return “FRIDAY”;
case 6: return “SATURDAY”;
default: return “”;
}
}

static const char* get_month_abbr(int mon) {
// tm_mon: 0=Jan … 11=Dec
static const char *months[] = {
“JAN”,“FEB”,“MAR”,“APR”,“MAY”,“JUN”,
“JUL”,“AUG”,“SEP”,“OCT”,“NOV”,“DEC”
};
if (mon >= 0 && mon < 12) return months[mon];
return “”;
}

// ============================================================
// DRAWING
// ============================================================
static void draw_layer(Layer *layer, GContext *ctx) {
GRect bounds = layer_get_unobstructed_bounds(layer);
int w = bounds.size.w;
int h = bounds.size.h;

// On rectangular screens the drawable circle is limited by the shorter axis.
// On round screens, w == h already.
int diameter = (w < h) ? w : h;
int cx       = w / 2;
int cy       = h / 2;

// Outer ring inset from the edge
int outer_inset  = 2;
int outer_thick  = 6;

// Inner tick ring — inset further inside the outer ring
int tick_margin  = outer_inset + outer_thick + 2;
int tick_thick   = 19;  // matches original “overlay” mode

// ── Background ──────────────────────────────────────────
graphics_context_set_fill_color(ctx, COLOR_BACKGROUND);
graphics_fill_rect(ctx, bounds, 0, GCornerNone);

// ── Outer ring geometry ──────────────────────────────────
// Centre the ring on the display regardless of aspect ratio
GRect outer_frame = GRect(
cx - diameter/2 + outer_inset,
cy - diameter/2 + outer_inset,
diameter - 2*outer_inset,
diameter - 2*outer_inset
);

// ── BATTERY arc  (right half: 0°→180°, fills from bottom-right to top) ──
// Empty track
graphics_context_set_fill_color(ctx, COLOR_OUTER_EMPTY);
graphics_fill_radial(ctx, outer_frame, GOvalScaleModeFitCircle,
outer_thick,
DEG_TO_TRIGANGLE(3),
DEG_TO_TRIGANGLE(180 - 3));
// Filled portion (battery %)
// Fills from the top-right (3°) clockwise proportional to battery level
int32_t batt_end = DEG_TO_TRIGANGLE(3 + (int)((180 - 6) * s_battery / 100));
graphics_context_set_fill_color(ctx, COLOR_BATTERY_FILLED);
if (s_battery > 0) {
graphics_fill_radial(ctx, outer_frame, GOvalScaleModeFitCircle,
outer_thick,
DEG_TO_TRIGANGLE(3),
batt_end);
}

// ── STEPS arc  (left half: 180°→360°, fills from bottom-left to top) ──
// Empty track
graphics_context_set_fill_color(ctx, COLOR_OUTER_EMPTY);
graphics_fill_radial(ctx, outer_frame, GOvalScaleModeFitCircle,
outer_thick,
DEG_TO_TRIGANGLE(180 + 3),
DEG_TO_TRIGANGLE(360 - 3));
// Filled portion (step goal %)
int step_pct = (s_steps * 100) / s_step_goal;
if (step_pct > 100) step_pct = 100;
int32_t steps_end = DEG_TO_TRIGANGLE(180 + 3 + (int)((180 - 6) * step_pct / 100));
graphics_context_set_fill_color(ctx, COLOR_STEPS_FILLED);
if (step_pct > 0) {
graphics_fill_radial(ctx, outer_frame, GOvalScaleModeFitCircle,
outer_thick,
DEG_TO_TRIGANGLE(180 + 3),
steps_end);
}

// ── Tick ring geometry ───────────────────────────────────
GRect tick_frame = GRect(
cx - diameter/2 + tick_margin,
cy - diameter/2 + tick_margin,
diameter - 2*tick_margin,
diameter - 2*tick_margin
);

// ── MINUTE ticks (right half: 0°→180°, 60 ticks total → 30 per half) ──
// 30 ticks fit in 177° (180° minus 3° gap on each side)
// Each tick = 2° wide with 1° gap, plus every 5th has extra 5° space
graphics_context_set_fill_color(ctx, COLOR_TICK_EMPTY);
for (int i = 0; i < 60; i++) {
graphics_fill_radial(ctx, tick_frame, GOvalScaleModeFitCircle,
tick_thick,
DEG_TO_TRIGANGLE(3 + 2*i + 5*(i/5)),
DEG_TO_TRIGANGLE(3 + 2*i + 1 + 5*(i/5)));
}
graphics_context_set_fill_color(ctx, COLOR_TICK_MINUTE);
for (int i = 0; i < s_minute; i++) {
graphics_fill_radial(ctx, tick_frame, GOvalScaleModeFitCircle,
tick_thick,
DEG_TO_TRIGANGLE(3 + 2*i + 5*(i/5)),
DEG_TO_TRIGANGLE(3 + 2*i + 1 + 5*(i/5)));
}

// ── HOUR ticks (left half: 180°→360°, 12 ticks) ──
graphics_context_set_fill_color(ctx, COLOR_TICK_EMPTY);
for (int i = 0; i < 12; i++) {
graphics_fill_radial(ctx, tick_frame, GOvalScaleModeFitCircle,
tick_thick,
DEG_TO_TRIGANGLE(180 + 3 + 15*i),
DEG_TO_TRIGANGLE(180 + 3 + 15*i + 9));
}
graphics_context_set_fill_color(ctx, COLOR_TICK_HOUR);
for (int i = 0; i < s_hour; i++) {
graphics_fill_radial(ctx, tick_frame, GOvalScaleModeFitCircle,
tick_thick,
DEG_TO_TRIGANGLE(180 + 3 + 15*i),
DEG_TO_TRIGANGLE(180 + 3 + 15*i + 9));
}

// ── Centre text ──────────────────────────────────────────
// Scale font area relative to display size
// Original was 33px tall time text on a 180px display
int text_h_time = (h * 33) / 180;
int text_h_sub  = (h * 11) / 180;
int text_y_base = (h - text_h_time) / 2 - 4;

graphics_context_set_text_color(ctx, COLOR_TEXT);

// Time
graphics_draw_text(ctx, s_time_buffer,
fonts_get_system_font(FONT_KEY_LECO_28_LIGHT_NUMBERS),
GRect(0, text_y_base, w, text_h_time + 4),
GTextOverflowModeFill, GTextAlignmentCenter, NULL);

// Day name
graphics_draw_text(ctx, s_day_buffer,
fonts_get_system_font(FONT_KEY_GOTHIC_14),
GRect(0, text_y_base + text_h_time + 2, w, text_h_sub + 4),
GTextOverflowModeFill, GTextAlignmentCenter, NULL);

// Date
graphics_draw_text(ctx, s_date_buffer,
fonts_get_system_font(FONT_KEY_GOTHIC_14_BOLD),
GRect(0, text_y_base + text_h_time + text_h_sub + 4, w, text_h_sub + 4),
GTextOverflowModeFill, GTextAlignmentCenter, NULL);
}

// ============================================================
// TICK HANDLER
// ============================================================
static void tick_handler(struct tm *t, TimeUnits units_changed) {
s_hour   = t->tm_hour % 12;
s_minute = t->tm_min;

snprintf(s_time_buffer, sizeof(s_time_buffer),
“%02d:%02d”,
clock_is_24h_style() ? t->tm_hour : t->tm_hour % 12,
t->tm_min);

snprintf(s_day_buffer,  sizeof(s_day_buffer),  “%s”, get_day_name(t->tm_wday));
snprintf(s_date_buffer, sizeof(s_date_buffer), “%s %02d”,
get_month_abbr(t->tm_mon), t->tm_mday);

layer_mark_dirty(s_canvas_layer);
}

// ============================================================
// BATTERY HANDLER
// ============================================================
static void battery_handler(BatteryChargeState state) {
s_battery = state.charge_percent;
layer_mark_dirty(s_canvas_layer);
}

// ============================================================
// HEALTH / STEPS HANDLER
// ============================================================
#if defined(PBL_HEALTH)
static void update_steps(void) {
HealthMetric metric = HealthMetricStepCount;
time_t start        = time_start_of_today();
time_t end          = time(NULL);
HealthServiceAccessibilityMask mask =
health_service_metric_accessible(metric, start, end);

if (mask & HealthServiceAccessibilityMaskAvailable) {
s_steps = (int)health_service_sum_today(metric);
} else {
s_steps = 0;
}
layer_mark_dirty(s_canvas_layer);
}

static void health_handler(HealthEventType event, void *context) {
if (event == HealthEventMovementUpdate) {
update_steps();
}
}
#endif  // PBL_HEALTH

// ============================================================
// PERSISTENT STORAGE — user settings
// ============================================================
#define PERSIST_KEY_STEP_GOAL 1

static void load_settings(void) {
if (persist_exists(PERSIST_KEY_STEP_GOAL)) {
s_step_goal = persist_read_int(PERSIST_KEY_STEP_GOAL);
} else {
s_step_goal = DEFAULT_STEP_GOAL;
}
}

// ============================================================
// APP MESSAGE — receive settings from phone config page
// ============================================================
static void inbox_received(DictionaryIterator *iter, void *context) {
Tuple *goal_t = dict_find(iter, MESSAGE_KEY_StepGoal);
if (goal_t) {
s_step_goal = (int)goal_t->value->int32;
persist_write_int(PERSIST_KEY_STEP_GOAL, s_step_goal);
layer_mark_dirty(s_canvas_layer);
}
}

// ============================================================
// WINDOW LIFECYCLE
// ============================================================
static void window_load(Window *window) {
Layer *root = window_get_root_layer(window);
GRect bounds = layer_get_bounds(root);

s_canvas_layer = layer_create(bounds);
layer_set_update_proc(s_canvas_layer, draw_layer);
layer_add_child(root, s_canvas_layer);
}

static void window_unload(Window *window) {
layer_destroy(s_canvas_layer);
}

// ============================================================
// INIT / DEINIT
// ============================================================
static void init(void) {
load_settings();
init_colors();

s_window = window_create();
window_set_window_handlers(s_window, (WindowHandlers){
.load   = window_load,
.unload = window_unload,
});
window_set_background_color(s_window, COLOR_BACKGROUND);
window_stack_push(s_window, true);

// Seed current time immediately
time_t now = time(NULL);
struct tm *t = localtime(&now);
tick_handler(t, MINUTE_UNIT);

// Subscribe to events
tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);

battery_state_service_subscribe(battery_handler);
battery_handler(battery_state_service_peek());

#if defined(PBL_HEALTH)
health_service_events_subscribe(health_handler, NULL);
update_steps();
#endif

// App message for phone-based settings
app_message_register_inbox_received(inbox_received);
app_message_open(128, 128);
}

static void deinit(void) {
tick_timer_service_unsubscribe();
battery_state_service_unsubscribe();
#if defined(PBL_HEALTH)
health_service_events_unsubscribe();
#endif
window_destroy(s_window);
}

// ============================================================
// MAIN
// ============================================================
int main(void) {
init();
app_event_loop();
deinit();
}