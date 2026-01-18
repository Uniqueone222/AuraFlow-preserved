# Example Logging Output

## Console Output During Execution

```
>>> EXECUTING WORKFLOW: my-research-workflow (sequential) <<<
Stop on error: false
Steps: 3

>>> SEQUENTIAL EXECUTION STARTED <<<

[2026-01-18T10:30:45.123Z] [SESSION] 📍 Workflow Execution Started (Workflow: my-research-workflow)
  Details: {"type":"sequential","stopOnError":false,"stepsCount":3}

[1/3] research_step → researcher (search_topic)

[2026-01-18T10:30:45.234Z] [SESSION] 📍 Agent Execution Started (Workflow: my-research-workflow) (Agent: researcher)
  Details: {"role":"Research Analyst","action":"search_topic"}

[2026-01-18T10:30:45.345Z] [NETWORK] 📤 DuckDuckGo Request: GET
  Correlation ID: session_1705588800000_abc123_1
  URL: https://api.duckduckgo.com/?q=AI+trends&format=json
  Request Size: 28 Bytes

🔍 🔍 🔍 INTERNET SEARCH ACTIVATED: "AI trends 2025"

[2026-01-18T10:30:46.456Z] [NETWORK] 📥 Response 200 (1111ms)
  Response Size: 5.2 KB

✅ ✅ ✅ INTERNET SEARCH COMPLETED: Found 8 results

[2026-01-18T10:30:46.567Z] [NETWORK] 📤 Groq Request: POST
  Correlation ID: session_1705588800000_abc123_2
  URL: https://api.groq.com/openai/v1/chat/completions
  Request Size: 1.8 KB

[2026-01-18T10:30:48.789Z] [NETWORK] 📥 Response 200 (2222ms)
  Response Size: 3.4 KB

[2026-01-18T10:30:48.890Z] [SESSION] 📍 Agent Execution Completed (Workflow: my-research-workflow) (Agent: researcher)
  Details: {"outputLength":3456,"produced":["research_findings"]}

[2026-01-18T10:30:48.901Z] [NETWORK] 📤 Qdrant Request: PUT
  Correlation ID: session_1705588800000_abc123_3
  URL: http://localhost:6333/collections/auraflow_memory/points/upsert

[2026-01-18T10:30:49.012Z] [NETWORK] 📥 Response 200 (111ms)
  Response Size: 256 Bytes

  Output: Research findings compiled successfully...

[2/3] summary_step → summarizer (create_summary)

[2026-01-18T10:30:49.123Z] [SESSION] 📍 Agent Execution Started (Workflow: my-research-workflow) (Agent: summarizer)
  Details: {"role":"Content Summarizer","action":"create_summary"}

[2026-01-18T10:30:49.234Z] [NETWORK] 📤 Groq Request: POST
  Correlation ID: session_1705588800000_abc123_4
  URL: https://api.groq.com/openai/v1/chat/completions
  Request Size: 2.1 KB

[2026-01-18T10:30:51.456Z] [NETWORK] 📥 Response 200 (2222ms)
  Response Size: 2.8 KB

[2026-01-18T10:30:51.567Z] [SESSION] 📍 Agent Execution Completed (Workflow: my-research-workflow) (Agent: summarizer)
  Details: {"outputLength":1234,"produced":["summary"]}

[2026-01-18T10:30:51.678Z] [NETWORK] 📤 Qdrant Request: PUT
  Correlation ID: session_1705588800000_abc123_5
  URL: http://localhost:6333/collections/auraflow_memory/points/upsert

[2026-01-18T10:30:51.789Z] [NETWORK] 📥 Response 200 (111ms)
  Response Size: 256 Bytes

  Output: Summary created successfully...

[3/3] report_step → reporter (generate_report)

[2026-01-18T10:30:51.890Z] [SESSION] 📍 Agent Execution Started (Workflow: my-research-workflow) (Agent: reporter)
  Details: {"role":"Report Generator","action":"generate_report"}

[2026-01-18T10:30:52.001Z] [NETWORK] 📤 Groq Request: POST
  Correlation ID: session_1705588800000_abc123_6
  URL: https://api.groq.com/openai/v1/chat/completions
  Request Size: 1.9 KB

[2026-01-18T10:30:54.223Z] [NETWORK] 📥 Response 200 (2222ms)
  Response Size: 4.1 KB

[2026-01-18T10:30:54.334Z] [SESSION] 📍 Agent Execution Completed (Workflow: my-research-workflow) (Agent: reporter)
  Details: {"outputLength":4567,"produced":["final_report"]}

[2026-01-18T10:30:54.445Z] [NETWORK] 📤 Qdrant Request: PUT
  Correlation ID: session_1705588800000_abc123_7
  URL: http://localhost:6333/collections/auraflow_memory/points/upsert

[2026-01-18T10:30:54.556Z] [NETWORK] 📥 Response 200 (111ms)
  Response Size: 256 Bytes

  Output: Report generated successfully...

>>> SEQUENTIAL EXECUTION COMPLETED <<<

[2026-01-18T10:30:54.667Z] [SESSION] 📍 Workflow Execution Completed (Workflow: my-research-workflow)
  Details: {"type":"sequential","status":"success"}

>>> WORKFLOW COMPLETED SUCCESSFULLY <<<
Execution finished. Results shown above.

✓ Session logs saved to: workflow_outputs/logs/session_1705588800000_abc123_summary.json
```

## Generated Log Files

