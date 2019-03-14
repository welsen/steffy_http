import { registerRest } from "./register-rest";

export function post(path: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    registerRest('post', path, target, propertyKey);
  };
}
