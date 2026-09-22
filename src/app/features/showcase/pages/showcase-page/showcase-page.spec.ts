import { EventCatalogService } from '@core/event-catalog/event-catalog.service';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowcasePageComponent } from './showcase-page';

describe('ShowcasePage', () => {
  let component: ShowcasePageComponent;
  let fixture: ComponentFixture<ShowcasePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideRouter([]), { provide: EventCatalogService, useValue: { getTypes: () => of([]) } }],
      imports: [ShowcasePageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowcasePageComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
