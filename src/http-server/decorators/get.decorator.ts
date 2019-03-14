import { registerRest } from "./register-rest";

export function get(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('get', path, target, propertyKey);
  };
}
