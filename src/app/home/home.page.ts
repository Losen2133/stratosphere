import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { Location, WeatherDataParam } from '../models/models.model';
import { firstValueFrom } from 'rxjs';

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
    await this.getWeatherParams(true);
  }

  async getWeatherParams(byCity: boolean) {
    try {
      let params;
      if (!byCity) {
        params = await firstValueFrom(this.weatherService.fetchWeatherParams(this.location, 6, 'metric', true));
        console.log("Weather Params: ", params);
      } else {
        params = await firstValueFrom(this.weatherService.fetchWeatherParamsByCity('Manila, PH', 6, 'metric', true));
        console.log("Weather Params by City: ", params);
      }
      this.weatherParam = params;
    } catch (err) {
      console.error("Error: ", err);
    }
  }
  

}
