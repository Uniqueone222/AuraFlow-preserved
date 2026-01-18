"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const generative_ai_1 = require("@google/generative-ai");
const openai_1 = __importDefault(require("openai"));
const chalk_1 = __importDefault(require("chalk"));
// Track if the client has been initialized to prevent duplicate logs
let isInitialized = false;
/**
 * Multi-provider LLM client supporting Groq, Gemini, and OpenAI
 */
class LLMClient {
    provider;
    client;
    gemini;
    openai;
    model;
    tools = [];
    constructor() {
        this.provider = process.env.LLM_PROVIDER || 'groq';
        this.model = process.env.CURRENT_AI_MODEL || 'llama-3.1-8b-instant';
        // Initialize provider-specific client
        if (this.provider === 'gemini') {
            this.initializeGemini();
        }
        else if (this.provider === 'openai') {
            this.initializeOpenAI();
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
    initializeOpenAI() {
        const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
        if (!OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set. ' +
                'Please configure it in your .env file or set it as an environment variable.');
        }
        this.openai = new openai_1.default({ apiKey: OPENAI_API_KEY });
    }
    /**
     * Register tools for function calling
     */
    registerTools(tools) {
        this.tools = tools;
    }
    /**
     * Generate response with potential tool calls
     */
    async generateWithTools(prompt, tools) {
        this.tools = tools;
        try {
            console.log(chalk_1.default.green(`✓ Using model: ${this.model}`));
            if (this.provider === 'gemini') {
                return await this.generateGeminiWithTools(prompt);
            }
            else if (this.provider === 'openai') {
                return await this.generateOpenAIWithTools(prompt);
            }
            else {
                return await this.generateGroqWithTools(prompt);
            }
        }
        catch (error) {
            console.error(chalk_1.default.red(`✘ LLM API Error: ${error.message}`));
            throw error;
        }
    }
    async generate(prompt) {
        try {
            console.log(chalk_1.default.green(`✓ Using model: ${this.model}`));
            if (this.provider === 'gemini') {
                return await this.generateGemini(prompt);
            }
            else if (this.provider === 'openai') {
                return await this.generateOpenAI(prompt);
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
    async generateGeminiWithTools(prompt) {
        try {
            const model = this.gemini.getGenerativeModel({
                model: this.model,
                tools: this.tools.length > 0 ? [{ functionDeclarations: this.convertToolsToGeminiFunctions() }] : undefined
            });
            const result = await model.generateContent(prompt);
            const response = result.response;
            // Check if there are tool calls
            if (response.functionCalls?.length > 0) {
                return {
                    type: 'tool_calls',
                    toolCalls: response.functionCalls.map((call) => ({
                        name: call.name,
                        arguments: call.args || {}
                    })),
                    rawResponse: response
                };
            }
            // Return text response
            const text = response.text();
            return {
                type: 'text',
                content: text,
                rawResponse: response
            };
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
            throw new Error(`Gemini Generation with tools failed: ${errorMessage}`);
        }
    }
    convertToolsToGeminiFunctions() {
        return this.tools.map(tool => ({
            name: tool.name,
            description: tool.description,
            parameters: {
                type: 'OBJECT',
                properties: tool.parameters.properties,
                required: tool.parameters.required
            }
        }));
    }
    async generateOpenAI(prompt) {
        try {
            const chatCompletion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'user', content: prompt }
                ],
                model: this.model
            });
            const response = chatCompletion.choices[0]?.message?.content;
            if (!response) {
                throw new Error('Empty response from OpenAI API');
            }
            return response;
        }
        catch (error) {
            let errorMessage = error.message || 'Unknown error';
            if (error.status === 404) {
                errorMessage = `Model '${this.model}' not found. Available models: gpt-4, gpt-4-turbo, gpt-3.5-turbo`;
            }
            else if (error.status === 401) {
                errorMessage = 'Invalid or expired OpenAI API key. Please check your OPENAI_API_KEY.';
            }
            else if (error.status === 429) {
                errorMessage = 'Rate limit exceeded on OpenAI API. Please try again later.';
            }
            else if (error.status === 500) {
                errorMessage = 'OpenAI API server error. Please try again later.';
            }
            console.error(chalk_1.default.dim(`Status: ${error.status || 'unknown'}`));
            throw new Error(`OpenAI Generation failed: ${errorMessage}`);
        }
    }
    async generateOpenAIWithTools(prompt) {
        try {
            const tools = this.tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            }));
            const chatCompletion = await this.openai.chat.completions.create({
                messages: [
                    { role: 'user', content: prompt }
                ],
                model: this.model,
                tools: tools.length > 0 ? tools : undefined,
                tool_choice: tools.length > 0 ? 'auto' : undefined
            });
            const message = chatCompletion.choices[0]?.message;
            // Check if there are tool calls
            if (message?.tool_calls?.length > 0) {
                return {
                    type: 'tool_calls',
                    toolCalls: message.tool_calls.map((call) => ({
                        name: call.function.name,
                        arguments: JSON.parse(call.function.arguments)
                    })),
                    rawResponse: message
                };
            }
            return {
                type: 'text',
                content: message?.content || '',
                rawResponse: message
            };
        }
        catch (error) {
            let errorMessage = error.message || 'Unknown error';
            if (error.status === 404) {
                errorMessage = `Model '${this.model}' not found. Available models: gpt-4, gpt-4-turbo, gpt-3.5-turbo`;
            }
            else if (error.status === 401) {
                errorMessage = 'Invalid or expired OpenAI API key. Please check your OPENAI_API_KEY.';
            }
            else if (error.status === 429) {
                errorMessage = 'Rate limit exceeded on OpenAI API. Please try again later.';
            }
            else if (error.status === 500) {
                errorMessage = 'OpenAI API server error. Please try again later.';
            }
            console.error(chalk_1.default.dim(`Status: ${error.status || 'unknown'}`));
            throw new Error(`OpenAI Generation with tools failed: ${errorMessage}`);
        }
    }
    async generateGroqWithTools(prompt) {
        try {
            const tools = this.tools.map(tool => ({
                type: 'function',
                function: {
                    name: tool.name,
                    description: tool.description,
                    parameters: tool.parameters
                }
            }));
            const chatCompletion = await this.client.chat.completions.create({
                messages: [
                    { role: 'user', content: prompt }
                ],
                model: this.model,
                tools: tools.length > 0 ? tools : undefined
            });
            const message = chatCompletion.choices[0]?.message;
            // Check if there are tool calls
            if (message?.tool_calls?.length > 0) {
                return {
                    type: 'tool_calls',
                    toolCalls: message.tool_calls.map((call) => ({
                        name: call.function.name,
                        arguments: JSON.parse(call.function.arguments)
                    })),
                    rawResponse: message
                };
            }
            return {
                type: 'text',
                content: message?.content || '',
                rawResponse: message
            };
        }
        catch (error) {
            let errorMessage = error.message || 'Unknown error';
            if (error.status === 404) {
                errorMessage = `Model '${this.model}' not found or not available with your API key.`;
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
            throw new Error(`Groq Generation with tools failed: ${errorMessage}`);
        }
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=LLMClient.js.map