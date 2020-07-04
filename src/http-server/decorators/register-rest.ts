import { IRestMeta, Logger } from '@steffy/core';
import { storage } from '@steffy/di';
import { endpointContainer } from '../constants/endpoint-container.constant';
import FromProps from '../interfaces/from-props';

function registerRest(method: string, path: string, target: any, propertyKey: string) {
  if (path[0] !== '/') {
    throw new Error('invalid path! path must start with "/"');
  }
  const paramsMeta: FromProps = Reflect.getOwnMetadata('steffy:http:params', target, propertyKey) || new Map<number, string>();
  const stateMeta: FromProps = Reflect.getOwnMetadata('steffy:http:state', target, propertyKey) || new Map<number, string>();
  const sessionMeta: FromProps = Reflect.getOwnMetadata('steffy:http:session', target, propertyKey) || new Map<number, string>();
  const bodyMeta: FromProps = Reflect.getOwnMetadata('steffy:http:body', target, propertyKey) || new Map<number, string>();
  const queryMeta: FromProps = Reflect.getOwnMetadata('steffy:http:query', target, propertyKey) || new Map<number, string>();
  const wrapperFn = async (context: any, next: Function) => {
    const logger = new Logger();
    const tgt: any = storage.get(target.constructor);
    const params = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    const fnArgs: any[] = [];
    try {
      for (const param of paramsMeta) {
        fnArgs[param[0]] = null;
        if (context.params[param[1]]) fnArgs[param[0]] = params[param[0]](context.params[param[1]]);
      }
      for (const stateParam of stateMeta) {
        fnArgs[stateParam[0]] = null;
        if (context.state[stateParam[1]]) fnArgs[stateParam[0]] = params[stateParam[0]](context.state[stateParam[1]]);
      }
      for (const sessionParam of sessionMeta) {
        fnArgs[sessionParam[0]] = null;
        if (context.state[sessionParam[1]]) fnArgs[sessionParam[0]] = params[sessionParam[0]](context.state[sessionParam[1]]);
      }
      for (const bodyParam of bodyMeta) {
        fnArgs[bodyParam[0]] = null;
        if (context.request.body) {
          const body = JSON.parse(context.request.body);
          if (body[bodyParam[1]]) fnArgs[bodyParam[0]] = params[bodyParam[0]](body[bodyParam[1]]);
        }
      }
      for (const queryParam of queryMeta) {
        fnArgs[queryParam[0]] = null;
        if (context.request.query[queryParam[1]]) fnArgs[queryParam[0]] = params[queryParam[0]](context.request.query[queryParam[1]]);
      }
      tgt.$koa = context;
      tgt.$next = next;
      fnArgs.push(context);
      fnArgs.push(next);
      logger.log('HttpServer', `Invoking: ${method} - ${path} - ${target.constructor.name}::${propertyKey}`);
      const result = await (target[propertyKey] as Function).call(tgt, ...fnArgs);
      if (result) {
        if (!result.next) {
          context.response.body = result;
        } else {
          context.response.body = (await result.next()).value;
        }
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const meta: IRestMeta = {
    controller: target,
    name: target.constructor.name,
    func: wrapperFn.bind(target),
  };
  const epMeta = {
    controller: target,
    method,
    path,
  };
  endpointContainer.push(epMeta);
  storage.storeAsDynamicScoped(`rest:${target.constructor.name.toLowerCase()}:${method}:${path}`, () => meta);
}

export { registerRest };
