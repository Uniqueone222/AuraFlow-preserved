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

  /**
   * Query interface for structured log analysis
   */

  /**
   * Query network logs with filters
   */
  queryNetworkLogs(filters: {
    sessionId?: string;
    provider?: string;
    method?: string;
    statusCode?: number;
    minDuration?: number;
    maxDuration?: number;
    errorOnly?: boolean;
    startTime?: string;
    endTime?: string;
  } = {}): NetworkLog[] {
    let results = [...this.networkLogs];

    if (filters.sessionId) {
      results = results.filter(log => log.sessionId === filters.sessionId);
    }

    if (filters.provider) {
      results = results.filter(log =>
        log.provider.toLowerCase().includes(filters.provider!.toLowerCase())
      );
    }

    if (filters.method) {
      results = results.filter(log => log.method === filters.method);
    }

    if (filters.statusCode) {
      results = results.filter(log => log.statusCode === filters.statusCode);
    }

    if (filters.minDuration !== undefined) {
      results = results.filter(log => log.duration >= filters.minDuration!);
    }

    if (filters.maxDuration !== undefined) {
      results = results.filter(log => log.duration <= filters.maxDuration!);
    }

    if (filters.errorOnly) {
      results = results.filter(log => log.status === 'error');
    }

    if (filters.startTime) {
      const startTime = new Date(filters.startTime).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() >= startTime);
    }

    if (filters.endTime) {
      const endTime = new Date(filters.endTime).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() <= endTime);
    }

    return results;
  }

  /**
   * Query session logs with filters
   */
  querySessionLogs(filters: {
    sessionId?: string;
    event?: string;
    workflowId?: string;
    agentId?: string;
    stepId?: string;
    startTime?: string;
    endTime?: string;
  } = {}): SessionLog[] {
    let results = [...this.sessionLogs];

    if (filters.sessionId) {
      results = results.filter(log => log.sessionId === filters.sessionId);
    }

    if (filters.event) {
      results = results.filter(log =>
        log.event.toLowerCase().includes(filters.event!.toLowerCase())
      );
    }

    if (filters.workflowId) {
      results = results.filter(log => log.workflowId === filters.workflowId);
    }

    if (filters.agentId) {
      results = results.filter(log => log.agentId === filters.agentId);
    }

    if (filters.stepId) {
      results = results.filter(log => log.stepId === filters.stepId);
    }

    if (filters.startTime) {
      const startTime = new Date(filters.startTime).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() >= startTime);
    }

    if (filters.endTime) {
      const endTime = new Date(filters.endTime).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() <= endTime);
    }

    return results;
  }

  /**
   * Get execution timeline - all events sorted by timestamp
   */
  getExecutionTimeline(sessionId?: string): Array<{
    timestamp: string;
    type: 'network' | 'session';
    data: NetworkLog | SessionLog;
  }> {
    const events: Array<{
      timestamp: string;
      type: 'network' | 'session';
      data: NetworkLog | SessionLog;
    }> = [];

    const networkEvents = (sessionId
      ? this.networkLogs.filter(log => log.sessionId === sessionId)
      : this.networkLogs
    ).map(data => ({ timestamp: data.timestamp, type: 'network' as const, data }));

    const sessionEvents = (sessionId
      ? this.sessionLogs.filter(log => log.sessionId === sessionId)
      : this.sessionLogs
    ).map(data => ({ timestamp: data.timestamp, type: 'session' as const, data }));

    events.push(...networkEvents, ...sessionEvents);
    events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    return events;
  }

  /**
   * Get agent execution summary
   */
  getAgentExecutionSummary(agentId?: string): {
    agent: string;
    eventCount: number;
    events: SessionLog[];
    averageResponseTime?: number;
  }[] {
    const summaries: Map<
      string,
      { eventCount: number; events: SessionLog[]; responseTimes: number[] }
    > = new Map();

    this.sessionLogs.forEach(log => {
      if (agentId && log.agentId !== agentId) return;

      if (log.agentId) {
        const key = log.agentId;
        if (!summaries.has(key)) {
          summaries.set(key, { eventCount: 0, events: [], responseTimes: [] });
        }

        const summary = summaries.get(key)!;
        summary.eventCount++;
        summary.events.push(log);

        // Track response times from start to completion events
        if (log.event === 'Agent Execution Completed' && log.details?.duration) {
          summary.responseTimes.push(log.details.duration);
        }
      }
    });

    return Array.from(summaries.entries()).map(([agent, summary]) => ({
      agent,
      eventCount: summary.eventCount,
      events: summary.events,
      averageResponseTime:
        summary.responseTimes.length > 0
          ? Math.round(
              summary.responseTimes.reduce((a, b) => a + b, 0) /
                summary.responseTimes.length
            )
          : undefined
    }));
  }

  /**
   * Get provider statistics
   */
  getProviderStats(provider?: string): {
    provider: string;
    requestCount: number;
    successCount: number;
    errorCount: number;
    averageDuration: number;
    totalDuration: number;
  }[] {
    const stats: Map<
      string,
      {
        requestCount: number;
        successCount: number;
        errorCount: number;
        durations: number[];
      }
    > = new Map();

    this.networkLogs.forEach(log => {
      if (provider && log.provider !== provider) return;

      const key = log.provider;
      if (!stats.has(key)) {
        stats.set(key, { requestCount: 0, successCount: 0, errorCount: 0, durations: [] });
      }

      const stat = stats.get(key)!;
      stat.requestCount++;
      if (log.status === 'success') {
        stat.successCount++;
      } else {
        stat.errorCount++;
      }
      stat.durations.push(log.duration);
    });

    return Array.from(stats.entries()).map(([prov, stat]) => ({
      provider: prov,
      requestCount: stat.requestCount,
      successCount: stat.successCount,
      errorCount: stat.errorCount,
      averageDuration:
        stat.durations.length > 0
          ? Math.round(stat.durations.reduce((a, b) => a + b, 0) / stat.durations.length)
          : 0,
      totalDuration: stat.durations.reduce((a, b) => a + b, 0)
    }));
  }

  /**
   * Get workflow execution stats
   */
  getWorkflowStats(workflowId?: string): {
    workflowId: string;
    eventCount: number;
    agentCount: number;
    startTime?: string;
    endTime?: string;
    duration?: number;
    status: 'pending' | 'completed' | 'failed';
  }[] {
    const stats: Map<
      string,
      {
        events: SessionLog[];
        agents: Set<string>;
        startTime?: string;
        endTime?: string;
        status: 'pending' | 'completed' | 'failed';
      }
    > = new Map();

    this.sessionLogs.forEach(log => {
      if (workflowId && log.workflowId !== workflowId) return;

      if (log.workflowId) {
        const key = log.workflowId;
        if (!stats.has(key)) {
          stats.set(key, {
            events: [],
            agents: new Set(),
            status: 'pending'
          });
        }

        const stat = stats.get(key)!;
        stat.events.push(log);

        if (log.agentId) {
          stat.agents.add(log.agentId);
        }

        if (log.event === 'Workflow Execution Started') {
          stat.startTime = log.timestamp;
        }

        if (log.event === 'Workflow Execution Completed') {
          stat.endTime = log.timestamp;
          stat.status = 'completed';
        }

        if (log.event === 'Workflow Execution Failed') {
          stat.status = 'failed';
        }
      }
    });

    return Array.from(stats.entries()).map(([wfId, stat]) => ({
      workflowId: wfId,
      eventCount: stat.events.length,
      agentCount: stat.agents.size,
      startTime: stat.startTime,
      endTime: stat.endTime,
      duration:
        stat.startTime && stat.endTime
          ? new Date(stat.endTime).getTime() - new Date(stat.startTime).getTime()
          : undefined,
      status: stat.status
    }));
  }

  /**
   * Export logs as structured JSON
   */
  exportLogs(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(
        {
          sessionId: this.sessionId,
          exportedAt: new Date().toISOString(),
          networkLogs: this.networkLogs,
          sessionLogs: this.sessionLogs
        },
        null,
        2
      );
    } else {
      // CSV format
      let csv = 'timestamp,type,event,agent,workflow,provider,status,duration\n';

      this.sessionLogs.forEach(log => {
        csv += `"${log.timestamp}","session","${log.event}","${log.agentId || ''}","${
          log.workflowId || ''
        }",,\n`;
      });

      this.networkLogs.forEach(log => {
        csv += `"${log.timestamp}","network","","","","${log.provider}","${log.status}","${log.duration}"\n`;
      });

      return csv;
    }
  }

  /**
   * Clear all logs (useful for testing)
   */
  clearLogs(): void {
    this.networkLogs = [];
    this.sessionLogs = [];
    this.correlationId = 0;
  }

  /**
   * Get logs summary statistics
   */
  getLogsSummary(): {
    sessionId: string;
    totalEvents: number;
    networkRequests: number;
    sessionEvents: number;
    uniqueAgents: Set<string>;
    uniqueWorkflows: Set<string>;
    totalNetworkDuration: number;
    errorCount: number;
  } {
    const agents = new Set<string>();
    const workflows = new Set<string>();

    this.sessionLogs.forEach(log => {
      if (log.agentId) agents.add(log.agentId);
      if (log.workflowId) workflows.add(log.workflowId);
    });

    const errorCount = this.networkLogs.filter(log => log.status === 'error').length;
    const totalNetworkDuration = this.networkLogs.reduce((sum, log) => sum + log.duration, 0);

    return {
      sessionId: this.sessionId,
      totalEvents: this.networkLogs.length + this.sessionLogs.length,
      networkRequests: this.networkLogs.length,
      sessionEvents: this.sessionLogs.length,
      uniqueAgents: agents,
      uniqueWorkflows: workflows,
      totalNetworkDuration,
      errorCount
    };
  }
}

export default Logger.getInstance();
