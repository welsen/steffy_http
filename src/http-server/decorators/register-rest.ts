import { IRestMeta } from '@steffy/core';
import { storage } from '@steffy/di';
import { endpointContainer } from '../constants/endpoint-container.constant';
import FromProps from '../interfaces/from-props';

function registerRest(method: string, path: string, target: any, propertyKey: string) {
  if (path !== '' && path[0] !== '/') {
    throw new Error('invalid path! path must start with "/"');
  }
  Reflect.defineMetadata('steffy:http:rest', {path, fn: propertyKey}, target, propertyKey);
  const paramsMeta: FromProps = Reflect.getOwnMetadata('steffy:http:params', target, propertyKey) || new Map<number, string>();
  const stateMeta: FromProps = Reflect.getOwnMetadata('steffy:http:state', target, propertyKey) || new Map<number, string>();
  const sessionMeta: FromProps = Reflect.getOwnMetadata('steffy:http:session', target, propertyKey) || new Map<number, string>();
  const bodyMeta: FromProps = Reflect.getOwnMetadata('steffy:http:body', target, propertyKey) || new Map<number, string>();
  const filesMeta: FromProps = Reflect.getOwnMetadata('steffy:http:files', target, propertyKey) || new Map<number, string>();
  const queryMeta: FromProps = Reflect.getOwnMetadata('steffy:http:query', target, propertyKey) || new Map<number, string>();
  const wrapperFn = async (context: any, next: Function) => {
    const logger: any = await storage.get('Logger');
    const tgt: any = storage.get(target.constructor);
    const params = Reflect.getMetadata('design:paramtypes', target, propertyKey);
    const fnArgs: any[] = [];
    try {
      for (const param of paramsMeta) {
        const [paramIndex, paramName] = param;
        fnArgs[paramIndex] = null;
        if (context.params[paramName]) fnArgs[paramIndex] = params[paramIndex](context.params[paramName]);
        if (paramName === '**') fnArgs[paramIndex] = context.params;
      }
      for (const stateParam of stateMeta) {
        const [paramIndex, paramName] = stateParam;
        fnArgs[paramIndex] = null;
        if (context.state[paramName]) fnArgs[paramIndex] = params[paramIndex](context.state[paramName]);
        if (paramName === '**') fnArgs[paramIndex] = context.state;
      }
      for (const sessionParam of sessionMeta) {
        const [paramIndex, paramName] = sessionParam;
        fnArgs[paramIndex] = null;
        if (context.session[paramName]) fnArgs[paramIndex] = params[paramIndex](context.session[paramName]);
        if (paramName === '**') fnArgs[paramIndex] = context.session;
      }
      for (const bodyParam of bodyMeta) {
        const [paramIndex, paramName] = bodyParam;
        fnArgs[paramIndex] = null;
        if (context.request.body) {
          let body = context.request.body;
          if (typeof body === 'string') body = JSON.parse(context.request.body);
          if (body[paramName]) fnArgs[paramIndex] = params[paramIndex](body[paramName]);
          if (paramName === '**') fnArgs[paramIndex] = body;
        }
      }
      for (const filesParam of filesMeta) {
        fnArgs[filesParam[0]] = null;
        if (context.request.files) {
          let files = context.request.files;
          if (typeof files === 'string') files = JSON.parse(context.request.body);
          if (files[filesParam[1]]) fnArgs[filesParam[0]] = params[filesParam[0]](files[filesParam[1]]);
        }
      }
      for (const queryParam of queryMeta) {
        const [paramIndex, paramName] = queryParam;
        fnArgs[paramIndex] = null;
        if (context.request.query[paramName]) fnArgs[paramIndex] = params[paramIndex](context.request.query[paramName]);
        if (paramName === '**') fnArgs[paramIndex] = context.request.query;
      }

      tgt.$koa = context;
      tgt.$next = next;
      tgt.state = context.state;
      tgt.session = context.session;

      fnArgs.push(context);
      fnArgs.push(next);

      logger.info('HttpServer', `Invoking: ${method} - ${path || '/'} - ${target.constructor.name}::${propertyKey}`);
      const fn = target[propertyKey];
      const result = await fn.call(tgt, ...fnArgs);
      if (result) {
        if (!result.next) {
          if (result.errorCode) {
            tgt.$koa.status = result.errorCode || 500;
            tgt.$koa.body = result;
            // tgt.$koa.app.emit('error', result, tgt.$koa);
            throw new (class extends Error {
              constructor(payload) {
                super(payload.message);
                Object.keys(payload).forEach((k) => (this[k] = payload[k]));
              }
            })(result);
          } else {
            tgt.$koa.response.body = result;
          }
        } else {
          tgt.$koa.response.body = (await result.next()).value;
        }
      }
    } catch (error) {
      // logger.error('HttpServer', error);
      return error;
    }
    return tgt.$koa.response.body;
  };
  const meta: IRestMeta = {
    controller: target,
    name: target.constructor.name,
    func: wrapperFn.bind(target),
  };
  const epMeta = {
    controller: target,
    controllerProperty: propertyKey,
    controllerHandler: target[propertyKey],
    method,
    path,
    paramsMeta,
    stateMeta,
    sessionMeta,
    bodyMeta,
    filesMeta,
    queryMeta,
  };
  endpointContainer.push(epMeta);
  storage.storeAsDynamicScoped(`rest:${target.constructor.name.toLowerCase()}:${method}:${path}`, () => meta);
}

export { registerRest };
