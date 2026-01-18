# Gemini Support - Quick Start Guide

## ✅ Status: Live & Ready

Gemini API support has been fully implemented and tested.

## Getting Your Gemini API Key

1. Visit: https://ai.google.dev
2. Click "Get API Key" 
3. Create a new project or select existing
4. Copy your API key (starts with `AIza...`)

## Method 1: Using Environment Variables

```bash
# Set environment variable
$env:GEMINI_API_KEY="AIzaSyDummy_Replace_With_Your_Key_1234567890"
$env:LLM_PROVIDER="gemini"
$env:CURRENT_AI_MODEL="gemini-1.5-flash"

# Run workflow
node dist/cli.js run examples/basic-sequential-example.yaml
```

## Method 2: Using .env File

```env
GEMINI_API_KEY=AIzaSyDummy_Replace_With_Your_Key_1234567890
LLM_PROVIDER=gemini
CURRENT_AI_MODEL=gemini-1.5-flash
```

Then run:
```bash
node dist/cli.js run examples/basic-sequential-example.yaml
```

## Method 3: YAML Configuration (Recommended)

Update your YAML workflow file with Gemini config:

```yaml
id: my-gemini-workflow
agents:
  - id: analyst
    role: Data Analyst
    goal: Analyze data

workflow:
  type: sequential
  steps:
    - id: step1
      agent: analyst
      action: Do something with Gemini

config:
  apiKeys:
    provider: gemini
    gemini: AIzaSyDummy_Replace_With_Your_Key_1234567890
    model: gemini-1.5-flash
    qdrant_url: http://localhost:6333
    qdrant_key: your-qdrant-key
```

Then run:
```bash
node dist/cli.js run my-gemini-workflow.yaml
```

## Available Gemini Models

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| `gemini-1.5-flash` | ⚡ Very Fast | Cheapest | Quick analysis, high volume |
| `gemini-1.5-pro` | Fast | Moderate | Complex reasoning |
| `gemini-pro` | Standard | Budget | General purpose |

## Switching Between Providers

All three providers (Groq, Gemini, OpenAI) can be used interchangeably:

```bash
# Use Groq
$env:LLM_PROVIDER="groq"
$env:GROQ_API_KEY="gsk_..."

# Use Gemini
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="AIza..."

# Use OpenAI (when implemented)
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_..."
```

## Initialization Output

When using Gemini, you'll see:
```
✓ Gemini client initialized
✓ Model: gemini-1.5-flash
✓ Using model: gemini-1.5-flash
```

## Error Handling

**Invalid API Key:**
```
API key not valid. Please pass a valid API key.
```
→ Check your GEMINI_API_KEY is correct

**Rate Limited:**
```
Rate limit exceeded on Gemini API
```
→ Wait a few seconds and retry

**Model Not Found:**
```
Model 'gemini-pro-vision' not found
```
→ Use one of the available models above

## Testing

Example test YAML file: `examples/gemini-test-demo.yaml`

Run with a valid key:
```bash
$env:GEMINI_API_KEY="your-real-key"
node dist/cli.js run examples/gemini-test-demo.yaml
```

## Architecture

The implementation uses:
- **SDK**: `@google/generative-ai` (Google's official package)
- **LLMClient**: Multi-provider adapter that auto-detects provider via `LLM_PROVIDER` env var
- **CLI**: Auto-extracts config from YAML `config.apiKeys` section
- **Error Handling**: Provider-specific error messages and recovery strategies

## Known Limitations

- Single provider per execution (set `LLM_PROVIDER` to one value)
- Gemini API key exposed in terminal history (use YAML config for security)
- No batch processing across multiple providers

## Future: Multi-Provider in One Workflow

Planned enhancement to support multiple providers simultaneously for comparative analysis.

---

**For more details:** See [LLM_PROVIDER_GUIDE.ts](LLM_PROVIDER_GUIDE.ts)
