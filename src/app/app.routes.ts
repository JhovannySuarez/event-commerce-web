import { Routes } from '@angular/router';

import { HomeComponent } from './features/event-planner/pages/home/home';
import { ShowcasePageComponent } from './features/showcase/pages/showcase-page/showcase-page';

export const routes: Routes = [
  { path: 'event-spaces/:id', loadComponent: () => import('./features/event-space-detail/event-space-detail').then(m => m.EventSpaceDetailComponent) },

  /**
   * Event Planner
   */
  {
    path: '',
    component: HomeComponent,
    title: 'Event Planner'
  },

  /**
   * Venue Search
   */
  {
    path: 'venue-search/:eventTypeCode',
    loadComponent: () =>
      import('./features/venue-search/venue-search')
        .then(m => m.VenueSearchComponent)
  },

  /**
   * Showcase
   */
  {
    path: 'showcase',
    component: ShowcasePageComponent
  },

  /**
   * Fallback
   */
  {
    path: '**',
    redirectTo: ''
  }

];