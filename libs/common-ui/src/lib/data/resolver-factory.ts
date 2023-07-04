import { inject } from '@angular/core';
import { DataService } from './data.service';
import { ResolveFn } from '@angular/router';

export function createResolver<T>(path: string, defaultValue: T) {
  const resolve: ResolveFn<T> = () => {
    const api = inject(DataService);
    return api.load<T>(path, defaultValue);
  };

  return resolve;
}
