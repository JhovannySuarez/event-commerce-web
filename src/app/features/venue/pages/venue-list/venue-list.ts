import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Venue } from '../../interfaces/venue';
import { VenueService } from '../../services/venue-service';

@Component({
  selector: 'app-venue-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './venue-list.html',
  styleUrl: './venue-list.css'
})
export class VenueList implements OnInit {

  private venueService = inject(VenueService);

  venues: Venue[] = [];

  ngOnInit(): void {
    this.loadVenues();
  }

  private loadVenues(): void {

    this.venueService.getVenues()
      .subscribe(response => {
        this.venues = response;
      });

  }

}
