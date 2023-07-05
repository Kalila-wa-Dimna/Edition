import { TransferHttpCacheModule } from '@nguniversal/common';
import { APP_ID, NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  DataModule,
  NavbarModule,
  RenderHelpersModule,
  StorageModule,
  ThemeModule,
} from '@kalila-edition/common-ui';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MainPageComponent } from './main-page.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [AppComponent, MainPageComponent],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    BrowserAnimationsModule,
    HttpClientModule,
    StorageModule,
    ThemeModule,
    NavbarModule,
    DataModule,
    RenderHelpersModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    }),
    TransferHttpCacheModule,
  ],
  providers: [{ provide: APP_ID, useValue: 'kd-edition' }],
  bootstrap: [AppComponent],
})
export class AppModule {}
