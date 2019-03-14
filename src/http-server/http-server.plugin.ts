import { IInjectable, ILogger, inject, injectable, IServerPlugin } from '@steffi/core';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { parse as urlParse } from 'url';
import { SteffiRequest, SteffiResponse } from './classes';

@injectable()
export class HttpServerPlugin implements IServerPlugin {
  public pluginName = 'HttpServer';
  public server: any;

  constructor(@inject('SteffiConfig') private config: IInjectable, @inject('LoggerPlugin') private logger: ILogger) { }

  public listen() {
    this.server = createServer((req, res) => {
      return this.httpParseRequest(req, res);
    });
    this.server.listen(this.config.settings.port || 5737);
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
    await req.parse();
    try {
      const res = new SteffiResponse(response, url);
      const result: any = await req.rest.func.apply(req.restInstance, [...req.parsed.args, req.parsed, res]);
      if (result) {
        if (result.status || result.message || result.contentType) {
          res.payload(result);
          this.logger.log('STEFFI SYSTEM', `${request.method}`, req.info, 'RESPONSE', result.payload || null);
        } else {
          res.json(result);
          this.logger.log('STEFFI SYSTEM', `${request.method}`, req.info, 'RESPONSE', result);
        }
      } else {
        res.null();
        this.logger.log('STEFFI SYSTEM', `${request.method}`, req.info, 'RESPONSE', 'null response');
      }
      try {
        response.end();
      } catch {
        // response ended already - possible native use
      }
    } catch (error) {
      this.logger.error('STEFFI SYSTEM', error);
      SteffiResponse.error(url, response, error);
    } finally {
    }
  }
}
