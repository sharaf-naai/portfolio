import QRCode from "qrcode";
import { getMessages } from "next-intl/server";
import { whatsappUrl } from "@/lib/pricing";
import AccessCard from "./AccessCard";

/** 04 About. The WhatsApp QR is rendered on the server (at build time for the static page). */
export default async function About() {
  const { about } = await getMessages();
  const url = whatsappUrl(about.whatsapp); // localized: a French visitor sends a French message
  // Dark modules on a light ground: some scanners fail on inverted codes.
  const qr = await QRCode.toString(url, { type: "svg", margin: 2, color: { dark: "#141414", light: "#EDEBE6" } });
  return <AccessCard qr={qr} requestUrl={url} />;
}
