import connectDB from "@/lib/db";
import product from "@/models/product";
import OpenAI from "openai";

let client;

function parseKeywords(content) {
    const terms = content
        .replace(/```(?:json)?/gi, "")
        .replace(/```/g, "")
        .split(/[\r\n,;]+/)
        .flatMap((line) =>
            line
                .replace(/^\s*(?:[-*]|\d+[.)])\s*/, "")
                .replace(/^\s*keywords?\s*:\s*/i, "")
                .split(/\s+/),
        )
        .map((term) => term.replace(/^[\s"'`[\]{}().:]+|[\s"'`[\]{}().:]+$/g, ""))
        .filter(Boolean);

    return [...new Set(terms)].slice(0, 20);
}

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function POST(request) {
    try {
        const { query, aiSearch } = await request.json();

        if (typeof query !== "string" || !query.trim()) {
            return Response.json({ error: "Enter a product search term." }, { status: 400 });
        }

        let keyword;

        if (aiSearch) {
            if (!process.env.OPENROUTER_API_KEY) {
                throw new Error("OPENROUTER_API_KEY is not configured.");
            }

            client ??= new OpenAI({
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: process.env.OPENROUTER_API_KEY,
            });

            const apiResponse = await client.chat.completions.create({
                model: "qwen/qwen3.8-27b",
                messages: [
                    {
                        role: "system",
                        content:
                            "You generate product-search keywords for a footwear store. Return only relevant footwear keywords, one word per line, with no numbering or explanation. Provide at least 10 keywords.",
                    },
                    {
                        role: "user",
                        content: query,
                    },
                ],
                reasoning: { enabled: false },
            });
            const content = apiResponse.choices[0]?.message?.content?.trim();

            if (!content) {
                throw new Error("OpenRouter returned empty product keywords.");
            }

            keyword = parseKeywords(content);
            if (keyword.length === 0) {
                throw new Error("OpenRouter returned no usable product keywords.");
            }
        } else {
            keyword = [query.trim()];
        }

        await connectDB();
        const products = await product.find({
            $or: keyword.map((term) => ({
                title: { $regex: escapeRegex(term), $options: "i" },
            })),
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