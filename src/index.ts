import { injector, IServerPlugin, useInjectionToken, registerInjectionToken } from '@steffi/core';
import { HttpServerPlugin } from './http-server/http-server.plugin';

registerInjectionToken('HttpServerPlugin');
injector.bind<IServerPlugin>(useInjectionToken('HttpServerPlugin')).to(HttpServerPlugin);

export * from './http-server'