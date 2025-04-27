import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemperatureService {

  constructor() { }

  convertTemps(from: string, to: string, value: number) {
    return this.conversionDispatcher(
      this.instructionConstructor(from, to),
      value
    )
  }

  instructionConstructor(from: string, to: string): string {
    let instruction: string;

    if(from === 'metric' && to === 'imperial') {
      instruction = 'ctf';
    } else if(from === 'metric' && to === 'standard') {
      instruction = 'ctk';
    } else if(from === 'imperial' && to === 'metric') {
      instruction = 'ftc';
    } else if(from === 'imperial' && to === 'standard') {
      instruction = 'ftk';
    } else if(from === 'standard' && to === 'metric') {
      instruction = 'ktc';
    } else if(from === 'standard' && to === 'imperial') {
      instruction = 'ktf';
    } else {
      instruction = 'Invalid conversion instruction';
    }

    return instruction;
  }

  conversionDispatcher(instruction: string, value: number): string | number {
    switch (instruction) {
      case 'ctf': return this.celsiusToFahrenheit(value);
      case 'ctk': return this.celsiusToKelvin(value);
      case 'ftc': return this.fahrenheitToCelsius(value);
      case 'ftk': return this.fahrenheitToKelvin(value);
      case 'ktc': return this.kelvinToCelsius(value);
      case 'ktf': return this.kelvinToFahrenheit(value);
      default: return 'Invalid instruction';
    }
  }
  
  celsiusToFahrenheit(c: number) {
    return ((c * 9/5) + 32).toFixed(2);
  }

  celsiusToKelvin(c: number) {
    return (c + 273.15).toFixed(2);
  }

  fahrenheitToCelsius(f: number) {
    return ((f - 32) * 5/9).toFixed(2);
  }

  fahrenheitToKelvin(f: number) {
    return (((f - 32) * 5/9) + 273.15).toFixed(2);
  }

  kelvinToCelsius(k: number) {
    return (k - 273.15).toFixed(2);
  }

  kelvinToFahrenheit(k: number) {
    return ((k - 273.15) * 9/5 + 32).toFixed(2);
  }
}
