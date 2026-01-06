import { Router } from "express"
import { connectToMongo } from "../config/mongo"

const router = Router()

router.get("/", async (req, res) => {
    try {
        const { knowledgeNodes, knowledgeEdges } = await connectToMongo()
        const showCalendar = req.query.showCalendar === 'true'

        const nodeQuery = showCalendar ? {} : { "metadata.source": { $ne: 'calendar' } }

        const nodes = await knowledgeNodes.find(nodeQuery).toArray()
        // Determine edge filtering strategy:
        // Ideally filter edges where source/target nodes are excluded.
        // For now, fetching all edges is acceptable as React Flow handles missing nodes well,
        // or we can just return them. Strict edge filtering would require finding all valid node IDs first.
        const edges = await knowledgeEdges.find({}).toArray()

        // Clean up _id for frontend
        const safeNodes = nodes.map((n: any) => {
            const { _id, ...rest } = n
            return rest
        })

        const safeEdges = edges.map((e: any) => {
            const { _id, ...rest } = e
            return rest
        })

        res.json({
            knowledgeNodes: safeNodes,
            knowledgeEdges: safeEdges
        })
    } catch (err: any) {
        console.error(err)
        res.status(500).json({ error: err.message })
    }
})

import { analyzeWhiteboardImage } from "../services/whiteboard-analysis";
import { HumanMessage } from "@langchain/core/messages";
import { graph } from "../services/graph/workflow";

router.post("/analyze-whiteboard", async (req, res) => {
    try {
        const { image } = req.body; // Base64 string
        if (!image) {
            return res.status(400).json({ error: "Image is required (base64)" });
        }

        console.log("Analyze request received, length:", image.length);
        const result = await analyzeWhiteboardImage(image);
        res.json(result);
    } catch (error) {
        console.error("Whiteboard Analysis Route Error:", error);
        res.status(500).json({ error: "Analysis failed" });
    }
});

router.post("/chat", async (req, res) => {
    try {
        const { message, history } = req.body;
        // history could be passed as state messages

        // For simplicity, we just take the new message and assume stateless or limited history for now
        // In a real app, you'd load conversation history
        const input = {
            messages: [new HumanMessage(message)],
            intent: req.body.intent // e.g. "search"
        };

        const result = await graph.invoke(input);

        res.json({
            graphState: result
        });
    } catch (error) {
        console.error("Graph Error:", error);
        res.status(500).json({ error: "Graph processing failed" });
    }
});

export default router
