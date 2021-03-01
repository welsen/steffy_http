import FromProps from '../interfaces/from-props';

export function Body(key: string = '**') {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:body', target, prop) || new Map<number, string>();
    meta.set(index, key);
    Reflect.defineMetadata('steffy:http:body', meta, target, prop);
  };
}
