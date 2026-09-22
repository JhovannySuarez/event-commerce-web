import { Component, DestroyRef, signal, inject  } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EventCardComponent } from '../../../../shared/components/event-card/event-card';
import { EventCatalogService, eventTypeIcon } from '@core/event-catalog/event-catalog.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { EventCardModel } from '../../../../shared/interfaces/event-card.model';
import { TranslatePipe } from '@ngx-translate/core'; 
import { Router } from '@angular/router';

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
  private readonly router = inject(Router);
  private readonly catalog = inject(EventCatalogService);
  private readonly destroyRef = inject(DestroyRef);
  readonly eventTypes = signal<EventCardModel[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);

  constructor() { this.loadTypes(); }

  loadTypes(): void {
    if (this.loading()) return;
    this.loading.set(true);
    this.error.set(false);
    this.catalog.getTypes().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: types => {
        this.eventTypes.set(types.map(type => ({ ...type, icon: eventTypeIcon(type.code) })));
        this.loading.set(false);
      },
      error: () => { this.error.set(true); this.loading.set(false); }
    });
  }

  selectEvent(eventTypeId: string): void {
  this.router.navigate([
    '/venue-search',
    eventTypeId
  ]);
}

}