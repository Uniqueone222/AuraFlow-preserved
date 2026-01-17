# AuraFlow – Usage Guide

This document explains how to use AuraFlow.

## 1. Define Agents

```yaml
agents:
  - id: researcher
    role: Research Assistant
    goal: Find insights
```

## 2. Define Workflow

### Sequential
```yaml
workflow:
  type: sequential
  steps:
    - agent: researcher
```

### Parallel
```yaml
workflow:
  type: parallel
  branches:
    - backend
    - frontend
  then:
    agent: reviewer
```

## 3. Run AuraFlow

```bash
node dist/index.js path/to/workflow.yaml
```

The engine validates, executes, and prints results.
