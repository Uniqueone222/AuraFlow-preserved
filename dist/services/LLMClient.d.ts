/**
 * Model-agnostic LLM client using Groq API
 */
export declare class LLMClient {
    private client;
    private model;
    constructor();
    generate(prompt: string): Promise<string>;
}
