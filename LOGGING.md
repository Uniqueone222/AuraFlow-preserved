# Network and Session Logging System

## Overview

A comprehensive logging system has been implemented to track network requests, API interactions, and session events throughout workflow execution. All logs are both displayed in the console (with colored output) and persisted to files for later analysis.

The system now includes a **structured query interface** for programmatic log analysis. See [STRUCTURED_LOG_QUERIES.md](STRUCTURED_LOG_QUERIES.md) for detailed query examples.

## Features

### 1. **Network Request Logging**
Logs all HTTP requests to external APIs with correlation IDs for request tracing:

- **LLM API Calls**: Groq, Gemini, and OpenAI
  - Tracks request size, response size, and latency
  - Logs HTTP status codes and error details
  - Sanitizes URLs to hide API keys

- **Qdrant Vector Database**
  - Logs save, query, and clear operations
  - Tracks operation duration and payload sizes
  - Records success/failure status

- **Web Search (DuckDuckGo)**
  - Logs search queries and result counts
  - Tracks response times
  - Records HTTP status and error information

### 2. **Session Tracking**
Unique session ID tracking for correlating all events within a workflow execution:

- **Session ID**: Generated at application startup (`session_TIMESTAMP_RANDOMID`)
- **Correlation IDs**: Assigned to each API request for tracing (`sessionId_sequentialNumber`)
- **Event Logging**: Tracks workflow start, agent execution, step completion, and errors

### 3. **Log Levels**
Structured logging with severity levels:

- `DEBUG`: Detailed debugging information
- `INFO`: General informational messages
- `WARN`: Warning messages
- `ERROR`: Error conditions
- `NETWORK`: Network request/response events
- `SESSION`: Workflow and session events

## Log Files

Logs are saved to `workflow_outputs/logs/` directory:

### File Structure
```
workflow_outputs/logs/
├── general.log                          # All general messages
├── network.log                          # All network requests/responses
├── session.log                          # All session events
└── session_<sessionId>_summary.json     # Complete session summary
```

### Summary JSON Format
```json
{
  "sessionId": "session_1705588800000_abc123",
  "networkRequests": 15,
  "sessionEvents": 42,
  "totalNetworkTime": 3456,
  "logsDirectory": "/path/to/workflow_outputs/logs",
  "networkLogs": [
    {
      "timestamp": "2026-01-18T10:30:45.123Z",
      "sessionId": "session_1705588800000_abc123",
      "correlationId": "session_1705588800000_abc123_1",
      "method": "POST",
      "url": "https://api.groq.com/openai/v1/chat/completions",
      "provider": "Groq",
      "requestSize": 1024,
      "responseSize": 2048,
      "duration": 1234,
      "statusCode": 200,
      "status": "success"
    }
  ],
  "sessionLogs": [
    {
      "timestamp": "2026-01-18T10:30:45.123Z",
      "sessionId": "session_1705588800000_abc123",
      "event": "Workflow Execution Started",
      "workflowId": "my-workflow",
      "agentId": "researcher",
      "stepId": "step-1",
      "details": {}
    }
  ]
}
```

## API Usage

### Getting the Logger Instance
```typescript
import { Logger } from './utils/Logger';

const logger = Logger.getInstance();
const sessionId = logger.getSessionId();
```

### Logging Network Requests
```typescript
// Start tracking a request
const correlationId = logger.logNetworkRequest(
  'POST',
  'https://api.example.com/endpoint',
  'MyProvider',
  requestPayloadSize
);

try {
  // Make the request
  const response = await fetch(url);
  
  // Log the response
  logger.logNetworkResponse(
    correlationId,
    response.status,
    responseSize,
    duration  // milliseconds
  );
} catch (error) {
  logger.logNetworkResponse(
    correlationId,
    500,
    0,
    duration,
    error.message
  );
}
```

### Logging Session Events
```typescript
logger.logSessionEvent(
  'Workflow Execution Started',  // event name
  'my-workflow',                  // workflowId (optional)
  'agent-id',                     // agentId (optional)
  'step-1',                       // stepId (optional)
  { custom: 'details' }          // details (optional)
);
```

### Writing Summary
```typescript
logger.writeSummary();  // Writes summary JSON file
```

## Console Output Example

```
[2026-01-18T10:30:45.123Z] [NETWORK] 📤 Groq Request: POST
  Correlation ID: session_1705588800000_abc123_1
  URL: https://api.groq.com/openai/v1/chat/completions
  Request Size: 1.2 KB

[2026-01-18T10:30:46.357Z] [NETWORK] 📥 Response 200 (1234ms)
  Response Size: 2.0 KB

[2026-01-18T10:30:46.357Z] [SESSION] 📍 Agent Execution Completed (Workflow: my-workflow) (Agent: researcher)
  Details: {"outputLength": 2048, "produced": ["result"]}
```

## Integration Points

### LLMClient (`src/services/LLMClient.ts`)
- Logs all LLM provider requests (Groq, Gemini, OpenAI)
- Tracks API errors and status codes
- Measures request latency

### QdrantMemoryProvider (`src/memory/QdrantMemoryProvider.ts`)
- Logs vector database operations
- Tracks save, query, and clear operations
- Records operation timing and payload sizes

### WebSearchTool (`src/tools/WebSearchTool.ts`)
- Logs web search requests to DuckDuckGo
- Tracks search query and result count
- Records HTTP status and timing

### Context (`src/models/Context.ts`)
- Initializes logger with session ID
- Stores session ID for correlation

### Executor (`src/models/Executor.ts`)
- Logs workflow lifecycle events
- Tracks agent execution start/completion/failure
- Records step-level metrics

### CLI (`src/cli.ts`)
- Writes session summary JSON file at workflow completion
- Handles logging initialization

## Best Practices

1. **Correlation Tracking**: Use the correlation ID returned from `logNetworkRequest()` in the corresponding `logNetworkResponse()` call
2. **Timing Accuracy**: Use `Date.now()` before and after operations to capture accurate timing
3. **Error Logging**: Always include error messages in response logging when status indicates failure
4. **Sanitization**: URLs are automatically sanitized to remove API keys (key, apiKey, api_key, token, auth, password)
5. **Aggregation**: Use `getNetworkLogs()` and `getSessionLogs()` to retrieve all logs after execution for analysis

## Monitoring and Analysis

After workflow execution, review the summary JSON to:
- Count network requests by provider
- Calculate total execution time
- Identify failing requests
- Trace request sequence by correlation ID
- Analyze latency patterns

Example analysis:
```json
{
  "totalRequests": 15,
  "byProvider": {
    "Groq": 8,
    "Qdrant": 5,
    "DuckDuckGo": 2
  },
  "averageLatency": "230ms",
  "failedRequests": 0,
  "totalTime": "3456ms"
}
```

## Environment Configuration

Logging can be configured through the Logger instance:
```typescript
logger.setConsoleEnabled(true);   // Enable/disable console output
logger.setFileEnabled(true);      // Enable/disable file logging
```

## Troubleshooting

- **Missing Logs**: Ensure `workflow_outputs` directory exists (created automatically on first run)
- **File Permission Issues**: Check write permissions on `workflow_outputs/logs/` directory
- **Large Log Files**: Logs accumulate over multiple workflow runs; clean up periodically
- **Sanitization Issues**: If API keys appear in logs, they're not in sensitive request/response bodies, only in URLs

## Future Enhancements

Potential improvements to the logging system:
1. Structured logging format (JSON for all console output)
2. Log rotation and compression
3. Remote log aggregation support
4. Performance metrics aggregation
5. Real-time log streaming API
