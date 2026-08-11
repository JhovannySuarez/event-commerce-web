import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventCardComponent } from '../../../../shared/components/event-card/event-card';
import { EVENT_TYPES } from '../../../../shared/mock/event-types.mock';
import { EventCardModel } from '../../../../shared/interfaces/event-card.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    EventCardComponent,
    TranslatePipe
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {

  readonly eventTypes: EventCardModel[] = EVENT_TYPES;

}