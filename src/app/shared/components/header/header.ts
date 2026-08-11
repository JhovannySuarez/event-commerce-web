import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Language, LanguageService } from '../../../core/i18n/language.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class HeaderComponent {

  private readonly languageService = inject(LanguageService);

  currentLanguage: Language = this.languageService.getLanguage();

  readonly languages = [
    {
      value: Language.EN,
      label: 'EN'
    },
    {
      value: Language.ES,
      label: 'ES'
    },
    {
      value: Language.PT_BR,
      label: 'PT'
    }
  ];

  changeLanguage(event: Event): void {

    const select = event.target as HTMLSelectElement;

    const language = select.value as Language;

    this.languageService.setLanguage(language);

    this.currentLanguage = language;
  }
}