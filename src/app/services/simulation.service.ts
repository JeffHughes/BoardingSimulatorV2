import { Injectable, inject } from '@angular/core';
import { PassengerService } from './passenger.service';
import { AnimationService } from './animation.service';
import { Passenger } from '../classes/passenger';

import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { FamilyService } from './family.service';
import { ConfigService } from './config.service';
import { OverheadBinService } from './overhead-bin.service';
import { GateService } from './gate.service';
import { SeatService } from './seat.service';

gsap.registerPlugin(MotionPathPlugin);

@Injectable({
  providedIn: 'root'
})
export class SimulationService {

  config = inject(ConfigService);
  passengers = inject(PassengerService);
  animation = inject(AnimationService);
  family = inject(FamilyService);
  overheadBin = inject(OverheadBinService);
  gate = inject(GateService);
  seats = inject(SeatService);

  start() {
    let passengers = this.passengers.passengers();
    let config = this.config;

    passengers.forEach(p => {
      gsap.set("#passenger" + p.id, { opacity: 0 });
      this.animation.movePassengerTo(p, 'gate-start');
    });

    const familyInfo = this.family.distributePassengersIntoGroups(passengers, false, false);

    passengers = this.overheadBin.assignPassengerBins(
      familyInfo.passengers,
      familyInfo.groups
    );

    passengers = this.gate.assignBoardingGroups(passengers);

    passengers = this.seats.assignSeatsToPassengers(passengers);

    this.passengers.passengers.set(passengers);

    const boardingGroups = this.groupPassengersByBoardingGroup(passengers);

    console.log({ boardingGroups });
    debugger;

    let boardingGroup = 1;
    this.animateBoardingGroup(boardingGroup); 

    // setTimeout(() => {
    //   this.animateBoardingGroup(2);
    // }, 1000);
  }



