import FromProps from '../interfaces/from-props';

export function Files() {
  return (target: Object, prop: string | symbol, index: number) => {
    let meta: FromProps = Reflect.getOwnMetadata('steffy:http:files', target, prop) || new Map<number, string>();
    meta.set(index, 'files');
    Reflect.defineMetadata('steffy:http:files', meta, target, prop);
  };
}
