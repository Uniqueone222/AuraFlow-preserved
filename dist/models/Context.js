"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Context = void 0;
const QdrantMemoryProvider_1 = require("../memory/QdrantMemoryProvider");
const Logger_1 = require("../utils/Logger");
/**
 * Represents shared context between agents in a workflow.
 * Contains an ordered list of messages and shared outputs.
 */
class Context {
    memory;
    logger;
    sessionId;
    /**
     * Ordered list of messages that agents can read
     */
    messages;
    /**
     * Map of shared outputs that agents can contribute to
     */
    outputs;
    /**
     * Creates a new Context instance with empty messages and outputs
     */
    constructor() {
        this.messages = [];
        this.outputs = new Map();
        this.logger = Logger_1.Logger.getInstance();
        this.sessionId = this.logger.getSessionId();
        this.memory =
            process.env.MEMORY_BACKEND === "qdrant"
                ? new QdrantMemoryProvider_1.QdrantMemoryProvider()
                : undefined; // fallback handled later
        this.logger.log(require('../utils/Logger').LogLevel.INFO, "🧠 Memory backend initialized", {
            backend: process.env.MEMORY_BACKEND,
            hasQdrantUrl: !!process.env.QDRANT_URL,
            hasQdrantKey: !!process.env.QDRANT_API_KEY
        });
    }
    /**
     * Adds a message to the shared context
     * @param agentId - ID of the agent adding the message
     * @param content - Content of the message
     */
    addMessage(agentId, content) {
        const message = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            agentId,
            content,
            timestamp: new Date()
        };
        this.messages.push(message);
    }
    /**
     * Retrieves all messages from the shared context
     * @returns Array of all messages in chronological order
     */
    getMessages() {
        return [...this.messages]; // Return a copy to prevent external mutation
    }
    /**
     * Adds or updates an output in the shared context
     * @param key - Key to store the output under
     * @param value - Value of the output
     */
    setOutput(key, value) {
        this.outputs.set(key, value);
    }
    /**
     * Retrieves an output from the shared context
     * @param key - Key of the output to retrieve
     * @returns Value of the output or undefined if not found
     */
    getOutput(key) {
        return this.outputs.get(key);
    }
}
exports.Context = Context;
//# sourceMappingURL=Context.js.map