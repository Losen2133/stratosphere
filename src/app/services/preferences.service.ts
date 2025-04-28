import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class PreferencesService {

  constructor() { }

  async getPreference(key: string): Promise<any> {
    const preference = (await Preferences.get({ key: key }))?.value;
    if(preference) {
      try{
        return JSON.parse(preference);
      }catch(error) {
        return preference;
      }
    }
    return null;
  }

  async createPreference(key: string, value: any) {
    try {
      await Preferences.set({ key: key, value: JSON.stringify(value) })
    } catch {
      await Preferences.set({ key: key, value: value });
    }
    
  }

  async clearPreferences() {
    await Preferences.clear();
    alert("Preferences Cleared!");
  }
}
