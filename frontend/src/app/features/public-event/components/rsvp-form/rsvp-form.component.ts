import { Component, Input, inject, OnDestroy, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Subject, catchError, debounceTime, distinctUntilChanged, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';

import { RsvpService } from '../../../../core/services/rsvp.service';
import { CheckRsvpNameResponse, CreateRsvpPayload, CreateRsvpResponse } from '../../../../models/rsvp.model';

interface NameCheckTarget {
  type: 'contact' | 'attendee';
  index?: number;
  name: string;
}

@Component({
  selector: 'app-rsvp-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rsvp-form.component.html',
  styleUrl: './rsvp-form.component.css'
})
export class RsvpFormComponent implements OnInit, OnDestroy {

  @Input() eventId!: string;
  readonly maxAttendeeCount = 5;

  private fb = inject(FormBuilder);
  private rsvpService = inject(RsvpService);

  submitted = false;
  submitting = false;
  errorMessage = '';
  validationMessage = '';
  duplicateWarningMessage = '';
  notificationWarningMessage = '';
  attendeeDuplicateWarningMessages: string[] = [];
  checkingDuplicateName = false;
  private readonly destroy$ = new Subject<void>();

  private readonly nameValidators = [
    Validators.required,
    Validators.pattern(/\S/)
  ];

  form = this.fb.group({
    contactFullName: ['', this.nameValidators],
    attending: [true, Validators.required],
    attendeeCount: [1, [Validators.required, Validators.min(1), Validators.max(this.maxAttendeeCount)]],
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
    this.form.controls.attendeeCount.valueChanges.pipe(
      takeUntil(this.destroy$)
    ).subscribe(value => {
      const count = Number(value);

      if (this.isAttending && Number.isInteger(count) && count >= 1 && count <= this.maxAttendeeCount) {
        this.updateAttendeeInputs(count);
      }
    });

    this.form.valueChanges.pipe(
      debounceTime(450),
      map(() => this.getNameCheckTargets()),
      distinctUntilChanged((previous, current) => JSON.stringify(previous) === JSON.stringify(current)),
      switchMap(targets => {
        this.clearDuplicateWarnings();

        if (!this.eventId || !targets.length) {
          this.checkingDuplicateName = false;
          return of(null);
        }

        this.checkingDuplicateName = true;
        return forkJoin(
          targets.map(target => this.rsvpService.checkRsvpName(this.eventId, target.name).pipe(
            map(response => ({ target, response })),
            catchError(() => of({ target, response: null as CheckRsvpNameResponse | null }))
          ))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.checkingDuplicateName = false;
      if (!results) return;

      results.forEach(({ target, response }) => {
        const warning = response?.warning ?? '';
        if (target.type === 'contact') {
          this.duplicateWarningMessage = warning;
        } else if (typeof target.index === 'number') {
          this.attendeeDuplicateWarningMessages[target.index] = warning;
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
      this.attendeeDuplicateWarningMessages = [];
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

    this.attendeeDuplicateWarningMessages = this.attendeeDuplicateWarningMessages.slice(0, additionalAttendeeCount);
  }

  selectAttendeeCount(event: Event): void {
    (event.target as HTMLInputElement).select();
  }

  normalizeAttendeeCount(): void {
    if (!this.isAttending) return;

    const currentValue = Number(this.form.controls.attendeeCount.value);
    const normalizedValue = Number.isFinite(currentValue)
      ? Math.min(Math.max(Math.round(currentValue), 1), this.maxAttendeeCount)
      : 1;

    this.form.controls.attendeeCount.setValue(normalizedValue);
  }

  capitalizeNameWords(control: FormControl<string | null>): void {
    const value = control.value;
    if (!value) return;

    const capitalizedValue = value.replace(
      /(^|\s)(\p{L})/gu,
      (_match, prefix: string, letter: string) => `${prefix}${letter.toLocaleUpperCase('tr-TR')}`
    );

    if (capitalizedValue !== value) {
      control.setValue(capitalizedValue);
    }
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
    this.notificationWarningMessage = '';

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
      next: (response: CreateRsvpResponse) => {
        this.submitted = true;
        this.submitting = false;
        this.notificationWarningMessage = response.notificationWarning ?? '';
        this.clearDuplicateWarnings();
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

  private getNameCheckTargets(): NameCheckTarget[] {
    const targets: NameCheckTarget[] = [];
    const contactName = this.form.controls.contactFullName.value?.trim();

    if (contactName && contactName.length >= 2) {
      targets.push({ type: 'contact', name: contactName });
    }

    this.attendees.controls.forEach((control, index) => {
      const name = control.value?.trim();
      if (name && name.length >= 2) {
        targets.push({ type: 'attendee', index, name });
      }
    });

    return targets;
  }

  private clearDuplicateWarnings(): void {
    this.duplicateWarningMessage = '';
    this.attendeeDuplicateWarningMessages = [];
  }
}
