import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { PassengerService } from '../../services/passenger.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-passengers',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './passengers.component.html',
  styleUrl: './passengers.component.scss'
})
export class PassengersComponent {


  config = inject(ConfigService)
  passengers = inject(PassengerService)
}
