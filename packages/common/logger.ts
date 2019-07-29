export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
  OFF
}

export class Logger {
  constructor(private level = LogLevel.INFO) {}

  setLevel(newLevel: LogLevel) {
    this.level = newLevel;
  }

  debug(...msg: any[]) {
    this.print(LogLevel.DEBUG, 'DEBUG', msg);
  }

  info(...msg: any[]) {
    this.print(LogLevel.INFO, 'INFO', msg);
  }

  warn(...msg: any[]) {
    this.print(LogLevel.WARN, 'WARN', msg);
  }

  error(...msg: any[]) {
    this.print(LogLevel.ERROR, 'ERROR', msg);
  }

  private print(level: LogLevel, label: string, msg: any[]) {
    if (level >= this.level) {
      switch (level) {
        case LogLevel.DEBUG:
          console.debug(this.prettify(label), ...msg);
          break;
        case LogLevel.INFO:
          console.info(this.prettify(label), ...msg);
          break;
        case LogLevel.WARN:
          console.warn(this.prettify(label), ...msg);
          break;
        case LogLevel.ERROR:
          console.error(this.prettify(label), ...msg);
          break;
        default:
          console.log(this.prettify(label), ...msg);
          break;
      }
    }
  }

  private prettify(label: string) {
    return `${label}::${Date.now()}::`;
  }
}
