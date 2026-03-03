#include <pebble.h>

// ============================================================
// CONSTANTS
// ============================================================
#define SETTINGS_KEY      1
#define DEFAULT_STEP_GOAL 10000
#define RING_GAP          2    // px gap between outer ring inner edge and tick radials
#define RING_THICK        6    // outer ring thickness in px

// OverlayMode values
#define OVERLAY_ON     0
#define OVERLAY_OFF    1
#define OVERLAY_SHAKE  2

// ============================================================
// SETTINGS
// ============================================================
typedef struct {
  GColor BackgroundColor;  // canvas background
  GColor TimeTextColor;    // time digits
  GColor DateTextColor;    // day name + date string
  GColor LitHourColor;     // filled hour ticks
  GColor LitMinuteColor;   // filled minute ticks
  GColor LitBatteryColor;  // battery bar fill
  GColor LitStepsColor;    // steps bar fill
  GColor DimTickColor;     // empty tick tracks
  GColor DimRingColor;     // empty outer ring
  int    StepGoal;
  int    OverlayMode;      // OVERLAY_ON / OVERLAY_OFF / OVERLAY_SHAKE
  bool   InvertBW;         // B&W only: swap black/white at draw time
} RadiumSettings;

static RadiumSettings s_settings;

static void prv_default_settings(void) {
  s_settings.BackgroundColor = GColorBlack;
#if defined(PBL_COLOR)
  // Radium green defaults
  s_settings.TimeTextColor   = GColorWhite;
  s_settings.DateTextColor   = GColorWhite;
  s_settings.LitHourColor    = GColorMintGreen;   // soft mint-white, luminous
  s_settings.LitMinuteColor  = GColorMintGreen;
  s_settings.LitBatteryColor = GColorMintGreen;
  s_settings.LitStepsColor   = GColorMintGreen;
  s_settings.DimTickColor    = GColorDarkGray;
  s_settings.DimRingColor    = GColorDarkGray;
#else
  s_settings.TimeTextColor   = GColorWhite;
  s_settings.DateTextColor   = GColorWhite;
  s_settings.LitHourColor    = GColorWhite;
  s_settings.LitMinuteColor  = GColorWhite;
  s_settings.LitBatteryColor = GColorWhite;
  s_settings.LitStepsColor   = GColorWhite;
  s_settings.DimTickColor    = GColorDarkGray;
  s_settings.DimRingColor    = GColorDarkGray;
#endif
  s_settings.StepGoal    = DEFAULT_STEP_GOAL;
  s_settings.OverlayMode = OVERLAY_SHAKE;
  s_settings.InvertBW    = false;
}

static void prv_save_settings(void) {
  persist_write_data(SETTINGS_KEY, &s_settings, sizeof(s_settings));
}

static void prv_load_settings(void) {
  prv_default_settings();
  persist_read_data(SETTINGS_KEY, &s_settings, sizeof(s_settings));
}

// ============================================================
// STATE
// ============================================================
static Window *s_window;
static Layer  *s_canvas_layer;

static int  s_hour    = 0;
static int  s_minute  = 0;
static int  s_battery = 100;
static int  s_steps   = 0;
static bool s_show_overlay = true;  // runtime state; synced from OverlayMode on load

static char s_time_buffer[8];
static char s_day_buffer[12];
static char s_date_buffer[10];

// Pre-allocated GPath for rect wedge drawing (avoids per-frame allocation)
static GPoint    s_tri_pts[3];
static GPathInfo s_tri_info = { .num_points = 3, .points = s_tri_pts };
static GPath    *s_tri_path = NULL;

// ============================================================
// HELPERS
// ============================================================
static const char *get_day_name(int wday) {
  static const char *days[] = {
    "SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"
  };
  return (wday >= 0 && wday < 7) ? days[wday] : "";
}

static const char *get_month_abbr(int mon) {
  static const char *months[] = {
    "JAN","FEB","MAR","APR","MAY","JUN",
    "JUL","AUG","SEP","OCT","NOV","DEC"
  };
  return (mon >= 0 && mon < 12) ? months[mon] : "";
}

// Returns true when the time/date overlay should be drawn
static bool prv_overlay_visible(void) {
  return (s_settings.OverlayMode != OVERLAY_OFF) && s_show_overlay;
}

