import { registerRest } from './register-rest';

export function del(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('del', path, target, propertyKey);
  };
}
