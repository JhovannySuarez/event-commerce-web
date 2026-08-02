import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { Venue } from '../interfaces/venue';

@Injectable({
  providedIn: 'root'
})
export class VenueService {

  private http = inject(HttpClient);

  private api = 'http://localhost:8080/api/v1/venues';

  getVenues(): Observable<Venue[]> {
    return this.http.get<Venue[]>(this.api);
  }

}