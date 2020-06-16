import { IPlugin, Logger, ILogger } from '@steffy/core';
import { Singleton } from '@steffy/di';

@Singleton()
export class LoggerPlugin implements IPlugin {
  public pluginName = 'Logger';
  private _logger: ILogger;

  constructor() {
    this._logger = new Logger();
  }

  public debug = (mod: string, ...messages: any[]) => this._logger.debug(mod, ...messages);
  public error = (mod: string, ...messages: any[]) => this._logger.error(mod, ...messages);
  public info = (mod: string, ...messages: any[]) => this._logger.info(mod, ...messages);
  public log = (mod: string, ...messages: any[]) => this._logger.log(mod, ...messages);
}
