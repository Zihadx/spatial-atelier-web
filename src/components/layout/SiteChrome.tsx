import Cursor from "./Cursor";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Preloader from "./Preloader";
import SmoothScroll from "./SmoothScroll";
import { getChromeData } from "@/lib/chrome";

export default function SiteChrome({ children }: { children: React.ReactNode }) {
  const chrome = getChromeData();
  return (
    <>
      <noscript><style>{`[data-preloader]{display:none!important}[data-page]{opacity:1!important}`}</style></noscript>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-ivory focus:px-4 focus:py-2 focus:text-espresso">Skip to content</a>
      <Preloader brand={chrome.brand} />
      <SmoothScroll />
      <Cursor />
      <Navbar brand={chrome.brand} nav={chrome.nav} contact={chrome.contact} />
      <main id="main">{children}</main>
      <Footer chrome={chrome} />
    </>
  );
}
