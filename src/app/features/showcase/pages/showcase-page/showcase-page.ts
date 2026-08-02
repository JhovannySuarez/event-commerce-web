import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventCardComponent } from '../../../../shared/components/event-card/event-card';
import { EventCardModel } from '@shared/interfaces/event-card.model';
import { EVENT_TYPES } from '@shared/mock/event-types.mock';

@Component({
  selector: 'app-showcase-page',
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent
  ],
  templateUrl: './showcase-page.html',
  styleUrl: './showcase-page.scss'
})
export class ShowcasePageComponent {

  eventTypes: EventCardModel[] = EVENT_TYPES;

}