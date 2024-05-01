import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-gate',
  standalone: true,
  imports: [
  ],
  templateUrl: './gate.component.html',
  styleUrl: './gate.component.scss'
})
export class GateComponent {

  public config = inject(ConfigService);

}
