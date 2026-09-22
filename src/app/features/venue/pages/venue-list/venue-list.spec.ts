import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VenueList } from './venue-list';

describe('VenueList', () => {
  let component: VenueList;
  let fixture: ComponentFixture<VenueList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VenueList],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(VenueList);
    component = fixture.componentInstance;
    fixture.detectChanges();
    TestBed.inject(HttpTestingController).expectOne('http://localhost:8080/api/v1/venues').flush([]);
    await fixture.whenStable();
    TestBed.inject(HttpTestingController).verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
