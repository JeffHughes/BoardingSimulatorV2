import { Injectable, inject } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { ConsoleService } from './console.service';

@Injectable({
  providedIn: 'root'
})
export class GateService {

  consoleService = inject(ConsoleService);

  assignBoardingGroups(passengers: Passenger[]) {

    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.slot)}-${pad(passenger.bin)}`;

    // Sort passengers by bin, slot, and numeric boarding group
    passengers.sort((a: any, b: any) => {
      return key(a).localeCompare(key(b));
    });

    // const sortedPassengers = JSON.parse(JSON.stringify(passengers));
    // console.log('Sorted Passengers:', sortedPassengers)

    const boardingGroups: Record<string, Passenger[]> = {};

    let currentBoardingGroup = 1;
    let currentBoardingGroupBin = 1;

    //  BG check here for future front of line work & consistency 
    let bagless = passengers.filter(p => !p.hasCarryOn && !p.boardingGroup);

    // const baglessBeforeCarryOns = [...bagless];
    // console.log('Bagless (before assignment):', baglessBeforeCarryOns)

    function assignBoardingGroup(group: Passenger[]) {
      group.forEach(groupPassenger => {
        groupPassenger.boardingGroup = currentBoardingGroup;
        groupPassenger.boardingOrder = currentBoardingGroupBin;
      });

      const BGPosition = `${pad(currentBoardingGroup)}-${pad(currentBoardingGroupBin)}`;
      boardingGroups[BGPosition] = group;
      advanceBoardingGroupBin();
    }

    function advanceBoardingGroupBin() {
      currentBoardingGroupBin++;
      if (currentBoardingGroupBin > 12) {
        currentBoardingGroup++;
        currentBoardingGroupBin = 1;
      }
    }


    bagless.forEach((passenger, index) => {
      let group = passengers.filter(p => p.familyID === passenger.familyID);
      if (group.length == group.filter(p => !p.hasCarryOn).length) {
        assignBoardingGroup(group);
      }
    });

    // const baglessAfterCarryOns = [...bagless];
    // console.log('Bagless (after assignment):', baglessAfterCarryOns)

    let passengersNeedBoardingGroup = passengers.filter(p => !p.boardingGroup);
    let periodicDisplayCounter = 501;  // also a backup if we get stuck in a loop
    while (passengersNeedBoardingGroup.length > 0 && periodicDisplayCounter-- > 0) {
      // find the first passenger that doesn't have a boarding group assigned
      // that has slot == spot and the lowest bin

      const passengersInBin = passengersNeedBoardingGroup.filter(p => p.bin === currentBoardingGroupBin);
      // sort by lowest slot
      passengersInBin.sort((a, b) => a.slot! - b.slot!);

      if (passengersInBin.length > 0) {
        const passenger = passengersInBin[0];
        let group = passengers.filter(p => p.familyID === passenger.familyID);
        assignBoardingGroup(group);
      } else {
        advanceBoardingGroupBin();
      }

      passengersNeedBoardingGroup = passengers.filter(p => !p.boardingGroup);

      // if (periodicDisplayCounter % 10 == 0) console.log( 
      //   'Passengers:', passengersNeedBoardingGroup.length,
      //   'Spot:', currentBoardingGroupSpot,
      //   'Group:', currentBoardingGroup)
    }

    // go thru each passenger and assign a letter boarding group 
    passengers.forEach(passenger => {
      if (!passenger.boardingGroupLetter)
        passenger.boardingGroupLetter = String.fromCharCode('A'.charCodeAt(0) + passenger.boardingGroup! - 1);
    });

    // this.consoleService.printBoardingGroupTable(passengers);

    return passengers;




  }
}
