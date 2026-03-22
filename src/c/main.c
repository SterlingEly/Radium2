  t = dict_find(iter, MESSAGE_KEY_WeatherTempF);
  if (t) {
    s_weather_temp_f = (int)t->value->int32;
    // Use %c to pass 0xB0 (degree symbol) as a runtime char argument.
    // This avoids all compiler hex-escape parsing ambiguities entirely.
    snprintf(s_temp_f_buffer, sizeof(s_temp_f_buffer), "%d%cF", s_weather_temp_f, (char)0xB0);
  }
  t = dict_find(iter, MESSAGE_KEY_WeatherTempC);
  if (t) {
    s_weather_temp_c = (int)t->value->int32;
    snprintf(s_temp_c_buffer, sizeof(s_temp_c_buffer), "%d%cC", s_weather_temp_c, (char)0xB0);
  }