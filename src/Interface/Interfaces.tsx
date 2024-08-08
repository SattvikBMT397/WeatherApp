export interface DailyWeather {
    temperature_2m_min: number[];
    temperature_2m_max: number[];
  }
  
  export interface WeatherData {
    temperature_2m_max: any;
    temperature_2m_min: any;
    daily: DailyWeather;
  }