// Draw a filled wedge triangle from center outward between two trig angles.
// Radius is large enough to exit the screen; the layer clips the rest.
static void draw_wedge(GContext *ctx, int cx, int cy, int radius,
                       int32_t a1, int32_t a2) {
  s_tri_pts[0] = GPoint(cx, cy);
  s_tri_pts[1] = GPoint(cx + radius * sin_lookup(a1) / TRIG_MAX_RATIO,
                        cy - radius * cos_lookup(a1) / TRIG_MAX_RATIO);
  s_tri_pts[2] = GPoint(cx + radius * sin_lookup(a2) / TRIG_MAX_RATIO,
                        cy - radius * cos_lookup(a2) / TRIG_MAX_RATIO);
  gpath_draw_filled(ctx, s_tri_path);
}

// ============================================================
// DRAW
// ============================================================
static void draw_layer(Layer *layer, GContext *ctx) {
  GRect bounds = layer_get_unobstructed_bounds(layer);
  int w  = bounds.size.w;
  int h  = bounds.size.h;
  int cx = w / 2;
  int cy = h / 2;

#if defined(PBL_ROUND)
  const bool is_round = true;
#else
  const bool is_round = false;
#endif

  // ----------------------------------------------------------
  // EFFECTIVE COLORS
  // B&W: InvertBW swaps black/white. All color vars resolved once here.
  // ----------------------------------------------------------
#if defined(PBL_BW)
  GColor bw_lit   = s_settings.InvertBW ? GColorBlack     : GColorWhite;
  GColor bw_dim   = s_settings.InvertBW ? GColorLightGray : GColorDarkGray;
  GColor col_bg   = s_settings.InvertBW ? GColorWhite     : GColorBlack;
  GColor col_fg   = s_settings.InvertBW ? GColorBlack     : GColorWhite;
  GColor col_dfg  = col_fg;   // date text on B&W: same as time text
  GColor col_tick = bw_lit;
  GColor col_hour = bw_lit;
  GColor col_batt = bw_lit;
  GColor col_step = bw_lit;
  GColor col_empty = bw_dim;
  GColor col_ring  = bw_dim;
#else
  GColor col_bg   = s_settings.BackgroundColor;
  GColor col_fg   = s_settings.TimeTextColor;
  GColor col_dfg  = s_settings.DateTextColor;
  GColor col_tick = s_settings.LitMinuteColor;
  GColor col_hour = s_settings.LitHourColor;
  GColor col_batt = s_settings.LitBatteryColor;
  GColor col_step = s_settings.LitStepsColor;
  GColor col_empty = s_settings.DimTickColor;
  GColor col_ring  = s_settings.DimRingColor;
#endif

  // ----------------------------------------------------------
  // LAYOUT
  // ----------------------------------------------------------
  int inset      = RING_THICK + RING_GAP;
  GRect tick_rect  = GRect(inset, inset, w - 2*inset, h - 2*inset);
  int inner_short  = (tick_rect.size.w < tick_rect.size.h)
                     ? tick_rect.size.w : tick_rect.size.h;

  // Tick ring thickness -- controls inner hole size on round screens.
  // Art mode (OVERLAY_OFF): fill ring completely (pure starburst).
  // Round: tuned per screen size. Rect: original ratio.
  int tick_thick;
  if (s_settings.OverlayMode == OVERLAY_OFF) {
    tick_thick = inner_short;
  } else {
#if defined(PBL_ROUND)
    tick_thick = (h > 180) ? inner_short * 36 / 164   // Gabbro: 128px hole = 64px radius (matches Emery overlay)
                           : inner_short * 18 / 164;  // Chalk:  116px hole = 58px radius (matches low-res rect overlay)
#else
    tick_thick = inner_short * 19 / 164;
#endif
  }

  // Wedge radius: oversized; layer clips to screen bounds
  int radius = ((w > h) ? w : h) - RING_THICK - 1;

  // Stroke has no effect on gpath_draw_filled; set 0 to be explicit
  graphics_context_set_stroke_width(ctx, 0);

  // ----------------------------------------------------------
  // BACKGROUND
  // ----------------------------------------------------------
  graphics_context_set_fill_color(ctx, col_bg);
  graphics_fill_rect(ctx, bounds, 0, GCornerNone);

  // ----------------------------------------------------------
  // TICK MARKS
  // ----------------------------------------------------------
  if (!is_round) {
    // RECT: wedge triangles from center, clipped by layer.
    // Minutes: right half  3..178 deg, 12 groups of 5 ticks (10 deg/group).
    // Hours:   left  half 183..357 deg, 12 hour blocks (10 deg each).
    // Color: 1deg gap separators cut after each group.
    // B&W:   solid blocks only (narrow gaps look noisy due to dithering).

    int filled_groups = s_minute / 5;
    int partial_min   = s_minute % 5;

    // -- Minutes: empty groups --
    graphics_context_set_fill_color(ctx, col_empty);
    graphics_context_set_stroke_color(ctx, col_empty);
    for (int g = filled_groups + (partial_min > 0 ? 1 : 0); g < 12; g++) {
      int a = 3 + 15*g;
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 10));
    }
