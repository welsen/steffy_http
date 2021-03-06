import { registerRest } from './register-rest';

export function Post(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('post', path, target, propertyKey);
  };
}
