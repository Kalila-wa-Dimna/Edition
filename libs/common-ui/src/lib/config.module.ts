import { NgModule, ModuleWithProviders, InjectionToken } from '@angular/core';

// Define the configuration interface
export interface IConfig {
  imagesEndPoint: string;
  dataEndPoint: string;
  pagesEndPoint: string;
}

export const CONFIG_TOKEN = new InjectionToken<IConfig>('Config');

@NgModule({})
export class ConfigModule {
  // The forRoot method allows for the module to be configured when imported in another module
  static forRoot(config: IConfig): ModuleWithProviders<ConfigModule> {
    return {
      ngModule: ConfigModule,
      providers: [{ provide: CONFIG_TOKEN, useValue: config }],
    };
  }
}