#if defined(PBL_COLOR)
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_context_set_stroke_color(ctx, col_bg);
    for (int g = filled_groups + (partial_min > 0 ? 1 : 0); g < 12; g++) {
      int base = 3 + 15*g;
      for (int i = 0; i < 4; i++) {
        int gap = base + 2*i + 1;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(gap), DEG_TO_TRIGANGLE(gap + 1));
      }
    }
#endif

    // -- Minutes: filled groups --
    graphics_context_set_fill_color(ctx, col_tick);
    graphics_context_set_stroke_color(ctx, col_tick);
    for (int g = 0; g < filled_groups; g++) {
      int a = 3 + 15*g;
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 10));
    }
#if defined(PBL_COLOR)
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_context_set_stroke_color(ctx, col_bg);
    for (int g = 0; g < filled_groups; g++) {
      int base = 3 + 15*g;
      for (int i = 0; i < 4; i++) {
        int gap = base + 2*i + 1;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(gap), DEG_TO_TRIGANGLE(gap + 1));
      }
    }
#endif

    // -- Minutes: partial group --
    if (partial_min > 0) {
      int a = 3 + 15*filled_groups;
      // Empty base block
      graphics_context_set_fill_color(ctx, col_empty);
      graphics_context_set_stroke_color(ctx, col_empty);
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 10));
#if defined(PBL_COLOR)
      // Gap cuts
      graphics_context_set_fill_color(ctx, col_bg);
      graphics_context_set_stroke_color(ctx, col_bg);
      for (int i = 0; i < 4; i++) {
        int gap = a + 2*i + 1;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(gap), DEG_TO_TRIGANGLE(gap + 1));
      }
#endif
      // Filled ticks overdraw: 1deg color, 2deg B&W
      graphics_context_set_fill_color(ctx, col_tick);
      graphics_context_set_stroke_color(ctx, col_tick);
      for (int i = 0; i < partial_min; i++) {
        int ta = a + 2*i;
#if defined(PBL_BW)
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(ta), DEG_TO_TRIGANGLE(ta + 2));
#else
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(ta), DEG_TO_TRIGANGLE(ta + 1));
#endif
      }
    }

    // -- Hours --
    // 12h mode: each slot = 10deg solid.
    // 24h mode: each slot split into two 4deg segments with 2deg gap.
    //   slot = hour/2, first seg = even hours, second seg = odd hours.
    bool is_24h = clock_is_24h_style();
    // 24h: slot = pair of hours (0-11), half = which within pair (0=first, 1=second)
    // 12h: slot = hour (0-11)
    int filled_slots = is_24h ? (s_hour / 2) : (s_hour % 12);
    int filled_half  = s_hour % 2;  // 24h only: 0=first half only, 1=both halves

    // Empty slot bases (all 12 slots, full 10deg each)
    graphics_context_set_fill_color(ctx, col_empty);
    graphics_context_set_stroke_color(ctx, col_empty);
    for (int h2 = 0; h2 < 12; h2++) {
      int a = 183 + 15*h2;
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 10));
    }
#if defined(PBL_COLOR)
    // Slot separators: 1deg gap after each block (color only -- too noisy on B&W)
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_context_set_stroke_color(ctx, col_bg);
    for (int h2 = 0; h2 < 12; h2++) {
      int a = 183 + 15*h2;
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a + 10), DEG_TO_TRIGANGLE(a + 11));
    }
    // 24h: 2deg internal mid-slot gap (color only)
    if (is_24h) {
      for (int h2 = 0; h2 < 12; h2++) {
        int a = 183 + 15*h2 + 4;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 2));
      }
    }
