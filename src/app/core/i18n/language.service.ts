import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

export enum Language {
  ES = 'es',
  EN = 'en',
  PT_BR = 'pt-BR'
}

export function detectInitialLanguage(): Language {
  const stored = localStorage.getItem('language');

  if (
    stored === Language.ES ||
    stored === Language.EN ||
    stored === Language.PT_BR
  ) {
    return stored;
  }

  const browserLanguage = navigator.language.toLowerCase();

  if (browserLanguage.startsWith('en')) {
    return Language.EN;
  }

  if (browserLanguage.startsWith('pt')) {
    return Language.PT_BR;
  }

  return Language.ES;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {

  private readonly STORAGE_KEY = 'language';

  private readonly translate = inject(TranslateService);

  readonly currentLanguage = signal<Language>(
    detectInitialLanguage()
  );

  initialize(): Promise<void> {
    return firstValueFrom(
      this.translate.use(this.currentLanguage())
    ).then(() => {
      this.updateDocumentLanguage();
    });
  }

  setLanguage(language: Language): void {
    localStorage.setItem(this.STORAGE_KEY, language);

    this.currentLanguage.set(language);

    this.translate.use(language).subscribe(() => {
      this.updateDocumentLanguage();
    });
  }

  private updateDocumentLanguage(): void {
    document.documentElement.lang =
      this.currentLanguage();
  }
}