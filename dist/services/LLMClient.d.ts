/**
 * Tool definition for function calling
 */
export interface ToolDefinition {
    name: string;
    description: string;
    parameters: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}
/**
 * Multi-provider LLM client supporting Groq, Gemini, and OpenAI
 */
export declare class LLMClient {
    private provider;
    private client;
    private gemini;
    private openai;
    private model;
    private tools;
    private logger;
    constructor();
    private initializeGroq;
    private initializeGemini;
    private initializeOpenAI;
    /**
     * Register tools for function calling
     */
    registerTools(tools: ToolDefinition[]): void;
    /**
     * Generate response with potential tool calls
     */
    generateWithTools(prompt: string, tools: ToolDefinition[]): Promise<any>;
    generate(prompt: string): Promise<string>;
    private generateGroq;
    private generateGemini;
    private generateGeminiWithTools;
    private convertToolsToGeminiFunctions;
    private generateOpenAI;
    private generateOpenAIWithTools;
    private generateGroqWithTools;
}
