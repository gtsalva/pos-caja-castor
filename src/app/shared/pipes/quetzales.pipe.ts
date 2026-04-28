import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'quetzales', standalone: true, pure: true })
export class QuetzalesPipe implements PipeTransform {
  private static readonly fmt = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  transform(value: number | null | undefined): string {
    if (value == null) return '—';
    return 'Q ' + QuetzalesPipe.fmt.format(value);
  }
}
