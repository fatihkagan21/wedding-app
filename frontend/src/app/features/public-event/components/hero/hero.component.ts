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
      max-width: 560px;
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
      justify-content: center;
      gap: 2px;
    }
    .event-fact + .event-fact { border-left: 1px solid var(--color-blush); }
    .event-fact strong {
      font: 600 1.08rem/1.3 var(--font-display);
      overflow-wrap: anywhere;
    }
    .event-fact > span:last-child { font-size: .75rem; color: var(--color-text-muted); }
    .fact-address {
      line-height: 1.35;
      overflow-wrap: anywhere;
    }
    .event-fact .fact-time {
      font-size: 1rem;
      font-weight: 600;
      color: var(--color-lilac-deep);
    }
    .schedule-fact { gap: 18px; }
    .schedule-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0;
    }
    .fact-label {
      margin-bottom: 1px;
      font-size: .66rem;
      letter-spacing: .12em;
      text-transform: uppercase;
      color: var(--color-lilac-deep);
    }
    .hero-actions {
      margin-top: 12px;
      display: flex;
      flex-wrap: wrap;
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
      gap: 7px;
      border: 1px solid var(--color-lilac-deep);
      border-radius: 6px;
      font: 600 .78rem/1 var(--font-body);
      letter-spacing: .06em;
      text-decoration: none;
      cursor: pointer;
      transition: background .2s ease, color .2s ease, transform .2s ease;
    }
    .action-icon {
      flex: 0 0 auto;
      width: 18px;
      height: 18px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: rgba(255, 255, 255, .78);
      color: #111;
      font-size: .78rem;
      font-weight: 700;
      line-height: 1;
    }
    .action-icon-map {
      background: transparent;
      font-size: 1rem;
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
    .calendar-demo-action {
      min-width: 132px;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      gap: 6px;
    }
    .calendar-demo-action .hero-action {
      width: 100%;
    }
    .calendar-demo-message {
      margin: 0;
      padding: 7px 8px;
      border-radius: 6px;
      background: #fff0f0;
      color: #8a3333;
      font-size: .72rem;
      line-height: 1.35;
      text-align: center;
    }
    @media (max-width: 600px) {
      .event-facts { padding-block: 9px; }
      .event-fact { padding-inline: 6px; }
      .event-fact strong { font-size: .94rem; }
      .event-fact .fact-time { font-size: .92rem; }
      .hero-actions {
        width: 100%;
        margin-top: clamp(16px, 3.5svh, 30px);
        padding-top: 0;
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        grid-auto-rows: auto;
        align-items: start;
        gap: 8px;
      }
      .hero-action {
        min-width: 0;
        min-height: 38px;
        height: 38px;
        width: 100%;
        padding: 8px 6px;
        font-size: .69rem;
        line-height: 1.15;
      }
      .calendar-demo-action {
        min-width: 0;
        width: 100%;
      }
      .calendar-demo-action .hero-action {
        min-height: 38px;
        height: 38px;
      }
    }
    @media (max-width: 380px) {
      .event-fact { padding-inline: 4px; }
      .event-fact strong { font-size: .8rem; }
      .event-fact > span:last-child { font-size: .66rem; }
      .hero-actions {
        gap: 4px;
      }
      .hero-action {
        padding-inline: 3px;
        font-size: .62rem;
        letter-spacing: .02em;
      }
      .action-icon {
        width: 15px;
        height: 15px;
        font-size: .68rem;
      }
    }
    @media (max-height: 720px) {
      .hero-actions { margin-top: 10px; }
    }
    @media (max-height: 620px) {
      .event-facts { padding-block: 6px; }
      .hero-actions { margin-top: 6px; }
      .hero-action { min-height: 34px; padding-block: 6px; }
    }
  `]
})
export class HeroComponent implements OnInit, OnDestroy {

  @Input() event!: Event;

  readonly invitationUrl = 'https://ozgefatihdugun.tr';
  readonly qrCodeUrl = '/images/invitation-qr.png';
  readonly brideParents = 'Ayşe & Mehmet';
  readonly groomParents = 'Zeynep & Ahmet';
  now = Date.now();
  calendarDemoMessage = '';

  private readonly ceremonyLeadTimeMs = 30 * 60_000;
  private countdownTimer?: ReturnType<typeof setInterval>;
  private calendarMessageTimer?: ReturnType<typeof setTimeout>;

  ngOnInit(): void {
    this.countdownTimer = setInterval(() => {
      this.now = Date.now();
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) clearInterval(this.countdownTimer);
    if (this.calendarMessageTimer) clearTimeout(this.calendarMessageTimer);
  }

  get countdownParts(): { value: string; label: string }[] {
    const ceremonyTime = new Date(this.event.eventDate).getTime() - this.ceremonyLeadTimeMs;
    const difference = Math.max(ceremonyTime - this.now, 0);
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

  scrollToPhotos(): void {
    document.querySelector('#photos')?.scrollIntoView({ behavior: 'smooth' });
  }

  showCalendarDemoMessage(): void {
    this.calendarDemoMessage = 'Demo sayfada takvime ekleme yapılamaz.';
    if (this.calendarMessageTimer) clearTimeout(this.calendarMessageTimer);
    this.calendarMessageTimer = setTimeout(() => {
      this.calendarDemoMessage = '';
    }, 2800);
  }

  scrollToNextSection(): void {
    document.querySelector('#location')?.scrollIntoView({ behavior: 'smooth' });
  }
}
