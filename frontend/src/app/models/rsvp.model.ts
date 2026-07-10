export interface Rsvp {
  id: string;
  eventId: string;
  contactFullName: string;
  attending: boolean;
  attendeeCount?: number;
  attendees?: string[];
  notes?: string;
  createdAt: string;
}

export type CreateRsvpResponse = Rsvp & {
  warning?: string;
};

export interface CheckRsvpNameResponse {
  duplicate: boolean;
  warning?: string;
}

export type CreateRsvpPayload = Omit<Rsvp, 'id' | 'createdAt'>;
