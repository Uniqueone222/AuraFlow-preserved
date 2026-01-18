/**
 * Multi-Provider LLM Client
 * Supports: Groq, OpenAI, Gemini
 * 
 * This is a GUIDE for how to add support for OpenAI and Gemini
 * Current implementation uses Groq only
 */

// INSTALLATION REQUIRED FOR OTHER PROVIDERS:
// npm install openai                  # For OpenAI (GPT-4, GPT-3.5)
// npm install @google/generative-ai   # For Gemini

/*
═══════════════════════════════════════════════════════════════
EXAMPLE: How to use different providers
═══════════════════════════════════════════════════════════════

# For Groq (Current - No changes needed)
GROQ_API_KEY=gsk_...
CURRENT_AI_MODEL=llama-3.1-8b-instant
LLM_PROVIDER=groq

# For OpenAI
OPENAI_API_KEY=sk_...
CURRENT_AI_MODEL=gpt-4
LLM_PROVIDER=openai

# For Gemini
GEMINI_API_KEY=AIza...
CURRENT_AI_MODEL=gemini-pro
LLM_PROVIDER=gemini

═══════════════════════════════════════════════════════════════
*/

// STEP-BY-STEP: Add OpenAI Support
// ═══════════════════════════════════════════════════════════════

/*
1. Install package:
   npm install openai

2. Update .env or YAML config:
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk_your_key_here
   CURRENT_AI_MODEL=gpt-4

3. Add to CLI config loading (src/cli.ts):
   if (apiKeys.openai) {
     process.env.OPENAI_API_KEY = apiKeys.openai;
   }
   if (apiKeys.llm_provider) {
     process.env.LLM_PROVIDER = apiKeys.llm_provider;
   }

4. Update LLMClient to handle multiple providers:
   - Check LLM_PROVIDER env var
   - Load appropriate SDK (Groq, OpenAI, or Gemini)
   - Adapt generate() method for each API

5. Example LLMClient change:
   
   constructor() {
     const provider = process.env.LLM_PROVIDER || 'groq';
     
     if (provider === 'openai') {
       const OpenAI = require('openai');
       this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
     } else if (provider === 'gemini') {
       const { GoogleGenerativeAI } = require('@google/generative-ai');
       this.gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
     } else {
       const Groq = require('groq-sdk');
       this.client = new Groq({ apiKey: process.env.GROQ_API_KEY });
     }
     this.provider = provider;
   }
   
   async generate(prompt: string) {
     if (this.provider === 'openai') {
       return await this.generateOpenAI(prompt);
     } else if (this.provider === 'gemini') {
       return await this.generateGemini(prompt);
     } else {
       return await this.generateGroq(prompt);
     }
   }

═══════════════════════════════════════════════════════════════
*/

export const LLM_PROVIDER_GUIDE = {
  groq: {
    name: 'Groq',
    package: 'groq-sdk',
    installed: true,
    apiKeyEnv: 'GROQ_API_KEY',
    models: [
      'llama-3.1-8b-instant',
      'mixtral-8x7b-32768',
      'gemma-7b-it'
    ],
    cost: 'Free tier + paid',
    speed: 'Fast',
    docUrl: 'https://console.groq.com/docs'
  },
  openai: {
    name: 'OpenAI',
    package: 'openai',
    installed: true,
    apiKeyEnv: 'OPENAI_API_KEY',
    models: [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-3.5-turbo'
    ],
    cost: 'Paid only',
    speed: 'Fast',
    docUrl: 'https://platform.openai.com/docs'
  },
  gemini: {
    name: 'Google Gemini',
    package: '@google/generative-ai',
    installed: true,
    apiKeyEnv: 'GEMINI_API_KEY',
    models: [
      'gemini-pro',
      'gemini-1.5-pro',
      'gemini-1.5-flash'
    ],
    cost: 'Free tier + paid',
    speed: 'Fast',
    docUrl: 'https://ai.google.dev'
  }
};
