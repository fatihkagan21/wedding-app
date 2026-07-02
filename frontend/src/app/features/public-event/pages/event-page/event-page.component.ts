import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/services/event.service';
import { Event } from '../../../../models/event.model';

import { HeroComponent } from '../../components/hero/hero.component';
import { EventDetailsComponent } from '../../components/event-details/event-details.component';
import { LocationComponent } from '../../components/location/location.component';
import { RsvpFormComponent } from '../../components/rsvp-form/rsvp-form.component';

@Component({
  selector: 'app-event-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    EventDetailsComponent,
    LocationComponent,
    RsvpFormComponent
  ],
  templateUrl: './event-page.component.html',
  styleUrl: './event-page.component.css'
})
export class EventPageComponent implements OnInit, OnDestroy {

  event: Event | null = null;
  loading = true;
  error = false;

  @ViewChild('bgMusic')
  bgMusic!: ElementRef<HTMLAudioElement>;

  @ViewChild('eventPage')
  eventPage?: ElementRef<HTMLElement>;

  isPlaying = false;
  activeSection = 'hero';
  readonly sections = [
    { id: 'hero', label: 'Davet' },
    { id: 'location', label: 'Konum' },
    { id: 'details', label: 'Günün Akışı' },
    { id: 'rsvp', label: 'Katılım' }
  ];

  private readonly musicVolume = 0.25;
  private sectionObserver?: IntersectionObserver;

  // Şimdilik manuel.
  private eventId = '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a';
  private eventService = inject(EventService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadEvent();
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
  }

  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  }

  playMusic(): void {
    const audio = this.bgMusic.nativeElement;
    audio.volume = this.musicVolume;

    audio.play()
      .then(() => {
        this.isPlaying = true;
      })
      .catch(() => {
        // Tarayıcı otomatik oynatmayı engellerse sorun değil.
        this.isPlaying = false;
      });
  }

  toggleMusic(): void {
    const audio = this.bgMusic.nativeElement;
    audio.volume = this.musicVolume;

    if (audio.paused) {
      audio.play();
      this.isPlaying = true;
    } else {
      audio.pause();
      this.isPlaying = false;
    }
  }

  loadEvent(): void {
    this.loading = true;
    this.error = false;
    this.cdr.detectChanges();

    this.eventService.getEventById(this.eventId).subscribe({
      next: (response) => {
        this.event = response as Event;
        this.loading = false;
        this.cdr.detectChanges();
        setTimeout(() => this.playMusic(), 100);
        setTimeout(() => this.observeSections());
      },
      error: (err) => {
        console.error('Event loading failed', err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  private observeSections(): void {
    const root = this.eventPage?.nativeElement;
    if (!root) return;

    this.sectionObserver?.disconnect();
    this.sectionObserver = new IntersectionObserver(entries => {
      const activeEntry = entries
        .filter(entry => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio)[0];

      if (activeEntry) {
        this.activeSection = activeEntry.target.id;
        this.cdr.detectChanges();
      }
    }, {
      root,
      rootMargin: '-15% 0px -45% 0px',
      threshold: [0.2, 0.4, 0.6]
    });

    this.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) this.sectionObserver?.observe(element);
    });
  }
}
