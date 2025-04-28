import { Component } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { Location, Setting, WeatherDataParam } from '../models/models.model';
import { firstValueFrom } from 'rxjs';
import { Network } from '@capacitor/network';
import { PreferencesService } from '../services/preferences.service';
import { ToastController } from '@ionic/angular';
import { DateTimeService } from '../services/date-time.service';
import { TemperatureService } from '../services/temperature.service';

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
  userSettings!: Setting;
  darkMode!: boolean;
  tempFormat!: string;
  hour12!: boolean;
  isConnected!: boolean;
  weatherParam?: WeatherDataParam;
  

  constructor(
    private weatherService: WeatherService,
    private preferencesService: PreferencesService,
    private toastController: ToastController,
    private dateTimeService: DateTimeService,
    private temperatureService: TemperatureService
  ) {
    
  }

  async ngOnInit() {
    // await this.preferencesService.clearPreferences()
    await this.checkNetworkStatus();

    Network.addListener('networkStatusChange', async status => {
      if(this.isConnected != status.connected) {
        this.isConnected = status.connected;
        if(status.connected) {
          this.presentToast('Connection: Online');
        } else {
          this.presentToast('Connection: Offline');
        }
      }
    })

    if(this.isConnected) {
      await this.initUserSettings();
      this.setSettings();

      await this.getWeatherParams(false);
      await this.preferencesService.createPreference('currentWeather', this.weatherParam);

    } else {
      const savedWeather = await this.preferencesService.getPreference('currentWeather');
      if(savedWeather) {
        this.weatherParam = savedWeather;
      } else {
        console.log('No weather preference saved')
      }
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'bottom',
    });

    await toast.present();
  }

  setSettings() {
    this.tempFormat = this.userSettings.tempFormat;
    this.darkMode = this.userSettings.darkMode;
    this.hour12 = this.userSettings.hour12;
  }

  async initUserSettings() {
    this.userSettings = await this.preferencesService.getPreference('userSettings');
    if(this.userSettings === null) {
      console.log('Settings not set, initializing settings...');
      const setting: Setting = {
        tempFormat: 'metric',
        darkMode: false,
        hour12: true
      }
      await this.preferencesService.createPreference('userSettings', setting);
      this.userSettings = await this.preferencesService.getPreference('userSettings');
      console.log('Settings Initialized', this.userSettings);
    }
  }

  async checkNetworkStatus() {
    const status = await Network.getStatus();
    this.isConnected = status.connected
  }

  async getWeatherParams(byCity: boolean) {
    try {
      let params;
      if (!byCity) {
        params = await firstValueFrom(this.weatherService.fetchWeatherParams(this.location, 6, this.userSettings.tempFormat, this.userSettings.hour12));
        console.log("Weather Params: ", params);
      } else {
        params = await firstValueFrom(this.weatherService.fetchWeatherParamsByCity('Manila, PH', 6, this.userSettings.tempFormat, this.userSettings.hour12));
        console.log("Weather Params by City: ", params);
      }
      this.weatherParam = params;
    } catch (err) {
      console.error("Error: ", err);
    }
  }

  async onChangeHour12() {
    this.userSettings.hour12 = this.hour12;
    await this.preferencesService.createPreference('userSettings', this.userSettings);

    if (this.weatherParam?.currentParams) {
      this.weatherParam.currentParams.dt = this.dateTimeService.formatTimestampToTimeString(
        this.weatherParam.currentParams.timestamp * 1000,
        this.userSettings.hour12
      );
    }

    if(this.weatherParam?.hourlyParams && this.weatherParam?.dailyParams) {
      for(let counter = 0;counter < 5;counter++) {
        this.weatherParam.hourlyParams[counter].dt = this.dateTimeService.formatTimestampToTimeString(
          this.weatherParam.hourlyParams[counter].timestamp * 1000,
          this.userSettings.hour12
        );
      }
    }

    await this.preferencesService.createPreference('currentWeather', this.weatherParam);
  }

  async onChangeTemp() {
    this.userSettings.tempFormat = this.tempFormat;
    await this.preferencesService.createPreference('userSettings', this.userSettings);
  
    if (!this.weatherParam) {
      console.error("Weather parameters are not available.");
      return;
    }
  
    this.convertTemperature(this.weatherParam.currentParams?.main);
  
    if (this.weatherParam?.hourlyParams) {
      this.weatherParam.hourlyParams.forEach(hour => {
        this.convertTemperature(hour.main);
      });
    }
  
    if (this.weatherParam?.dailyParams) {
      this.weatherParam.dailyParams.forEach(day => {
        this.convertTemperature2(day.temp);
      });
    }
  
    this.weatherParam.tempFormat = this.userSettings.tempFormat;
  
    await this.preferencesService.createPreference('currentWeather', this.weatherParam);
  }
  
  private convertTemperature(tempData: any) {
    if(this.weatherParam) {
      if (tempData) {
        tempData.temp = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.temp
        );
        tempData.temp_min = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.temp_min
        );
        tempData.temp_max = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.temp_max
        );
      }
    }
  }

  private convertTemperature2(tempData: any) {
    if(this.weatherParam) {
      if (tempData) {
        tempData.day = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.day
        );
        tempData.eve = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.eve
        );
        tempData.night = this.temperatureService.convertTemps(
          this.weatherParam.tempFormat,
          this.userSettings.tempFormat,
          tempData.night
        );
      }
    }
  }

}
