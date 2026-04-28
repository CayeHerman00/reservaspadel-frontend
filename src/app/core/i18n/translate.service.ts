import { Injectable, signal } from '@angular/core';
import { ES_TRANSLATIONS } from './es';

@Injectable({ providedIn: 'root' })
export class TranslateService {
  private translations: Record<string, string> = ES_TRANSLATIONS;
  currentLang = signal('es');

  get(key: string, params?: Record<string, string>): string {
    let text = this.translations[key] || key;
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{{${k}}}`, v);
      });
    }
    return text;
  }

  setLanguage(lang: string): void {
    this.currentLang.set(lang);
  }
}
