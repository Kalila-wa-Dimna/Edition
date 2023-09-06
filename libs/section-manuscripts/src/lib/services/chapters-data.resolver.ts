import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  ResolveFn,
  RouterStateSnapshot,
} from '@angular/router';
import { DataService } from '@kalila-edition/common-ui';
import { map } from 'rxjs/operators'; // Import map from 'rxjs/operators'
import { Observable, of } from 'rxjs';


