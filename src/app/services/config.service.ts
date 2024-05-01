import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  binCount = signal( 12);
  rowCount = signal(24);
  seatCount = signal(6);
  walkwaySpots = signal(20);

  constructor() { }

  bins() {
    return Array.from({ length: this.binCount() }, (v, k) => k + 1);
  }

  rows() {
    return Array.from({ length: this.rowCount() }, (v, k) => k + 1);
  }

  seatsABC() {
    return Array.from({ length: 3 }, (v, k) => String.fromCharCode(65 + k));
  }

  seatsDEF() {
    return Array.from({ length: 3 }, (v, k) => String.fromCharCode(68 + k));
  }

  seatStyle() { 
    return { width: "calc(100% / " + this.rowCount() + ")" }; 
  }

  walkway() { 
    return Array.from({ length: this.walkwaySpots() }, (v, k) => k + 1);
  }
 
}
