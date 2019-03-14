import { ILogger, injector, IRestMeta, useInjectionToken } from '@steffi/core';
import { IncomingMessage } from 'http';
import pathToRegexp from 'path-to-regexp';
import { UrlWithStringQuery } from 'url';
import { endpointContainer } from '../constants/endpoint-container.constant';

export class SteffiRequest {
  private url: UrlWithStringQuery;
  private original: IncomingMessage;
  private logger: ILogger;

  private method: string | undefined;
  private body: any;
  private headers: any;
  private params: any;
  private args: any;
  private endpoint: any;

  public info: any;
  public rest: IRestMeta | any;
  public restInstance: any;

  public get parsed() {
    return {
      method: this.method,
      path: this.url.pathname,
      headers: this.headers,
      query: this.url.query,
      body: this.body,
      _raw: this.original,
      params: this.params,
      args: this.args
    };
  }

  constructor(original: IncomingMessage, url: UrlWithStringQuery, logger: ILogger) {
    this.original = original;
    this.url = url;
    this.logger = logger;
  }

  private readData(req: any) {
    return new Promise<string>((resolve: any, reject: any) => {
      let body = '';
      req.on('data', (data: any) => {
        body += data;
        if (body.length > 1e6) {
          req.connection.destroy();
          reject(new Error('data to large'));
        }
      });
      req.on('end', () => {
        resolve(body);
      });
    });
  }

  private getEndpoint(url: string) {
    const possibleEndpoints = endpointContainer.filter(
      i => i.match(/([\-\/\[\]+?.,\\\^$|#\s])/g)!.length === url.match(/([\-\/\[\]+?.,\\\^$|#\s])/g)!.length || i === url
    );
    let endpoint = -1;
    let params: any;
    let args: Array<any> = [];
    possibleEndpoints.forEach((ep, idx) => {
      const keys = [];
      const re = pathToRegexp(ep, keys);
      const reRes = re.exec(url);
      if (reRes !== null) {
        params = keys.map((k: any, i) => ({ [k.name]: decodeURIComponent(reRes![i + 1]) }));
        params = Object.assign({}, ...params);
        args = Object.values(params);
        endpoint = idx;
      }
    });
    this.endpoint = possibleEndpoints[endpoint];
    if (!this.endpoint) {
      throw new Error(`no endpoint found for: '${url}'`);
    }
    this.params = params;
    this.args = args;
    this.info = {
      endpoint: this.endpoint,
      params: this.params,
      args: this.args
    };
  }

  private async getBody() {
    let body: string = '';
    try {
      body = await this.readData(this.original);
    } catch (error) {
      this.logger.error('STEFFI SYSTEM', error);
    }
    this.body = body || JSON.stringify(body);
  }

  private getMethod() {
    this.method = this.original.method!.toLowerCase();
  }

  private getHeaders() {
    this.headers = this.original.headers;
  }

  public async parse() {
    this.getMethod();
    this.getHeaders();
    if (this.method === 'post') {
      this.getBody();
    }
    this.getEndpoint(this.url.pathname!);

    try {
      this.rest = await injector.get<IRestMeta>(useInjectionToken(`rest_${this.method}_${this.endpoint}`));
    } catch (error) {
      throw new Error(`rest call 'rest_${this.method}_${this.endpoint}' not found`);
    }

    try {
      this.restInstance = await injector.get(useInjectionToken(this.rest.name));
    } catch (error) {
      throw error;
    }
  }
}
