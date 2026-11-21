import Link from "next/link";
import SiteChrome from "@/components/layout/SiteChrome";
import PageHero from "@/components/ui/PageHero";
import { PHOTO } from "@/data/photos";

export default function NotFound() {
  return (
    <SiteChrome>
      <PageHero eyebrow="404" title={<>This room does not <em>exist.</em></>} lead="The page you are looking for has moved or was never built." photo={PHOTO.journalHero}>
        <Link href="/" className="btn btn-solid">Return home</Link>
      </PageHero>
    </SiteChrome>
  );
}
