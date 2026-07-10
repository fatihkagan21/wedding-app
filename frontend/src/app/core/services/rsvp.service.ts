import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { CheckRsvpNameResponse, CreateRsvpPayload, CreateRsvpResponse, Rsvp } from '../../models/rsvp.model';

@Injectable({
  providedIn: 'root',
})
export class RsvpService {

  private api = inject(ApiService);

  createRsvp(data: CreateRsvpPayload) {
    return this.api.post<CreateRsvpResponse>('/rsvp', data);
  }

  checkRsvpName(eventId: string, name: string) {
    return this.api.post<CheckRsvpNameResponse>('/rsvp/check-name', { eventId, name });
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
