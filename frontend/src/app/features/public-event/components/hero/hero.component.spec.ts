import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HeroComponent } from './hero.component';

describe('HeroComponent', () => {
  let component: HeroComponent;
  let fixture: ComponentFixture<HeroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeroComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('event', {
      id: 'event-1',
      title: 'Özge & Fatih Kağan Düğün Davetiyesi',
      brideName: 'Özge',
      groomName: 'Fatih Kağan',
      venueName: 'Yaka Davet Çiçekliköy',
      venueAddress: 'İzmir, Türkiye',
      eventDate: '2026-09-05T17:00:00.000Z',
      createdAt: '2026-01-01T00:00:00.000Z'
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
