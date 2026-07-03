import { Component, Input, OnChanges, SimpleChanges, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Event } from '../../../../models/event.model';

@Component({
  selector: 'app-location',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './location.component.html',
  styleUrl: './location.component.css'
})
export class LocationComponent implements OnChanges {

  @Input() event!: Event;

  mapEmbedUrl?: SafeResourceUrl;
  mapsLinkUrl = '';

  private sanitizer = inject(DomSanitizer);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['event'] && this.event) {
      this.updateMapUrls();
    }
  }

  scrollToRsvp(): void {
    document.querySelector('#rsvp')?.scrollIntoView({ behavior: 'smooth' });
  }

  private updateMapUrls(): void {
    const query = encodeURIComponent(
      `${this.event.venueName}, ${this.event.venueAddress}`
    );

    const embedUrl = this.event.googleMapsEmbedUrl
      || `https://maps.google.com/maps?q=${query}&output=embed`;

    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
    this.mapsLinkUrl = this.event.googleMapsUrl || `https://maps.google.com/maps?q=${query}`;
  }

}
