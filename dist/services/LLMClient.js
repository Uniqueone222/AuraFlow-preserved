"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const generative_ai_1 = require("@google/generative-ai");
const chalk_1 = __importDefault(require("chalk"));
// Track if the client has been initialized to prevent duplicate logs
let isInitialized = false;
/**
 * Multi-provider LLM client supporting Groq and Gemini
 */
class LLMClient {
    provider;
    client;
    gemini;
    model;
    constructor() {
        this.provider = process.env.LLM_PROVIDER || 'groq';
        this.model = process.env.CURRENT_AI_MODEL || 'llama-3.1-8b-instant';
        // Initialize provider-specific client
        if (this.provider === 'gemini') {
            this.initializeGemini();
        }
        else if (this.provider === 'groq') {
            this.initializeGroq();
        }
        else {
            throw new Error(`Unsupported LLM provider: ${this.provider}`);
        }
        if (!isInitialized) {
            console.log(chalk_1.default.green('INITIALIZATION'));
            console.log(chalk_1.default.green('-------------'));
            console.log(chalk_1.default.green(`✓ ${this.provider.charAt(0).toUpperCase() + this.provider.slice(1)} client initialized`));
            console.log(chalk_1.default.green(`✓ Model: ${this.model}`));
            isInitialized = true;
        }
    }
    initializeGroq() {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set. ' +
                'Please configure it in your .env file or set it as an environment variable.');
        }
        this.client = new groq_sdk_1.default({ apiKey: GROQ_API_KEY });
    }
    initializeGemini() {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY environment variable is not set. ' +
                'Please configure it in your .env file or set it as an environment variable.');
        }
        this.gemini = new generative_ai_1.GoogleGenerativeAI(GEMINI_API_KEY);
    }
    async generate(prompt) {
        try {
            console.log(chalk_1.default.green(`✓ Using model: ${this.model}`));
            if (this.provider === 'gemini') {
                return await this.generateGemini(prompt);
            }
            else {
                return await this.generateGroq(prompt);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`✘ LLM API Error: ${error.message}`));
            throw error;
        }
    }
    async generateGroq(prompt) {
        try {
            const chatCompletion = await this.client.chat.completions.create({
                messages: [
                    { role: 'user', content: prompt }
                ],
                model: this.model
            });
            const response = chatCompletion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('Empty response from Groq API');
            }
            return response;
        }
        catch (error) {
            let errorMessage = error.message || 'Unknown error';
            if (error.status === 404) {
                errorMessage = `Model '${this.model}' not found or not available with your API key. Check your Groq account and model name.`;
            }
            else if (error.status === 401) {
                errorMessage = 'Invalid or expired Groq API key. Please check your GROQ_API_KEY.';
            }
            else if (error.status === 429) {
                errorMessage = 'Rate limit exceeded. Please try again later.';
            }
            else if (error.status === 500) {
                errorMessage = 'Groq API server error. Please try again later.';
            }
            console.error(chalk_1.default.dim(`Status: ${error.status || 'unknown'}`));
            throw new Error(`Groq Generation failed: ${errorMessage}`);
        }
    }
    async generateGemini(prompt) {
        try {
            const model = this.gemini.getGenerativeModel({ model: this.model });
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            if (!response) {
                throw new Error('Empty response from Gemini API');
            }
            return response;
        }
        catch (error) {
            let errorMessage = error.message || 'Unknown error';
            if (error.message?.includes('RESOURCE_EXHAUSTED')) {
                errorMessage = 'Rate limit exceeded on Gemini API. Please try again later.';
            }
            else if (error.message?.includes('PERMISSION_DENIED')) {
                errorMessage = 'Invalid or expired Gemini API key. Please check your GEMINI_API_KEY.';
            }
            else if (error.message?.includes('NOT_FOUND')) {
                errorMessage = `Model '${this.model}' not found. Available Gemini models: gemini-1.5-pro, gemini-1.5-flash`;
            }
            throw new Error(`Gemini Generation failed: ${errorMessage}`);
        }
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=LLMClient.js.map