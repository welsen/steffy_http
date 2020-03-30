import { IInjectable, inject, injectable, IServerPlugin } from '@steffi/core';
import { LoggerPlugin } from '@steffi/logger';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse as urlParse } from 'url';
import { SteffiRequest, SteffiResponse } from './classes';

@injectable()
export class HttpServerPlugin implements IServerPlugin {
  public pluginName = 'HttpServer';
  public server: any;

  constructor(@inject('SteffiConfig') private config: IInjectable, @inject('LoggerPlugin') private logger: LoggerPlugin) {}

  public listen() {
    this.server = createServer((req, res) => {
      return this.httpParseRequest(req, res);
    });
    this.server.listen(this.config.settings.port || 5737);
    this.logger.log(`${this.pluginName}`, `listening on port ${this.config.settings.port || 5737}`);
  }

  private async httpParseRequest(request: IncomingMessage, response: ServerResponse) {
    if (request.method!.toLowerCase() === 'options') {
      SteffiResponse.ok(response);
      return;
    }
    const headers = request.headers;
    const hostUrl = headers.host!.includes('://') ? `${headers.host}${request.url}` : `http://${headers.host}${request.url}`;
    const url = urlParse(`${hostUrl}`);

    const req = new SteffiRequest(request, url, this.logger);
    try {
      await req.parse();
      const res = new SteffiResponse(response, url);
      let result;
      if (req.rest.func) {
        result = await req.rest.func.apply(req.restInstance, [...req.parsed.args, req.parsed, res]);
      }
      if (result) {
        if (result.status || result.message || result.contentType) {
          res.payload(result);
          this.logger.log(`Steffi ${this.pluginName}`, `${request.method}`, req.info, 'RESPONSE', 'payload');
        } else {
          res.json(result);
          this.logger.log(`Steffi ${this.pluginName}`, `${request.method}`, req.info, 'RESPONSE', 'json');
        }
      } else {
        res.null();
        this.logger.log(`Steffi ${this.pluginName}`, `${request.method}`, req.info, 'RESPONSE', 'null response');
      }
      try {
        response.end();
      } catch {
        // response ended already - possible native use
      }
    } catch (error) {
      this.logger.error(`Steffi ${this.pluginName}`, error);
      SteffiResponse.error(url, response, error);
    } finally {
    }
  }
}
