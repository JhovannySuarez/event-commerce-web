import { Component } from '@angular/core';
import { HomeComponent } from '../../../event-planner/pages/home/home';
@Component({
  selector: 'app-showcase-page', standalone: true, imports: [HomeComponent],
  templateUrl: './showcase-page.html', styleUrl: './showcase-page.scss'
})
export class ShowcasePageComponent {}
