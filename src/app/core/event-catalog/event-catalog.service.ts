import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface EventType {
  id: string;
  code: string;
  name: string;
  description: string;
}
export interface EventSubtype {
  id: string;
  eventTypeId: string;
  code: string;
  name: string;
}
export function eventTypeIcon(code: string): string {
  return ({ social: 'celebration', corporate: 'business_center', other: 'auto_awesome' } as Record<string, string>)[code] ?? 'event';
}
@Injectable({ providedIn: 'root' })
export class EventCatalogService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/event-types`;
  getTypes() { return this.http.get<EventType[]>(this.url); }
  getSubtypes(eventTypeId: string) {
    return this.http.get<EventSubtype[]>(`${this.url}/${encodeURIComponent(eventTypeId)}/subtypes`);
  }
}
