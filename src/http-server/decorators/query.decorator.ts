import FromProps from '../interfaces/from-props';

export function Query(key: string) {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:query', target, prop) || new Map<number, string>();
    meta.set(index, key);
    Reflect.defineMetadata('steffy:http:query', meta, target, prop);
  };
}
