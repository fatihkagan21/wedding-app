export interface CreateRsvpDto {
  eventId: string;
  contactFullName: string;
  attending: boolean;
  attendeeCount?: number;
  attendees?: string[];
  notes?: string;
}