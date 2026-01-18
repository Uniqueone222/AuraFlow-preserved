# OpenAI Support - Quick Start Guide

## ✅ Status: Live & Ready

OpenAI API support has been fully implemented and tested.

## Getting Your OpenAI API Key

1. Visit: https://platform.openai.com/api-keys
2. Sign in to your OpenAI account (create one if needed)
3. Click "Create new secret key"
4. Copy your API key (starts with `sk_...`)
5. Keep it secure - never commit to version control

## Method 1: Using Environment Variables

```bash
# Set environment variable
$env:OPENAI_API_KEY="sk_test_DUMMY_REPLACE_WITH_YOUR_KEY"
$env:LLM_PROVIDER="openai"
$env:CURRENT_AI_MODEL="gpt-3.5-turbo"

# Run workflow
node dist/cli.js run examples/openai-sequential-test.yaml
```

## Method 2: Using .env File

```env
OPENAI_API_KEY=sk_test_DUMMY_REPLACE_WITH_YOUR_KEY
LLM_PROVIDER=openai
CURRENT_AI_MODEL=gpt-3.5-turbo
```

Then run:
```bash
node dist/cli.js run examples/openai-sequential-test.yaml
```

## Method 3: YAML Configuration (Recommended)

Update your YAML workflow file with OpenAI config:

```yaml
id: my-openai-workflow
agents:
  - id: assistant
    role: AI Assistant
    goal: Help with tasks

workflow:
  type: sequential
  steps:
    - id: step1
      agent: assistant
      action: Do something with OpenAI

config:
  apiKeys:
    provider: openai
    openai: sk_test_DUMMY_REPLACE_WITH_YOUR_KEY
    model: gpt-4-turbo
    qdrant_url: http://localhost:6333
    qdrant_key: your-qdrant-key
```

Then run:
```bash
node dist/cli.js run my-openai-workflow.yaml
```

## Available OpenAI Models

| Model | Speed | Cost | Best For |
|-------|-------|------|----------|
| `gpt-4-turbo` | Fast | High | Complex reasoning, advanced tasks |
| `gpt-4` | Standard | Very High | Most advanced capabilities |
| `gpt-3.5-turbo` | ⚡ Fastest | Low | Quick tasks, high volume |

## Model Recommendations

**For Production:**
- `gpt-4-turbo`: Best balance of quality and cost
- `gpt-3.5-turbo`: Budget-friendly, fast

**For Research/Testing:**
- `gpt-4`: Most capable (highest cost)
- `gpt-3.5-turbo`: Good for prototyping

## Switching Between Providers

All three providers (Groq, Gemini, OpenAI) work interchangeably:

```bash
# Use Groq (free tier available)
$env:LLM_PROVIDER="groq"
$env:GROQ_API_KEY="gsk_..."
$env:CURRENT_AI_MODEL="llama-3.1-8b-instant"

# Use Gemini (free tier available)
$env:LLM_PROVIDER="gemini"
$env:GEMINI_API_KEY="AIza..."
$env:CURRENT_AI_MODEL="gemini-1.5-flash"

# Use OpenAI (paid only)
$env:LLM_PROVIDER="openai"
$env:OPENAI_API_KEY="sk_..."
$env:CURRENT_AI_MODEL="gpt-3.5-turbo"
```

## Initialization Output

When using OpenAI, you'll see:
```
✓ Openai client initialized
✓ Model: gpt-3.5-turbo
✓ Using model: gpt-3.5-turbo
```

## Error Handling

**Invalid API Key:**
```
Invalid or expired OpenAI API key. Please check your OPENAI_API_KEY.
```
→ Check your API key at https://platform.openai.com/api-keys

**Model Not Found:**
```
Model 'gpt-5' not found. Available models: gpt-4, gpt-4-turbo, gpt-3.5-turbo
```
→ Use one of the available models above

**Rate Limited:**
```
Rate limit exceeded on OpenAI API. Please try again later.
```
→ Wait and retry, or upgrade your plan

**Insufficient Funds:**
```
You exceeded your current usage quota
```
→ Add billing method or increase quota at https://platform.openai.com/account/billing/overview

## Test Files

AuraFlow includes example OpenAI workflows:

- `examples/openai-sequential-test.yaml` - Sequential workflow
- `examples/openai-parallel-test.yaml` - Parallel workflow  
- `examples/openai-conditional-test.yaml` - Conditional workflow

Run with your real key:
```bash
$env:OPENAI_API_KEY="your-real-key"
node dist/cli.js run examples/openai-sequential-test.yaml
```

## Cost Optimization Tips

1. **Use gpt-3.5-turbo for simple tasks** - 10-50x cheaper than gpt-4
2. **Cache results** - Qdrant memory stores past results (via RAG)
3. **Batch operations** - Process multiple requests together
4. **Monitor usage** - Check https://platform.openai.com/account/usage

## Rate Limits by Plan

| Plan | RPM | TPM |
|------|-----|-----|
| Free Trial | 3 | 40,000 |
| Pay-as-you-go | 3,500 | 200,000 |
| Enterprise | Custom | Custom |

*RPM = Requests Per Minute, TPM = Tokens Per Minute*

## Architecture

The implementation uses:
- **SDK**: `openai` (Official OpenAI Node.js client)
- **LLMClient**: Multi-provider adapter supporting all three APIs
- **CLI**: Automatic config extraction from YAML
- **Error Handling**: Provider-specific error messages

## Billing Considerations

- **No free tier** - All requests charged
- **Pay-as-you-go** - No monthly minimum
- **By token** - Input tokens cost less than output tokens
- **Auto-billing** - Charges to your credit card

Monitor spending at: https://platform.openai.com/account/billing/usage

---

**For more details:** See [LLM_PROVIDER_GUIDE.ts](LLM_PROVIDER_GUIDE.ts)
