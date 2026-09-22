import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCardComponent } from './event-card';

describe('EventCard', () => {
  let component: EventCardComponent;
  let fixture: ComponentFixture<EventCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideTranslateService(), provideRouter([])],
      imports: [EventCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCardComponent);
    fixture.componentRef.setInput('event', { id: 'global-id', code: 'social', name: 'Social', description: 'Description', icon: 'celebration' });
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
