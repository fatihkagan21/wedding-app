import { Component, Input } from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';

import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [DatePipe, NgStyle],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {

  @Input() event!: Event;

  readonly invitationUrl = 'https://ozgefatihdugun.tr';
  readonly qrCodeUrl = '/images/invitation-qr.png';
  readonly brideParents = 'Sema & Semih Ötleş';
  readonly groomParents = 'Hatice Hülya & Yusuf Keremit';

  get backgroundStyle(): Record<string, string> {
    const fallbackImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80';
    const eventImage = this.event.heroImageUrl;

    return {
      backgroundImage: eventImage
        ? `url('${eventImage}'), url('${fallbackImage}')`
        : `url('${fallbackImage}')`
    };
  }

  scrollToNextSection(): void {
    document.querySelector('app-location')?.scrollIntoView({ behavior: 'smooth' });
  }
}
