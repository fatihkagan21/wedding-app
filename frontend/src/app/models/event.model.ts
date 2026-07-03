export interface Event {
    id: string;

    title: string;

    brideName: string;
    groomName: string;

    description?: string;

    venueName: string;
    venueAddress: string;

    eventDate: string;

    heroImageUrl?: string;
    musicUrl?: string;
    googleMapsUrl?: string;
    googleMapsEmbedUrl?: string;

    createdAt: string;
  }

export type CreateEventPayload = Omit<Event, 'id' | 'createdAt'>;
