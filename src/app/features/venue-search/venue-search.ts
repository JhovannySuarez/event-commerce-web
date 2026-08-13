import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { EVENT_SUBTYPES } from './mock/event-subtypes.mock';
import { EventSubtype } from './interfaces/venue-search.model';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

@Component({
  selector: 'app-venue-search',
  standalone: true,
  imports: [
    TranslatePipe,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ],
  templateUrl: './venue-search.html',
  styleUrl: './venue-search.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VenueSearchComponent {

  readonly selectedDate = signal<Date | null>(null);

  readonly minDate = this.getTomorrow();

  readonly minGuests = 10;
  readonly maxGuests = 100000;

  private readonly route = inject(ActivatedRoute);

  readonly eventTypeId = signal(
    this.route.snapshot.paramMap.get('eventTypeId') ?? ''
  );

  readonly selectedSubtype = signal<string | null>(null);
  readonly otherSubtype = signal('');
  readonly guests = signal<number>(50);

  readonly availableSubtypes = computed<EventSubtype[]>(() =>
    EVENT_SUBTYPES.filter(
      subtype => subtype.eventTypeId === this.eventTypeId()
    )
  );

  selectSubtype(subtype: string): void {
    this.selectedSubtype.set(subtype);

    if (subtype !== 'other') {
      this.otherSubtype.set('');
    }
  }

  updateOtherSubtype(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.otherSubtype.set(input.value);
  }

  increaseGuests(): void {
    if (this.guests() < this.maxGuests) {
      this.guests.update(value => value + 1);
    }
  }

  decreaseGuests(): void {
    if (this.guests() > this.minGuests) {
      this.guests.update(value => value - 1);
    }
  }

  onGuestsInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = Number(input.value);

    if (!Number.isFinite(value)) {
      return;
    }

    if (value < this.minGuests) {
      this.guests.set(this.minGuests);
      return;
    }

    if (value > this.maxGuests) {
      this.guests.set(this.maxGuests);
      return;
    }

    this.guests.set(Math.floor(value));
  }

  private getToday(): Date {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
  }

  private getDateAfterDays(days: number): Date {
    const date = this.getToday();

    date.setDate(date.getDate() + days);

    return date;
  }

  onDateChange(date: Date | null): void {

    if (!date) {
      this.selectedDate.set(null);
      return;
    }

    if (date < this.minDate) {
      this.selectedDate.set(null);
      return;
    }

    this.selectedDate.set(date);
  }

  private getTomorrow(): Date {
    const tomorrow = new Date();

    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    return tomorrow;
  }
}