#endif

    // Filled hours
    graphics_context_set_fill_color(ctx, col_hour);
    graphics_context_set_stroke_color(ctx, col_hour);
    if (!is_24h) {
      for (int h2 = 0; h2 < filled_slots; h2++) {
        int a = 183 + 15*h2;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 10));
      }
    } else {
      // Complete slots: both halves filled
      for (int h2 = 0; h2 < filled_slots; h2++) {
        int a = 183 + 15*h2;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a),     DEG_TO_TRIGANGLE(a + 4));
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a + 6), DEG_TO_TRIGANGLE(a + 10));
      }
      // Current partial slot
      if (filled_slots < 12) {
        int a = 183 + 15*filled_slots;
        // First half always lit in current slot (we're at least at the even hour)
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 4));
        // Second half lit only on odd hour
        if (filled_half == 1) {
          draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a + 6), DEG_TO_TRIGANGLE(a + 10));
        }
      }
    }
#if defined(PBL_COLOR)
    // Re-cut separators over filled blocks to restore gaps (color only)
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_context_set_stroke_color(ctx, col_bg);
    for (int h2 = 0; h2 <= filled_slots && h2 < 12; h2++) {
      int a = 183 + 15*h2;
      draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a + 10), DEG_TO_TRIGANGLE(a + 11));
    }
    if (is_24h) {
      for (int h2 = 0; h2 <= filled_slots && h2 < 12; h2++) {
        int a = 183 + 15*h2 + 4;
        draw_wedge(ctx, cx, cy, radius, DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 2));
      }
    }
#endif

  } else {
    // ROUND: fill_radial annulus. Inner hole = natural space inside tick_thick.
    // Minutes: 60 ticks of 1deg each, 1deg gaps, extra 5deg gap every 5th.
    // Hours:   12 blocks of 9deg each.
    graphics_context_set_fill_color(ctx, col_empty);
    for (int i = 0; i < 60; i++) {
      int a = 3 + 2*i + 5*(i/5);
      graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                           DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 1));
    }
    graphics_context_set_fill_color(ctx, col_tick);
    for (int i = 0; i < s_minute; i++) {
      int a = 3 + 2*i + 5*(i/5);
      graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                           DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 1));
    }
    {
      bool is_24h = clock_is_24h_style();
      int filled_slots = is_24h ? (s_hour / 2) : (s_hour % 12);
      int filled_half  = s_hour % 2;
      // Empty slot bases (9deg each, 1deg natural gap to next slot at 15deg spacing)
      graphics_context_set_fill_color(ctx, col_empty);
      for (int h2 = 0; h2 < 12; h2++) {
        int a = 183 + 15*h2;
        graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                             DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 9));
      }
      // 24h: cut 2deg mid-slot gap in empty bases (background color)
      if (is_24h) {
        graphics_context_set_fill_color(ctx, col_bg);
        for (int h2 = 0; h2 < 12; h2++) {
          int a = 183 + 15*h2 + 4;
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 2));
        }
      }
      // Filled hours
      graphics_context_set_fill_color(ctx, col_hour);
      if (!is_24h) {
        for (int h2 = 0; h2 < filled_slots; h2++) {
          int a = 183 + 15*h2;
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 9));
        }
      } else {
        // Complete slots: both halves filled
        for (int h2 = 0; h2 < filled_slots; h2++) {
          int a = 183 + 15*h2;
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 4));
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a + 6), DEG_TO_TRIGANGLE(a + 9));
        }
        // Current partial slot
        if (filled_slots < 12) {
          int a = 183 + 15*filled_slots;
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 4));
          if (filled_half == 1) {
            graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                                 DEG_TO_TRIGANGLE(a + 6), DEG_TO_TRIGANGLE(a + 9));
          }
        }
        // Re-cut mid-slot gaps over filled blocks
        graphics_context_set_fill_color(ctx, col_bg);
        for (int h2 = 0; h2 <= filled_slots && h2 < 12; h2++) {
          int a = 183 + 15*h2 + 4;
          graphics_fill_radial(ctx, tick_rect, GOvalScaleModeFitCircle, tick_thick,
                               DEG_TO_TRIGANGLE(a), DEG_TO_TRIGANGLE(a + 2));
        }
      }
    }
  }

  // ----------------------------------------------------------
  // CENTER OVERLAY CIRCLE (rect only)
  // Covers wedge tips to create a clean center area for text.
  // On round: the inner hole of the tick annulus serves this purpose naturally.
  // Hidden when overlay is off (art mode or shake-toggled off).
  // ----------------------------------------------------------
  if (!is_round && prv_overlay_visible()) {
    // Fixed pixel radius: covers LECO_36 time + GOTHIC_18 day/date block (~82px tall, ~64px wide)
    // Emery (200px) gets a touch more room; all other rect platforms share the base size
    int overlay_r = (w >= 200) ? 64 : 58;
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_fill_circle(ctx, GPoint(cx, cy), overlay_r);
  }

  // ----------------------------------------------------------
  // INNER GAP STRIP (rect only)
  // Background-colored border separating tick radials from outer ring.
  // ----------------------------------------------------------
