import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FlagService {
  private flagUrl = "https://flagsapi.com";

  constructor() { }
  
  getFlagUrl(countryCode: string, shiny: boolean, size: number): Promise<string> {
    const url = shiny
      ? `${this.flagUrl}/${countryCode}/shiny/${size}.png`
      : `${this.flagUrl}/${countryCode}/flat/${size}.png`;

    return Promise.resolve(url);
  }
}
