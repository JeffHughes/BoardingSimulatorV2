import { Injectable, inject, signal } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root'
})
export class PassengerService {

  config = inject(ConfigService);

  passengers = signal<Passenger[]>(
    Array.from({ length: this.config.passengerCount() }, (v, i) => ({
      id: i + 1,
    }))
  );

  constructor() {
    
  }

 

}
