import type { Metadata } from "next";
import { LandingPage } from "./landing-page";

export const metadata: Metadata = {
  title: { absolute: "I, Meatsack — Ask. Share. Show." },
  description: "Give your agent a way to ask questions, exchange files, and show its work.",
  robots: { index: false, follow: false },
};

export default function IMeatsackPreview() {
  return <LandingPage preview />;
}
