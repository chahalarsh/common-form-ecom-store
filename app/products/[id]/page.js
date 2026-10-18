import { ProductPage } from "../../components/StorePages";

export async function generateMetadata({ params }) {
  const { id } = await params;
  return {
    title: `Product ${id} | Common Form`,
    description: "Discover a thoughtful everyday find from the Common Form collection.",
  };
}

export default async function ProductRoute({ params }) {
  const { id } = await params;
  return <ProductPage id={id} />;
}
