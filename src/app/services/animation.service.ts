import { Injectable, inject, signal } from '@angular/core';
import { Passenger } from '../classes/passenger';
import { gsap } from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(MotionPathPlugin);

@Injectable({
  providedIn: 'root'
})
export class AnimationService {

  frameRate = signal(1);
  //// 


  movePassengerTo(passenger: Passenger, targetDivID: string) {
    const passengerDiv = document.getElementById('passenger-' + passenger.id?.toString());
    if (!passengerDiv) {
      console.error('Invalid passengerDiv ' + passenger.id);
      return;
    }

    const targetDiv = document.getElementById(targetDivID);
    if (!targetDiv) {
      console.error('Invalid targetDiv ' + targetDivID);
      return;
    }

    this.centerDivOnTarget(passengerDiv, targetDiv);
  }


  /**
   * Animates the movement of a passenger from their current position to their assigned seat.
   *
   *  by moving first to the row of their seat, then to the seat itself
   */
  moveToSeat(passenger: Passenger) {
    const passengerDivID = 'passenger-' + passenger.id;
    const targetDivID = 'seat-' + passenger.row + passenger.seatLetter;

    const movingDiv = document.getElementById(passengerDivID) as HTMLElement;
    const targetDiv = document.getElementById(targetDivID) as HTMLElement;
    // Calculate the centers of each div
    const targetRect = targetDiv.getBoundingClientRect();
    const movingRect = movingDiv.getBoundingClientRect();

    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const movingCenterX = movingRect.left + movingRect.width / 2;
    const movingCenterY = movingRect.top + movingRect.height / 2;

    // Calculate the distance to move on the X axis
    const deltaX = targetCenterX - movingCenterX;

    // Animate on the X axis
    gsap.to(movingDiv, {
      x: `+=${deltaX}px`,
      duration: 1,
      onComplete: () => {
        // Calculate the distance to move on the Y axis after X movement is complete
        const deltaY = targetCenterY - movingCenterY;
        // Animate on the Y axis
        gsap.to(movingDiv, {
          y: `+=${deltaY}px`,
          duration: 1,
          onComplete: () => {
            this.movePassengerTo(passenger, targetDivID);
          },
        });
      },
    });
  }

  passengersToDivIDs(passengers: Passenger[]) {
    return passengers.map(p => 'passenger-' + p.id);
  }

  arrangePassengers(divID: string, passengers: Passenger[]) {
    this.arrangeDivs(divID, this.passengersToDivIDs(passengers));
  }

  arrangeDivs(largeDivID: string, smallDivIDs: string[]) {
    const largeDiv = document.getElementById(largeDivID);
    if (!largeDiv) {
      console.error('Invalid largeDiv ' + largeDivID);
      return;
    }
    const largeRect = largeDiv.getBoundingClientRect();

    let cols = 2;
    // Default to 2 columns except when the total div count is 2 or 3 for vertical alignment
    if ([2, 3].includes(smallDivIDs.length)) cols = 1;

    const rows = Math.ceil(smallDivIDs.length / cols);
    const spacingX = largeRect.width / cols;
    let spacingY = largeRect.height / rows;

    if ([2, 4].includes(smallDivIDs.length)) {
      spacingY *= 0.6;  // Make them closer together for 2 or 4 divs
    }

    const paddingFactor = 0.05 * (6 - smallDivIDs.length); // More padding for fewer divs
    const centerXOffset = paddingFactor * largeRect.width; // Push towards the center horizontally

    const tempDivs: any = [];

    smallDivIDs.forEach((id, index) => {
      const smallDiv = document.getElementById(id);
      if (!smallDiv) {
        console.error('Invalid smallDiv ' + id);
        return;
      }

      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'absolute';
      tempDiv.style.width = '1px';
      tempDiv.style.height = '1px';
      const row = Math.floor(index / cols);
      const col = index % cols;
      const randomOffsetX = (Math.random() - 0.5) * 2 * centerXOffset; // Dynamic center push
      const randomOffsetY = (Math.random() - 0.5) * 2 * (spacingY * 0.1); // Random vertical offset

      // Calculate center based on the modified dimensions and positions
      const centerX = largeRect.left + (col + 0.5) * spacingX + randomOffsetX;
      const centerY = largeRect.top + (row + 0.5) * spacingY + randomOffsetY;

      // Use calculated centers for temporary div positioning
      tempDiv.style.left = `${centerX - 0.5}px`;  // -0.5 because the tempDiv is 1px wide
      tempDiv.style.top = `${centerY - 0.5}px`;  // -0.5 because the tempDiv is 1px high

      document.body.appendChild(tempDiv);
      tempDivs.push(tempDiv);

      this.centerDivOnTarget(smallDiv, tempDiv);
    });

    setTimeout(() => {
      tempDivs.forEach((div: any) => div.parentNode.removeChild(div));
    }, 1000);

  }


  centerDivOnTarget(movingDiv: Element, targetDiv: Element): void {
    // Get the dimensions and positions of the moving and target divs
    const movingRect = movingDiv.getBoundingClientRect();
    const targetRect = targetDiv.getBoundingClientRect();

    const target = this.getCenterOfDivFromRect(targetRect);
    const moving = this.getCenterOfDivFromRect(movingRect);

    // Compute the new translation offsets
    const translateX = target.centerX - moving.centerX;
    const translateY = target.centerY - moving.centerY;

    // Use GSAP to animate the moving div to the new position
    gsap.to(movingDiv, {
      x: `+=${translateX}`,
      y: `+=${translateY}`,
      duration: 0.5,
      ease: "power2.inOut"
    });
  }


  getCenterOfDivFromRect(targetRect: DOMRect) {
    const centerX = targetRect.left + (targetRect.width / 2);
    const centerY = targetRect.top + (targetRect.height / 2);
    return { centerX, centerY };
  }

  getCenterOfDivFromID(divID: string) {
    const div = document.getElementById(divID);
    if (!div) {
      console.error('Invalid div ' + divID);
      return;
    }
    return this.getCenterOfDivFromRect(div.getBoundingClientRect());
  }


}
