import { Component, Input, OnDestroy, OnInit } from '@angular/core';
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
    .hero-actions {
      margin-top: 12px;
      display: flex;
      justify-content: center;
      gap: 10px;
    }
    .hero-action {
      min-width: 132px;
      min-height: 42px;
      padding: 10px 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--color-lilac-deep);
      border-radius: 6px;
      font: 600 .78rem/1 var(--font-body);
      letter-spacing: .06em;
      text-decoration: none;
      cursor: pointer;
      transition: background .2s ease, color .2s ease, transform .2s ease;
    }
    .hero-action:hover { transform: translateY(-1px); }
    .hero-action-primary {
      background: var(--color-lilac-deep);
      color: #fff;
    }
    .hero-action-secondary {
      background: transparent;
      color: var(--color-lilac-deep);
    }
    @media (max-width: 600px) {
      .event-facts { padding-block: 9px; }
      .event-fact { padding-inline: 10px; }
      .event-fact strong { font-size: .9rem; }
      .hero-actions { margin-top: 8px; gap: 8px; }
      .hero-action {
        min-width: 0;
        min-height: 38px;
        flex: 1;
        padding: 8px 10px;
      }
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {

  @Input() event!: Event;

  readonly invitationUrl = 'https://ozgefatihdugun.tr';
  readonly qrCodeUrl = '/images/invitation-qr.png';
  readonly brideParents = 'Sema & Semih';
  readonly groomParents = 'Hatice Hülya & Yusuf';
  now = Date.now();

  private countdownTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.countdownTimer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
  }

  get countdownParts(): { value: string; label: string }[] {
    const difference = Math.max(new Date(this.event.eventDate).getTime() - this.now, 0);
    const days = Math.floor(difference / 86_400_000);
    const hours = Math.floor((difference / 3_600_000) % 24);
    const minutes = Math.floor((difference / 60_000) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return [
      { value: String(days), label: 'Gün' },
      { value: String(hours).padStart(2, '0'), label: 'Saat' },
      { value: String(minutes).padStart(2, '0'), label: 'Dk' },
      { value: String(seconds).padStart(2, '0'), label: 'Sn' }
    ];
  }

  get backgroundStyle(): Record<string, string> {
    const fallbackImage = 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80';
    const eventImage = this.event.heroImageUrl;

    return {
      backgroundImage: eventImage
        ? `url('${eventImage}'), url('${fallbackImage}')`
        : `url('${fallbackImage}')`
    };
  }

  scrollToRsvp(): void {
    document.querySelector('#rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToNextSection(): void {
    document.querySelector('#location')?.scrollIntoView({ behavior: 'smooth' });
  }
}
