import { IRestMeta, registerInjectionToken, useInjectionToken, injector } from '@steffi/core';
import { endpointContainer } from '../constants/endpoint-container.constant';

function registerRest(method: string, path: string, target: any, propertyKey: string) {
  if (path[0] !== '/') {
    throw new Error('invalid path! path must start with "/"');
  }
  const meta: IRestMeta = {
    name: target.constructor.name,
    func: target[propertyKey]
  };
  endpointContainer.push(path);
  registerInjectionToken(`rest_${method}_${path}`);
  injector.bind<IRestMeta>(useInjectionToken(`rest_${method}_${path}`)).toConstantValue(meta);
}

export { registerRest };