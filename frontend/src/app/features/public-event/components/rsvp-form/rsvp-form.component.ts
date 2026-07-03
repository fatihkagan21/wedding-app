import { Component, Input, inject, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { RsvpService } from '../../../../core/services/rsvp.service';
import { CreateRsvpPayload } from '../../../../models/rsvp.model';

@Component({
  selector: 'app-rsvp-form',
  standalone: true,
  imports: [ReactiveFormsModule],
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
  validationMessage = '';

  private readonly nameValidators = [
    Validators.required,
    Validators.pattern(/\S/)
  ];

  form = this.fb.group({
    contactFullName: ['', this.nameValidators],
    attending: [true, Validators.required],
    attendeeCount: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    attendees: this.fb.array<FormControl<string | null>>([]),
    notes: ['']
  });

  get attendees(): FormArray<FormControl<string | null>> {
    return this.form.controls.attendees;
  }

  get isAttending(): boolean {
    return this.form.value.attending === true;
  }

  ngOnInit(): void {
    this.form.controls.attendeeCount.valueChanges.subscribe(value => {
      const count = Number(value);

      if (this.isAttending && Number.isInteger(count) && count >= 1 && count <= 10) {
        this.updateAttendeeInputs(count);
      }
    });
  }

  changeAttendance(value: boolean): void {
    this.form.patchValue({ attending: value });

    if (value) {
      this.form.controls.attendeeCount.enable({ emitEvent: false });
      const count = Math.max(this.form.controls.attendeeCount.value ?? 1, 1);
      this.form.controls.attendeeCount.setValue(count);
      this.updateAttendeeInputs(count);
    } else {
      this.attendees.clear();
      this.form.controls.attendeeCount.setValue(0, { emitEvent: false });
      this.form.controls.attendeeCount.disable({ emitEvent: false });
    }
  }

  updateAttendeeInputs(count: number): void {
    const additionalAttendeeCount = Math.max(count - 1, 0);

    while (this.attendees.length < additionalAttendeeCount) {
      this.attendees.push(this.fb.control('', this.nameValidators));
    }

    while (this.attendees.length > additionalAttendeeCount) {
      this.attendees.removeAt(this.attendees.length - 1);
    }
  }

  selectAttendeeCount(event: Event): void {
    (event.target as HTMLInputElement).select();
  }

  normalizeAttendeeCount(): void {
    if (!this.isAttending) return;

    const currentValue = Number(this.form.controls.attendeeCount.value);
    const normalizedValue = Number.isFinite(currentValue)
      ? Math.min(Math.max(Math.round(currentValue), 1), 10)
      : 1;

    this.form.controls.attendeeCount.setValue(normalizedValue);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.validationMessage = 'Lütfen işaretli alanları doldurun.';
      return;
    }

    this.submitting = true;
    this.errorMessage = '';
    this.validationMessage = '';

    const formValue = this.form.value;
    const attending = formValue.attending === true;
    const attendeeCount = attending ? Number(formValue.attendeeCount ?? 1) : 0;
    const contactFullName = formValue.contactFullName!.trim();
    const additionalAttendees = (formValue.attendees ?? [])
      .filter((name): name is string => typeof name === 'string')
      .map(name => name.trim());
    const attendees = attending ? [contactFullName, ...additionalAttendees] : [];

    const payload: CreateRsvpPayload = {
      eventId: this.eventId,
      contactFullName,
      attending,
      attendeeCount,
      attendees,
      notes: formValue.notes ?? ''
    };

    this.rsvpService.createRsvp(payload).subscribe({
      next: () => {
        this.submitted = true;
        this.submitting = false;
        this.form.reset({
          contactFullName: '',
          attending: true,
          attendeeCount: 1,
          notes: ''
        });
        this.form.controls.attendeeCount.enable({ emitEvent: false });
        this.updateAttendeeInputs(1);
        setTimeout(() => {
          const successMessage = document.querySelector<HTMLElement>('#rsvp-success');
          successMessage?.focus();
        });
      },
      error: (error) => {
        console.error('RSVP submit failed', error);
        this.submitting = false;
        this.errorMessage = 'Gönderim başarısız oldu. Lütfen tekrar deneyin.';
      }
    });
  }

  
  scrollToPhoto(): void {
    document.querySelector('#photos')?.scrollIntoView({ behavior: 'smooth' });
  }
}
