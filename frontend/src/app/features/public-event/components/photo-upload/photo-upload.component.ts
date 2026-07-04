import { DatePipe } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';

import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.css'
})
export class PhotoUploadComponent implements OnInit, OnDestroy {
  @Input() event!: Event;

  readonly formUrl = 'https://forms.gle/KsyUQXgqWQGagHFC9';
  now = Date.now();

  private availabilityTimer?: ReturnType<typeof setInterval>;

  get isUploadOpen(): boolean {
    return this.now <= new Date(this.event.eventDate).getTime();
  }

  ngOnInit(): void {
    this.availabilityTimer = setInterval(() => {
      this.now = Date.now();
    }, 30_000);
  }

  ngOnDestroy(): void {
    if (this.availabilityTimer) clearInterval(this.availabilityTimer);
  }
}
