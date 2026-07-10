import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CreateRsvpPayload, CreateRsvpResponse, Rsvp } from '../../models/rsvp.model';

@Injectable({
  providedIn: 'root',
})
export class RsvpService {

  private api = inject(ApiService);

  createRsvp(data: CreateRsvpPayload) {
    return this.api.post<CreateRsvpResponse>('/rsvp', data);
  }

  getRsvpsByEvent(eventId: string, adminKey: string) {
    return this.api.get<Rsvp[]>(`/rsvp/event/${eventId}`, {
      headers: { 'x-admin-key': adminKey }
    });
  }

  deleteRsvp(id: string, adminKey: string) {
    return this.api.delete<void>(`/rsvp/${id}`, {
      headers: { 'x-admin-key': adminKey }
    });
  }
}
