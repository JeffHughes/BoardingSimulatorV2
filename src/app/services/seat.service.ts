import { Injectable, inject } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { LoggingService } from './logging.service';

export type Seat = {
  seatID: number;
  passengerID?: number;
  row: number;
  seat: string;
  seatRow: string;
  passengerId?: number;
  familyID?: number;
  groupSize?: number;
  orderAssigned?: number;
};

@Injectable({
  providedIn: 'root'
})
export class SeatService {
 
  public seats: Seat[];
  public seatAssigned: boolean[];

  logger = inject(LoggingService)

  constructor() {
    this.seatAssigned = Array.from({ length: 24 * 6 }, () => false);
    this.seats = this.initializeSeats(24, 6);
  }

  public initializeSeats(rows: number = 24, seats: number = 6): Seat[] {

    this.seatAssigned = Array.from({ length: rows * seats }, () => false);

    let layout: Seat[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let seat of ['A', 'B', 'C', 'D', 'E', 'F']) {
        layout.push({
          seatID: layout.length,
          row,
          seat,
          seatRow: `${row + 1}${seat}`,
        });
      }
    }
    return layout;
  }


  public assignSeatsToPassengers(passengers: any[]): Passenger[] {
    let passengerGroups: { [key: string]: Passenger[]; } = this.groupPassengersByBoardingOrder(passengers);

    console.log('Passenger Groups:', passengerGroups,)
    const keys = Object.keys(passengerGroups);
    keys.forEach((key, index) => {
      let group = passengerGroups[key];

      let targetRow = 25 - (group[0].bin! * 2);

      if (group[0].bin! == 0) targetRow = 1;

      // for (let bin = 1; bin <= 12; bin++) {
      //   let targetRow = 25 - (bin * 2);
      //   console.log(`Bin: ${bin}, Target Row: ${targetRow}`);
      // }

      /*
      Bin: 1, Target Row: 23
      Bin: 2, Target Row: 21
      Bin: 3, Target Row: 19
      Bin: 4, Target Row: 17
      Bin: 5, Target Row: 15
      Bin: 6, Target Row: 13
      Bin: 7, Target Row: 11
      Bin: 8, Target Row: 9
      Bin: 9, Target Row: 7
      Bin: 10, Target Row: 5
      Bin: 11, Target Row: 3
      Bin: 12, Target Row: 1
      */

      this.assignSeatsToGroup(group, targetRow, index);

      // console.log('Assigning seats to group', group[0].familyID, 'bin: ', group[0].bin!, 'in row', targetRow);
      // this.printSeats();
      // this.logger.downloadLogAsPNG();
    });

    return passengers;
  }

  public groupPassengersByBoardingOrder(passengers: any[]) {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const key = (passenger: any) => `${pad(passenger.boardingGroup)}-${pad(passenger.boardingOrder)}`;

    let passengerGroups: { [key: string]: Passenger[]; } = {};

    passengers.forEach(passenger => {
      if (!passengerGroups[key(passenger)]) passengerGroups[key(passenger)] = [];
      passengerGroups[key(passenger)].push(passenger);
    });
    return passengerGroups;
  }

  printSeats(): void {
    let header = '  ';
    for (let i = 1; i <= 24; i++) {
      header += i.toString().padStart(4, ' ');
    }
    this.logger.log(header);

    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    rowLabels.forEach((label, row) => {
      let rowDisplay = label + ' ';
      for (let col = 0; col < 24; col++) {
        const index = col * 6 + row;
        rowDisplay += this.seatAssigned[index] ? ' ███' : '   X';
      }
      this.logger.log(rowDisplay);
    });
  }

  public printSeats2(): void {
    // Print the column numbers with proper spacing for up to three digits
    let header = '  ';
    for (let i = 1; i <= 24; i++) {
      header += i.toString().padStart(4, ' ');
    }
    console.log(header);

    // Row labels from 'A' to 'F'
    const rowLabels = ['A', 'B', 'C', 'D', 'E', 'F'];
    rowLabels.forEach((label, row) => {
      let rowDisplay = label + ' ';
      for (let col = 0; col < 24; col++) {
        const index = col * 6 + row;
        // Add placeholder for three digits, or an 'X' with padding if the seat is unassigned
        rowDisplay += this.seatAssigned[index] ? ' ███' : '   X';
      }
      console.log(rowDisplay);
    });
  }


  assignSeatsToGroup(group: Passenger[], startingRow: number, index: number) {

    let seats: number[] = [];

    seats = this.findSeatsForGroup(group, startingRow, index);

    if (seats.length === 0) {
      // console.log('No seats found for group', group);
      // try assigning seats to decreasingly small groups to 1
      // split the group into 1 or more smaller groups
      // starting w the largest number - 1

      //TODO: Break into ever smaller groups
      // for (let size = group.length - 1; size > 0; size--) {
      //   let subgroup = group.slice(0, size);
      //   let seatsFound = this.assignSeatsToGroup(subgroup, subgroup[0].preferredRow);
      //   if (seatsFound) {
      //     console.log(`Assigned ${size} of ${group.length} seats. Attempting to assign remaining seats.`);
      //     this.splitAndAssign(group.slice(size));
      //     break;
      //   }
      // }

      // if all else fails, split group into singles 
      group.forEach(passenger => {
        let newGroup = [passenger];
        this.findSeatsForGroup(newGroup, startingRow, index);
      });
    }

  }




  findSeatsForGroup(group: Passenger[], startingRow: number, index: number): number[] {
    let seats: number[] = [];

    const preferredSeatsForGroup = this.preferredSeats(group.length);

    for (let i = 0; i < preferredSeatsForGroup.length; i++) {
      let seatsToCheck = preferredSeatsForGroup[i];
      if (this.checkEverySeat(startingRow, seatsToCheck)) {
        // console.log('Found available seats:', seatsToCheck)
        seats = seatsToCheck;
        // mark all seats as assigned

        seatsToCheck.forEach(seat => this.seatAssigned[this.rowCorrectedSeat(startingRow, seat)] = true);
        // stop looking for seats
        break;
      }
    }

    this.assignSeatsToPassengersInGroup(group, seats, index);

    return seats;
  }

  rowCorrectedSeat(startingRow: number, seatNumber: number) {
    return startingRow * 6 + seatNumber - 1;

  }

  checkEverySeat(startingRow: number, seatArray: number[]) {
    let avail = true;
    seatArray.forEach((seat: any) => {
      seat = this.rowCorrectedSeat(startingRow, seat);
      // console.log('Checking seat:', seat, this.seatAssigned[seat])
      if (seat < 0 || seat >= this.seatAssigned.length + 1) avail = false;
      if (this.seatAssigned[seat] === undefined || this.seatAssigned[seat]) avail = false;
    });
    return avail;
  }

  preferredSeats(groupSize: number) {
    switch (groupSize) {
      case 2:
        return this.prefSeatsPairs();
      case 3:
        return this.prefSeats3();
      case 4:
        return this.prefSeats4();
      case 5:
        return this.prefSeats5();
      case 6:
        return this.prefSeats6();

      default:
        return this.prefSeatsSingles();
    }
  }

  portOrStarboard() {
    // 60% of the time, return port
    // 40% of the time, return aft
    // let random = Math.random();
    let random = .25; //fixed for testing

    return random < 0.6 ? 'port' : 'starboard';
  }

  singles: any = null;
  prefSeatsSingles(): number[][] {
    if (this.singles) return this.singles;

    // A,F,C,D for 5 rows, alternating F,A,D,C
    // then E, B 

    // Singles Preferred seating window priority port:
    let AFCD = this.letterToSeat("A,F,C,D"); // [[1], [6], [3], [4]]

    // Singles Preferred seating window priority starboard:
    let FADC = this.letterToSeat("F,A,D,C"); // [[6], [4], [3], [1]];

    // Singles Preferred seating isle then window port:
    let CDAF = this.letterToSeat("C,D,A,F"); // [[4], [6], [1], [3]];

    // Singles Preferred seating isle then window starboard:
    let DCFA = this.letterToSeat("D,C,F,A"); // [[3], [1], [6], [4]];

    // Singles Secondary Preference seating window priority starboard:
    let BE = this.letterToSeat("B,E"); // [[5], [2]];

    // Singles Secondary Preference seating isle then window port:
    let EB = this.letterToSeat("E,B"); // [[2], [5]];


    // 60% of the time, return AFCD
    // 40% of the time, return FADC

    let preferredSeats = [];
    let secondarySeats = [];
    // let random = Math.random();
    let random = .25;

    if (random < 0.3) {
      preferredSeats = AFCD;  //WILMA Port
      secondarySeats = EB;
    } else if (random < 0.6) { //WIMA Starboard
      preferredSeats = FADC;
      secondarySeats = BE;
    } else if (random < 0.8) { // Isle then window Port
      preferredSeats = CDAF;
      secondarySeats = EB;
    } else {                  // ILWMA Starboard
      preferredSeats = DCFA;
      secondarySeats = BE;
    }

    this.singles = this.getSeatPreferences(preferredSeats, secondarySeats);
    return this.singles;
  }

  pairs: any = null;
  prefSeatsPairs(): number[][] {
    if (this.pairs) return this.pairs;

    let ABBCDEEF = this.letterToSeat("AB,EF,BC,DE");
    let BCCDEEFA = this.letterToSeat("FE,BA,DE,CB");

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let random = Math.random();


    if (random < 0.6) {
      preferredSeats = ABBCDEEF;  //  Port 
    } else {    //  Starboard
      preferredSeats = BCCDEEFA;
    }

    this.pairs = this.getSeatPreferences(preferredSeats, preferredSeats);
    return this.pairs;
  }

  groupsOf3: any = null;
  prefSeats3(): number[][] {
    if (this.groupsOf3) return this.groupsOf3;

    let ABCDEF = this.letterToSeat("ABC,DEF");
    let DEFABC = this.letterToSeat("DEF,ABC");

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let random = Math.random();


    if (random < 0.6) {
      preferredSeats = ABCDEF;  //  Port 
    } else {    //  Starboard
      preferredSeats = DEFABC;
    }

    this.groupsOf3 = this.getSeatPreferences(preferredSeats, preferredSeats);
    return this.groupsOf3;
  }

  groupOf4: any = null;
  prefSeats4(): number[][] {
    if (this.groupOf4) return this.groupOf4;

    let primaryStr = "ABCD,BCDE,CDEF";
    let ABCDBCDECDEF = this.letterToSeat(primaryStr);
    let reversePrimaryStr = primaryStr.split(',').reverse().join(',');
    let BCDECDCEDEF = this.letterToSeat(reversePrimaryStr);

    let secondaryStr = "ABGH,BCHI,DEJK,EFKL";
    let ABGHBCHICDJKDEKL = this.letterToSeat(secondaryStr);
    let reverseSecondaryStr = secondaryStr.split(',').reverse().join(',');
    let BCGHCDHIDEKJDEKL = this.letterToSeat(reverseSecondaryStr);

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let secondarySeats: number[][] = [];

    let random = Math.random();


    if (random < 0.6) {
      preferredSeats = ABCDBCDECDEF;  //  Port 
      secondarySeats = ABGHBCHICDJKDEKL;
    } else {    //  Starboard
      preferredSeats = BCDECDCEDEF;
      secondarySeats = BCGHCDHIDEKJDEKL;
    }

    this.groupOf4 = this.getSeatPreferences(preferredSeats, secondarySeats);
    return this.groupOf4;
  }

  groupOf5: any = null;
  prefSeats5(): number[][] {
    if (this.groupOf5) return this.groupOf5;

    let portPrimaryStr = "ABCDE,BCDEF";
    let ABCDE_BCDEF = this.letterToSeat(portPrimaryStr);
    let starboardPrimaryStr = portPrimaryStr.split(',').reverse().join(',');
    let BCDEF_ABCDE = this.letterToSeat(starboardPrimaryStr);

    const allOtherCombosStr = "ABCGH,ABCHI,DEFJK,DEFKL"; //",ABCDI,BCDEI,ABCDJ,BCDEJ,ABCDK,BCDEK,ABCDL,BCDEL,ABCGH,BCDGH,ABCHI,BCDHI,ABCJI,BCDJI,ABCKJ,BCDKJ,ABCLK,BCDLK";
    let AllOtherCombos = this.letterToSeat(allOtherCombosStr);
    let AllOtherCombosReversedStr = allOtherCombosStr.split(',').reverse().join(',');
    let AllOtherCombosReversed = this.letterToSeat(AllOtherCombosReversedStr);

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let secondarySeats: number[][] = [];

    let random = Math.random();


    if (random < 0.6) {
      preferredSeats = ABCDE_BCDEF;  //  Port 
      secondarySeats = AllOtherCombos;
    } else {    //  Starboard
      preferredSeats = BCDEF_ABCDE;
      secondarySeats = AllOtherCombosReversed;
    }

    this.groupOf5 = this.getSeatPreferences(preferredSeats, secondarySeats);
    return this.groupOf5;
  }

  groupOf6: any = null;
  prefSeats6(): number[][] {
    if (this.groupOf6) return this.groupOf6;

    let portPrimaryStr = "ABCDEF,GHIJKL";
    let ABCDE_BCDEF = this.letterToSeat(portPrimaryStr);
    let starboardPrimaryStr = portPrimaryStr.split(',').reverse().join(',');
    let BCDEF_ABCDE = this.letterToSeat(starboardPrimaryStr);

    const allOtherCombosStr = "ABCGHI,DEFJKL";
    let AllOtherCombos = this.letterToSeat(allOtherCombosStr);
    let AllOtherCombosReversedStr = allOtherCombosStr.split(',').reverse().join(',');
    let AllOtherCombosReversed = this.letterToSeat(AllOtherCombosReversedStr);

    // 60% of the time, return port
    // 40% of the time, return aft

    let preferredSeats: number[][] = [];
    let secondarySeats: number[][] = [];

    // let random = Math.random();
    let random = .25; //fixed for testing

    if (random < 0.6) {
      preferredSeats = ABCDE_BCDEF;  //  Port 
      secondarySeats = AllOtherCombos;
    } else {    //  Starboard
      preferredSeats = BCDEF_ABCDE;
      secondarySeats = AllOtherCombosReversed;
    }

    this.groupOf6 = this.getSeatPreferences(preferredSeats, secondarySeats);
    return this.groupOf6;
  }

  // the idea here is you'll look forward and back for the best seat
  // if you can't find a good seat, you'll take the next available closer than further away

  orderOfPref1: any = [
    { startRow: 1, endRow: 1, order: -2 },
    { startRow: 2, endRow: 2, order: 1 },
    { startRow: 3, endRow: 6, order: 3 },
    // { startRow: 7, endRow: 8, order: 8 },
    // { startRow: 9, endRow: 10, order: 6 },

    { startRow: -1, endRow: -1, order: -1 },
    { startRow: -2, endRow: -2, order: 2 },
    { startRow: -3, endRow: -4, order: 4 },
    { startRow: -5, endRow: -6, order: 9 },
    // { startRow: -7, endRow: -8, order: 12 },
    // { startRow: -9, endRow: -10, order: 15 },
  ];

  orderOfPref2: any = [
    { startRow: 1, endRow: 3, order: 5 },
    { startRow: 4, endRow: 6, order: 10 },
    // { startRow: 7, endRow: 8, order: 13 },
    // { startRow: 9, endRow: 10, order: 16 },

    { startRow: -1, endRow: -2, order: 7 },
    { startRow: -3, endRow: -4, order: 11 },
    { startRow: -5, endRow: -6, order: 14 },
    // { startRow: -7, endRow: -8, order: 17 },
    // { startRow: -9, endRow: -10, order: 18 },
  ];

  getSeatPreferences(preferredSeats: any[][], secondarySeats: any[][]): number[][] {
    let orderOfPref1 = [...this.orderOfPref1];
    orderOfPref1.forEach(x => x.seats = preferredSeats);

    let orderOfPref2 = [...this.orderOfPref2];
    orderOfPref2.forEach(x => x.seats = secondarySeats);

    let orderOfPref = orderOfPref1.concat(orderOfPref2);
    orderOfPref.sort((a, b) => a.order - b.order);

    let result: number[][] = [];

    let highestRow = 0;
    let lowestRow = 0;

    let counter = 1;

    while (highestRow < 25 || lowestRow > -25) {

      for (let i = 0; i < orderOfPref.length; i++) {
        let order = orderOfPref[i];
        let startRow = order.startRow * counter;
        let endRow = order.endRow * counter;

        if (startRow > 0) {
          this.addPrefSeatsInHigherNumberedRows(result, order.seats, startRow, endRow);
        }
        else
          this.addPrefSeatsInLowerNumberedRows(result, order.seats, startRow, endRow);

        if (endRow * counter > highestRow) highestRow = endRow;
        if (startRow * counter < lowestRow) lowestRow = startRow;
      }
      counter++;

    }
    return result;
  }

  addPrefSeatsInHigherNumberedRows(result: number[][], seats: number[][], startRow: number, endRow: number) {
    for (let i = startRow - 1; i < endRow; i++) {
      seats.forEach(row => {
        result.push(row.map(x => x + i * 6));
      });
    }
  }

  addPrefSeatsInLowerNumberedRows(result: number[][], seats: number[][], startRow: number, endRow: number) {
    for (let i = startRow; i > endRow - 1; i--) {
      seats.forEach(row => {
        result.push(row.map(x => (x + i * 6)));
      });
    }
  }


  letterToSeat(input: string) {
    const noteToNumber: any = {
      'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 5, 'F': 6,
      'G': 7, 'H': 8, 'I': 9, 'J': 10, 'K': 11, 'L': 12
    };

    return input.split(',').map(group => {
      return group.split('').map(note => noteToNumber[note]);
    });
  }

  assignSeatsToPassengersInGroup(group: Passenger[], seats: number[], index: number) {

    console.log('\nAssigning seats to group', group[0].familyID,
      'bin: ', group[0].bin!);


    group.forEach((passenger, seatIndex) => {
      const seat = this.seats[seats[seatIndex]];
      // console.log('Seat#', seats[seatIndex], ' is  seat', seat);

      if (seat) {
        this.seatAssigned[seatIndex] = true;
        passenger.seatLetter = seat.seat;
        passenger.row = seat.row;
        passenger.seatAndRowLetter = seat.seatRow;
      } else {
        console.error('No seat found for passenger', passenger);
      }
    });

  }

}
