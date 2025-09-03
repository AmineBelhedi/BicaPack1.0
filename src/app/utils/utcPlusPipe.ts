import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcPlus'
})
export class UtcPlusPipe implements PipeTransform {
  transform(value: Date | string | null): string {
    if (!value) return '';

    const date = new Date(value);
    date.setHours(date.getHours() + 1); // décalage UTC+1

    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
     
    });
  }
}
