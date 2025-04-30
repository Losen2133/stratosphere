import { CurrentParams } from "./current-weather.model";
import { DailyParams } from "./daily-weather.model";
import { HourlyParams } from "./hourly-weather.model";

export interface Setting {
    tempFormat: string;
    darkMode: boolean;
    hour12: boolean;
}

export interface Location {
    lat: number;
    lon: number;
}

export interface WeatherDataParam {
    flagIconUrl: string;
    tempFormat: string;
    currentParams: CurrentParams;
    hourlyParams: HourlyParams[];
    dailyParams: DailyParams[];
}