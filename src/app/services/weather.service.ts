import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location, WeatherDataParam } from '../models/models.model';
import { Observable, forkJoin } from 'rxjs'; 
import { catchError, switchMap } from 'rxjs/operators';
import { CurrentWeather } from '../models/current-weather.model';
import { HourlyWeather } from '../models/hourly-weather.model';
import { DailyWeather } from '../models/daily-weather.model';
import { environment } from 'src/environments/environment';
import { DateTimeService } from './date-time.service';
import { FlagService } from './flag.service';
import { ImagePreloaderService } from './image-preloader.service';

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
    private flagService: FlagService,
    private imagePreloaderService: ImagePreloaderService
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
      switchMap( async ({ current, hourly, daily }) => {
        const flagUrl = await this.flagService.getFlagUrl(
          current.sys.country, true, 48
        )

        const weatherParams: WeatherDataParam = {
          coord: current.coord,
          flagIconUrl: flagUrl,
          tempFormat: units,
          currentParams: {
            dt: this.dateTimeService.formatTimestampToTimeString(current.dt * 1000, hour12, location),
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
            dt: this.dateTimeService.formatTimestampToTimeString(hourly.list[i].dt * 1000, hour12, location),
            timestamp: hourly.list[i].dt,
            weather: hourly.list[i].weather ?? [],
            main: hourly.list[i].main,
            wind: hourly.list[i].wind,
            icon: hourly.list[i].weather?.length ? `assets/icon/weather-icons/${hourly.list[i].weather[0].icon}.png` : '',
            locationName: `${current.name}, ${current.sys.country}`
          });
  
          weatherParams.dailyParams.push({
            dt: this.dateTimeService.formatTimestampToDateString(daily.list[i].dt * 1000),
            timestamp: daily.list[i].dt,
            weather: daily.list[i].weather ?? [],
            temp: daily.list[i].temp,
            icon: daily.list[i].weather?.length ? `assets/icon/weather-icons/${daily.list[i].weather[0].icon}.png` : '',
            locationName: `${current.name}, ${current.sys.country}`
          });
        }

        this.imagePreloaderService.preloadImages([
          weatherParams.currentParams.icon,
          weatherParams.hourlyParams[0].icon,
          weatherParams.hourlyParams[1].icon,
          weatherParams.hourlyParams[2].icon,
          weatherParams.hourlyParams[3].icon,
          weatherParams.hourlyParams[4].icon,
          weatherParams.dailyParams[0].icon,
          weatherParams.dailyParams[1].icon,
          weatherParams.dailyParams[2].icon,
          weatherParams.dailyParams[3].icon,
          weatherParams.dailyParams[4].icon
        ]);
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
      switchMap( async ({ current, hourly, daily }) => {
        const flagUrl = await this.flagService.getFlagUrl(
          current.sys.country, true, 48
        )

        const weatherParams: WeatherDataParam = {
          coord: current.coord,
          flagIconUrl: flagUrl,
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

        this.imagePreloaderService.preloadImages([
          weatherParams.currentParams.icon,
          weatherParams.hourlyParams[0].icon,
          weatherParams.hourlyParams[1].icon,
          weatherParams.hourlyParams[2].icon,
          weatherParams.hourlyParams[3].icon,
          weatherParams.hourlyParams[4].icon,
          weatherParams.dailyParams[0].icon,
          weatherParams.dailyParams[1].icon,
          weatherParams.dailyParams[2].icon,
          weatherParams.dailyParams[3].icon,
          weatherParams.dailyParams[4].icon
        ]);
        return weatherParams;
      }),
      catchError((error) => {
        console.error("Error fetching weather params:", error);
        throw error;
      })
    );
  }
}
