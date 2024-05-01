import { Component, inject } from '@angular/core';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-walkway',
  standalone: true,
  imports: [],
  templateUrl: './walkway.component.html',
  styleUrl: './walkway.component.scss'
})
export class WalkwayComponent {

  public config = inject(ConfigService);

}
