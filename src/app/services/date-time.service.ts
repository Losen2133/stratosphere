import { Injectable } from '@angular/core';
import tzLookup from 'tz-lookup';
import { Location } from '../models/models.model';

@Injectable({
  providedIn: 'root'
})
export class DateTimeService {

  constructor() { }

  private getIANA(location: Location) {
    return tzLookup(location.lat, location.lon);
  }

  formatTimestampToTimeString(timestamp: number, hour12: boolean, location: Location): string {
    const timeZone = this.getIANA(location);

    return new Date(timestamp).toLocaleString('en-US', {
      timeZone: timeZone,
      hour: 'numeric',
      minute: '2-digit',
      hour12: hour12
    });
  }

  formatTimestampToDateString(timestamp: number): string {
    const date = new Date(timestamp);
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayName = daysOfWeek[date.getDay()];
    return `${dayName}, ${formattedDate}`;
  }
}
