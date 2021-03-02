import FromProps from '../interfaces/from-props';

export function State(key: string = '**') {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:state', target, prop) || new Map<number, string>();
    meta.set(index, key);
    Reflect.defineMetadata('steffy:http:state', meta, target, prop);
  };
}
