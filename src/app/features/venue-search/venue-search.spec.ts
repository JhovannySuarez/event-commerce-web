import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { VenueSearchComponent } from './venue-search';
import { VenueSearchService } from './venue-search.service';
import { BehaviorSubject } from 'rxjs';

const cityId = '00000000-0000-0000-0000-000000000001';
const eventTypeId = '00000000-0000-0000-0000-000000000002';

describe('Venue search flow', () => {
  let component: VenueSearchComponent;
  let http: HttpTestingController;
  let route: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  beforeEach(() => {
    route = new BehaviorSubject(convertToParamMap({ eventTypeCode: 'social' }));
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(), VenueSearchService,
      { provide: ActivatedRoute, useValue: { paramMap: route } }
    ] });
    component = TestBed.runInInjectionContext(() => new VenueSearchComponent());
    http = TestBed.inject(HttpTestingController);
    http.expectOne(r => r.url.endsWith('/event-types')).flush([{ id: eventTypeId, code: 'social', name: 'Social', description: '' }]);
    http.expectOne(r => r.url.endsWith('/subtypes')).flush([{ id: 'subtype-id', eventTypeId, code: 'other', name: 'Other' }]);
    component.selectCity({ id: cityId, name: 'City', location: 'Location' });
    component.onDateChange(new Date(2030, 0, 20));
  });
  afterEach(() => http.verify());
  const request = () => TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/venues/search'));

  it('sends the complete GET contract using a local calendar date and Q1', () => {
    component.selectSubtype('subtype-id');
    component.search();
    const req = request();
    expect(req.request.method).toBe('GET');
    expect(req.request.body).toBeNull();
    expect(Object.fromEntries(req.request.params.keys().map(k => [k, req.request.params.get(k)]))).toEqual({
      cityId, eventTypeId, eventDate: '2030-01-20', requestedGuests: '50', tier: 'Q1', page: '0', pageSize: '20'
    });
    req.flush({ results: [], tier: 'Q1', hasMore: false, hasNextTier: true });
    http.expectNone(r => r.url.endsWith('/venues/search'));
  });

  it('paginates the same filters and advances tiers only on explicit request with page zero', () => {
    component.search();
    request().flush({ results: [{ eventSpaceId: 'one' }], tier: 'Q1', hasMore: true, hasNextTier: true });
    component.nextTier();
    http.expectNone(r => r.url.endsWith('/venues/search'));
    component.guests.set(90);
    component.loadMore();
    const more = request();
    expect(more.request.params.get('page')).toBe('1');
    expect(more.request.params.get('tier')).toBe('Q1');
    expect(more.request.params.get('requestedGuests')).toBe('50');
    more.flush({ results: [{ eventSpaceId: 'two' }], tier: 'Q1', hasMore: false, hasNextTier: true });
    expect(component.response()?.results.length).toBe(2);
    for (const tier of ['Q2', 'Q3']) {
      component.nextTier();
      const next = request();
      expect(next.request.params.get('tier')).toBe(tier);
      expect(next.request.params.get('page')).toBe('0');
      next.flush({ results: [], tier, hasMore: false, hasNextTier: tier !== 'Q3' });
      expect(component.response()?.results.map(space => space.eventSpaceId)).toEqual(['one', 'two']);
      expect(component.resultTiers().at(-1)?.results).toEqual([]);
    }
    component.nextTier();
    http.expectNone(r => r.url.endsWith('/venues/search'));
    component.search();
    const fresh = request();
    expect(component.resultTiers()).toEqual([]);
    expect(fresh.request.params.get('tier')).toBe('Q1');
    expect(fresh.request.params.get('requestedGuests')).toBe('90');
    fresh.flush({ results: [], tier: 'Q1', hasMore: false, hasNextTier: true });
  });

  it('appends and paginates Q2 while retaining Q1, then retains both when Q3 is empty', () => {
    component.search();
    request().flush({ results: [{ eventSpaceId: 'one' }], tier: 'Q1', hasMore: false, hasNextTier: true });
    component.nextTier();
    request().flush({ results: [{ eventSpaceId: 'one' }], tier: 'Q2', hasMore: true, hasNextTier: true });
    component.loadMore();
    const more = request();
    expect(more.request.params.get('tier')).toBe('Q2');
    expect(more.request.params.get('page')).toBe('1');
    more.flush({ results: [{ eventSpaceId: 'two' }], tier: 'Q2', hasMore: false, hasNextTier: true });
    component.nextTier();
    request().flush({ results: [], tier: 'Q3', hasMore: false, hasNextTier: false });
    expect(component.resultTiers().map(group => [group.tier, group.results.length])).toEqual([
      ['Q1', 1], ['Q2', 2], ['Q3', 0]
    ]);
    expect(component.response()?.results.length).toBe(3);
  });

  it('retains the current page after failure and retries the same page', () => {
    component.search();
    request().flush({ results: [], tier: 'Q1', hasMore: true, hasNextTier: true });
    component.loadMore();
    request().flush({}, { status: 500, statusText: 'Error' });
    expect(component.loading()).toBe(false);
    expect(component.page()).toBe(0);
    expect(component.error()).toBeTruthy();
    component.loadMore();
    const retry = request();
    expect(retry.request.params.get('page')).toBe('1');
    retry.flush({ results: [], tier: 'Q1', hasMore: false, hasNextTier: true });
  });

  it('clears selection and cancels obsolete search and subtype requests on route changes', () => {
    component.selectSubtype('subtype-id');
    component.otherSubtype.set('Party');
    component.search();
    const oldSearch = request();
    route.next(convertToParamMap({ eventTypeCode: 'corporate' }));
    expect(oldSearch.cancelled).toBe(true);
    expect(component.selectedSubtype()).toBeNull();
    expect(component.otherSubtype()).toBe('');
    expect(component.response()).toBeNull();
    expect(component.canSearch()).toBe(false);
    http.expectOne(r => r.url.endsWith('/event-types')).flush([{ id: 'corporate-uuid', code: 'corporate' }]);
    const obsolete = http.expectOne(r => r.url.endsWith('/corporate-uuid/subtypes'));
    route.next(convertToParamMap({ eventTypeCode: 'social' }));
    expect(obsolete.cancelled).toBe(true);
    http.expectOne(r => r.url.endsWith('/event-types')).flush([{ id: eventTypeId, code: 'social' }]);
    http.expectOne(r => r.url.endsWith('/subtypes')).flush([]);
    expect(component.availableSubtypes()).toEqual([]);
  });

  it('handles catalog failure, unknown codes and an empty catalog with retry', () => {
    component.loadType();
    http.expectOne(r => r.url.endsWith('/event-types')).flush({}, { status: 500, statusText: 'Error' });
    expect(component.catalogError()).toBe('catalog.error');
    component.loadType();
    http.expectOne(r => r.url.endsWith('/event-types')).flush([]);
    expect(component.catalogError()).toBe('catalog.emptyTypes');
    component.loadType();
    http.expectOne(r => r.url.endsWith('/event-types')).flush([{ id: 'different', code: 'unknown' }]);
    expect(component.catalogError()).toBe('catalog.unknownType');
    component.search();
    http.expectNone(r => r.url.endsWith('/venues/search'));
  });

  it('retries subtypes without sending tenant parameters', () => {
    component.loadSubtypes();
    http.expectOne(r => r.url.endsWith('/subtypes')).flush({}, { status: 500, statusText: 'Error' });
    expect(component.subtypesError()).toBe(true);
    component.loadSubtypes();
    const req = http.expectOne(r => r.url.endsWith('/subtypes'));
    expect(req.request.params.keys()).toEqual([]);
    req.flush([{ id: 'wedding-id', eventTypeId, code: 'wedding', name: 'Wedding' }]);
    expect(component.subtypesError()).toBe(false);
    expect(component.availableSubtypes()[0].name).toBe('Wedding');
  });
  it('looks up venues after three characters and cancels stale suggestions', async () => {
    vi.useFakeTimers();
    try {
      component.setSearchMode('venue');
      component.onVenueInput({ target: { value: 'Ag' } } as unknown as Event);
      await vi.advanceTimersByTimeAsync(300);
      http.expectNone(r => r.url.endsWith('/autocomplete'));
      component.onVenueInput({ target: { value: 'Agu' } } as unknown as Event);
      await vi.advanceTimersByTimeAsync(300);
      const old = http.expectOne(r => r.url.endsWith('/autocomplete'));
      expect(old.request.params.get('query')).toBe('Agu');
      component.onVenueInput({ target: { value: 'Aguas' } } as unknown as Event);
      expect(old.cancelled).toBe(true);
      await vi.advanceTimersByTimeAsync(300);
      const venue = { id: 'venue-id', name: 'Aguas Claras', city: 'Medellin', state: 'Antioquia' };
      http.expectOne(r => r.url.endsWith('/autocomplete')).flush([venue]);
      component.selectVenue(venue);
      expect(component.canSearch()).toBe(true);
      expect(component.venueSuggestions()).toEqual([]);
      component.onVenueInput({ target: { value: 'A' } } as unknown as Event);
      expect(component.selectedVenue()).toBeNull();
      expect(component.canSearch()).toBe(false);
    } finally { vi.useRealTimers(); }
  });

  it('retries venue suggestions and handles empty matches', async () => {
    vi.useFakeTimers();
    try {
      component.setSearchMode('venue');
      component.venueQuery.set('Agu');
      component.lookupVenues();
      await vi.advanceTimersByTimeAsync(300);
      http.expectOne(r => r.url.endsWith('/autocomplete')).flush({}, { status: 500, statusText: 'Error' });
      expect(component.suggestionsError()).toBe(true);
      component.lookupVenues();
      await vi.advanceTimersByTimeAsync(300);
      http.expectOne(r => r.url.endsWith('/autocomplete')).flush([]);
      expect(component.suggestionsError()).toBe(false);
      expect(component.suggestionsDone()).toBe(true);
      expect(component.venueSuggestions()).toEqual([]);
    } finally { vi.useRealTimers(); }
  });

  it('searches only the chosen venue without hidden city or guest filters and falls back to nearby dates', () => {
    component.setSearchMode('venue');
    component.selectVenue({ id: 'venue-id', name: 'Venue', city: 'City', state: 'State' });
    component.search();
    const exact = http.expectOne(r => r.url.endsWith('/venues/venue-id/availability'));
    expect(Object.fromEntries(exact.request.params.keys().map(k => [k, exact.request.params.get(k)]))).toEqual({
      eventTypeId, eventDate: '2030-01-20', tier: 'Q1', page: '0', pageSize: '20'
    });
    exact.flush({ results: [], tier: 'Q1', hasMore: false, hasNextTier: true });
    const nearby = http.expectOne(r => r.url.endsWith('/availability'));
    expect(nearby.request.params.get('tier')).toBe('Q2');
    expect(nearby.request.params.get('page')).toBe('0');
    nearby.flush({ results: [{ eventSpaceId: 'hall-a' }, { eventSpaceId: 'hall-b' }], tier: 'Q2', hasMore: true, hasNextTier: false });
    expect(component.response()?.results.length).toBe(2);
    component.loadMore();
    const page = http.expectOne(r => r.url.endsWith('/availability'));
    expect(page.request.params.get('page')).toBe('1');
    component.setSearchMode('general');
    expect(page.cancelled).toBe(true);
    expect(component.resultTiers()).toEqual([]);
  });

  it('keeps exact-date venue results without automatically loading nearby dates', () => {
    component.setSearchMode('venue');
    component.selectVenue({ id: 'venue-id', name: 'Venue', city: 'City', state: 'State' });
    component.search();
    http.expectOne(r => r.url.endsWith('/availability')).flush({ results: [{ eventSpaceId: 'hall-a' }], tier: 'Q1', hasMore: false, hasNextTier: true });
    http.expectNone(r => r.url.endsWith('/availability'));
    expect(component.resultTiers()[0].results.length).toBe(1);
  });

});
