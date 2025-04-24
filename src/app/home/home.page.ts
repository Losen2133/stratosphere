import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { Location, WeatherData, WeatherDataParams } from '../models/models.model';
import { CurrentWeather } from '../models/current-weather.model';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private location: Location = {
    lat: 44.34,
    lon: 10.99
  }

  weatherDataParams: WeatherDataParams = {} as WeatherDataParams;

  constructor(private weatherService: WeatherService) {
    this.getCurrentWeather();
    this.getHourlyWeather(5);
    this.getDailyWeather();
    this.getCurrentWeatherByCity();
    this.getHourlyWeatherByCity();
    this.getDailyWeatherByCity();
  }

  getCurrentWeather() {
    this.weatherService.getCurrentWeather(this.location).subscribe((data) => {
      this.weatherDataParams.currentParams = {
        weather: data.weather ?? [],
        main: data.main,
        wind: data.wind,
        icon: data.weather?.length ? `assets/icon/weather-icons/${data.weather[0].icon}.png` : ''
      }
      console.log("Current Weather: ", data);
      console.log("Params: ", this.weatherDataParams.currentParams);
    });
  }

  getHourlyWeather(count: number) {
    this.weatherService.getHourlyWeather(this.location, count).subscribe((data) => {
      this.weatherDataParams.hourlyParams = [];
      for(let counter = 0;counter < count;counter++) {
        this.weatherDataParams.hourlyParams[counter] = {
          dt: 'test date',
          weather: data.list[counter].weather ?? [],
          wind: data.list[counter].wind,
          main: data.list[counter].main,
          icon: data.list[counter].weather?.length ? `assets/icon/weather-icons/${data.list[counter].weather[0].icon}.png` : ''
        }
      }
      console.log("Hourly Weather: ", data);
      console.log("Params: ", this.weatherDataParams.hourlyParams);
    });
  }

  getDailyWeather() {
    this.weatherService.getDailyWeather(this.location, 5).subscribe((data) => {
      console.log("Daily Weather: ", data);
    });
  }

  getCurrentWeatherByCity() {
    this.weatherService.getCurrentWeatherByCityName('Cebu').subscribe((data) => {
      console.log("Current Weather By City: ", data);
    });
  }

  getHourlyWeatherByCity() {
    this.weatherService.getHourlyWeatherByCityName('Cebu', 5).subscribe((data) => {
      console.log("Hourly Weather By City: ", data);
    })
  }

  getDailyWeatherByCity() {
    this.weatherService.getDailyWeatherByCityName('Cebu', 5).subscribe((data) => {
      console.log("Daily Weather By City: ", data);
    })
  }

}
