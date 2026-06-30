import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CreateEventPayload, Event } from '../../models/event.model';

@Injectable({
  providedIn: 'root',
})
export class EventService {

  private api = inject(ApiService);

  getEventById(id: string) {
    return this.api.get<Event>(`/events/${id}`);
  }

  createEvent(data: CreateEventPayload) {
    return this.api.post<Event>('/events', data);
  }

  getEvents() {
    return this.api.get<Event[]>('/events');
  }

  deleteEvent(id: string) {
    return this.api.delete<void>(`/events/${id}`);
  }
}
