import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { DatePipe, NgStyle } from '@angular/common';
import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [DatePipe, NgStyle],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent implements OnInit, OnDestroy {

  @Input() event!: Event;

  countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
  private timer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  get backgroundStyle(): Record<string, string> {
    const image = this.event.heroImageUrl
      || 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1920&q=80';

    return {
      backgroundImage: `url('${image}')`
    };
  }

  private startCountdown(): void {
    this.updateCountdown();
    this.timer = setInterval(() => this.updateCountdown(), 1000);
  }

  private updateCountdown(): void {
    const target = new Date(this.event.eventDate).getTime();
    const now = Date.now();
    const diff = Math.max(0, target - now);

    this.countdown = {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60)
    };
  }

  scrollToRsvp(): void {
    document.getElementById('rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }
}
