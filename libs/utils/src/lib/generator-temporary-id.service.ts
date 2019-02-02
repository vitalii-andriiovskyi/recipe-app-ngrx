import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TemporaryIdGenerator {
  private _id: number;
  lastBiggestBaseForId: number;

  constructor() { }

  createId(baseForId: number): number {
    baseForId = Math.abs(baseForId);

    if (!this._id && !this.lastBiggestBaseForId && baseForId === 0) {
      baseForId = 1;
    } 

    if (((this.lastBiggestBaseForId || this.lastBiggestBaseForId === 0) && baseForId > this.lastBiggestBaseForId) || !this._id) {
      this._id = baseForId * 1000;
      this.lastBiggestBaseForId = baseForId;
    } else {
      this._id = ++this._id;
    }
    return this._id;
  }
}
