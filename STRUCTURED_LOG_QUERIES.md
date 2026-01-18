# Structured Log Query Guide

## Overview

AuraFlow now includes a comprehensive structured log query interface that allows you to analyze workflow execution with precise filtering, aggregation, and export capabilities.

---

## Basic Query Examples

### 1. Query Network Logs

```typescript
import Logger from './src/utils/Logger';

const logger = Logger.getInstance();

// Get all network requests
const allNetworkLogs = logger.getNetworkLogs();

// Query network logs with filters
const groqRequests = logger.queryNetworkLogs({
  provider: 'groq'
});

// Get only failed network requests
const failures = logger.queryNetworkLogs({
  errorOnly: true
});

// Get requests slower than 1 second
const slowRequests = logger.queryNetworkLogs({
  minDuration: 1000
});

// Filter by time range
const recentLogs = logger.queryNetworkLogs({
  startTime: '2026-01-18T12:00:00Z',
  endTime: '2026-01-18T13:00:00Z'
});
```

### 2. Query Session Logs

```typescript
// Get all session events
const allSessionLogs = logger.getSessionLogs();

// Find all events for a specific agent
const agentEvents = logger.querySessionLogs({
  agentId: 'researcher'
});

// Get all workflow completion events
const completionEvents = logger.querySessionLogs({
  event: 'WORKFLOW_COMPLETE'
});

// Find events for a specific workflow
const workflowEvents = logger.querySessionLogs({
  workflowId: 'file-system-logging-test'
});

// Get events within time range
const timeRangeEvents = logger.querySessionLogs({
  startTime: '2026-01-18T12:00:00Z',
  endTime: '2026-01-18T13:00:00Z'
});
```

### 3. Execution Timeline

```typescript
// Get complete execution timeline (all events in order)
const timeline = logger.getExecutionTimeline();

// Print timeline
timeline.forEach(event => {
  console.log(`${event.timestamp} [${event.type}]`, event.data);
});

// Timeline for specific session
const sessionTimeline = logger.getExecutionTimeline('session_1768717688865_q37s6kf5i');
```

---

## Advanced Queries

### 4. Agent Execution Summary

```typescript
// Get execution summary for all agents
const allAgentStats = logger.getAgentExecutionSummary();

allAgentStats.forEach(stat => {
  console.log(`Agent: ${stat.agent}`);
  console.log(`  Events: ${stat.eventCount}`);
  console.log(`  Average Response Time: ${stat.averageResponseTime}ms`);
});

// Get summary for specific agent
const agentStats = logger.getAgentExecutionSummary('researcher');
```

**Output Example:**
```
Agent: researcher
  Events: 5
  Average Response Time: 245ms

Agent: writer
  Events: 3
  Average Response Time: 189ms
```

### 5. Provider Statistics

```typescript
// Get stats for all providers
const providerStats = logger.getProviderStats();

providerStats.forEach(stat => {
  console.log(`Provider: ${stat.provider}`);
  console.log(`  Requests: ${stat.requestCount}`);
  console.log(`  Success: ${stat.successCount}`);
  console.log(`  Errors: ${stat.errorCount}`);
  console.log(`  Average Duration: ${stat.averageDuration}ms`);
  console.log(`  Total Duration: ${stat.totalDuration}ms`);
});

// Get stats for specific provider
const groqStats = logger.getProviderStats('groq');
```

**Output Example:**
```
Provider: groq
  Requests: 4
  Success: 4
  Errors: 0
  Average Duration: 245ms
  Total Duration: 980ms

Provider: qdrant
  Requests: 1
  Success: 1
  Errors: 0
  Average Duration: 249ms
  Total Duration: 249ms
```

### 6. Workflow Execution Stats

```typescript
// Get stats for all workflows
const workflowStats = logger.getWorkflowStats();

workflowStats.forEach(stat => {
  console.log(`Workflow: ${stat.workflowId}`);
  console.log(`  Events: ${stat.eventCount}`);
  console.log(`  Agents: ${stat.agentCount}`);
  console.log(`  Status: ${stat.status}`);
  console.log(`  Duration: ${stat.duration}ms`);
});

// Get stats for specific workflow
const fileSystemStats = logger.getWorkflowStats('file-system-logging-test');
```

