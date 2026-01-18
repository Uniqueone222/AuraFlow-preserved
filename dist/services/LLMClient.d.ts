/**
 * Multi-provider LLM client supporting Groq and Gemini
 */
export declare class LLMClient {
    private provider;
    private client;
    private gemini;
    private model;
    constructor();
    private initializeGroq;
    private initializeGemini;
    generate(prompt: string): Promise<string>;
    private generateGroq;
    private generateGemini;
}
