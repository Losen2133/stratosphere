import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location, WeatherDataParam } from '../models/models.model';
import { Observable, forkJoin } from 'rxjs'; 
import { map, catchError } from 'rxjs/operators';
import { CurrentWeather } from '../models/current-weather.model';
import { HourlyWeather } from '../models/hourly-weather.model';
import { DailyWeather } from '../models/daily-weather.model';
import { environment } from '../../environments/environment';
import { DateTimeService } from './date-time.service';
import { FlagService } from './flag.service';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";
  private hourlyWeatherUrl = "https://api.openweathermap.org/data/2.5/forecast/hourly";
  private dailyWeatherUrl = "https://pro.openweathermap.org/data/2.5/forecast/daily";
  private apiKey = environment.secretEnvironment.OPENWEATHERMAP_API_KEY;

  constructor(
    private http: HttpClient,
    private dateTimeService: DateTimeService,
    private flagService: FlagService
  ) {}

  private getCurrentWeather(location: Location, units: string = 'metric'): Observable<CurrentWeather> {
    return this.http.get<CurrentWeather>(`${this.currentWeatherUrl}?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=${this.apiKey}`);
  }

  private getHourlyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<HourlyWeather> {
    return this.http.get<HourlyWeather>(`${this.hourlyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  private getDailyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<DailyWeather> {
    return this.http.get<DailyWeather>(`${this.dailyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  private getCurrentWeatherByCityName(city: string, units: string = 'metric'): Observable<CurrentWeather> {
    return this.http.get<CurrentWeather>(`${this.currentWeatherUrl}?q=${city}&units=${units}&appid=${this.apiKey}`);
  }

  private getHourlyWeatherByCityName(city: string, count: number = 0, units: string = 'metric'): Observable<HourlyWeather> {
    return this.http.get<HourlyWeather>(`${this.hourlyWeatherUrl}?q=${city}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  private getDailyWeatherByCityName(city: string, count: number = 0, units: string = 'metric'): Observable<DailyWeather> {
    return this.http.get<DailyWeather>(`${this.dailyWeatherUrl}?q=${city}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  fetchWeatherParams(location: Location, count: number = 0, units: string = 'metric', hour12: boolean = true): Observable<WeatherDataParam> {
    return forkJoin({
      current: this.getCurrentWeather(location, units),
      hourly: this.getHourlyWeather(location, count, units),
      daily: this.getDailyWeather(location, count, units)
    }).pipe(
      map(({ current, hourly, daily }) => {
        const weatherParams: WeatherDataParam = {
          coord: current.coord,
          flagIconUrl: this.flagService.getFlagUrl(
            current.sys.country, true, 48
          ),
          tempFormat: units,
          currentParams: {
            dt: this.dateTimeService.formatTimestampToTimeString(current.dt * 1000, hour12, location),
            timestamp: current.dt,
            weather: current.weather ?? [],
            main: current.main,
            wind: current.wind,
            icon: current.weather?.length ? `assets/icon/weather-icons/${current.weather[0].icon}.png` : '',
            locationName: `Latitude: ${current.coord.lat} | Longitude: ${current.coord.lon}`
          },
          hourlyParams: [],
          dailyParams: []
        };

        for (let i = 0; i < count; i++) {
          weatherParams.hourlyParams.push({
            dt: this.dateTimeService.formatTimestampToTimeString(hourly.list[i].dt * 1000, hour12, location),
            timestamp: hourly.list[i].dt,
            weather: hourly.list[i].weather ?? [],
            main: hourly.list[i].main,
            wind: hourly.list[i].wind,
            icon: hourly.list[i].weather?.length ? `assets/icon/weather-icons/${hourly.list[i].weather[0].icon}.png` : '',
            locationName: `Latitude: ${hourly.city.coord.lat} | Longitude: ${hourly.city.coord.lon}`
          });
  
          weatherParams.dailyParams.push({
            dt: this.dateTimeService.formatTimestampToDateString(daily.list[i].dt * 1000),
            timestamp: daily.list[i].dt,
            weather: daily.list[i].weather ?? [],
            temp: daily.list[i].temp,
            icon: daily.list[i].weather?.length ? `assets/icon/weather-icons/${daily.list[i].weather[0].icon}.png` : '',
            locationName: `Latitude: ${daily.city.coord.lat} | Longitude: ${daily.city.coord.lon}`
          });
        }

        return weatherParams;
      }),
      catchError((error) => {
        console.error("Error fetching weather params:", error);
        throw error;
      })
    );
  }

  fetchWeatherParamsByCity(city: string, count: number = 0, units: string = 'metric', hour12: boolean = true): Observable<WeatherDataParam> {
    return forkJoin({
      current: this.getCurrentWeatherByCityName(city, units),
      hourly: this.getHourlyWeatherByCityName(city, count, units),
      daily: this.getDailyWeatherByCityName(city, count, units)
    }).pipe(
      map(({ current, hourly, daily }) => {
        const weatherParams: WeatherDataParam = {
          coord: current.coord,
          flagIconUrl: this.flagService.getFlagUrl(
            current.sys.country, true, 48
          ),
          tempFormat: units,
          currentParams: {
            dt: this.dateTimeService.formatTimestampToTimeString(current.dt * 1000, hour12, {lon: current.coord.lon, lat: current.coord.lat}),
            timestamp: current.dt,
            weather: current.weather ?? [],
            main: current.main,
            wind: current.wind,
            icon: current.weather?.length ? `assets/icon/weather-icons/${current.weather[0].icon}.png` : '',
            locationName: `${current.name}, ${current.sys.country}`
          },
          hourlyParams: [],
          dailyParams: []
        };

        for (let i = 0; i < count; i++) {
          weatherParams.hourlyParams.push({
            dt: this.dateTimeService.formatTimestampToTimeString(hourly.list[i].dt * 1000, hour12, {lon: current.coord.lon, lat: current.coord.lat}),
            timestamp: hourly.list[i].dt,
            weather: hourly.list[i].weather ?? [],
            main: hourly.list[i].main,
            wind: hourly.list[i].wind,
            icon: hourly.list[i].weather?.length ? `assets/icon/weather-icons/${hourly.list[i].weather[0].icon}.png` : '',
            locationName: `${hourly.city.name}, ${hourly.city.country}`
          });
          
          weatherParams.dailyParams.push({
            dt: this.dateTimeService.formatTimestampToDateString(daily.list[i].dt * 1000),
            timestamp: daily.list[i].dt,
            weather: daily.list[i].weather ?? [],
            temp: daily.list[i].temp,
            icon: daily.list[i].weather?.length ? `assets/icon/weather-icons/${daily.list[i].weather[0].icon}.png` : '',
            locationName: `${daily.city.name}, ${daily.city.country}`
          });
          
        }

        console.log(hourly);
        return weatherParams;
      }),
      catchError((error) => {
        console.error("Error fetching weather params:", error);
        throw error;
      })
    );
  }
}
