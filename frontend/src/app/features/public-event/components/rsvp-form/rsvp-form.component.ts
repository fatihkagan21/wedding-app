import { Component, Input, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RsvpService } from '../../../../core/services/rsvp.service';
import { CreateRsvpPayload } from '../../../../models/rsvp.model';

@Component({
  selector: 'app-rsvp-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './rsvp-form.component.html',
  styleUrl: './rsvp-form.component.css'
})
export class RsvpFormComponent implements OnInit {

  @Input() eventId!: string;

  private fb = inject(FormBuilder);
  private rsvpService = inject(RsvpService);

  submitted = false;
  submitting = false;
  errorMessage = '';

  form = this.fb.group({
    contactFullName: ['', Validators.required],
    attending: [true, Validators.required],
    attendeeCount: [1],
    attendees: this.fb.array([]),
    notes: ['']
  });

  get attendees() {
    return this.form.controls.attendees;
  }

  get isAttending(): boolean {
    return this.form.value.attending === true;
  }

  ngOnInit(): void {
    this.updateAttendeeInputs(1);

    // Keep attendee count within the supported guest limit.
    this.form.get('attendeeCount')?.valueChanges.subscribe(value => {
      let count = Number(value);

      if (isNaN(count)) count = 1;
      count = Math.min(Math.max(count, 1), 10);

      if (count !== value) {
        this.form.patchValue(
          { attendeeCount: count },
          { emitEvent: false }
        );
      }

      if (this.isAttending) {
        this.updateAttendeeInputs(count);
      }
    });

  }

  changeAttendance(value: boolean): void {
    this.form.patchValue({ attending: value });

    if (value) {
      const count = this.form.value.attendeeCount ?? 1;
      this.form.patchValue({ attendeeCount: count || 1 });
      this.updateAttendeeInputs(count || 1);
    } else {
      this.attendees.clear();
      this.form.patchValue({ attendeeCount: 0 });
    }
  }

  updateAttendeeInputs(count: number): void {
    this.attendees.clear();

    for (let i = 0; i < count; i++) {
      this.attendees.push(
        this.fb.control('', Validators.required)
      );
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting = true;
    this.errorMessage = '';

    const formValue = this.form.value;

    const attending = formValue.attending === true;
    const attendeeCount = attending ? Number(formValue.attendeeCount ?? 1) : 0;
    const attendees = attending
      ? (formValue.attendees ?? []).filter((name): name is string => typeof name === 'string')
      : [];

    const payload: CreateRsvpPayload = {
      eventId: this.eventId,
      contactFullName: formValue.contactFullName!,
      attending,
      attendeeCount,
      attendees,
      notes: formValue.notes ?? ''
    };

    this.rsvpService.createRsvp(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.form.reset();
        this.form.patchValue({ attending: true, attendeeCount: 1 });
        this.updateAttendeeInputs(1);
      },
      error: (error) => {
        console.error('RSVP submit failed', error);
        this.submitting = false;
        this.errorMessage = 'Gönderim başarısız oldu. Lütfen tekrar deneyin.';
      }
    });
  }
}
