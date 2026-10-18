import connectDB from "@/lib/db";
import Product from "@/models/product";

export async function GET() {
    try {
        await connectDB();
        const products = await Product.find().select("-embedding").lean();
        return Response.json(
            products.map((product) => ({
                ...product,
                _id: product._id.toString(),
            })),
        );
    } catch (error) {
        console.error("Could not load products:", error);
        return Response.json(
            { error: "Could not load products. Check the MongoDB connection and server logs." },
            { status: 500 },
        );
    }
}