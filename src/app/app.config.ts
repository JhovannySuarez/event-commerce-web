import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { routes } from './app.routes';

import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

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

    })

  ]

};