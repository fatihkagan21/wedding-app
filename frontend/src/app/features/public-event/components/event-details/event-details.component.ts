import { Component, Input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.css'
})
export class EventDetailsComponent {

  @Input() event!: Event;

}
