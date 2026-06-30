import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { EventService } from '../../core/services/event.service';
import { RsvpService } from '../../core/services/rsvp.service';
import { Event } from '../../models/event.model';
import { Rsvp } from '../../models/rsvp.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private eventService = inject(EventService);
  private rsvpService = inject(RsvpService);

  adminKey = '';
  events: Event[] = [];
  selectedEventId = '';
  rsvps: Rsvp[] = [];
  searchTerm = '';
  attendanceFilter: 'all' | 'attending' | 'declined' = 'all';
  loading = false;
  deletingId = '';
  errorMessage = '';
  authenticated = false;

  ngOnInit(): void {
    const savedKey = sessionStorage.getItem('wedding-admin-key');
    if (savedKey) {
      this.adminKey = savedKey;
      this.signIn();
    }
  }

  get filteredRsvps(): Rsvp[] {
    const search = this.searchTerm.trim().toLocaleLowerCase('tr-TR');

    return this.rsvps.filter((rsvp) => {
      const matchesAttendance = this.attendanceFilter === 'all'
        || (this.attendanceFilter === 'attending' && rsvp.attending)
        || (this.attendanceFilter === 'declined' && !rsvp.attending);
      const searchableText = [
        rsvp.contactFullName,
        ...(rsvp.attendees ?? []),
        rsvp.notes ?? ''
      ].join(' ').toLocaleLowerCase('tr-TR');

      return matchesAttendance && (!search || searchableText.includes(search));
    });
  }

  get attendingResponses(): number {
    return this.rsvps.filter((rsvp) => rsvp.attending).length;
  }

  get declinedResponses(): number {
    return this.rsvps.filter((rsvp) => !rsvp.attending).length;
  }

  get totalGuests(): number {
    return this.rsvps.reduce(
      (total, rsvp) => total + (rsvp.attending ? rsvp.attendeeCount ?? 0 : 0),
      0
    );
  }

  signIn(): void {
    if (!this.adminKey.trim()) {
      this.errorMessage = 'Admin anahtarını girin.';
      return;
    }

    this.errorMessage = '';
    this.loadEvents();
  }

  signOut(): void {
    sessionStorage.removeItem('wedding-admin-key');
    this.adminKey = '';
    this.authenticated = false;
    this.events = [];
    this.rsvps = [];
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getEvents().subscribe({
      next: (events) => {
        this.events = events;
        if (!events.length) {
          this.loading = false;
          this.errorMessage = 'Henüz bir davetiye bulunmuyor.';
          return;
        }

        this.selectedEventId = this.selectedEventId || events[0].id;
        this.loadRsvps(true);
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Davetiye listesi yüklenemedi.';
      }
    });
  }

  loadRsvps(authenticating = false): void {
    if (!this.selectedEventId) return;

    this.loading = true;
    this.errorMessage = '';
    this.rsvpService.getRsvpsByEvent(this.selectedEventId, this.adminKey).subscribe({
      next: (rsvps) => {
        this.rsvps = rsvps;
        this.loading = false;
        this.authenticated = true;
        sessionStorage.setItem('wedding-admin-key', this.adminKey);
      },
      error: (error) => {
        this.loading = false;
        if (error.status === 401) {
          this.authenticated = false;
          sessionStorage.removeItem('wedding-admin-key');
          this.errorMessage = 'Admin anahtarı geçersiz.';
        } else {
          this.errorMessage = authenticating
            ? 'Admin paneline bağlanılamadı.'
            : 'Katılım yanıtları yüklenemedi.';
        }
      }
    });
  }

  deleteRsvp(rsvp: Rsvp): void {
    const confirmed = window.confirm(`${rsvp.contactFullName} kaydını silmek istiyor musunuz?`);
    if (!confirmed) return;

    this.deletingId = rsvp.id;
    this.rsvpService.deleteRsvp(rsvp.id, this.adminKey).subscribe({
      next: () => {
        this.rsvps = this.rsvps.filter((item) => item.id !== rsvp.id);
        this.deletingId = '';
      },
      error: () => {
        this.deletingId = '';
        this.errorMessage = 'Kayıt silinemedi. Lütfen tekrar deneyin.';
      }
    });
  }
}
