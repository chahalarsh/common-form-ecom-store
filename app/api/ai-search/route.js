import connectDB from "@/lib/db";
import product from "@/models/product";
import OpenAI from "openai";

let client;

function cosineSimilarity(left, right) {
    if (left.length !== right.length) {
        return null;
    }

    let dotProduct = 0;
    let leftMagnitude = 0;
    let rightMagnitude = 0;

    for (let index = 0; index < left.length; index += 1) {
        dotProduct += left[index] * right[index];
        leftMagnitude += left[index] ** 2;
        rightMagnitude += right[index] ** 2;
    }

    if (leftMagnitude === 0 || rightMagnitude === 0) {
        return null;
    }

    return dotProduct / (Math.sqrt(leftMagnitude) * Math.sqrt(rightMagnitude));
}

export async function POST(request) {
    try {
        const { query } = await request.json();

        if (typeof query !== "string" || !query.trim()) {
            return Response.json({ error: "Enter a product search term." }, { status: 400 });
        }

        if (!process.env.OPENROUTER_API_KEY) {
            throw new Error("OPENROUTER_API_KEY is not configured.");
        }

        client ??= new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });

        const embeddingResponse = await client.embeddings.create({
            model: "openai/text-embedding-3-small",
            input: query.trim(),
        });
        const queryEmbedding = embeddingResponse.data[0]?.embedding;

        if (
            !Array.isArray(queryEmbedding) ||
            queryEmbedding.length === 0 ||
            queryEmbedding.some((value) => !Number.isFinite(value))
        ) {
            throw new Error("OpenRouter returned an invalid query embedding.");
        }

        await connectDB();
        const productsWithEmbeddings = await product.find({
            embedding: { $exists: true, $ne: [] },
        }).lean();

        const semanticResults = productsWithEmbeddings
            .map((item) => ({
                item,
                score: cosineSimilarity(queryEmbedding, item.embedding),
            }))
            .filter(({ score }) => score !== null)
            .sort((left, right) => right.score - left.score)
            .slice(0, 10);

        const products = semanticResults.map(({ item }) => {
            const responseProduct = { ...item };
            delete responseProduct.embedding;
            return responseProduct;
        });

        return Response.json(products);
    } catch (error) {
        console.error("AI product search failed:", error);
        return Response.json(
            { error: "Product search failed. Check the server logs for details." },
            { status: 500 },
        );
    }
}