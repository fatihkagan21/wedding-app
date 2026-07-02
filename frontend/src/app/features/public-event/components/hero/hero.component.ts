import { Component, Input } from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';

import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [DatePipe, NgStyle],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css',
  styles: [`
    .event-facts {
      max-width: 470px;
      margin: 0 auto;
      padding-block: 14px;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-block: 1px solid var(--color-blush);
    }
    .event-fact {
      min-width: 0;
      padding-inline: 18px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .event-fact + .event-fact { border-left: 1px solid var(--color-blush); }
    .event-fact strong { font: 600 1rem/1.3 var(--font-display); }
    .event-fact > span:last-child { font-size: .75rem; color: var(--color-text-muted); }
    .fact-label {
      margin-bottom: 3px;
      font-size: .63rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--color-lilac-deep);
    }
    @media (max-width: 600px) {
      .event-fact { padding-inline: 10px; }
      .event-fact strong { font-size: .9rem; }
    }
  `]
})
export class HeroComponent {

  @Input() event!: Event;

  readonly invitationUrl = 'https://ozgefatihdugun.tr';
  readonly qrCodeUrl = '/images/invitation-qr.png';
  readonly brideParents = 'Sema & Semih';
  readonly groomParents = 'Hatice Hülya & Yusuf';

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
