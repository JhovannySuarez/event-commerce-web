import { Component, input } from '@angular/core';
import { EventCardModel } from '../../interfaces/event-card.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  templateUrl: './event-card.html',
  styleUrl: './event-card.scss'
})
export class EventCardComponent  {
  event = input.required<EventCardModel>();
}
