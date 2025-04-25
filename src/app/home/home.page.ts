import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { Location, WeatherDataParam } from '../models/models.model';

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

  weatherParam: WeatherDataParam = {} as WeatherDataParam;

  constructor(private weatherService: WeatherService) {
    
  }

  async ngOnInit() {
    await this.getWeatherParams(false);
  }

  async getWeatherParams(byCity: boolean) {
    if(!byCity) {
      this.weatherService.fetchWeatherParams(this.location, 6, 'metric', true).subscribe({
        next: (params) => {
          this.weatherParam = params;
          console.log("Weather Params: ", params);
        },
        error: (err) => {
          console.error("Error: ", err);
        }
      })
    } else {
      this.weatherService.fetchWeatherParamsByCity('Manila, US', 6, 'metric', true).subscribe({
        next: (params) => {
          this.weatherParam = params;
          console.log("Weather Params by City: ", params);
        },
        error: (err) => {
          console.error("Error: ", err);
        }
      })
    } 
  }

}
