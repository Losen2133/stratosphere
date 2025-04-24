import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Location } from '../models/models.model';
import { Observable } from 'rxjs'; 
import { CurrentWeather } from '../models/current-weather.model';
import { HourlyWeather } from '../models/hourly-weather.model';
import { DailyWeather } from '../models/daily-weather.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private currentWeatherUrl = "https://api.openweathermap.org/data/2.5/weather";
  private hourlyWeatherUrl = "https://api.openweathermap.org/data/2.5/forecast/hourly";
  private dailyWeatherUrl = "https://pro.openweathermap.org/data/2.5/forecast/daily";
  private apiKey= environment.OPENWEATHERMAP_API_KEY;
  
  constructor(private http: HttpClient) { }

  getCurrentWeather(location: Location, units: string = 'metric'): Observable<CurrentWeather> {
    return this.http.get<CurrentWeather>(`${this.currentWeatherUrl}?lat=${location.lat}&lon=${location.lon}&units=${units}&appid=${this.apiKey}`);
  }

  getHourlyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<HourlyWeather> {
    return this.http.get<HourlyWeather>(`${this.hourlyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  getDailyWeather(location: Location, count: number = 0, units: string = 'metric'): Observable<DailyWeather> {
    return this.http.get<DailyWeather>(`${this.dailyWeatherUrl}?lat=${location.lat}&lon=${location.lon}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  getCurrentWeatherByCityName(city: string, units: string = 'metric'): Observable<CurrentWeather> {
    return this.http.get<CurrentWeather>(`${this.currentWeatherUrl}?q=${city}&units=${units}&appid=${this.apiKey}`);
  }

  getHourlyWeatherByCityName(city: string, count: number = 0, units: string = 'metric'): Observable<HourlyWeather> {
    return this.http.get<HourlyWeather>(`${this.hourlyWeatherUrl}?q=${city}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }

  getDailyWeatherByCityName(city: string, count: number = 0, units: string = 'metric') {
    return this.http.get(`${this.dailyWeatherUrl}?q=${city}&cnt=${count}&units=${units}&appid=${this.apiKey}`);
  }
}
