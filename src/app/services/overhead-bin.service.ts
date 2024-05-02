import { Injectable, inject } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { ConfigService } from './config.service';

interface Group {
  members: number[];
  maxSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class OverheadBinService {

  config = inject(ConfigService);
  /*
   The histogram of passenger group sizes is an unknown
 
   so, this is distribution is totally fictitious - just to get the data in the simulator
   IRL, the bin distribution would be based on a totally different set of factors
   */
  assignPassengerBins(passengers: Passenger[], groups: Group[], 
    totalBins: number = this.config.binCount(),
    slotsPerBin: number = this.config.slotsPerParallelBinsCount()): Passenger[] {
 
    //make a dictionary of bins and the bin's slots
    let bins: any = {};
    for (let bin = 0; bin <= totalBins; bin++) {
      bins[bin] = [];
    }

    groups.sort((a, b) => b.maxSize - a.maxSize);

    // groups.sort((a: any, b: any) => {
    //   // Compare the maxSize properties randomly
    //   return 0.5 - Math.random();
    // }).sort((a: any, b: any) => {
    //   // Additional sorting step to shuffle based on maxSize
    //   if (Math.random() > 0.5) {
    //     return b.maxSize - a.maxSize;
    //   } else {
    //     return a.maxSize - b.maxSize;
    //   }
    // });

    // starting w bin 12 assign 1 group per bin, when you get to 1 go back to 12
    // there's an advantage to loading big groups on the back of the plane

    let currentBin = totalBins;
    let currentSlotIndex = 1;
    for (let group of groups) {
      if (group.maxSize > slotsPerBin) continue;
      if (currentSlotIndex + group.maxSize > slotsPerBin) {
        currentBin--;
        currentSlotIndex = 1;
      }
      if (currentBin < 1) break;
      group.members.forEach((memberId, index) => {
        const passengerIndex = passengers.findIndex(p => p.id === memberId);
        if (passengerIndex !== -1) {
          let passenger = passengers[passengerIndex];
          passenger.bin = currentBin;
          passenger.slot = +(currentSlotIndex++ + 1);
          passenger.hasCarryOn = true;
          bins[currentBin].push({ passenger });
        }
      });
    }


    let slotsFilled = passengers.filter(p => p.slot).length || 0;
    const totalSlots = totalBins * slotsPerBin;
    const totalSlotsToFill = Math.floor(totalSlots * 0.95) || 0; // 95% fill rate
    const slotsToFill = totalSlotsToFill - slotsFilled;

    let remaining = passengers.filter(p => !p.slot && !p.bin);

    if (remaining && remaining.length > slotsToFill) {
      remaining = remaining.slice(0, slotsToFill);

      // fill in w singles
      // look at all the bins one at a time, add singles until 12
      // then move to the next bin 
      for (let bin = totalBins; bin >= 1; bin--) {
        let binSlots = bins[bin].length;
        while (binSlots < slotsPerBin) {
          let passenger = remaining.find(p => !p.slot && !p.bin);
          if (passenger) {
            passenger.bin = bin;
            passenger.slot = binSlots++;
            passenger.hasCarryOn = true;
            bins[bin].push({ passenger });
          } else {
            break;
          }
        }
      }

    }





    passengers.forEach((passenger: any) => {

      if (!passenger.slot) {
        passenger.bin = 0;
        passenger.slot = 0;
        passenger.hasCarryOn = false;
        bins[0].push({ passenger });
      }
    });

    const carryOns = passengers.filter(p => p.hasCarryOn).length;
    const bagless = passengers.filter(p => !p.hasCarryOn).length;
    const totalPassengers = passengers.length;

    const percentageWBags = (totalPassengers - bagless) / totalPassengers * 100;
    console.log('total passengers', totalPassengers,
      'carry-ons', carryOns, 'bagless', bagless,
      'percentage w bags', percentageWBags.toFixed(1), '%'
    )


    console.log("bin assignments", bins)

    return passengers;
  }
}
