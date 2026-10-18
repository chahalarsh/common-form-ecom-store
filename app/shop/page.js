import { HomePage } from "../components/StorePages";

export const metadata = {
  title: "Shop | Common Form",
  description: "Browse considered, useful finds from the Common Form collection.",
};

export default function ShopPage() {
  return <HomePage shopOnly />;
}
