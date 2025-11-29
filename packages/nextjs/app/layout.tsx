import { Pacifico } from "next/font/google";
import "@rainbow-me/rainbowkit/styles.css";
import "@scaffold-ui/components/styles.css";
import { ExternalStyles } from "~~/components/ExternalStyles";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

const pacifico = Pacifico({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-pacifico",
});

export const metadata = getMetadata({
  title: "MemePot",
  description:
    "MemePot is a trusted DeFi staking platform that focuses on realistic, sustainable yields, security-first fund protection, and always-on event pools. Join 24/7 MemePot events and experience reliable rewards with a fun, culture-driven meme ecosystem.",
  keywords:
    "MemePot, DeFi staking, crypto staking, event pool, rewards system, secure DeFi, sustainable yields, meme culture",
});

const ScaffoldEthApp = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="ko" suppressHydrationWarning className={`${pacifico.variable}`}>
      <body>
        <ExternalStyles />
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders>{children}</ScaffoldEthAppWithProviders>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default ScaffoldEthApp;
