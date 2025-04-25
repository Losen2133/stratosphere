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

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";
  private hourlyWeatherUrl = "https://api.openweathermap.org/data/2.5/forecast/hourly";
  private dailyWeatherUrl = "https://pro.openweathermap.org/data/2.5/forecast/daily";
  private apiKey = environment.secretEnvironment.OPENWEATHERMAP_API_KEY;

  constructor(private http: HttpClient, private dateTimeService: DateTimeService) {}

  private getCurrentWeather(location: Location, units: string = 'metric'): Observable<CurrentWeather> {
    return this.http.get<CurrentWeather>(`${this.currentWeatherUrl}?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=${this.apiKey}`);
  }

  private getHourlyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<HourlyWeather> {
    return this.http.get<HourlyWeather>(`${this.hourlyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  private getDailyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<DailyWeather> {
    return this.http.get<DailyWeather>(`${this.dailyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  fetchWeatherParams(location: Location, count: number = 0, units: string = 'metric', hour12: boolean = true): Observable<WeatherDataParam> {
    return forkJoin({
      current: this.getCurrentWeather(location, units),
      hourly: this.getHourlyWeather(location, count, units),
      daily: this.getDailyWeather(location, count, units)
    }).pipe(
      map(({ current, hourly, daily }) => {
        const weatherParams: WeatherDataParam = {
          tempFormat: units,
          currentParams: {
            dt: this.dateTimeService.formatTimestampToTimeString(current.dt * 1000, hour12),
            weather: current.weather ?? [],
            main: current.main,
            wind: current.wind,
            icon: current.weather?.length ? `assets/icon/weather-icons/${current.weather[0].icon}.png` : '',
            locationName: `Latitude: ${location.lat} | Longitude: ${location.lon}`
          },
          hourlyParams: [],
          dailyParams: []
        };

        for (let i = 0; i < count; i++) {
          if(i !== (count - 1) && hourly.list[i]) {
            weatherParams.hourlyParams.push({
              dt: this.dateTimeService.formatTimestampToTimeString(hourly.list[i].dt * 1000, hour12),
              weather: hourly.list[i].weather ?? [],
              main: hourly.list[i].main,
              wind: hourly.list[i].wind,
              icon: hourly.list[i].weather?.length ? `assets/icon/weather-icons/${hourly.list[i].weather[0].icon}.png` : '',
              locationName: `Latitude: ${location.lat} | Longitude: ${location.lon}`
            });
          }
  
          if (i !== 0 && daily.list[i]) {
            weatherParams.dailyParams.push({
              dt: this.dateTimeService.formatTimestampToDateString(daily.list[i].dt * 1000),
              weather: daily.list[i].weather ?? [],
              temp: daily.list[i].temp,
              icon: daily.list[i].weather?.length ? `assets/icon/weather-icons/${daily.list[i].weather[0].icon}.png` : '',
              locationName: `Latitude: ${location.lat} | Longitude: ${location.lon}`
            });
          }
        }

        return weatherParams;
      }),
      catchError((error) => {
        console.error("Error fetching weather params:", error);
        throw error;
      })
    );
  }
}
