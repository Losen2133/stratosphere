import { CurrentWeather, CurrentParams} from "./current-weather.model";
import { DailyParams, DailyWeather } from "./daily-weather.model";
import { HourlyParams, HourlyWeather } from "./hourly-weather.model";

export interface Setting {
    tempFormat: string;
    darkMode: boolean;
}

export interface Location {
    lat: number;
    lon: number;
}

export interface WeatherData {
    tempFormat: string;
    currentWeather: CurrentWeather;
    hourlyWeather: HourlyWeather;
    dailyWeather: DailyWeather;
}

export interface WeatherDataParams {
    tempFormat: string;
    currentParams: CurrentParams;
    hourlyParams: HourlyParams[];
    dailyParams: DailyParams[];
}