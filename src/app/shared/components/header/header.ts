import {
  Component,
  computed,
  inject,
  signal
} from '@angular/core';

import { Location } from '@angular/common';
import {
  NavigationEnd,
  Router,
  RouterLink
} from '@angular/router';

import { filter } from 'rxjs';

import {
  Language,
  LanguageService
} from '../../../core/i18n/language.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {

  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly languageService = inject(LanguageService);

  private readonly currentUrl = signal(this.router.url);

  readonly showBackButton = computed(() => {
    return this.currentUrl() !== '/';
  });

  readonly currentLanguage =
    this.languageService.getLanguage();

  readonly languages = [
    {
      value: Language.ES,
      label: 'ES'
    },
    {
      value: Language.EN,
      label: 'EN'
    },
    {
      value: Language.PT_BR,
      label: 'PT'
    }
  ];


  constructor() {

    this.router.events
      .pipe(
        filter(
          event => event instanceof NavigationEnd
        )
      )
      .subscribe(event => {

        const navigation =
          event as NavigationEnd;

        this.currentUrl.set(
          navigation.urlAfterRedirects
        );

      });

  }


  goBack(): void {
    this.location.back();
  }


  changeLanguage(event: Event): void {

    const select =
      event.target as HTMLSelectElement;

    this.languageService.setLanguage(
      select.value as Language
    );

  }

}