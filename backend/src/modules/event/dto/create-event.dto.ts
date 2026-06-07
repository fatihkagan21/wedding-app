export interface CreateEventDto {
  title: string;
  brideName: string;
  groomName: string;
  description?: string;
  venueName: string;
  venueAddress: string;
  eventDate: Date;
  heroImageUrl?: string;
  musicUrl?: string;
}