**Output Example:**
```
Workflow: file-system-logging-test
  Events: 13
  Agents: 2
  Status: completed
  Duration: 2043ms
```

### 7. Logs Summary

```typescript
// Get comprehensive summary
const summary = logger.getLogsSummary();

console.log(`Session: ${summary.sessionId}`);
console.log(`Total Events: ${summary.totalEvents}`);
console.log(`Network Requests: ${summary.networkRequests}`);
console.log(`Session Events: ${summary.sessionEvents}`);
console.log(`Unique Agents: ${summary.uniqueAgents.size}`);
console.log(`Unique Workflows: ${summary.uniqueWorkflows.size}`);
console.log(`Total Network Duration: ${summary.totalNetworkDuration}ms`);
console.log(`Error Count: ${summary.errorCount}`);
```

**Output Example:**
```
Session: session_1768717688865_q37s6kf5i
Total Events: 14
Network Requests: 1
Session Events: 13
Unique Agents: 2
Unique Workflows: 1
Total Network Duration: 249ms
Error Count: 0
```

---

## Export Functionality

### 8. Export Logs

```typescript
// Export as JSON
const jsonExport = logger.exportLogs('json');
fs.writeFileSync('logs_export.json', jsonExport);

// Export as CSV
const csvExport = logger.exportLogs('csv');
fs.writeFileSync('logs_export.csv', csvExport);
```

---

## Query Filters Reference

### Network Log Filters

| Filter | Type | Description |
|--------|------|-------------|
| `sessionId` | string | Filter by session ID |
| `provider` | string | Filter by provider name (groq, gemini, openai, qdrant) |
| `method` | string | Filter by HTTP method (GET, POST, DELETE) |
| `statusCode` | number | Filter by HTTP status code |
| `minDuration` | number | Filter requests slower than X ms |
| `maxDuration` | number | Filter requests faster than X ms |
| `errorOnly` | boolean | Return only failed requests |
| `startTime` | string | ISO 8601 timestamp |
| `endTime` | string | ISO 8601 timestamp |

### Session Log Filters

| Filter | Type | Description |
|--------|------|-------------|
| `sessionId` | string | Filter by session ID |
| `event` | string | Filter by event name (partial match) |
| `workflowId` | string | Filter by workflow ID |
| `agentId` | string | Filter by agent ID |
| `stepId` | string | Filter by step ID |
| `startTime` | string | ISO 8601 timestamp |
| `endTime` | string | ISO 8601 timestamp |

---

## Practical Use Cases

### Use Case 1: Performance Analysis

```typescript
// Find slowest operations
const slowOps = logger.queryNetworkLogs({ minDuration: 500 })
  .sort((a, b) => b.duration - a.duration);

console.log('Slowest Operations:');
slowOps.forEach(op => {
  console.log(`${op.provider}: ${op.duration}ms`);
});
```

### Use Case 2: Error Diagnosis

```typescript
// Find all errors in workflow
const errors = logger.queryNetworkLogs({ errorOnly: true });

console.log('Network Errors:');
errors.forEach(err => {
  console.log(`${err.provider} - Status ${err.statusCode}: ${err.error}`);
});

// Also check for agent failures
const agentFailures = logger.querySessionLogs({ 
  event: 'Agent Execution Failed' 
});

console.log('Agent Failures:');
agentFailures.forEach(failure => {
  console.log(`Agent ${failure.agentId}: ${failure.details?.error}`);
});
```

### Use Case 3: Resource Tracking

```typescript
// Track data transferred
let totalTransferred = 0;

logger.getNetworkLogs().forEach(log => {
  if (log.requestSize) totalTransferred += log.requestSize;
  if (log.responseSize) totalTransferred += log.responseSize;
});

console.log(`Total Data Transferred: ${logger['formatBytes'](totalTransferred)}`);

// Get provider breakdown
const stats = logger.getProviderStats();
stats.forEach(stat => {
  console.log(`${stat.provider}: ${stat.requestCount} requests, ${stat.totalDuration}ms total`);
});
```

