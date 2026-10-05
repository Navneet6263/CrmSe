import instagram from "@/assets/brands/instagram.svg";
import facebook from "@/assets/brands/facebook.svg";
import whatsapp from "@/assets/brands/whatsapp.svg";
import googleCalendar from "@/assets/brands/google-calendar.svg";
import { cn } from "@/lib/utils";

const marks = { Instagram: instagram, Facebook: facebook, WhatsApp: whatsapp, "Google Calendar": googleCalendar } as const;
export type BrandName = keyof typeof marks;

export function BrandIcon({ brand, className }: { brand: BrandName; className?: string }) {
  return <img src={marks[brand]} alt="" aria-hidden="true" className={cn("h-4 w-4 object-contain", className)} />;
}