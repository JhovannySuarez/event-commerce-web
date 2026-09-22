import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VenueSearchRequest, VenueSearchResponse, VenueSuggestion, VenueAvailabilityCriteria, SearchTier } from './interfaces/venue-search.model';

@Injectable({ providedIn: 'root' })
export class VenueSearchService {
  private readonly http = inject(HttpClient);

  suggestVenues(query: string) {
    return this.http.get<VenueSuggestion[]>(`${environment.apiUrl}/venues/autocomplete`, {
      params: new HttpParams().set('query', query)
    });
  }

  searchVenue(criteria: VenueAvailabilityCriteria, tier: SearchTier, page: number, pageSize: number) {
    const { venueId, ...filters } = criteria;
    return this.http.get<VenueSearchResponse>(`${environment.apiUrl}/venues/${encodeURIComponent(venueId)}/availability`, {
      params: new HttpParams({ fromObject: { ...filters, tier, page, pageSize } })
    });
  }

  search(request: VenueSearchRequest) {
    const params = new HttpParams({ fromObject: { ...request } });
    return this.http.get<VenueSearchResponse>(`${environment.apiUrl}/venues/search`, { params });
  }
}

