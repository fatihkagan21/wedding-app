import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../../../core/services/event.service';
import { Event } from '../../../../models/event.model';
import { ActivatedRoute } from '@angular/router';

import { HeroComponent } from '../../components/hero/hero.component';
import { LocationComponent } from '../../components/location/location.component';
import { PhotoUploadComponent } from '../../components/photo-upload/photo-upload.component';
import { RsvpFormComponent } from '../../components/rsvp-form/rsvp-form.component';

@Component({
  selector: 'app-event-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    LocationComponent,
    PhotoUploadComponent,
    RsvpFormComponent
  ],
  templateUrl: './event-page.component.html',
  styleUrl: './event-page.component.css'
})
export class EventPageComponent implements OnInit, OnDestroy {

  event: Event | null = null;
  loading = true;
  loadingFading = false;
  error = false;

  @ViewChild('bgMusic')
  bgMusic!: ElementRef<HTMLAudioElement>;

  @ViewChild('eventPage')
  eventPage?: ElementRef<HTMLElement>;

  isPlaying = false;
  activeSection = 'hero';
  sectionDragActive = false;
  readonly sections = [
    { id: 'hero', label: 'Davet' },
    { id: 'location', label: 'Konum' },
    { id: 'rsvp', label: 'Katılım' },
    { id: 'photos', label: 'Fotoğraflar' }
  ];

  private readonly musicVolume = 0.5;
  private sectionObserver?: IntersectionObserver;
  private sectionDragMoved = false;
  private sectionDragStartY = 0;
  private suppressSectionClick = false;

  // Şimdilik manuel.
  private eventId = '991c4c5b-bb31-43d8-bcea-ab4bbf2c636a';
  private eventService = inject(EventService);
  private route = inject(ActivatedRoute);
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

  selectSection(sectionId: string): void {
    if (this.suppressSectionClick) {
      this.suppressSectionClick = false;
      return;
    }
    this.scrollToSection(sectionId);
  }

  startSectionDrag(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    this.sectionDragActive = true;
    this.sectionDragMoved = false;
    this.sectionDragStartY = event.clientY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  moveSectionDrag(event: PointerEvent): void {
    if (!this.sectionDragActive) return;

    if (Math.abs(event.clientY - this.sectionDragStartY) > 4) {
      this.sectionDragMoved = true;
    }

    const nav = event.currentTarget as HTMLElement;
    const buttons = Array.from(nav.querySelectorAll<HTMLButtonElement>('button[data-section-id]'));
    const nearestButton = buttons.reduce<HTMLButtonElement | undefined>((nearest, button) => {
      if (!nearest) return button;

      const buttonCenter = button.getBoundingClientRect().top + button.offsetHeight / 2;
      const nearestCenter = nearest.getBoundingClientRect().top + nearest.offsetHeight / 2;
      return Math.abs(event.clientY - buttonCenter) < Math.abs(event.clientY - nearestCenter)
        ? button
        : nearest;
    }, undefined);
    const sectionId = nearestButton?.dataset['sectionId'];

    if (sectionId && sectionId !== this.activeSection) {
      this.activeSection = sectionId;
      navigator.vibrate?.(8);
      this.cdr.detectChanges();
    }
  }

  finishSectionDrag(event: PointerEvent): void {
    if (!this.sectionDragActive) return;

    const nav = event.currentTarget as HTMLElement;
    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);

    this.sectionDragActive = false;
    this.suppressSectionClick = this.sectionDragMoved;
    if (this.sectionDragMoved) this.scrollToSection(this.activeSection);
    setTimeout(() => {
      this.suppressSectionClick = false;
    });
  }

  cancelSectionDrag(event: PointerEvent): void {
    const nav = event.currentTarget as HTMLElement;
    if (nav.hasPointerCapture(event.pointerId)) nav.releasePointerCapture(event.pointerId);
    this.sectionDragActive = false;
    this.sectionDragMoved = false;
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
        this.loadingFading = true;
        this.cdr.detectChanges();
        setTimeout(() => {
          this.loading = false;
          this.loadingFading = false;
          this.cdr.detectChanges();
          setTimeout(() => this.playMusic(), 100);
          this.observeSections();
          this.openInitialSection();
        }, 320);
      },
      error: (err) => {
        console.error('Event loading failed', err);
        this.loading = false;
        this.error = true;
      }
    });
  }

  private openInitialSection(): void {
    const initialSection = this.route.snapshot.data['initialSection'];

    if (typeof initialSection !== 'string') return;

    setTimeout(() => {
      this.activeSection = initialSection;
      document.getElementById(initialSection)?.scrollIntoView({ behavior: 'auto' });
      this.cdr.detectChanges();
    });
  }

  private observeSections(): void {
    const root = this.eventPage?.nativeElement;
    if (!root) return;

    this.sectionObserver?.disconnect();
    this.sectionObserver = new IntersectionObserver(() => {
      this.updateActiveSection(root);
    }, {
      root: window.matchMedia('(max-width: 768px)').matches ? null : root,
      rootMargin: '-15% 0px -45% 0px',
      threshold: [0.2, 0.4, 0.6]
    });

    this.sections.forEach(section => {
      const element = document.getElementById(section.id);
      if (element) this.sectionObserver?.observe(element);
    });

    this.updateActiveSection(root);
  }

  private updateActiveSection(root: HTMLElement): void {
    const rootRect = root.getBoundingClientRect();
    const focusY = rootRect.top + rootRect.height / 2;
    const currentSection = this.sections.find(section => {
      const element = document.getElementById(section.id);
      if (!element) return false;

      const sectionRect = element.getBoundingClientRect();
      return sectionRect.top <= focusY && sectionRect.bottom >= focusY;
    });

    if (currentSection && currentSection.id !== this.activeSection) {
      this.activeSection = currentSection.id;
      this.cdr.detectChanges();
    }
  }
}
