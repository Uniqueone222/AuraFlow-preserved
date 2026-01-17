"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMClient = void 0;
const groq_sdk_1 = __importDefault(require("groq-sdk"));
const chalk_1 = __importDefault(require("chalk"));
// Track if the client has been initialized to prevent duplicate logs
let isInitialized = false;
/**
 * Model-agnostic LLM client using Groq API
 */
class LLMClient {
    client;
    model;
    constructor() {
        const GROQ_API_KEY = process.env.GROQ_API_KEY;
        // Validate API key is set
        if (!GROQ_API_KEY) {
            throw new Error('GROQ_API_KEY environment variable is not set. ' +
                'Please configure it in your .env file or set it as an environment variable.');
        }
        this.client = new groq_sdk_1.default({ apiKey: GROQ_API_KEY });
        this.model = process.env.CURRENT_AI_MODEL || 'llama-3.1-8b-instant';
        if (!isInitialized) {
            console.log(chalk_1.default.green('INITIALIZATION'));
            console.log(chalk_1.default.green('-------------'));
            console.log(chalk_1.default.green('✓ Groq client initialized'));
            console.log(chalk_1.default.green(`✓ API Key: ${GROQ_API_KEY.substring(0, 15)}...`));
            console.log(chalk_1.default.green(`✓ Model: ${this.model}`));
            isInitialized = true;
        }
    }
    async generate(prompt) {
        try {
            console.log(chalk_1.default.green(`✓ Using model: ${this.model}`));
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
            // Provide more detailed error information
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
            console.error(chalk_1.default.red(`✘ Groq API Error: ${errorMessage}`));
            console.error(chalk_1.default.dim(`Status: ${error.status || 'unknown'}`));
            throw new Error(`LLM Generation failed: ${errorMessage}`);
        }
    }
}
exports.LLMClient = LLMClient;
//# sourceMappingURL=LLMClient.js.map