  groupPassengersByBoardingGroup(passengers: Passenger[]) {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.boardingGroup || -1)}-${pad(passenger.boardingOrder || -1)}`;

    let passengerGroups: { [key: string]: Passenger[]; } = {};

    passengers.forEach(passenger => {
      if (!passengerGroups[key(passenger)]) passengerGroups[key(passenger)] = [];
      passengerGroups[key(passenger)].push(passenger);
    });
    return passengerGroups;
  }

  animateBoardingGroup(boardingGroup: number) { //, boardingLane: number) {

    const passengersWithBoardingGroup = this.passengers.passengers().filter((passenger: any) => passenger.boardingGroup === boardingGroup);
    if (passengersWithBoardingGroup.length === 0) return;

    passengersWithBoardingGroup.sort((a: any, b: any) => a.boardingOrder - b.boardingOrder);

    // group by familyID
    let families: any = {};
    passengersWithBoardingGroup.forEach((passenger: any) => {
      if (!families[passenger.familyID]) families[passenger.familyID] = [];
      families[passenger.familyID].push(passenger);
    });

    // get families 
    const familyKeys = Object.keys(families);

    familyKeys.forEach((familyKey: any, index: number) => {
      const family = families[familyKey];
      setTimeout(() => {
        this.gateAnimation(family, family[0].boardingGroup % 2 === 0 ? 2 : 1);
      }, 200 * index);
    });

  }

  private gateAnimation(family: Passenger[], lane: number) {

    family.forEach(p => {
      gsap.set("#passenger" + p.id, { opacity: 1 });
    });

    const boardingGroup = family[0].boardingGroup!;

    let spot = 12;
    let interval = setInterval(() => {
      if (this.cabinHasBottleneck(12) && this.previousBoardingGroupBottleNeck(boardingGroup)) {

        console.log('waiting for bin ' + 12 + ' to clear');

      } else {

        this.animation.arrangePassengers('gate-' + lane + '-' + spot, family);

        if (spot === 0) {
          this.moveToWalkway(family);
          this.lastBoardingGroupToCompleteBoarding = boardingGroup;
          // this.callNextBoardingGroup(boardingGroup + 2);
          clearInterval(interval);
        }

        spot--;

      }
    }, 400);
  }

  lastBoardingGroupToCompleteBoarding = 0;
  previousBoardingGroupBottleNeck(boardingGroup: number): boolean {

    return boardingGroup > this.lastBoardingGroupToCompleteBoarding;
  }


  callNextBoardingGroup(boardingGroup: number) {
    setTimeout(() => {
      this.animateBoardingGroup(boardingGroup);
    }, 1500); // just a little delay to get people's attention before the next group starts
  }

  private moveToWalkway(family: Passenger[]) {
    this.animation.arrangePassengers('boarding', family);

    setTimeout(() => {
      this.animation.arrangePassengers('walkway-start', family);

      setTimeout(() => {
        this.walkwayAnimation(family);
      }, 500);

    }, 500);
  }

  private walkwayAnimation(family: Passenger[]) {
    let spot = 1;
    let interval = setInterval(() => {

      if (this.cabinHasBottleneck(12)) {

        console.log('waiting for bin ' + 12 + ' to clear');

      } else {
        this.animation.arrangePassengers('walkway-' + spot, family);

        if (spot === this.config.walkwaySpots() + 1) {
          this.moveToCabin(family);
          clearInterval(interval);
        }
        spot++;
      }
    }, 400);
  }

  private moveToCabin(family: Passenger[]) {
    this.animation.arrangePassengers('walkway-end', family);

    setTimeout(() => {
      this.animation.arrangePassengers('cabin-start', family);

      setTimeout(() => {
        this.cabinAnimation(family);
      }, 500);

    }, 500);
  }


  cabinAnimation(family: Passenger[]) {
    let spot = 12;
    const bin = family[0].bin!;

    let interval = setInterval(() => {

      if (this.cabinHasBottleneck(bin)) {

        console.log('waiting for bin ' + bin + ' to clear');

      } else {

        if (spot === bin) {
          this.stowLuggage(family);
          clearInterval(interval);
        }
        this.animation.arrangePassengers('cabin-' + spot--, family);
      }

    }, 400);

  }

  cabinBottlenecks: any = {}

  cabinHasBottleneck(bin: number = 12) {
    // look at all the keys in this.cabinBottlenecks
    // if any above the bin number have a value > 0, return true
    return Object.keys(this.cabinBottlenecks).some(key => {
      return this.cabinBottlenecks[key] > 0 && parseInt(key) < bin;
    });
  }

  stowLuggage(family: Passenger[]) {

    const bin = family[0].bin!;
    const row = family[0].row;

    // pick one passenger and have them hold for a count that equals family.length

    const valet = family[0];
    const luggageCount = family.filter(p => p.hasCarryOn).length;

    console.log('stowing luggage for ' + luggageCount + ' passengers in bin ' + bin);

    const nonValets = family.filter(p => p !== valet);

    // setup bottleneck 
    this.cabinBottlenecks[bin]++;

    // change the style of cabin-bin to background firebrick, then fade back to no bg

    gsap.timeline()
      .to('#cabin-' + bin, { duration: .5, backgroundColor: 'rgba(34, 178, 34, 1)' })


    setTimeout(() => {
      //release bottleneck
      this.cabinBottlenecks[bin]--;

      gsap.timeline()
        .to('#cabin-' + bin, { duration: 1, backgroundColor: 'rgba(34, 178, 34, 0)' });

      // let valet(s) sit down
      this.animation.moveToSeat(valet);
    }, 1000 * luggageCount);


    if (luggageCount > 0 && nonValets.length > 0) {
      nonValets.forEach((p, i) => {
        setTimeout(() => {
          this.animation.moveToSeat(p);
        }, 50 * i);
      });
    }

  }


  // private test1() {
  //   let passenger1 = this.passengers.passengers()[0];
  //   let passenger2 = this.passengers.passengers()[1];
  //   let passenger3 = this.passengers.passengers()[2];

  //   passenger1.row = 5;
  //   passenger1.bin = 10;
  //   passenger1.seatLetter = 'C';
  //   passenger1.hasCarryOn = true;
  //   passenger2.row = 5;
  //   passenger2.seatLetter = 'A';
  //   passenger2.hasCarryOn = true;
  //   passenger3.row = 5;
  //   passenger3.seatLetter = 'B';
  //   passenger3.hasCarryOn = true;

  //   const family1 = [passenger1, passenger2, passenger3];

  //   setTimeout(() => {
  //     this.gateAnimation(family1, lane);
  //   }, 1000);

  //   let passenger4 = this.passengers.passengers()[3];
  //   let passenger5 = this.passengers.passengers()[4];

  //   passenger4.bin = 11;
  //   passenger4.row = 4;
  //   passenger4.seatLetter = 'A';
  //   passenger4.hasCarryOn = true;
  //   passenger5.bin = 11;
  //   passenger5.row = 4;
  //   passenger5.seatLetter = 'B';
  //   passenger5.hasCarryOn = true;

  //   const family2 = [passenger4, passenger5];

  //   let lane = 1;

  //   setTimeout(() => {
  //     this.gateAnimation(family1, lane);
  //   }, 1000);

  //   lane = 2;

  //   setTimeout(() => {
  //     this.gateAnimation(family2, lane);
  //   }, 1500);
  // }
}
