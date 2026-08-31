import "@/styles/globals.css";
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export default function App({ Component, pageProps }) {
  return (
    <div className={`${jakarta.variable} ${playfair.variable}`}>
      <Component {...pageProps} />
    </div>
  );
}
