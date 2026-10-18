import { Geist } from "next/font/google";
import { CartProvider } from "./components/CartProvider";
import { SiteFooter, SiteHeader } from "./components/SiteChrome";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "Common Form | Everyday things, chosen well",
  description: "A considered collection of useful, well-made pieces for everyday life.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={geistSans.variable}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{const t=localStorage.getItem("common-form-theme");document.documentElement.dataset.theme=t==="dark"||t==="light"?t:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}catch{document.documentElement.dataset.theme="light"}',
          }}
        />
      </head>
      <body>
        <CartProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
