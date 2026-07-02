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

  private updateMapUrls(): void {
    const query = encodeURIComponent(
      `${this.event.venueName}, ${this.event.venueAddress}`
    );

    this.mapEmbedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://maps.google.com/maps?q=${query}&z=17&output=embed`
    );
    this.mapsLinkUrl = this.event.googleMapsUrl || `https://maps.google.com/maps?q=${query}`;
  }

}
