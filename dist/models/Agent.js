"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Agent = void 0;
const LLMClient_1 = require("../services/LLMClient");
/**
 * Represents an agent in the orchestration system.
 * An agent has a specific role, goal, and set of tools it can use.
 */
class Agent {
    /**
     * Unique identifier for the agent
     */
    id;
    /**
     * Role of the agent - describes what the agent is responsible for
     */
    role;
    /**
     * Goal that the agent is trying to achieve
     */
    goal;
    /**
     * Array of tools that the agent can use to accomplish its goal
     */
    tools;
    // Sub-agents that this agent can delegate to
    subAgents;
    // Tool registry for executing tools
    toolRegistry = null;
    llmClient = null;
    /**
     * Creates a new Agent instance
     * @param id - Unique identifier for the agent
     * @param role - Role of the agent
     * @param goal - Goal that the agent is trying to achieve
     * @param tools - Array of tools available to the agent
     * @param subAgents - Array of sub-agents
     * @param toolRegistry - Tool registry for executing tools
     */
    constructor(id, role, goal, tools, subAgents = [], toolRegistry = null) {
        this.id = id;
        this.role = role;
        this.goal = goal;
        this.tools = tools;
        this.subAgents = subAgents;
        this.toolRegistry = toolRegistry;
        // LLMClient will be initialized lazily when needed
    }
    /**
     * Runs the agent with the given context
     * @param context - The shared context containing messages
     * @returns Promise resolving to the agent's output
     */
    async run(context) {
        // Use the enhanced method that supports sub-agents
        return this.runWithSubAgents(context);
    }
    /**
     * Builds a prompt for the LLM using the agent's role, goal, and context
     * @param context - The shared context containing messages
     * @returns Formatted prompt string
     */
    async buildPrompt(context) {
        // Get all messages from the context
        const contextMessages = context.getMessages();
        const messages = contextMessages.map(msg => `[${msg.timestamp.toISOString()}] Agent ${msg.agentId}: ${msg.content}`).join('\n');
        // Format available sub-agents if they exist
        let subAgentsInfo = "";
        if (this.subAgents && this.subAgents.length > 0) {
            const subAgentList = this.subAgents.map(sa => `  - ${sa.id}: ${sa.role} (Goal: ${sa.goal})`).join('\n');
            subAgentsInfo = `

Available sub-agents you can delegate to:
${subAgentList}

If you need to delegate part of your task to a sub-agent, respond with: DELEGATE_TO:<sub_agent_id>:<task_description_for_sub_agent>`;
        }
        // Format available tools if they exist
        let toolsInfo = "";
        if (this.tools && this.tools.length > 0) {
            const toolList = this.tools.map(tool => `  - ${tool}`).join('\n');
            toolsInfo = `

[INTERNET ACCESS AVAILABLE]
Available tools:
${toolList}

You can use web_search to gather current information from the internet.`;
        }
        // --- AUTO-RAG INJECTION ---
        let ragContext = "";
        if (context.memory) {
            try {
                // Construct a query based on the agent's goal and the most recent context
                const lastMessage = contextMessages.length > 0 ? contextMessages[contextMessages.length - 1].content : "";
                const ragQuery = `Role: ${this.role}, Goal: ${this.goal}. Context: ${lastMessage.substring(0, 200)}`;
                console.log(`  🧠 Agent ${this.id} querying memory for context...`);
                const memories = await context.memory.query(ragQuery, 'all-workflows', 3); // Fetch top 3 relevant memories
                if (memories && memories.length > 0) {
                    const memoryContent = memories.map((m, i) => `Memory ${i + 1} (from Agent ${m.agentId} at ${new Date(m.timestamp).toISOString()}): ${m.content}`).join('\n\n');
                    ragContext = `
### 🧠 Relevant Past Memories
The following information was retrieved from your long-term memory (Qdrant) and may be relevant to your current task:

${memoryContent}
`;
                    console.log(`  ✓ Injected ${memories.length} memories into prompt`);
                }
            }
            catch (error) {
                console.warn(`  ⚠ Failed to query memory: ${error.message}`);
            }
        }
        // Construct the full prompt
        const prompt = `You are an AI agent with the following role: ${this.role}

Your goal is: ${this.goal}${subAgentsInfo}${toolsInfo}

${ragContext}

Current context:
${messages}

Do not ask questions. Complete the task independently and return a final answer.`;
        return prompt;
    }
    /**
     * Runs the agent with tools support, handling tool calls in a loop
     * @param context - The shared context containing messages
     * @returns Promise resolving to the agent's output
     */
    async runWithTools(context) {
        // Initialize the LLM client if not already done
        if (!this.llmClient) {
            this.llmClient = new LLMClient_1.LLMClient();
        }
        // Build tool definitions if tools are available
        const toolDefinitions = this.buildToolDefinitions();
        // Construct a prompt using the agent's role, goal, and the current context
        const prompt = await this.buildPrompt(context);
        let response;
        let iterations = 0;
        const maxIterations = 5; // Prevent infinite loops
        while (iterations < maxIterations) {
            iterations++;
            // Call the LLM client with tool definitions if available
            if (toolDefinitions.length > 0) {
                response = await this.llmClient.generateWithTools(prompt, toolDefinitions);
            }
            else {
                response = await this.llmClient.generate(prompt);
                response = { type: 'text', content: response };
            }
            // Handle tool calls
            if (response.type === 'tool_calls' && response.toolCalls?.length > 0) {
                console.log(`  📞 Agent ${this.id} received ${response.toolCalls.length} tool call(s)`);
                const toolResults = await this.processToolCalls(response.toolCalls);
                // Continue the conversation with tool results
                // In a real implementation, you'd append this to the conversation and call the LLM again
                // For now, we'll return the tool results as the final response
                return toolResults;
            }
            // If we get a text response, we're done
            if (response.type === 'text') {
                return response.content;
            }
            // If we get here, something unexpected happened
            break;
        }
        return response?.content || 'No response generated';
    }
    /**
     * Builds tool definitions from registered tools
     * @returns Array of tool definitions
     */
    buildToolDefinitions() {
        if (!this.tools || this.tools.length === 0 || !this.toolRegistry) {
            return [];
        }
        const toolDefs = [];
        for (const toolName of this.tools) {
            if (toolName === 'web_search') {
                toolDefs.push({
                    name: 'web_search',
                    description: 'Search the web for current information and news. Returns relevant search results with sources.',
                    parameters: {
                        type: 'object',
                        properties: {
                            query: {
                                type: 'string',
                                description: 'The search query to execute'
                            },
                            maxResults: {
                                type: 'number',
                                description: 'Maximum number of results to return (default: 5)'
                            }
                        },
                        required: ['query']
                    }
                });
            }
            else if (toolName === 'file_system') {
                toolDefs.push({
                    name: 'file_system',
                    description: 'Create, read, and manage files in the workflow_outputs directory.',
                    parameters: {
                        type: 'object',
                        properties: {
                            action: {
                                type: 'string',
                                enum: ['create', 'read', 'append', 'delete', 'list'],
                                description: 'The file operation to perform'
                            },
                            filePath: {
                                type: 'string',
                                description: 'Path to the file (relative to workflow_outputs)'
                            },
                            content: {
                                type: 'string',
                                description: 'Content to write (for create/append actions)'
                            }
                        },
                        required: ['action', 'filePath']
                    }
                });
            }
        }
        return toolDefs;
    }
    /**
     * Executes a tool call and returns the result
     * @param toolName - Name of the tool to execute
     * @param args - Arguments for the tool
     * @returns Promise resolving to the tool result
     */
    async executeTool(toolName, args) {
        if (!this.toolRegistry) {
            return `ERROR: Tool registry not available`;
        }
        try {
            if (toolName === 'web_search') {
                const result = await this.toolRegistry.executeTool('web_search', {
                    query: args.query,
                    maxResults: args.maxResults || 5
                });
                return JSON.stringify(result);
            }
            else if (toolName === 'file_system') {
                const result = await this.toolRegistry.executeTool('file_system', {
                    action: args.action,
                    filePath: args.filePath,
                    content: args.content
                });
                return JSON.stringify(result);
            }
            return `ERROR: Unknown tool ${toolName}`;
        }
        catch (error) {
            return `ERROR executing tool ${toolName}: ${error.message}`;
        }
    }
    /**
     * Processes tool calls from the LLM response and executes them
     * @param toolCalls - Array of tool calls to execute
     * @returns Formatted tool results
     */
    async processToolCalls(toolCalls) {
        const results = [];
        for (const toolCall of toolCalls) {
            const toolName = toolCall.name;
            const args = toolCall.arguments || {};
            console.log(`  🔧 Executing tool: ${toolName} with args:`, args);
            const result = await this.executeTool(toolName, args);
            results.push(`Tool: ${toolName}\nArguments: ${JSON.stringify(args)}\nResult: ${result}`);
        }
        return `Tool execution results:\n${results.join('\n---\n')}`;
    }
    /**
     * Checks if the agent's output contains a delegation instruction
     * @param output - The agent's output
     * @returns The delegation instruction if found, null otherwise
     */
    parseDelegation(output) {
        // Match DELEGATE_TO with flexible spacing
        const delegationMatch = output.match(/^\s*DELEGATE_TO:\s*(.+?)\s*:\s*(.+)/m);
        if (delegationMatch) {
            return {
                subAgentId: delegationMatch[1].trim(),
                task: delegationMatch[2].trim()
            };
        }
        return null;
    }
    /**
     * Runs the agent with the given context, handling potential sub-agent delegations and tool calls
     * @param context - The shared context containing messages
     * @returns Promise resolving to the agent's output
     */
    async runWithSubAgents(context) {
        // Initialize the LLM client if not already done
        if (!this.llmClient) {
            this.llmClient = new LLMClient_1.LLMClient();
        }
        // Check if agent has tools - if so, use the tools-enabled flow
        if (this.tools && this.tools.length > 0 && this.toolRegistry) {
            return this.runWithTools(context);
        }
        // Otherwise use the original delegation-based flow
        // Construct a prompt using the agent's role, goal, and the current context
        const prompt = await this.buildPrompt(context);
        // Call the LLM client to generate a response
        let response = await this.llmClient.generate(prompt);
        // Check if the response contains a delegation instruction
        const delegation = this.parseDelegation(response);
        if (delegation) {
            // Find the sub-agent to delegate to
            const subAgent = this.subAgents.find(sa => sa.id === delegation.subAgentId);
            if (subAgent) {
                // Create a temporary context for the sub-agent with the delegation task
                const subAgentContext = new (await Promise.resolve().then(() => __importStar(require('./Context')))).Context();
                // Add the delegation task to the sub-agent's context
                subAgentContext.addMessage(this.id, `Task delegated from parent agent: ${delegation.task}`);
                // Run the sub-agent with its own context
                const subAgentResponse = await subAgent.run(subAgentContext);
                // Add the sub-agent's response to the main context
                context.addMessage(subAgent.id, subAgentResponse);
                // Now have the parent agent respond to the original prompt with the sub-agent's result
                const followUpPrompt = `${prompt}

The sub-agent ${delegation.subAgentId} has completed the delegated task with the following result:
${subAgentResponse}

Now please continue with your original task using this information.`;
                response = await this.llmClient.generate(followUpPrompt);
            }
            else {
                // If sub-agent not found, return the original response without delegation
                response = `ERROR: Sub-agent ${delegation.subAgentId} not found. Original response: ${response}`;
            }
        }
        return response;
    }
}
exports.Agent = Agent;
//# sourceMappingURL=Agent.js.map