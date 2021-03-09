import cors from '@koa/cors';
import { asyncForEach, IRestMeta, IServerPlugin } from '@steffy/core';
import { Inject, Optional, Singleton, storage, Transient } from '@steffy/di';
import { LoggerPlugin } from '@steffy/logger';
import Koa from 'koa';
import helmet from 'koa-helmet';
import session from 'koa-session2';
import IO from 'koa-socket-2';
import serve from 'koa-static';
import { endpointContainer } from './constants';
const Router = require('koa2-router');
const bodyParser = require('koa-body');

@Singleton()
export class HttpServerPlugin implements IServerPlugin {
  public pluginName = 'HttpServer';
  public server = new Koa();
  public router = new Router();

  constructor(@Optional('SteffyConfig') private config: any, @Inject() private logger: LoggerPlugin) {}

  /**
   * setup routes defined by the controllers
   */
  public async warmup() {
    this.server
      .use(session({ key: this.config.sessionKey || 'STEFFY:SESSION' }, this.server))
      .use(cors())
      .use(helmet())
      .use(
        bodyParser({
          multipart: true,
        })
      )
      .use(await this.routes());
    // .use(this.router.allowedMethods());
  }

  public use(...args: any) {
    this.server.use(...args);
  }

  public async listen(path?: string, socket?: IO, indexOn404?: boolean);
  public async listen(path?: string | IO, socket?: IO, indexOn404: boolean = false) {
    if (path && typeof path === 'string') {
      this.serve(path as string);
    }
    if ((path && !(typeof path === 'string') && !socket) || socket) {
      let sock = path;
      if (socket) sock = socket;
      sock.attach(this.server);
    }
    this.server.listen(this.config.settings.port || 5737);
    // this.logger.log(`${this.pluginName}`, `listening on port ${this.config.settings.port || 5737}`);
  }

  public serve(path: string) {
    this.server.use(serve(path));
  }

  private async routes() {
    await asyncForEach(endpointContainer, async (ep) => {
      const restMeta: IRestMeta = await storage.get<IRestMeta>(`rest:${ep.controller.constructor.name.toLowerCase()}:${ep.method}:${ep.path}`);
      const controllerMeta = Reflect.getMetadata('steffy:http:controller', restMeta.controller.constructor);
      if (!controllerMeta) throw new Error(`${restMeta.controller.constructor.name} is not a @Controller`);
      this.router[ep.method](`${controllerMeta.root}${ep.path}`, restMeta.func);
    });
    // return this.router.routes();
    return this.router;
  }
}
