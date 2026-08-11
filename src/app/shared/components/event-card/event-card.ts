import { Component, input } from '@angular/core';
import { EventCardModel } from '../../interfaces/event-card.model';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-event-card',
  standalone: true,
   imports: [TranslatePipe],
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss'
})
export class EventCardComponent  {
  event = input.required<EventCardModel>();
}
