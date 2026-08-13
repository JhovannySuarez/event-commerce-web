import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export enum Language {
  ES = 'es',
  EN = 'en',
  PT_BR = 'pt-BR'
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly STORAGE_KEY = 'language';

  private readonly translate = inject(TranslateService);

  readonly currentLanguage = signal<Language>(this.loadLanguage());

  constructor() {
    this.translate.use(this.currentLanguage());
  }

  setLanguage(language: Language): void {

    localStorage.setItem(this.STORAGE_KEY, language);

    this.currentLanguage.set(language);

    this.translate.use(language);
  }

  getLanguage(): Language {
    return this.currentLanguage();
  }

  private loadLanguage(): Language {

    const stored = localStorage.getItem(this.STORAGE_KEY);

    if (
      stored === Language.ES ||
      stored === Language.EN ||
      stored === Language.PT_BR
    ) {
      return stored;
    }

    const browser = navigator.language;

    if (browser.startsWith('en')) {
      return Language.EN;
    }

    if (browser.startsWith('pt')) {
      return Language.PT_BR;
    }

    return Language.ES;
  }
}