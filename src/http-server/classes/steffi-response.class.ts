import { ServerResponse } from 'http';
import { UrlWithStringQuery } from 'url';
import { DEFAULT_HTML_HEADERS, DEFAULT_JSON_HEADERS } from '../constants';

export class SteffiResponse {
  private url: UrlWithStringQuery;
  private original: ServerResponse;

  public static ok(response: ServerResponse) {
    response.writeHead(200, 'OK', DEFAULT_JSON_HEADERS);
    response.end();
}

  public static error(url: UrlWithStringQuery, response: ServerResponse, error: any) {
    response.writeHead(404, `endpoint '${url.pathname}' not found`, DEFAULT_HTML_HEADERS);
    response.write(`<p>no endpoint '${url.pathname}'</p>`);
    response.write(
      `<pre style="padding: 8px; border: 1px solid rgba(128, 128, 128, 1); border-radius: 8px; background-color: rgba(192, 192, 192, 1);">${
        error.stack
      }</pre>`
    );
    response.end();
  }

  constructor(original: ServerResponse, url: UrlWithStringQuery) {
    this.original = original;
    this.url = url;
  }

  public ok() {
    SteffiResponse.ok(this.original);
  }

  public error(error: any) {
    SteffiResponse.error(this.url, this.original, error);
  }

  public null() {
    this.original.writeHead(204, 'I have nothing to say to you');
    this.original.end();
  }

  public text(str: string) {
    if (typeof str === 'string') {
      this.original.writeHead(200, `I'm gonna upload myself to the cloud`, DEFAULT_HTML_HEADERS);
      this.original.write(str);
      this.original.end();
    } else {
      this.error(new Error(`str is not a string`));
    }
  }

  public json(obj: any) {
    this.original.writeHead(200, `I'm gonna upload myself to the cloud`, DEFAULT_JSON_HEADERS);
    this.original.write(JSON.stringify(obj));
    this.original.end();
  }
  public payload(payload: any) {
    const headers = Object.assign({}, DEFAULT_JSON_HEADERS, { 'content-type': payload.contentType });
    this.original.writeHead(payload.status, payload.message, headers);
    this.original.write(JSON.stringify(payload.payload || null));
    this.original.end();
  }
}