#if !defined(PBL_ROUND)
  {
    int strip = RING_THICK + RING_GAP;
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_fill_rect(ctx, GRect(0,         0,         w,     strip), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,         h - strip, w,     strip), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,         0,         strip, h    ), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(w - strip, 0,         strip, h    ), 0, GCornerNone);
  }
#endif

  // ----------------------------------------------------------
  // OUTER RING: battery (right half) + steps (left half)
  // 3deg gap at top/bottom center aligns with tick layout.
  // Round: radial arcs flush to screen edge.
  // Rect:  thin filled rects along each edge.
  // ----------------------------------------------------------
  int step_pct = (s_settings.StepGoal > 0)
    ? (s_steps * 100) / s_settings.StepGoal : 0;
  if (step_pct > 100) step_pct = 100;

  if (is_round) {
    // Empty tracks
    graphics_context_set_fill_color(ctx, col_ring);
    graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, RING_THICK,
                         DEG_TO_TRIGANGLE(3),   DEG_TO_TRIGANGLE(177));
    graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, RING_THICK,
                         DEG_TO_TRIGANGLE(183), DEG_TO_TRIGANGLE(357));
    // Battery fill: right half, anchors at 177deg (6 o'clock), fills toward 3deg (12 o'clock)
    if (s_battery > 0) {
      graphics_context_set_fill_color(ctx, col_batt);
      graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, RING_THICK,
                           DEG_TO_TRIGANGLE(177 - 174 * s_battery / 100),
                           DEG_TO_TRIGANGLE(177));
    }
    // Steps fill: left half, anchors at 183deg (6 o'clock), fills toward 357deg (12 o'clock)
    if (step_pct > 0) {
      graphics_context_set_fill_color(ctx, col_step);
      graphics_fill_radial(ctx, bounds, GOvalScaleModeFitCircle, RING_THICK,
                           DEG_TO_TRIGANGLE(183),
                           DEG_TO_TRIGANGLE(183 + 174 * step_pct / 100));
    }
  } else {
    // Rect: right half = battery, left half = steps.
    // Segment order: bottom-center -> edge -> top-center (clockwise).
    int t      = RING_THICK;
    int gap    = 3;         // px gap at center top/bottom (matches 3deg tick gap)
    int half_w = cx - gap;  // horizontal segment length per half
    int total  = half_w + h + half_w;

    // Clear edge strips (wedge tips may have reached here)
    graphics_context_set_fill_color(ctx, col_bg);
    graphics_fill_rect(ctx, GRect(0,   0,   w, t), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,   h-t, w, t), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,   0,   t, h), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(w-t, 0,   t, h), 0, GCornerNone);

    // Battery empty track (right half)
    graphics_context_set_fill_color(ctx, col_ring);
    graphics_fill_rect(ctx, GRect(cx+gap, 0,   half_w, t), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(w-t,    0,   t,      h), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(cx+gap, h-t, half_w, t), 0, GCornerNone);

    // Battery fill: anchors bottom-right, fills counter-clockwise
    {
      int filled = total * s_battery / 100;
      graphics_context_set_fill_color(ctx, col_batt);
      if (filled > 0) {
        int seg = (filled < half_w) ? filled : half_w;
        graphics_fill_rect(ctx, GRect(cx+gap, h-t, seg, t), 0, GCornerNone);
        filled -= seg;
      }
      if (filled > 0) {
        int seg = (filled < h) ? filled : h;
        graphics_fill_rect(ctx, GRect(w-t, h-seg, t, seg), 0, GCornerNone);
        filled -= seg;
      }
      if (filled > 0) {
        int seg = (filled < half_w) ? filled : half_w;
        graphics_fill_rect(ctx, GRect(cx+gap+half_w-seg, 0, seg, t), 0, GCornerNone);
      }
    }

    // Steps empty track (left half)
    graphics_context_set_fill_color(ctx, col_ring);
    graphics_fill_rect(ctx, GRect(0,   0,   half_w, t), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,   0,   t,      h), 0, GCornerNone);
    graphics_fill_rect(ctx, GRect(0,   h-t, half_w, t), 0, GCornerNone);

    // Steps fill: anchors bottom-left, fills counter-clockwise
    if (step_pct > 0) {
      int filled = total * step_pct / 100;
      graphics_context_set_fill_color(ctx, col_step);
      if (filled > 0) {
        int seg = (filled < half_w) ? filled : half_w;
        graphics_fill_rect(ctx, GRect(cx-gap-seg, h-t, seg, t), 0, GCornerNone);
        filled -= seg;
      }
      if (filled > 0) {
        int seg = (filled < h) ? filled : h;
        graphics_fill_rect(ctx, GRect(0, h-seg, t, seg), 0, GCornerNone);
        filled -= seg;
      }
      if (filled > 0) {
        int seg = (filled < half_w) ? filled : half_w;
        graphics_fill_rect(ctx, GRect(0, 0, seg, t), 0, GCornerNone);
      }
    }
  }

  // ----------------------------------------------------------
  // TEXT OVERLAY: DAY / TIME / DATE
  // Shown when prv_overlay_visible() -- i.e. not art mode, not shaken off.
  // Vertically centered as a single block.
  // ----------------------------------------------------------
  if (prv_overlay_visible()) {
    int time_h  = 40;  // LECO_36_BOLD_NUMBERS approximate cap height
    int small_h = 18;  // GOTHIC_18 approximate cap height
    int spacing = 3;   // equal visual margin above/below time
    int block_h = small_h + spacing + time_h + spacing + small_h;
    int top_y   = cy - block_h / 2;

    // Day name (dim/date color)
    graphics_context_set_text_color(ctx, col_dfg);
    graphics_draw_text(ctx, s_day_buffer,
      fonts_get_system_font(FONT_KEY_GOTHIC_18),
      GRect(0, top_y, w, small_h + 2),
      GTextOverflowModeFill, GTextAlignmentCenter, NULL);

    // Time (large, primary text color)
    graphics_context_set_text_color(ctx, col_fg);
    graphics_draw_text(ctx, s_time_buffer,
      fonts_get_system_font(FONT_KEY_LECO_36_BOLD_NUMBERS),
      GRect(0, top_y + small_h + spacing, w, time_h + 4),
      GTextOverflowModeFill, GTextAlignmentCenter, NULL);

    // Date (dim/date color)
    graphics_context_set_text_color(ctx, col_dfg);
    graphics_draw_text(ctx, s_date_buffer,
      fonts_get_system_font(FONT_KEY_GOTHIC_18_BOLD),
      GRect(0, top_y + small_h + spacing + time_h + spacing, w, small_h + 2),
      GTextOverflowModeFill, GTextAlignmentCenter, NULL);
  }
}

