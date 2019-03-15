import { injector, IServerPlugin, useInjectionToken, registerInjectionToken } from '@steffi/core';
import { HttpServerPlugin } from './http-server';

registerInjectionToken('HttpServerPlugin');
injector.bind<IServerPlugin>(useInjectionToken('HttpServerPlugin')).to(HttpServerPlugin);

export * from './http-server'