import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  private flagUrl = "https://flagsapi.com";

  constructor() { }
  
  getFlagUrl(countryCode: string, shiny: boolean, size: number): string {
    if(shiny) {
      return `${this.flagUrl}/${countryCode}/shiny/${size}.png`;
    } else {
      return `${this.flagUrl}/${countryCode}/flat/${size}.png`;
    }
  }
}
