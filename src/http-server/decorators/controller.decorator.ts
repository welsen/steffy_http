export function Controller(root?: string) {
  return (target: Function) => {
    let meta = Reflect.getMetadata('steffy:http:controller', target) || { root: root || '' };
    Reflect.defineMetadata('steffy:http:controller', meta, target);
  };
}