### Use Case 4: Workflow Execution Report

```typescript
// Generate execution report
const wfStats = logger.getWorkflowStats()[0];
const agentStats = logger.getAgentExecutionSummary();
const providerStats = logger.getProviderStats();
const summary = logger.getLogsSummary();

console.log('=== EXECUTION REPORT ===');
console.log(`Workflow: ${wfStats.workflowId}`);
console.log(`Status: ${wfStats.status}`);
console.log(`Duration: ${wfStats.duration}ms`);
console.log(`Agents: ${wfStats.agentCount}`);
console.log();
console.log('Agent Performance:');
agentStats.forEach(agent => {
  console.log(`  ${agent.agent}: ${agent.eventCount} events`);
});
console.log();
console.log('Provider Performance:');
providerStats.forEach(provider => {
  console.log(`  ${provider.provider}: ${provider.averageDuration}ms avg`);
});
```

---

## CLI Integration Example

You can create a logs analysis command:

```typescript
// In src/cli.ts
async function analyzeLogs() {
  const logger = Logger.getInstance();
  const summary = logger.getLogsSummary();
  
  console.log(chalk.green('\n=== LOG ANALYSIS ==='));
  console.log(`Session: ${summary.sessionId}`);
  console.log(`Total Events: ${summary.totalEvents}`);
  
  const workflowStats = logger.getWorkflowStats();
  workflowStats.forEach(stat => {
    console.log(chalk.cyan(`\nWorkflow: ${stat.workflowId}`));
    console.log(`  Events: ${stat.eventCount}`);
    console.log(`  Agents: ${stat.agentCount}`);
    console.log(`  Status: ${stat.status}`);
  });
  
  const providerStats = logger.getProviderStats();
  console.log(chalk.cyan('\nProvider Performance:'));
  providerStats.forEach(stat => {
    console.log(`  ${stat.provider}: ${stat.averageDuration}ms avg (${stat.requestCount} requests)`);
  });
}
```

---

## Advanced Filtering Patterns

### Combine Multiple Filters

```typescript
// Complex query: All failed Groq requests in a time range
const complexQuery = logger.queryNetworkLogs({
  provider: 'groq',
  errorOnly: true,
  startTime: '2026-01-18T12:00:00Z',
  endTime: '2026-01-18T13:00:00Z'
});
```

### Multi-filter Session Queries

```typescript
// All events for specific agent in specific workflow
const agentWorkflowEvents = logger.querySessionLogs({
  workflowId: 'file-system-logging-test',
  agentId: 'researcher'
});

// All events in time range for specific step
const stepTimerangeEvents = logger.querySessionLogs({
  stepId: 'research_step',
  startTime: '2026-01-18T12:00:00Z'
});
```

---

## Best Practices

1. **Always use ISO 8601 timestamps** for time range queries
2. **Chain multiple queries** for complex analysis
3. **Export logs regularly** for archival and compliance
4. **Clear logs between test runs** to avoid data pollution
5. **Use agent/workflow IDs** for consistent filtering
6. **Check error counts first** in diagnostic workflows
7. **Export before clearing** if you need to preserve data

---

## Performance Considerations

- Network log queries: O(n) where n = number of network logs
- Session log queries: O(n) where n = number of session logs
- Timeline generation: O(n log n) due to sorting
- Export: O(n) but can be memory-intensive for large datasets

For workflows with 1000+ events, consider:
- Using specific time ranges
- Exporting and analyzing separately
- Clearing old logs periodically

---

## Troubleshooting

### No logs returned from query?
- Check if session has completed (`writeSummary()` called)
- Verify filter values match actual log data
- Use `getNetworkLogs()` and `getSessionLogs()` to see raw data

### Query returns empty set?
- Ensure time range filters are in ISO 8601 format
- Check that IDs (agent, workflow) are exactly correct
- Try broader filters first, then narrow down

### Export file is empty?
- Ensure logs were generated during workflow execution
- Check that `writeSummary()` was called
- Verify logging is enabled (`enableFile: true`)

---

**Query Interface Added:** January 18, 2026  
**Status:** ✅ Production Ready  
**Version:** Logger v1.1.0
