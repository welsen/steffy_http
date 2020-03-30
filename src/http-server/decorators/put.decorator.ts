import { registerRest } from './register-rest';

export function put(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('put', path, target, propertyKey);
  };
}
