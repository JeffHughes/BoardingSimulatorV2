import { Injectable } from '@angular/core';
import { Passenger } from '../classes/passenger';

@Injectable({
  providedIn: 'root'
})
export class FamilyService {

  distributePassengersIntoGroups(passengers: Passenger[],
    shuffle = false, log = true) {

    type Group = {
      members: number[];
      maxSize: number;
    }

    // Define the distribution of the group sizes
    // const groupDistribution: { size: number, count: number }[] = [
    //   { size: 6, count: 1 },
    //   { size: 5, count: 3 },
    //   { size: 4, count: 5 },
    //   { size: 3, count: 15 },
    //   { size: 2, count: 17 },
    //   { size: 1, count: 23 }
    // ];

    const groupDistribution: { size: number, count: number }[] = this.generateGroupDistribution(passengers.length, 6);
    console.log({ groupDistribution })

    let groups: Group[] = [];
    groupDistribution.forEach(distribution => {
      for (let i = 0; i < distribution.count; i++) {
        groups.push({ members: [], maxSize: distribution.size });
      }
    });

    let passengerIds = Array.from({ length: passengers.length }, (_, i) => i + 1);

    // Shuffle array to randomize passenger assignment (optional)
    if (shuffle)
      for (let i = passengerIds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [passengerIds[i], passengerIds[j]] = [passengerIds[j], passengerIds[i]];
      }

    // Fill the groups with passenger IDs
    passengerIds.forEach(passengerId => {
      const group = groups.find(group => group.members.length < group.maxSize);
      if (group) {
        group.members.push(passengerId);
      }
    });

    if (log)  // Output the groups for verification
      groups.forEach((group, index) => {
        console.log(`Group ${index + 1} ${group.maxSize} member(s): [${group.members.join(', ')}]`);
      });

    // assign familyID to each passenger
    passengers.forEach((passenger: any) => {
      const group = groups.find(group => group.members.includes(passenger.id));
      passenger.familyID = groups.indexOf(group!) + 1;
      passenger.groupSize = group!.maxSize;
    });

    return { passengers, groups };
  }

  generateGroupDistribution(totalPassengers: number, maxGroupSize = 6): { size: number, count: number }[] {
    let distribution: { size: number, count: number }[] = [];
    let remainingPassengers = totalPassengers;
    const groupSizeFallOffRatio = 3; // Ratio to reduce the number of groups as the size increases

    // Start with size 2 and work upwards
    for (let size = 2; size <= maxGroupSize && remainingPassengers >= size; size++) {
      let count = Math.floor(remainingPassengers / (size * groupSizeFallOffRatio));

      // Ensure there's at least one group of the current size
      if (size !== 2 && count === 0 && remainingPassengers >= size) {
        count = 1;
      }

      distribution.push({ size, count });
      remainingPassengers -= size * count;
    }

    console.log('singles:', remainingPassengers)

    // After allocating groups of size 2-6, fill in the remaining passengers with groups of size 1
    if (remainingPassengers > 0) {
      distribution.unshift({ size: 1, count: remainingPassengers }); // unshift to add to the beginning
    }

    return distribution;
  }
  
}
