import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AvailableDate } from '../venue-search/interfaces/venue-search.model';
export interface SpaceDetail {
  id: string; name: string; description: string | null;
  capacityMin: number | null; capacityMax: number | null; basePrice: number | null; currencyCode: string | null;
  venue: { id: string; name: string; description: string | null; address: string | null; city: string | null; state: string | null };
  eventTypes: { id: string; code: string; name: string }[];
}
export interface Reviews {
  averageRating: number | null; reviewCount: number; hasMore: boolean;
  results: { id: string; rating: number; title: string | null; review: string | null; createdAt: string }[];
}
export interface SpaceCalendar { from: string; to: string; availableDates: AvailableDate[]; }
@Injectable({ providedIn: 'root' })
export class EventSpaceDetailService {
  private readonly http = inject(HttpClient);
  private url(id: string) { return `${environment.apiUrl}/event-spaces/${encodeURIComponent(id)}`; }
  detail(id: string) { return this.http.get<SpaceDetail>(`${this.url(id)}/detail`); }
  reviews(id: string, page: number) {
    return this.http.get<Reviews>(`${this.url(id)}/reviews`, { params: new HttpParams().set('page', page).set('pageSize', 10) });
  }
  calendar(id: string, eventTypeId: string, from: string, to: string) {
    return this.http.get<SpaceCalendar>(`${this.url(id)}/calendar`, { params: new HttpParams({ fromObject: { eventTypeId, from, to } }) });
  }
}
