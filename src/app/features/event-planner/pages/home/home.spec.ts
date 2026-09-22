import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { HomeComponent } from './home';

describe('Home catalog', () => {
  beforeEach(() => TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideTranslateService()] }));
  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('renders backend text in backend order, maps icons, and navigates by code', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const request = TestBed.inject(HttpTestingController).expectOne(r => r.url.endsWith('/event-types'));
    expect(request.request.params.keys()).toEqual([]);
    request.flush([
      { id: 'new-id', code: 'additional', name: 'New category', description: 'Backend description' },
      { id: 'social-id', code: 'social', name: 'Social name', description: 'Social description' }
    ]);
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('.event-card');
    expect(cards[0].textContent).toContain('New category');
    expect(cards[0].textContent).toContain('Backend description');
    expect(fixture.componentInstance.eventTypes().map(t => t.icon)).toEqual(['event', 'celebration']);
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    cards[0].click();
    expect(navigate).toHaveBeenCalledWith(['/venue-search', 'additional']);
  });

  it('shows error, allows retry and handles empty catalogs', () => {
    const fixture = TestBed.createComponent(HomeComponent);
    const http = TestBed.inject(HttpTestingController);
    expect(fixture.componentInstance.loading()).toBe(true);
    http.expectOne(r => r.url.endsWith('/event-types')).flush({}, { status: 500, statusText: 'Error' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role=alert]')).toBeTruthy();
    fixture.nativeElement.querySelector('button').click();
    http.expectOne(r => r.url.endsWith('/event-types')).flush([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('catalog.emptyTypes');
  });
});
