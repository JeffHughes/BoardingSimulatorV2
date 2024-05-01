import { Component } from '@angular/core';
import { GateComponent } from '../../components/gate/gate.component';
import { WalkwayComponent } from '../../components/walkway/walkway.component';
import { CabinComponent } from '../../components/cabin/cabin.component';
import { PassengersComponent } from '../../components/passengers/passengers.component';

@Component({
  selector: 'app-gate-walkway-cabin-animation',
  standalone: true,
  imports: [
    GateComponent,
    WalkwayComponent,
    CabinComponent,
  ],
  templateUrl: './gate-walkway-cabin-animation.component.html',
  styleUrl: './gate-walkway-cabin-animation.component.scss'
})
export class GateWalkwayCabinAnimationComponent {

}
