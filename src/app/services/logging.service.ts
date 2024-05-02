import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoggingService {

  private logContainer: HTMLDivElement;

  constructor() {
    // Create a hidden div element to store log data
    this.logContainer = document.createElement('div');
    this.logContainer.style.visibility = 'hidden';
    this.logContainer.style.position = 'absolute';
    this.logContainer.style.whiteSpace = 'pre';
    this.logContainer.style.fontFamily = 'monospace';
    document.body.appendChild(this.logContainer);
  }

  log(message: string): void {
    console.log(message);
    this.logContainer.textContent += message + '\\n';
  }

  downloadLogAsPNG(): void {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const metrics = ctx!.measureText(this.logContainer?.textContent!);
    canvas.width = window.innerWidth; // Adjust as necessary
    canvas.height = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;

    ctx!.font = '16px monospace';
    ctx!.fillStyle = 'black';
    ctx!.fillText(this.logContainer?.textContent!, 0, metrics.actualBoundingBoxAscent);

    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob!);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'console-log.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }
}
