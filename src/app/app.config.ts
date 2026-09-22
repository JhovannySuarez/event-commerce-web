import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  inject,
  provideAppInitializer
} from '@angular/core';

import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { LanguageService } from './core/i18n/language.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideHttpClient(),

    provideRouter(routes),

    provideTranslateService({
      fallbackLang: 'en',

      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json'
      })
    }),

    provideAppInitializer(() =>
      inject(LanguageService).initialize()
    )
  ]
};