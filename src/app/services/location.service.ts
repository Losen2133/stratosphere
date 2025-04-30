import { Injectable } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Location } from '../models/models.model';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  async getCurrentPosition(): Promise<Location> {
    const position = await Geolocation.getCurrentPosition();

    const coords: Location = {
      lat: position.coords.latitude,
      lon: position.coords.longitude
    }

    return coords;
  }
}
