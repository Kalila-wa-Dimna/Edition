import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ClientOnlyDirective } from './render-helpers/client-only.directive';
import { ServerOnlyDirective } from './render-helpers/server-only.directive';

@NgModule({
  declarations: [ClientOnlyDirective, ServerOnlyDirective],
  imports: [CommonModule],
  exports: [ClientOnlyDirective, ServerOnlyDirective],
})
export class RenderHelpersModule {}
