# @steffy/http

## Usage

In your `@steffy` application setup your server something like this:

### boot.sequence.ts

```typescript
import { injector, jsonLoader, moduleLoader, SYMBOLS } from '@steffy/core';
import '@steffy/http';
import { registerLogger } from '@steffy/logger';
import { Application } from './application';

export const boot = async () => {
  ...
  await moduleLoader('./lib/controllers', 'controller'); // path to your controllers
  ...
};
```

### application.ts

```typescript
import { IInjectable, inject, injectable } from '@steffy/core';
import { HttpServerPlugin } from '@steffy/http';
import { LoggerPlugin } from '@steffy/logger';
import IO from 'koa-socket-2'; // only if you want to use socket.io

@injectable()
export class Application {
  private socket = new IO(); // only if you want to use socket.io
  constructor(
    @inject('LoggerPlugin') private logger: LoggerPlugin,
    @inject('SteffyConfig') private config: IInjectable,
    @inject('HttpServerPlugin') private server: HttpServerPlugin
  ) {}

  public async start() {
    this.logger.info('Steffy API Server', 'Starting');
    this.server.warmup(); // path to your static serves
    this.server.listen('public/'); // path to your static serves
    // or 
    this.server.listen(this.socket); // socket.io handler
    // or 
    this.server.listen('public/', this.socket); // path to your static serves, and your socket.io handler
  }
}
```

and finally setup your controller

### base.controller.ts

for your functions simply use `koa` syntax

```typescript
import { IInjectable, inject, injectable } from '@steffy/core';
import { get } from '@steffy/http';
import { LoggerPlugin } from '@steffy/logger';

@injectable()
export class BaseController {
  constructor(@inject('SteffyConfig') private config: IInjectable, @inject('LoggerPlugin') private logger: LoggerPlugin) {}

  @get('/tick') // register your endpoint in router
  public async getTick(ctx: any) {
    ctx.body = 'tick';
  }
}
```
