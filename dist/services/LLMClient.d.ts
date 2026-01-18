/**
 * Multi-provider LLM client supporting Groq, Gemini, and OpenAI
 */
export declare class LLMClient {
    private provider;
    private client;
    private gemini;
    private openai;
    private model;
    constructor();
    private initializeGroq;
    private initializeGemini;
    private initializeOpenAI;
    generate(prompt: string): Promise<string>;
    private generateGroq;
    private generateGemini;
    private generateOpenAI;
}
