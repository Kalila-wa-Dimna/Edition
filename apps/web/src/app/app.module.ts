import { APP_ID, NgModule, isDevMode,  NO_ERRORS_SCHEMA } from '@angular/core';
import { BrowserModule, provideClientHydration, withHttpTransferCacheOptions } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.component';
import { appRoutes } from './app.routes';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
  ConfigModule,
  DataModule,
  LayoutModule,
  RenderHelpersModule,
  StorageModule,
  ThemeModule,
} from '@kalila-edition/common-ui';
import { ServiceWorkerModule } from '@angular/service-worker';
import { MainPageComponent } from './main-page.component';
import { HttpClientModule, provideHttpClient, withFetch } from '@angular/common/http';
import { AboutPageComponent } from './about-page.component';
import { ImprintPageComponent } from './imprint-page.component';
import { environment } from './environment';

@NgModule({
  declarations: [
    AppComponent,
    MainPageComponent,
    AboutPageComponent,
    ImprintPageComponent,
  ],
  imports: [
    BrowserModule,
    RouterModule.forRoot(appRoutes, { initialNavigation: 'enabledBlocking' }),
    ConfigModule.forRoot(environment),
    BrowserAnimationsModule,
    HttpClientModule,
    StorageModule,
    ThemeModule,
    LayoutModule,
    DataModule,
    RenderHelpersModule,
    ServiceWorkerModule.register('ngsw-worker.js', {
      enabled: !isDevMode(),
      // Register the ServiceWorker as soon as the application is stable
      // or after 30 seconds (whichever comes first).
      registrationStrategy: 'registerWhenStable:30000',
    })
  ], schemas: [
    NO_ERRORS_SCHEMA
  ],
  providers: [{ provide: APP_ID, useValue: 'kd-edition' }, provideClientHydration(withHttpTransferCacheOptions({
    includePostRequests: true
  })), [
    provideHttpClient(
      withFetch(),
    ),
  ]],
  bootstrap: [AppComponent],

})
export class AppModule { }
