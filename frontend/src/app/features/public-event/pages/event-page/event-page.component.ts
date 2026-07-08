import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../../../models/event.model';
import { ActivatedRoute } from '@angular/router';
import { DEMO_EVENT } from '../../../../core/config/demo-event';

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
    { id: 'photos', label: 'Anılar' }
  ];

  private readonly musicVolume = 0.5;
  private sectionObserver?: IntersectionObserver;
  private sectionDragMoved = false;
  private sectionDragStartY = 0;
  private suppressSectionClick = false;
  private programmaticScrollUntil = 0;
  private rsvpBoundarySnapTimer?: ReturnType<typeof setTimeout>;
  private rsvpBoundarySnapLocked = false;
  private pageScrollListenerAttached = false;
  private lastPageScrollTop = 0;
  private lastScrollDirection: 'up' | 'down' = 'down';
  private readonly pauseMusicForVoiceRecording = (): void => {
    const audio = this.bgMusic?.nativeElement;
    if (!audio || audio.paused) return;

    audio.pause();
    this.isPlaying = false;
    this.cdr.detectChanges();
  };

  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    document.body.classList.add('event-page-open');
    window.addEventListener('voice-recording-started', this.pauseMusicForVoiceRecording);
    this.loadEvent();
  }

  ngOnDestroy(): void {
    this.sectionObserver?.disconnect();
    this.detachPageScrollListener();
    this.clearRsvpBoundarySnapTimer();
    window.removeEventListener('voice-recording-started', this.pauseMusicForVoiceRecording);
    document.body.classList.remove('event-page-open');
  }

  scrollToSection(sectionId: string): void {
    this.activeSection = sectionId;
    this.programmaticScrollUntil = Date.now() + 900;
    this.rsvpBoundarySnapLocked = sectionId === 'photos';
    this.cdr.detectChanges();
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
    this.event = DEMO_EVENT;
    this.loadingFading = true;
    this.cdr.detectChanges();

    setTimeout(() => {
      this.loading = false;
      this.loadingFading = false;
      this.cdr.detectChanges();
      setTimeout(() => this.playMusic(), 100);
      this.observeSections();
      this.attachPageScrollListener();
      this.openInitialSection();
    }, 320);
  }

  private openInitialSection(): void {
    const initialSection = this.route.snapshot.data['initialSection'];

    if (typeof initialSection !== 'string') return;

    setTimeout(() => {
      this.activeSection = initialSection;
      this.programmaticScrollUntil = Date.now() + 250;
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
      root,
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
    if (Date.now() < this.programmaticScrollUntil) return;

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

  private attachPageScrollListener(): void {
    const root = this.eventPage?.nativeElement;
    if (!root || this.pageScrollListenerAttached) return;

    this.lastPageScrollTop = root.scrollTop;
    root.addEventListener('scroll', this.handlePageScroll, { passive: true });
    this.pageScrollListenerAttached = true;
  }

  private detachPageScrollListener(): void {
    const root = this.eventPage?.nativeElement;
    if (!root || !this.pageScrollListenerAttached) return;

    root.removeEventListener('scroll', this.handlePageScroll);
    this.pageScrollListenerAttached = false;
  }

  private readonly handlePageScroll = (): void => {
    const root = this.eventPage?.nativeElement;
    if (root) {
      this.lastScrollDirection = root.scrollTop >= this.lastPageScrollTop ? 'down' : 'up';
      this.lastPageScrollTop = root.scrollTop;
    }

    this.scheduleRsvpBoundarySnap();
  };

  private scheduleRsvpBoundarySnap(): void {
    this.clearRsvpBoundarySnapTimer();

    this.rsvpBoundarySnapTimer = setTimeout(() => {
      this.snapFromRsvpBoundaryIfNeeded();
    }, 80);
  }

  private snapFromRsvpBoundaryIfNeeded(): void {
    const root = this.eventPage?.nativeElement;
    const rsvpSection = document.getElementById('rsvp');
    const photosSection = document.getElementById('photos');
    const rsvpCard = rsvpSection?.querySelector<HTMLElement>('.rsvp-card');
    const scrollCue = rsvpSection?.querySelector<HTMLElement>('.scroll-cue');

    if (!root || !rsvpSection || !photosSection || !rsvpCard || !scrollCue) return;
    if (!this.isMobileViewport()) return;
    if (this.isRsvpInputFocused()) return;
    if (Date.now() < this.programmaticScrollUntil) return;
    if (this.lastScrollDirection !== 'down') {
      this.rsvpBoundarySnapLocked = false;
      return;
    }

    const rootRect = root.getBoundingClientRect();
    const rsvpCardRect = rsvpCard.getBoundingClientRect();
    const scrollCueRect = scrollCue.getBoundingClientRect();
    const visualEndVisible = rsvpCardRect.bottom <= rootRect.bottom - 6
      && scrollCueRect.bottom <= rootRect.bottom - 6;

    if (!visualEndVisible) {
      this.rsvpBoundarySnapLocked = false;
      return;
    }

    if (this.rsvpBoundarySnapLocked) return;

    this.rsvpBoundarySnapLocked = true;
    this.activeSection = 'photos';
    this.programmaticScrollUntil = Date.now() + 900;
    this.cdr.detectChanges();
    photosSection.scrollIntoView({ behavior: 'smooth' });
  }

  private isMobileViewport(): boolean {
    return window.matchMedia('(max-width: 768px)').matches;
  }

  private isRsvpInputFocused(): boolean {
    const activeElement = document.activeElement;
    return activeElement instanceof HTMLElement && !!activeElement.closest('#rsvp');
  }

  private clearRsvpBoundarySnapTimer(): void {
    if (this.rsvpBoundarySnapTimer) clearTimeout(this.rsvpBoundarySnapTimer);
    this.rsvpBoundarySnapTimer = undefined;
  }
}
