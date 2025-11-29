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
  title: "MEMEPOT - Deposit To Win | Guaranteed Steady Income & Thrilling Events",
  description:
    "MEMEPOT은 혁신적인 스테이킹 플랫폼으로 안정적인 수익과 흥미진진한 이벤트를 제공합니다. 지금 바로 참여하여 특별한 보상을 받아보세요. Staking, Event Pool, Rewards System을 통해 최고의 경험을 제공합니다.",
  keywords: "MEMEPOT, 스테이킹, 암호화폐, 이벤트 풀, 보상 시스템",
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
