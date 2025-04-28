export interface DailyParams {
  dt: string;
  timestamp: number;
  weather: Weather[];
  temp: Temp;
  icon: string;
  locationName: string;
}


export interface DailyWeather {
  city: City;
  cod: string;
  message: number;
  cnt: number;
  list: List[];
}

interface List {
  dt: number;
  sunrise: number;
  sunset: number;
  temp: Temp;
  feels_like: Feelslike;
  pressure: number;
  humidity: number;
  weather: Weather[];
  speed: number;
  deg: number;
  gust: number;
  clouds: number;
  pop: number;
  rain?: number;
}

interface Weather {
  id: number;
  main: string;
  description: string;
  icon: string;
}

interface Feelslike {
  day: number;
  night: number;
  eve: number;
  morn: number;
}

interface Temp {
  day: number;
  min: number;
  max: number;
  night: number;
  eve: number;
  morn: number;
}

interface City {
  id: number;
  name: string;
  coord: Coord;
  country: string;
  population: number;
  timezone: number;
}

interface Coord {
  lon: number;
  lat: number;
}