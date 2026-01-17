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
exports.FileMemoryProvider = void 0;
const fs_1 = require("fs");
const path = __importStar(require("path"));
/**
 * File-based persistent memory provider
 * Stores workflow execution history as JSON files
 */
class FileMemoryProvider {
    storageDir;
    constructor(storageDir = './auraflow_memory') {
        this.storageDir = path.resolve(storageDir);
    }
    /**
     * Ensure storage directory exists
     */
    async ensureStorageDir() {
        try {
            await fs_1.promises.mkdir(this.storageDir, { recursive: true });
        }
        catch (error) {
            throw new Error(`Failed to create storage directory: ${error.message}`);
        }
    }
    /**
     * Get the path for a workflow's memory file
     */
    getWorkflowPath(workflowId) {
        return path.join(this.storageDir, `${workflowId}.json`);
    }
    /**
     * Load all entries for a workflow
     */
    async loadWorkflowEntries(workflowId) {
        try {
            const filePath = this.getWorkflowPath(workflowId);
            const content = await fs_1.promises.readFile(filePath, 'utf-8');
            return JSON.parse(content);
        }
        catch (error) {
            // File doesn't exist yet, return empty array
            if (error.code === 'ENOENT') {
                return [];
            }
            throw error;
        }
    }
    /**
     * Save all entries for a workflow
     */
    async saveWorkflowEntries(workflowId, entries) {
        try {
            const filePath = this.getWorkflowPath(workflowId);
            await fs_1.promises.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
        }
        catch (error) {
            throw new Error(`Failed to save workflow entries: ${error.message}`);
        }
    }
    /**
     * Save a single memory entry
     */
    async save(entry) {
        await this.ensureStorageDir();
        const entries = await this.loadWorkflowEntries(entry.workflowId);
        entries.push(entry);
        await this.saveWorkflowEntries(entry.workflowId, entries);
    }
    /**
     * Query memory entries by workflow and search term
     */
    async query(query, workflowId, limit = 10) {
        await this.ensureStorageDir();
        const entries = await this.loadWorkflowEntries(workflowId);
        // Simple text search - filter entries containing the query term
        const queryLower = query.toLowerCase();
        const filtered = entries.filter(entry => entry.content.toLowerCase().includes(queryLower) ||
            entry.agentId.toLowerCase().includes(queryLower));
        // Return most recent entries up to limit
        return filtered.slice(-limit).reverse();
    }
    /**
     * Get all entries for a workflow
     */
    async getAllEntries(workflowId) {
        await this.ensureStorageDir();
        return this.loadWorkflowEntries(workflowId);
    }
    /**
     * Clear all entries for a workflow
     */
    async clearWorkflow(workflowId) {
        try {
            const filePath = this.getWorkflowPath(workflowId);
            await fs_1.promises.unlink(filePath);
        }
        catch (error) {
            // File doesn't exist, ignore
            if (error.code !== 'ENOENT') {
                throw error;
            }
        }
    }
    /**
     * Get storage directory path
     */
    getStorageDir() {
        return this.storageDir;
    }
}
exports.FileMemoryProvider = FileMemoryProvider;
//# sourceMappingURL=FileMemoryProvider.js.map