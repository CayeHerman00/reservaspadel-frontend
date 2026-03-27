import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from './translate.service';

@Pipe({ name: 'translate', standalone: true, pure: false })
export class TranslatePipe implements PipeTransform {
  private ts = inject(TranslateService);

  transform(key: string, params?: Record<string, string>): string {
    return this.ts.get(key, params);
  }
}
