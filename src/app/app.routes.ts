import { Routes } from '@angular/router';
import { ShowcasePageComponent } from './features/showcase/pages/showcase-page/showcase-page';


export const routes: Routes = [

  {
    path: '',
    redirectTo: 'showcase',
    pathMatch: 'full'
  },

  {
    path: 'showcase',
    component: ShowcasePageComponent
  }

];