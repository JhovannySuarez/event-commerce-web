import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventCardComponent } from '../../../../shared/components/event-card/event-card';
import { EVENT_TYPES } from '../../../../shared/mock/event-types.mock';
import { EventCardModel } from '../../../../shared/interfaces/event-card.model';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  readonly eventTypes: EventCardModel[] = EVENT_TYPES;

}