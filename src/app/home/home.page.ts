import { Component, ViewChild } from '@angular/core';
import { WeatherService } from '../services/weather.service';
import { Location, Setting, WeatherDataParam } from '../models/models.model';
import { firstValueFrom } from 'rxjs';
import { Network } from '@capacitor/network';
import { PreferencesService } from '../services/preferences.service';
import { IonContent, ToastController } from '@ionic/angular';
import { DateTimeService } from '../services/date-time.service';
import { TemperatureService } from '../services/temperature.service';
import { AiPromptService } from '../services/ai-prompt.service';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  private location!: Location;
  userSettings!: Setting;
  darkMode!: boolean;
  tempFormat!: string;
  hour12!: boolean;
  isConnected!: boolean;
  weatherParam?: WeatherDataParam;
  weatherAdvice!: string;
  isLoading: boolean = true;
  searchValue!: string;

  @ViewChild('content', { static: false }) content!: IonContent;

  constructor(
    private weatherService: WeatherService,
    private preferencesService: PreferencesService,
    private toastController: ToastController,
    private dateTimeService: DateTimeService,
    private temperatureService: TemperatureService,
    private aiPromptService: AiPromptService,
    private locationService: LocationService
  ) {
    
  }

  async ngOnInit() {
    // await this.preferencesService.clearPreferences()
    await this.checkNetworkStatus();
    await this.getCurrentLocation();

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
        console.log('No weather preference saved');
      }
    }

    await this.fetchAdvice();
    
    this.isLoading = false;
  }

  async getCurrentLocation() {
    try {
      this.location = await this.locationService.getCurrentPosition();
    } catch(error) {
      console.error('Error getting location: ', error);
    }
  }

  async fetchAdvice() {
    try {
      this.weatherAdvice = "";
      const res: any = await firstValueFrom(
        this.aiPromptService.generateAdvice(
          'You are a weather reporter',
          `in ${this.weatherParam?.currentParams.locationName} it's ${this.weatherParam?.currentParams.main.temp} degrees ${this.weatherParam?.tempFormat} (metric = celsius, imperial = fahrenheit, standard = kelvin) and ${this.weatherParam?.currentParams.weather[0].description}, what advice can you give? limit it to a sentence.`
        )
      )

      this.weatherAdvice = res.candidates?.[0]?.content?.parts?.[0]?.text;
      console.log("Advice: ", res.candidates?.[0]?.content?.parts?.[0]?.text);
    } catch(error) {
      this.weatherAdvice = "No available advices right now :(";
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
        params = await firstValueFrom(this.weatherService.fetchWeatherParams(this.location, 5, this.userSettings.tempFormat, this.userSettings.hour12));
        console.log("Weather Params: ", params);
      } else {
        params = await firstValueFrom(this.weatherService.fetchWeatherParamsByCity(this.searchValue, 5, this.userSettings.tempFormat, this.userSettings.hour12));
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
        this.userSettings.hour12,
        {lon: this.weatherParam.coord.lon, lat: this.weatherParam.coord.lat}
      );
    }

    if(this.weatherParam?.hourlyParams && this.weatherParam?.dailyParams) {
      for(let counter = 0;counter < 5;counter++) {
        this.weatherParam.hourlyParams[counter].dt = this.dateTimeService.formatTimestampToTimeString(
          this.weatherParam.hourlyParams[counter].timestamp * 1000,
          this.userSettings.hour12,
          {lon: this.weatherParam.coord.lon, lat: this.weatherParam.coord.lat}
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

  async handleSearch(event: Event) {
    const target = event.target as HTMLIonSearchbarElement;
    this.searchValue = target.value?.toLowerCase() || '';
    console.log("Search Value: ", this.searchValue);
    
    if(this.searchValue ===  "") {
      this.isLoading = true;
      await this.getWeatherParams(false);
    } else {
      this.isLoading = true;
      await this.getWeatherParams(true);
    }
    this.content.scrollToTop(500);
    await this.preferencesService.createPreference('currentWeather', this.weatherParam);
    await this.fetchAdvice();
    this.isLoading = false;
  }
}
