import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'replace' })
export class ReplacePipe implements PipeTransform {
  transform(value: string, from: string, to: string): string {
    return value.split(from).join(to);
  }
}
