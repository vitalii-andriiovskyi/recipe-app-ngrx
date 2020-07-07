import { Injectable } from '@angular/core';

const APP_PREFIX = 'RCP-';

@Injectable({
  providedIn: 'root'
})
export class SessionStorageService {

  constructor() { }

  setItem(key: string, value: any) {
    sessionStorage.setItem(`${APP_PREFIX}${key}`, JSON.stringify(value));
  }

  getItem(key: string) {
    return JSON.parse(sessionStorage.getItem(`${APP_PREFIX}${key}`));
  }

  removeItem(key: string) {
    sessionStorage.removeItem(`${APP_PREFIX}${key}`);
  }

  /** Tests that sessionStorage exists, can be written to, and read from. */
  testSessionStorage() {
    const testValue = 'testValue';
    const testKey = 'testKey';
    let retrievedValue: string;
    const errorMessage = 'SessionStorage did not return expected value';

    this.setItem(testKey, testValue);
    retrievedValue = this.getItem(testKey);
    this.removeItem(testKey);

    if (retrievedValue !== testValue) {
      throw new Error(errorMessage);
    }
  }
}
