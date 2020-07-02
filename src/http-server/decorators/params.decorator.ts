import FromProps from '../interfaces/from-props';

export function Params(key: string) {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:params', target, prop) || new Map<number, string>();
    meta.set(index, key);
    Reflect.defineMetadata('steffy:http:params', meta, target, prop);
  };
}
