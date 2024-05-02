import { AfterViewInit, Component, inject } from '@angular/core';
import { GateComponent } from '../../components/gate/gate.component';
import { WalkwayComponent } from '../../components/walkway/walkway.component';
import { CabinComponent } from '../../components/cabin/cabin.component';
import { PassengersComponent } from '../../components/passengers/passengers.component';
import { AnimationService } from '../../services/animation.service';
import { PassengerService } from '../../services/passenger.service';
import { SimulationService } from '../../services/simulation.service';

@Component({
  selector: 'app-gate-walkway-cabin-animation',
  standalone: true,
  imports: [
    GateComponent,
    WalkwayComponent,
    CabinComponent,

    PassengersComponent
  ],
  templateUrl: './gate-walkway-cabin-animation.component.html',
  styleUrl: './gate-walkway-cabin-animation.component.scss'
})
export class GateWalkwayCabinAnimationComponent implements AfterViewInit {


  simulationService = inject(SimulationService);

  ngAfterViewInit(): void { 
    console.log('after view init');
 
     setTimeout(() => {
       this.simulationService.start();
     }, 500);
 
  }
}
