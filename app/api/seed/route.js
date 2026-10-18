import connectDB from "@/lib/db";
import Product from "@/models/product";
import OpenAI from "openai";

export async function GET() {
    const products = [
            {
                id: 1,
                title: "Red Sneakers",
                description: "Classic red sneakers",
                price: 129.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 2,
                title: "Black Running Shoes",
                description: "Lightweight running shoes",
                price: 159.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 3,
                title: "White Casual Sneakers",
                description: "Clean and comfortable everyday sneakers",
                price: 99.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 4,
                title: "Brown Leather Boots",
                description: "Durable leather boots for everyday wear",
                price: 189.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 5,
                title: "Black Chelsea Boots",
                description: "Stylish slip-on Chelsea boots",
                price: 174.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 6,
                title: "Gray Walking Shoes",
                description: "Comfortable shoes for long walks",
                price: 119.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 7,
                title: "Blue High-Top Sneakers",
                description: "Classic high-top sneakers with ankle support",
                price: 139.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 8,
                title: "White Sports Shoes",
                description: "Breathable shoes for workouts and sports",
                price: 149.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 9,
                title: "Tan Hiking Boots",
                description: "Rugged boots designed for outdoor adventures",
                price: 219.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 10,
                title: "Black Slip-On Shoes",
                description: "Simple and comfortable slip-on shoes",
                price: 89.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 11,
                title: "Green Trail Sneakers",
                description: "Durable sneakers for trails and outdoor use",
                price: 164.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 12,
                title: "Beige Fashion Sneakers",
                description: "Modern sneakers with a minimalist design",
                price: 109.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 13,
                title: "Navy Blue Loafers",
                description: "Elegant loafers for casual and formal outfits",
                price: 154.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 14,
                title: "Red Basketball Shoes",
                description: "High-performance shoes with extra ankle support",
                price: 199.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 15,
                title: "Gray Training Shoes",
                description: "Flexible shoes built for gym workouts",
                price: 134.99,
                category: "Footwear",
                image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
            },

            {
                id: 16,
                title: "Classic Blue Jeans",
                description: "Timeless blue denim jeans with a comfortable fit",
                price: 79.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 17,
                title: "Black Slim Fit Jeans",
                description: "Modern slim-fit jeans in classic black",
                price: 84.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=900&q=80&sat=-40",
            },
            {
                id: 18,
                title: "White Cotton T-Shirt",
                description: "Soft and breathable everyday cotton t-shirt",
                price: 29.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 19,
                title: "Black Oversized T-Shirt",
                description: "Relaxed oversized t-shirt with a modern fit",
                price: 34.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 20,
                title: "Gray Hoodie",
                description: "Warm and comfortable hoodie for everyday wear",
                price: 59.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 21,
                title: "Navy Blue Hoodie",
                description: "Classic navy hoodie made from soft fleece",
                price: 64.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 22,
                title: "Red Polo Shirt",
                description: "Classic polo shirt suitable for casual occasions",
                price: 44.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 23,
                title: "Green Cargo Pants",
                description: "Durable cargo pants with multiple utility pockets",
                price: 69.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80&sat=-35",
            },
            {
                id: 24,
                title: "Beige Chinos",
                description: "Versatile chinos for casual and semi-formal outfits",
                price: 74.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 25,
                title: "Brown Leather Jacket",
                description: "Premium-style leather jacket with a classic design",
                price: 249.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 26,
                title: "Black Denim Jacket",
                description: "Classic black denim jacket for everyday styling",
                price: 89.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 27,
                title: "White Linen Shirt",
                description: "Lightweight linen shirt for warm weather",
                price: 54.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 28,
                title: "Blue Flannel Shirt",
                description: "Soft flannel shirt with a classic blue pattern",
                price: 49.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 29,
                title: "Gray Sweatpants",
                description: "Comfortable sweatpants for lounging and workouts",
                price: 44.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 30,
                title: "Black Joggers",
                description: "Lightweight joggers designed for everyday comfort",
                price: 49.99,
                category: "Clothing",
                image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
            },

            {
                id: 31,
                title: "Classic Wrist Watch",
                description: "Minimal wrist watch with a timeless design",
                price: 119.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 32,
                title: "Silver Analog Watch",
                description: "Elegant silver watch suitable for everyday wear",
                price: 149.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 33,
                title: "Black Digital Watch",
                description: "Modern digital watch with a sporty design",
                price: 69.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 34,
                title: "Leather Wallet",
                description: "Compact leather wallet with multiple card slots",
                price: 39.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 35,
                title: "Canvas Backpack",
                description: "Durable backpack suitable for school and travel",
                price: 59.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 36,
                title: "Black Travel Bag",
                description: "Spacious travel bag with multiple compartments",
                price: 79.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1622560480654-d96214fdc887?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 37,
                title: "Brown Leather Belt",
                description: "Classic leather belt with a durable metal buckle",
                price: 34.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 38,
                title: "Aviator Sunglasses",
                description: "Classic aviator sunglasses with a metal frame",
                price: 49.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 39,
                title: "Round Frame Sunglasses",
                description: "Modern round-frame sunglasses for everyday use",
                price: 44.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 40,
                title: "Baseball Cap",
                description: "Adjustable cotton baseball cap with a curved brim",
                price: 24.99,
                category: "Accessories",
                image: "https://images.unsplash.com/photo-1521369909029-2afed882baee?auto=format&fit=crop&w=900&q=80",
            },

            {
                id: 41,
                title: "Wireless Headphones",
                description: "Over-ear wireless headphones with immersive sound",
                price: 129.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 42,
                title: "Bluetooth Earbuds",
                description: "Compact wireless earbuds with a charging case",
                price: 89.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 43,
                title: "Mechanical Keyboard",
                description: "Mechanical keyboard with responsive switches",
                price: 99.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 44,
                title: "Wireless Mouse",
                description: "Ergonomic wireless mouse for everyday computing",
                price: 39.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 45,
                title: "Gaming Mouse",
                description: "High-precision gaming mouse with programmable buttons",
                price: 69.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&q=80&sat=30",
            },
            {
                id: 46,
                title: "4K Monitor",
                description: "Sharp 4K display for work, gaming, and entertainment",
                price: 349.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 47,
                title: "USB-C Hub",
                description: "Multi-port USB-C hub for laptops and tablets",
                price: 49.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 48,
                title: "Portable SSD",
                description: "Fast portable solid-state drive for file storage",
                price: 119.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 49,
                title: "Smartphone Stand",
                description: "Adjustable stand for phones and small tablets",
                price: 19.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 50,
                title: "HD Webcam",
                description: "High-definition webcam for video calls and streaming",
                price: 59.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80",
            },

            {
                id: 51,
                title: "Gaming Keyboard",
                description: "RGB mechanical keyboard designed for gaming",
                price: 119.99,
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 52,
                title: "Gaming Headset",
                description: "Surround-sound gaming headset with a built-in microphone",
                price: 89.99,
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 53,
                title: "Gaming Controller",
                description: "Comfortable wireless controller for PC gaming",
                price: 69.99,
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 54,
                title: "RGB Mouse Pad",
                description: "Large gaming mouse pad with RGB lighting",
                price: 39.99,
                category: "Gaming",
                image: "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 55,
                title: "Laptop Cooling Pad",
                description: "Cooling pad designed to improve laptop airflow",
                price: 44.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 56,
                title: "USB Microphone",
                description: "Plug-and-play microphone for streaming and recording",
                price: 99.99,
                category: "Electronics",
                image: "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 57,
                title: "Desk LED Lamp",
                description: "Adjustable LED desk lamp for workspaces",
                price: 34.99,
                category: "Home",
                image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: 58,
                title: "Smart LED Bulb",
                description: "Smart LED bulb with adjustable brightness",
                price: 19.99,
                category: "Home",
                image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80",
            }
    ];

    let productsToSeed = products;
    const semanticSearchEnabled = Boolean(process.env.OPENROUTER_API_KEY);

    if (semanticSearchEnabled) {
        const client = new OpenAI({
            baseURL: "https://openrouter.ai/api/v1",
            apiKey: process.env.OPENROUTER_API_KEY,
        });
        const embeddingResponse = await client.embeddings.create({
            model: "openai/text-embedding-3-small",
            input: products.map(({ title, description, category }) =>
                [title, description, category].filter(Boolean).join(". "),
            ),
        });
        const embeddings = [...embeddingResponse.data].sort(
            (left, right) => left.index - right.index,
        );

        if (
            embeddings.length !== products.length ||
            embeddings.some(
                ({ embedding }) =>
                    !Array.isArray(embedding) ||
                    embedding.length === 0 ||
                    embedding.some((value) => !Number.isFinite(value)),
            )
        ) {
            throw new Error("OpenRouter returned invalid product embeddings.");
        }

        productsToSeed = products.map((product, index) => ({
            ...product,
            embedding: embeddings[index].embedding,
        }));
    }

    await connectDB();
    await Product.deleteMany();
    await Product.insertMany(productsToSeed);

    return Response.json({
        message: "Database added",
        productsSeeded: productsToSeed.length,
        semanticSearchEnabled,
    });
}