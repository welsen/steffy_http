import FromProps from '../interfaces/from-props';

export function Session(key: string) {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:session', target, prop) || new Map<number, string>();
    meta.set(index, key);
    Reflect.defineMetadata('steffy:http:session', meta, target, prop);
  };
}