// ============================================================
// EVENT HANDLERS
// ============================================================
static void tick_handler(struct tm *t, TimeUnits units_changed) {
  // s_hour: 0-23 raw; draw code converts to 12h slots or 24h split segments
  s_hour   = t->tm_hour;
  s_minute = t->tm_min;
  int disp_hour = clock_is_24h_style() ? t->tm_hour : (t->tm_hour % 12);
  snprintf(s_time_buffer, sizeof(s_time_buffer), "%02d:%02d", disp_hour, t->tm_min);
  snprintf(s_day_buffer,  sizeof(s_day_buffer),  "%s", get_day_name(t->tm_wday));
  snprintf(s_date_buffer, sizeof(s_date_buffer), "%s %02d",
           get_month_abbr(t->tm_mon), t->tm_mday);
  layer_mark_dirty(s_canvas_layer);
}

static void battery_handler(BatteryChargeState state) {
  s_battery = state.charge_percent;
  layer_mark_dirty(s_canvas_layer);
}

#if defined(PBL_HEALTH)
static void update_steps(void) {
  HealthServiceAccessibilityMask mask = health_service_metric_accessible(
    HealthMetricStepCount, time_start_of_today(), time(NULL));
  s_steps = (mask & HealthServiceAccessibilityMaskAvailable)
    ? (int)health_service_sum_today(HealthMetricStepCount) : 0;
  layer_mark_dirty(s_canvas_layer);
}

