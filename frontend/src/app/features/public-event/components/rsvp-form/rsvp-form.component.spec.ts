import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { RsvpService } from '../../../../core/services/rsvp.service';
import { RsvpFormComponent } from './rsvp-form.component';

describe('RsvpFormComponent', () => {
  let component: RsvpFormComponent;
  let fixture: ComponentFixture<RsvpFormComponent>;
  let rsvpService: jasmine.SpyObj<RsvpService>;

  beforeEach(async () => {
    rsvpService = jasmine.createSpyObj<RsvpService>('RsvpService', ['createRsvp']);
    rsvpService.createRsvp.and.returnValue(of({
      id: 'rsvp-1',
      eventId: 'event-1',
      contactFullName: 'Ada Lovelace',
      attending: true,
      attendeeCount: 1,
      attendees: ['Ada Lovelace'],
      createdAt: new Date().toISOString()
    }));

    await TestBed.configureTestingModule({
      imports: [RsvpFormComponent],
      providers: [
        { provide: RsvpService, useValue: rsvpService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RsvpFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('uses the contact as the first attendee and only asks for additional guests', () => {
    component.eventId = 'event-1';
    component.form.patchValue({
      contactFullName: '  Ada Lovelace  ',
      attendeeCount: 2
    });

    expect(component.attendees.length).toBe(1);
    component.attendees.at(0).setValue('  Grace Hopper  ');

    component.submit();

    expect(rsvpService.createRsvp).toHaveBeenCalledWith(jasmine.objectContaining({
      contactFullName: 'Ada Lovelace',
      attendeeCount: 2,
      attendees: ['Ada Lovelace', 'Grace Hopper']
    }));
  });

  it('shows validation feedback and does not submit when a name is empty', () => {
    component.form.patchValue({
      contactFullName: 'Ada Lovelace',
      attendeeCount: 2
    });

    component.submit();
    fixture.detectChanges();

    expect(rsvpService.createRsvp).not.toHaveBeenCalled();
    expect(component.validationMessage).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.field-error')?.textContent)
      .toContain('katılımcının adını');
  });

  it('preserves existing guest names when the attendee count increases', () => {
    component.form.controls.attendeeCount.setValue(2);
    component.attendees.at(0).setValue('Grace Hopper');

    component.form.controls.attendeeCount.setValue(3);

    expect(component.attendees.length).toBe(2);
    expect(component.attendees.at(0).value).toBe('Grace Hopper');
  });

  it('selects the current attendee count so typing replaces it', () => {
    const input = document.createElement('input');
    const selectSpy = spyOn(input, 'select');

    component.selectAttendeeCount({ target: input } as unknown as Event);

    expect(selectSpy).toHaveBeenCalled();
  });
});
