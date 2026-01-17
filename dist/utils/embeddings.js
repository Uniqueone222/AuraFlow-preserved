"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.embed = embed;
const transformers_1 = require("@xenova/transformers");
let embedder = null;
async function embed(text) {
    if (!embedder) {
        embedder = await (0, transformers_1.pipeline)("feature-extraction", "Xenova/all-MiniLM-L6-v2");
    }
    const output = await embedder(text, {
        pooling: "mean",
        normalize: true
    });
    return Array.from(output.data);
}
//# sourceMappingURL=embeddings.js.map