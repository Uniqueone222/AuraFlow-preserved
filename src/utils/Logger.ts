import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

/**
 * Log levels for severity
 */
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  NETWORK = 'NETWORK',
  SESSION = 'SESSION'
}

/**
 * Network request/response log entry
 */
export interface NetworkLog {
  timestamp: string;
  sessionId: string;
  correlationId: string;
  method: string;
  url: string;
  provider: string;
  requestSize?: number;
  responseSize?: number;
  duration: number;
  statusCode?: number;
  status: 'success' | 'error';
  error?: string;
}

/**
 * Session log entry
 */
export interface SessionLog {
  timestamp: string;
  sessionId: string;
  event: string;
  workflowId?: string;
  agentId?: string;
  stepId?: string;
  details?: any;
}

/**
 * Logger utility for comprehensive logging
 */
export class Logger {
  private static instance: Logger;
  private logsDir: string;
  private sessionId: string;
  private correlationId: number = 0;
  private networkLogs: NetworkLog[] = [];
  private sessionLogs: SessionLog[] = [];
  private enableConsole: boolean = true;
  private enableFile: boolean = true;

  private constructor() {
    this.logsDir = path.join(process.cwd(), 'workflow_outputs', 'logs');
    this.sessionId = this.generateSessionId();
    this.ensureLogsDirectory();
  }

  /**
   * Get singleton instance
   */
  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate correlation ID for request tracking
   */
  private getNextCorrelationId(): string {
    return `${this.sessionId}_${++this.correlationId}`;
  }

