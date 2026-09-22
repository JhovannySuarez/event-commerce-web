import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { combineLatest, Subscription } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { LanguageService } from '@core/i18n/language.service';
import { EventSpaceDetailService, SpaceDetail, Reviews, SpaceCalendar } from './event-space-detail.service';

export function calendarDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
@Component({
  selector: 'app-event-space-detail', standalone: true,
  imports: [RouterLink, TranslatePipe], templateUrl: './event-space-detail.html',
  styleUrl: './event-space-detail.scss', changeDetection: ChangeDetectionStrategy.OnPush
})
export class EventSpaceDetailComponent {
  private readonly api = inject(EventSpaceDetailService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly language = inject(LanguageService);
  private detailRequest?: Subscription;
  private reviewsRequest?: Subscription;
  private calendarRequest?: Subscription;
  private id = '';
  private requestedType = '';
  private reviewPage = 0;
  readonly detail = signal<SpaceDetail | null>(null);
  readonly loading = signal(false);
  readonly error = signal('');
  readonly reviews = signal<Reviews | null>(null);
  readonly reviewsLoading = signal(false);
  readonly reviewsError = signal(false);
  readonly calendar = signal<SpaceCalendar | null>(null);
  readonly calendarLoading = signal(false);
  readonly calendarError = signal(false);
  readonly eventTypeId = signal('');
  readonly selectedDate = signal('');
  readonly month = signal(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  readonly monthLabel = computed(() => new Intl.DateTimeFormat(this.language.currentLanguage(), { month: 'long', year: 'numeric' }).format(this.month()));
  readonly weekdays = computed(() => Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(this.language.currentLanguage(), { weekday: 'short' }).format(new Date(2024, 0, 1 + i))));
  readonly days = computed(() => {
    const month = this.month();
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const offset = (month.getDay() + 6) % 7;
    return [...Array.from({ length: offset }, () => null), ...Array.from({ length: count }, (_, i) => {
      const date = calendarDate(new Date(month.getFullYear(), month.getMonth(), i + 1));
      return { date, day: i + 1, available: this.calendar()?.availableDates.some(d => d.availableDate === date) ?? false };
    })];
  });
  readonly selectedAvailability = computed(() => this.calendar()?.availableDates.find(d => d.availableDate === this.selectedDate()));
  readonly returnCode = computed(() => this.detail()?.eventTypes.find(t => t.id === this.eventTypeId())?.code);

  constructor() {
    combineLatest([this.route.paramMap, this.route.queryParamMap]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(([params, query]) => {
      this.id = params.get('id') ?? '';
      this.requestedType = query.get('eventTypeId') ?? '';
      const raw = query.get('eventDate') ?? '';
      const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T12:00:00`) : new Date();
      const valid = Number.isFinite(date.getTime()) && (!raw || calendarDate(date) === raw) ? date : new Date();
      this.month.set(new Date(valid.getFullYear(), valid.getMonth(), 1));
      this.selectedDate.set(calendarDate(valid));
      this.loadDetail();
    });
  }

  loadDetail(): void {
    this.detailRequest?.unsubscribe(); this.reviewsRequest?.unsubscribe(); this.calendarRequest?.unsubscribe();
    this.detail.set(null); this.reviews.set(null); this.calendar.set(null);
    this.reviewsLoading.set(false); this.calendarLoading.set(false);
    this.reviewsError.set(false); this.calendarError.set(false);
    this.eventTypeId.set(''); this.error.set(''); this.reviewPage = 0;
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(this.id)) {
      this.loading.set(false); this.error.set('spaceDetail.notFound'); return;
    }
    this.loading.set(true);
    this.detailRequest = this.api.detail(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: detail => {
        this.detail.set(detail); this.loading.set(false);
        this.eventTypeId.set(detail.eventTypes.find(t => t.id === this.requestedType)?.id ?? detail.eventTypes[0]?.id ?? '');
        this.loadReviews(); this.loadCalendar();
      },
      error: error => { this.loading.set(false); this.error.set(error.status === 404 ? 'spaceDetail.notFound' : 'spaceDetail.error'); }
    });
  }
  loadReviews(more = false): void {
    if (this.reviewsLoading()) return;
    const page = more ? this.reviewPage + 1 : 0;
    this.reviewsLoading.set(true); this.reviewsError.set(false);
    this.reviewsRequest = this.api.reviews(this.id, page).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: data => {
        this.reviews.set({ ...data, results: more ? [...(this.reviews()?.results ?? []), ...data.results] : data.results });
        this.reviewPage = page; this.reviewsLoading.set(false);
      },
      error: () => { this.reviewsError.set(true); this.reviewsLoading.set(false); }
    });
  }
  changeType(event: Event): void {
    this.eventTypeId.set((event.target as HTMLSelectElement).value); this.loadCalendar();
  }
  changeMonth(delta: number): void {
    const month = this.month();
    this.month.set(new Date(month.getFullYear(), month.getMonth() + delta, 1));
    this.selectedDate.set(''); this.loadCalendar();
  }
  loadCalendar(): void {
    this.calendarRequest?.unsubscribe(); this.calendar.set(null); this.calendarError.set(false);
    if (!this.eventTypeId()) { this.calendarLoading.set(false); return; }
    this.calendarLoading.set(true);
    const month = this.month();
    this.calendarRequest = this.api.calendar(this.id, this.eventTypeId(), calendarDate(month),
      calendarDate(new Date(month.getFullYear(), month.getMonth() + 1, 0)))
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: data => { this.calendar.set(data); this.calendarLoading.set(false); },
        error: () => { this.calendarError.set(true); this.calendarLoading.set(false); }
      });
  }
}
