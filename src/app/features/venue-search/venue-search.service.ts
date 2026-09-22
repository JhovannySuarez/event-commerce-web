import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { VenueSearchRequest, VenueSearchResponse } from './interfaces/venue-search.model';

@Injectable({ providedIn: 'root' })
export class VenueSearchService {
  private readonly http = inject(HttpClient);

  search(request: VenueSearchRequest) {
    const params = new HttpParams({ fromObject: { ...request } });
    return this.http.get<VenueSearchResponse>(`${environment.apiUrl}/venues/search`, { params });
  }
}