  /**
   * Ensure logs directory exists
   */
  private ensureLogsDirectory(): void {
    if (!fs.existsSync(this.logsDir)) {
      fs.mkdirSync(this.logsDir, { recursive: true });
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get formatted timestamp
   */
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  /**
   * Color log level
   */
  private colorizeLevel(level: LogLevel): string {
    switch (level) {
      case LogLevel.DEBUG:
        return chalk.gray(level);
      case LogLevel.INFO:
        return chalk.cyan(level);
      case LogLevel.WARN:
        return chalk.yellow(level);
      case LogLevel.ERROR:
        return chalk.red(level);
      case LogLevel.NETWORK:
        return chalk.blue(level);
      case LogLevel.SESSION:
        return chalk.magenta(level);
      default:
        return level;
    }
  }

  /**
   * Log a message
   */
  log(level: LogLevel, message: string, data?: any): void {
    const timestamp = this.getTimestamp();
    const formattedMessage = `[${timestamp}] [${this.colorizeLevel(level)}] ${message}`;

    if (this.enableConsole) {
      console.log(formattedMessage);
      if (data) {
        console.log('  ', JSON.stringify(data, null, 2));
      }
    }

    if (this.enableFile) {
      this.writeToFile('general.log', `[${timestamp}] [${level}] ${message}`, data);
    }
  }

  /**
   * Log network request
   */
  logNetworkRequest(
    method: string,
    url: string,
    provider: string,
    requestSize?: number
  ): string {
    const correlationId = this.getNextCorrelationId();
    const timestamp = this.getTimestamp();

    const logEntry = {
      timestamp,
      sessionId: this.sessionId,
      correlationId,
      method,
      url: this.sanitizeUrl(url),
      provider,
      requestSize,
      duration: 0,
      status: 'success' as const
    };

    if (this.enableConsole) {
      console.log(
        chalk.blue(`[${timestamp}] [NETWORK] 📤 ${provider} Request: ${method}`)
      );
      console.log(chalk.blue(`  Correlation ID: ${correlationId}`));
      console.log(chalk.dim(`  URL: ${this.sanitizeUrl(url)}`));
      if (requestSize) {
        console.log(chalk.dim(`  Request Size: ${this.formatBytes(requestSize)}`));
      }
    }

    return correlationId;
  }

  /**
   * Log network response
   */
  logNetworkResponse(
    correlationId: string,
    statusCode: number,
    responseSize?: number,
    duration?: number,
    error?: string
  ): void {
    const timestamp = this.getTimestamp();
    const status = statusCode >= 400 ? 'error' : 'success';

    const logEntry: NetworkLog = {
      timestamp,
      sessionId: this.sessionId,
      correlationId,
      method: 'UNKNOWN',
      url: 'UNKNOWN',
      provider: 'UNKNOWN',
      statusCode,
      responseSize,
      duration: duration || 0,
      status: status as 'success' | 'error',
      error
    };

    this.networkLogs.push(logEntry);

    if (this.enableConsole) {
      const statusColor = statusCode >= 400 ? chalk.red : chalk.green;
      console.log(
        statusColor(
          `[${timestamp}] [NETWORK] 📥 Response ${statusCode} (${duration}ms)`
        )
      );
      if (responseSize) {
        console.log(
          chalk.dim(`  Response Size: ${this.formatBytes(responseSize)}`)
        );
      }
      if (error) {
        console.log(chalk.red(`  Error: ${error}`));
      }
    }

    if (this.enableFile) {
      this.writeToFile('network.log', `[${timestamp}] Response ${statusCode}`, logEntry);
    }
  }

  /**
   * Log session event
   */
  logSessionEvent(
    event: string,
    workflowId?: string,
    agentId?: string,
    stepId?: string,
    details?: any
  ): void {
    const timestamp = this.getTimestamp();

    const logEntry: SessionLog = {
      timestamp,
      sessionId: this.sessionId,
      event,
      workflowId,
      agentId,
      stepId,
      details
    };

    this.sessionLogs.push(logEntry);

    if (this.enableConsole) {
      let message = `[${timestamp}] [SESSION] 📍 ${event}`;
      if (workflowId) message += ` (Workflow: ${workflowId})`;
      if (agentId) message += ` (Agent: ${agentId})`;
      if (stepId) message += ` (Step: ${stepId})`;

      console.log(chalk.magenta(message));

      if (details) {
        console.log(chalk.dim('  Details: ' + JSON.stringify(details).substring(0, 100)));
      }

      if (this.enableFile) {
        this.writeToFile('session.log', message, logEntry);
      }
    }
  }

  /**
   * Write log to file
   */
  private writeToFile(filename: string, message: string, data?: any): void {
    try {
      const filepath = path.join(this.logsDir, filename);
      const logLine =
        typeof data === 'string'
          ? `${message}\n`
          : `${message}\n${JSON.stringify(data, null, 2)}\n`;

      fs.appendFileSync(filepath, logLine);
    } catch (error) {
      console.error(chalk.red(`Failed to write to log file: ${error}`));
    }
  }

  /**
   * Sanitize URLs to hide sensitive information
   */
  private sanitizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      // Remove API keys and sensitive query params
      const params = new URLSearchParams(urlObj.search);
      ['key', 'apiKey', 'api_key', 'token', 'auth', 'password'].forEach(param => {
        if (params.has(param)) {
          params.set(param, '***REDACTED***');
        }
      });
      urlObj.search = params.toString();
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  /**
   * Format bytes to human readable
   */
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Get network logs
   */
  getNetworkLogs(): NetworkLog[] {
    return [...this.networkLogs];
  }

  /**
   * Get session logs
   */
  getSessionLogs(): SessionLog[] {
    return [...this.sessionLogs];
  }

  /**
   * Generate session summary
   */
  generateSessionSummary(): {
    sessionId: string;
    networkRequests: number;
    sessionEvents: number;
    totalNetworkTime: number;
    logsDirectory: string;
  } {
    const totalTime = this.networkLogs.reduce((sum, log) => sum + log.duration, 0);

    return {
      sessionId: this.sessionId,
      networkRequests: this.networkLogs.length,
      sessionEvents: this.sessionLogs.length,
      totalNetworkTime: totalTime,
      logsDirectory: this.logsDir
    };
  }

  /**
   * Write summary to file
   */
  writeSummary(): void {
    const summary = this.generateSessionSummary();
    const summaryPath = path.join(this.logsDir, `session_${summary.sessionId}_summary.json`);

    try {
      fs.writeFileSync(
        summaryPath,
        JSON.stringify(
          {
            ...summary,
            networkLogs: this.networkLogs,
            sessionLogs: this.sessionLogs,
            timestamp: new Date().toISOString()
          },
          null,
          2
        )
      );

      console.log(
        chalk.green(
          `\n✓ Session logs saved to: ${path.relative(process.cwd(), summaryPath)}`
        )
      );
    } catch (error) {
      console.error(chalk.red(`Failed to write session summary: ${error}`));
    }
  }

  /**
   * Enable/disable console logging
   */
  setConsoleEnabled(enabled: boolean): void {
    this.enableConsole = enabled;
  }

  /**
   * Enable/disable file logging
   */
  setFileEnabled(enabled: boolean): void {
    this.enableFile = enabled;
  }
}

export default Logger.getInstance();
