import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal
} from '@angular/core';

import { ActivatedRoute } from '@angular/router';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap
} from 'rxjs/operators';

import { Subject, Subscription, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { VenueSearchService } from './venue-search.service';
import { EventCatalogService, EventType, EventSubtype } from '@core/event-catalog/event-catalog.service';
import { SearchTier, VenueSearchCriteria, VenueSearchResponse } from './interfaces/venue-search.model';

import { TranslatePipe } from '@ngx-translate/core';


import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { CitySearchResponse } from '@core/location/interfaces/city.model';
import { CityService } from '@core/location/city.service';

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

  private readonly searchService = inject(VenueSearchService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly catalog = inject(EventCatalogService);
  private catalogRequest?: Subscription;
  private subtypeRequest?: Subscription;
  private searchRequest?: Subscription;
  readonly selectedType = signal<EventType | null>(null);
  readonly catalogLoading = signal(false);
  readonly catalogError = signal('');
  readonly subtypesLoading = signal(false);
  readonly subtypesError = signal(false);
  readonly availableSubtypes = signal<EventSubtype[]>([]);
  readonly isOtherSubtype = computed(() => this.availableSubtypes().find(s => s.id === this.selectedSubtype())?.code === 'other');
  private criteria: VenueSearchCriteria | null = null;
  readonly response = signal<VenueSearchResponse | null>(null);
  readonly resultTiers = signal<VenueSearchResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly page = signal(0);
  readonly pageSize = 20;
  readonly configuredEventTypeId = computed(() => this.selectedType()?.id ?? null);
  readonly canSearch = computed(() => !!this.selectedCity() && !!this.configuredEventTypeId()
    && !!this.selectedDate() && Number.isFinite(this.selectedDate()!.getTime())
    && this.selectedDate()! >= this.minDate);

  search(): void {
    if (!this.canSearch() || this.loading()) return;
    const date = this.selectedDate()!;
    this.criteria = {
      cityId: this.selectedCity()!.id,
      eventTypeId: this.configuredEventTypeId()!,
      eventDate: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
      requestedGuests: this.guests()
    };
    this.response.set(null);
    this.resultTiers.set([]);
    this.page.set(0);
    this.fetch('Q1', 0);
  }

  loadMore(): void {
    const response = this.response();
    if (response?.hasMore) this.fetch(response.tier, this.page() + 1);
  }

  nextTier(): void {
    const response = this.response();
    if (!response || response.hasMore || !response.hasNextTier || response.tier === 'Q3') return;
    this.fetch(response.tier === 'Q1' ? 'Q2' : 'Q3', 0);
  }

  private fetch(tier: SearchTier, page: number): void {
    if (!this.criteria || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.searchRequest = this.searchService.search({ ...this.criteria, tier, page, pageSize: this.pageSize })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: response => {
          const previous = this.resultTiers().find(group => group.tier === response.tier);
          const group = { ...response, results: [...(previous?.results ?? []), ...response.results] };
          this.resultTiers.update(groups => previous
            ? groups.map(item => item.tier === response.tier ? group : item)
            : [...groups, group]);
          this.response.set({ ...response, results: this.resultTiers().flatMap(item => item.results) });
          this.page.set(page);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('venueSearch.searchError');
          this.loading.set(false);
        }
      });
  }

  private readonly cityService = inject(CityService);
  private readonly citySearch$ = new Subject<string>();

  readonly selectedDate = signal<Date | null>(null);
  readonly cityQuery = signal('');
  readonly citySuggestions = signal<CitySearchResponse[]>([]);
  readonly selectedCity = signal<CitySearchResponse | null>(null);

  readonly minDate = this.getTomorrow();

  readonly minGuests = 10;
  readonly maxGuests = 100000;

  private readonly route = inject(ActivatedRoute);

  readonly eventTypeCode = signal('');

  readonly selectedSubtype = signal<string | null>(null);
  readonly otherSubtype = signal('');
  readonly guests = signal<number>(50);

  loadType(): void {
    this.catalogRequest?.unsubscribe();
    this.subtypeRequest?.unsubscribe();
    this.searchRequest?.unsubscribe();
    this.selectedType.set(null);
    this.selectedSubtype.set(null);
    this.otherSubtype.set('');
    this.availableSubtypes.set([]);
    this.subtypesLoading.set(false);
    this.subtypesError.set(false);
    this.response.set(null);
    this.resultTiers.set([]);
    this.criteria = null;
    this.page.set(0);
    this.loading.set(false);
    this.error.set('');
    this.catalogLoading.set(true);
    this.catalogError.set('');
    this.catalogRequest = this.catalog.getTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: types => {
        const type = types.find(type => type.code === this.eventTypeCode());
        this.catalogLoading.set(false);
        if (!type) {
          this.catalogError.set(types.length ? 'catalog.unknownType' : 'catalog.emptyTypes');
          return;
        }
        this.selectedType.set(type);
        this.loadSubtypes();
      },
      error: () => { this.catalogError.set('catalog.error'); this.catalogLoading.set(false); }
    });
  }

  loadSubtypes(): void {
    const type = this.selectedType();
    if (!type) return;
    this.subtypeRequest?.unsubscribe();
    this.subtypesLoading.set(true);
    this.subtypesError.set(false);
    this.subtypeRequest = this.catalog.getSubtypes(type.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: subtypes => { this.availableSubtypes.set(subtypes); this.subtypesLoading.set(false); },
      error: () => { this.subtypesError.set(true); this.subtypesLoading.set(false); }
    });
  }

constructor() {
  this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
    this.eventTypeCode.set(params.get('eventTypeCode') ?? '');
    this.loadType();
  });

  this.citySearch$
    .pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(query => {

        if (query.length < 2) {
          return of([]);
        }

        return this.cityService.searchCities(query).pipe(catchError(() => of([])));
      }),
      takeUntilDestroyed(this.destroyRef)
    )
    .subscribe(cities => {
      this.citySuggestions.set(cities);
    });
}

  selectSubtype(subtype: string): void {
    this.selectedSubtype.set(subtype);

    if (!this.isOtherSubtype()) {
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

    onCityInput(event: Event): void {

    const input = event.target as HTMLInputElement;

    const query = input.value;

    this.cityQuery.set(query);
    this.selectedCity.set(null);

    this.citySearch$.next(query);
  }

  selectCity(city: CitySearchResponse): void {

    this.selectedCity.set(city);
    this.cityQuery.set(city.name);
    this.citySuggestions.set([]);
  }
}