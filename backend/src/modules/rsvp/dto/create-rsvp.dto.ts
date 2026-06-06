export interface CreateRsvpDto {
    eventId: string;
    name: string;
    phone: string;
    attending: boolean;
    guestCount?: number;
    message?: string;
  }