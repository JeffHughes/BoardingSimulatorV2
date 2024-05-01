import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabin',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './cabin.component.html',
  styleUrl: './cabin.component.scss'
})
export class CabinComponent {

  public config = inject(ConfigService);

}
