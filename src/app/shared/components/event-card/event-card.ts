import { Component, input, output } from '@angular/core';
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
  selected = output<string>();

  selectEvent(): void {
    this.selected.emit(this.event().id);
  }
}
