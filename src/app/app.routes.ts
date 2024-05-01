import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { GateWalkwayCabinAnimationComponent } from './pages/gate-walkway-cabin-animation/gate-walkway-cabin-animation.component';

export const routes: Routes = [ 
    
    { path: 'home', component: HomeComponent },
    { path: 'animation', component: GateWalkwayCabinAnimationComponent},

    { path: '', redirectTo: 'animation', pathMatch: 'full' }, 
];
