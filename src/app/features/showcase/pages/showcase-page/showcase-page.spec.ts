import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowcasePageComponent } from './showcase-page';

describe('ShowcasePage', () => {
  let component: ShowcasePageComponent;
  let fixture: ComponentFixture<ShowcasePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
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
