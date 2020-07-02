import { registerRest } from './register-rest';

export function Del(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('del', path, target, propertyKey);
  };
}
