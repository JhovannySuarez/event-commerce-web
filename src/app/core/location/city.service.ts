import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CitySearchResponse } from './interfaces/city.model';

@Injectable({
  providedIn: 'root'
})
export class CityService {

  private readonly http = inject(HttpClient);

  private readonly apiUrl = 'http://localhost:8080/api/v1/cities';

  searchCities(query: string): Observable<CitySearchResponse[]> {

    const params = new HttpParams()
      .set('query', query);

    return this.http.get<CitySearchResponse[]>(
      this.apiUrl,
      { params }
    );
  }
}