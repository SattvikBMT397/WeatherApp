export interface DailyWeather {
    temperature_2m_min: number[];
    temperature_2m_max: number[];
  }
  
  export interface WeatherData {
    daily: DailyWeather;
  }