static void health_handler(HealthEventType event, void *context) {
  if (event == HealthEventMovementUpdate) update_steps();
}
#endif

static void inbox_received(DictionaryIterator *iter, void *context) {
  Tuple *t;
  t = dict_find(iter, MESSAGE_KEY_BackgroundColor);
  if (t) s_settings.BackgroundColor  = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_TimeTextColor);
  if (t) s_settings.TimeTextColor    = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_DateTextColor);
  if (t) s_settings.DateTextColor    = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_LitHourColor);
  if (t) s_settings.LitHourColor     = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_LitMinuteColor);
  if (t) s_settings.LitMinuteColor   = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_LitBatteryColor);
  if (t) s_settings.LitBatteryColor  = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_LitStepsColor);
  if (t) s_settings.LitStepsColor    = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_DimTickColor);
  if (t) s_settings.DimTickColor     = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_DimRingColor);
  if (t) s_settings.DimRingColor     = GColorFromHEX(t->value->int32);
  t = dict_find(iter, MESSAGE_KEY_StepGoal);
  if (t) s_settings.StepGoal = (int)t->value->int32;
  t = dict_find(iter, MESSAGE_KEY_OverlayMode);
  if (t) {
    s_settings.OverlayMode = (int)t->value->int32;
    s_show_overlay = (s_settings.OverlayMode != OVERLAY_OFF);
  }
  t = dict_find(iter, MESSAGE_KEY_InvertBW);
  if (t) s_settings.InvertBW = (t->value->int32 == 1);
  prv_save_settings();
  layer_mark_dirty(s_canvas_layer);
}

static void accel_tap_handler(AccelAxisType axis, int32_t direction) {
  if (s_settings.OverlayMode != OVERLAY_SHAKE) return;
  s_show_overlay = !s_show_overlay;
  // Note: s_show_overlay is intentionally NOT saved -- overlay always starts
  // visible on reboot so the face reads as a normal watchface on first glance.
  layer_mark_dirty(s_canvas_layer);
}

// ============================================================
// WINDOW / APP LIFECYCLE
// ============================================================
static void window_load(Window *window) {
  Layer *root = window_get_root_layer(window);
  s_canvas_layer = layer_create(layer_get_bounds(root));
  layer_set_update_proc(s_canvas_layer, draw_layer);
  layer_add_child(root, s_canvas_layer);
  s_tri_path = gpath_create(&s_tri_info);
  accel_tap_service_subscribe(accel_tap_handler);
}

static void window_unload(Window *window) {
  gpath_destroy(s_tri_path);
  s_tri_path = NULL;
  layer_destroy(s_canvas_layer);
}

static void init(void) {
  prv_load_settings();
  s_show_overlay = (s_settings.OverlayMode != OVERLAY_OFF);

  s_window = window_create();
  window_set_window_handlers(s_window, (WindowHandlers){
    .load   = window_load,
    .unload = window_unload,
  });
  window_set_background_color(s_window, s_settings.BackgroundColor);
  window_stack_push(s_window, true);

  time_t now = time(NULL);
  tick_handler(localtime(&now), MINUTE_UNIT);

  tick_timer_service_subscribe(MINUTE_UNIT, tick_handler);
  battery_state_service_subscribe(battery_handler);
  battery_handler(battery_state_service_peek());
#if defined(PBL_HEALTH)
  health_service_events_subscribe(health_handler, NULL);
  update_steps();
#endif
  app_message_register_inbox_received(inbox_received);
  app_message_open(512, 64);
}

static void deinit(void) {
  accel_tap_service_unsubscribe();
  tick_timer_service_unsubscribe();
  battery_state_service_unsubscribe();
#if defined(PBL_HEALTH)
  health_service_events_unsubscribe();
#endif
  window_destroy(s_window);
}

int main(void) {
  init();
  app_event_loop();
  deinit();
}
