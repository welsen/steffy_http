import { registerRest } from './register-rest';

export function Patch(path: string) {
  return function(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('patch', path, target, propertyKey);
  };
}
