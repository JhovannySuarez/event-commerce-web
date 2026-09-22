import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { EventSpaceDetailComponent } from './event-space-detail';

const id = '00000000-0000-0000-0000-000000000001';
const detail = { id, name: 'Salon Principal', description: 'Space description', capacityMin: 10, capacityMax: 100,
  basePrice: 500, currencyCode: 'COP', venue: { id: 'venue', name: 'Aguas Claras', address: 'Calle 1', city: 'Medellin', state: 'Antioquia' },
  eventTypes: [{ id: 'type', code: 'social', name: 'Social' }] };
describe('Event space detail', () => {
  let component: EventSpaceDetailComponent;
  let http: HttpTestingController;
  let params: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    params = new BehaviorSubject(convertToParamMap({ id }));
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideTranslateService(), provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: params, queryParamMap: new BehaviorSubject(convertToParamMap({ eventTypeId: 'type', eventDate: '2030-02-10' })) } }
    ] });
    component = TestBed.runInInjectionContext(() => new EventSpaceDetailComponent());
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());
  const req = (suffix: string) => TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith(suffix));
  it('opens directly, loads venue reviews and month availability and exposes slots', () => {
    req('/detail').flush(detail);
    expect(component.detail()?.venue.address).toBe('Calle 1');
    req('/reviews').flush({ averageRating: 4.5, reviewCount: 2, results: [], hasMore: false });
    const calendar = req('/calendar');
    expect(calendar.request.params.get('from')).toBe('2030-02-01');
    expect(calendar.request.params.get('to')).toBe('2030-02-28');
    expect(calendar.request.params.get('eventTypeId')).toBe('type');
    calendar.flush({ from: '2030-02-01', to: '2030-02-28', availableDates: [{ availableDate: '2030-02-10', availableHours: 2, availableSlots: [{ from: '10:00', until: '12:00', hours: 2 }] }] });
    expect(component.selectedAvailability()?.availableSlots.length).toBe(1);
    expect(component.days().filter(d => d?.available).length).toBe(1);
  });
  it('cancels obsolete calendar requests and retries errors without losing detail', () => {
    req('/detail').flush(detail);
    req('/reviews').flush({}, { status: 500, statusText: 'Error' });
    const old = req('/calendar');
    component.changeMonth(1);
    expect(old.cancelled).toBe(true);
    req('/calendar').flush({}, { status: 500, statusText: 'Error' });
    expect(component.calendarError()).toBe(true);
    expect(component.detail()?.name).toBe('Salon Principal');
    component.loadCalendar();
    const retry = req('/calendar');
    expect(retry.request.params.get('to')).toBe('2030-03-31');
    retry.flush({ from: '2030-03-01', to: '2030-03-31', availableDates: [] });
    expect(component.calendarError()).toBe(false);
    component.loadReviews();
    req('/reviews').flush({ averageRating: null, reviewCount: 0, results: [], hasMore: false });
    expect(component.reviewsError()).toBe(false);
  });
  it('appends reviews and retries a failed page without skipping it', () => {
    req('/detail').flush(detail);
    req('/calendar').flush({ availableDates: [] });
    req('/reviews').flush({ averageRating: 5, reviewCount: 2, results: [{ id: 'one' }], hasMore: true });
    component.loadReviews(true);
    req('/reviews').flush({}, { status: 500, statusText: 'Error' });
    component.loadReviews(true);
    const retry = req('/reviews');
    expect(retry.request.params.get('page')).toBe('1');
    retry.flush({ averageRating: 5, reviewCount: 2, results: [{ id: 'two' }], hasMore: false });
    expect(component.reviews()?.results.map(r => r.id)).toEqual(['one', 'two']);
  });
  it('handles missing spaces and cancels pending requests on route changes', () => {
    const old = req('/detail');
    params.next(convertToParamMap({ id: '00000000-0000-0000-0000-000000000002' }));
    expect(old.cancelled).toBe(true);
    req('/detail').flush({}, { status: 404, statusText: 'Not found' });
    expect(component.error()).toBe('spaceDetail.notFound');
    http.expectNone(r => r.url.endsWith('/reviews') || r.url.endsWith('/calendar'));
  });
});