### workflow_outputs/logs/general.log
```
[2026-01-18T10:30:45.123Z] [SESSION] Workflow Execution Started
[2026-01-18T10:30:45.234Z] [SESSION] Agent Execution Started
[2026-01-18T10:30:46.456Z] [NETWORK] Response 200
[2026-01-18T10:30:48.890Z] [SESSION] Agent Execution Completed
[2026-01-18T10:30:49.123Z] [SESSION] Agent Execution Started
...
```

### workflow_outputs/logs/network.log
```
[2026-01-18T10:30:45.345Z] [NETWORK] Request (DuckDuckGo)
[2026-01-18T10:30:46.456Z] [NETWORK] Response 200 (1111ms)
[2026-01-18T10:30:46.567Z] [NETWORK] Request (Groq)
[2026-01-18T10:30:48.789Z] [NETWORK] Response 200 (2222ms)
[2026-01-18T10:30:48.901Z] [NETWORK] Request (Qdrant)
[2026-01-18T10:30:49.012Z] [NETWORK] Response 200 (111ms)
...
```

### workflow_outputs/logs/session.log
```
[2026-01-18T10:30:45.123Z] [SESSION] Workflow Execution Started
[2026-01-18T10:30:45.234Z] [SESSION] Agent Execution Started (researcher)
[2026-01-18T10:30:48.890Z] [SESSION] Agent Execution Completed (researcher)
[2026-01-18T10:30:49.123Z] [SESSION] Agent Execution Started (summarizer)
[2026-01-18T10:30:51.567Z] [SESSION] Agent Execution Completed (summarizer)
[2026-01-18T10:30:54.667Z] [SESSION] Workflow Execution Completed
```

### workflow_outputs/logs/session_1705588800000_abc123_summary.json
```json
{
  "sessionId": "session_1705588800000_abc123",
  "networkRequests": 7,
  "sessionEvents": 8,
  "totalNetworkTime": 9777,
  "logsDirectory": "/path/to/workflow_outputs/logs",
  "timestamp": "2026-01-18T10:30:55.000Z",
  "networkLogs": [
    {
      "timestamp": "2026-01-18T10:30:45.345Z",
      "sessionId": "session_1705588800000_abc123",
      "correlationId": "session_1705588800000_abc123_1",
      "method": "GET",
      "url": "https://api.duckduckgo.com/?q=AI+trends&format=json&no_html=1&skip_disambig=1",
      "provider": "DuckDuckGo",
      "requestSize": 28,
      "responseSize": 5325,
      "duration": 1111,
      "statusCode": 200,
      "status": "success"
    },
    {
      "timestamp": "2026-01-18T10:30:46.567Z",
      "sessionId": "session_1705588800000_abc123",
      "correlationId": "session_1705588800000_abc123_2",
      "method": "POST",
      "url": "https://api.groq.com/openai/v1/chat/completions",
      "provider": "Groq",
      "requestSize": 1843,
      "responseSize": 3481,
      "duration": 2222,
      "statusCode": 200,
      "status": "success"
    },
    {
      "timestamp": "2026-01-18T10:30:48.901Z",
      "sessionId": "session_1705588800000_abc123",
      "correlationId": "session_1705588800000_abc123_3",
      "method": "PUT",
      "url": "http://localhost:6333/collections/auraflow_memory/points/upsert",
      "provider": "Qdrant",
      "requestSize": 2048,
      "responseSize": 256,
      "duration": 111,
      "statusCode": 200,
      "status": "success"
    }
  ],
  "sessionLogs": [
    {
      "timestamp": "2026-01-18T10:30:45.123Z",
      "sessionId": "session_1705588800000_abc123",
      "event": "Workflow Execution Started",
      "workflowId": "my-research-workflow",
      "agentId": null,
      "stepId": null,
      "details": {
        "type": "sequential",
        "stopOnError": false,
        "stepsCount": 3
      }
    },
    {
      "timestamp": "2026-01-18T10:30:45.234Z",
      "sessionId": "session_1705588800000_abc123",
      "event": "Agent Execution Started",
      "workflowId": "my-research-workflow",
      "agentId": "researcher",
      "stepId": "research_step",
      "details": {
        "role": "Research Analyst",
        "action": "search_topic"
      }
    },
    {
      "timestamp": "2026-01-18T10:30:48.890Z",
      "sessionId": "session_1705588800000_abc123",
      "event": "Agent Execution Completed",
      "workflowId": "my-research-workflow",
      "agentId": "researcher",
      "stepId": "research_step",
      "details": {
        "outputLength": 3456,
        "produced": ["research_findings"]
      }
    }
  ]
}
```

## Analysis Examples

### Query Network Logs
```json
{
  "totalRequests": 7,
  "requestsByProvider": {
    "Groq": 3,
    "Qdrant": 3,
    "DuckDuckGo": 1
  },
  "totalNetworkTime": 9777,
  "averageLatency": 1397,
  "successRate": "100%",
  "failedRequests": 0,
  "totalDataTransferred": {
    "sent": 8218,
    "received": 11949
  }
}
```

### Session Timeline
```
10:30:45 - Workflow started
10:30:45 - Researcher agent started
10:30:46 - Web search completed (1111ms)
10:30:48 - LLM response received (2222ms)
10:30:48 - Memory save completed (111ms)
10:30:48 - Researcher agent completed
10:30:49 - Summarizer agent started
10:30:51 - LLM response received (2222ms)
10:30:51 - Summarizer agent completed
10:30:51 - Reporter agent started
10:30:54 - LLM response received (2222ms)
10:30:54 - Reporter agent completed
10:30:54 - Workflow completed successfully
```
