import { useCallback, useEffect, useState } from "react";
import { bookings as initialBookings, type Booking } from "@/data/mockCrmData";

const STORAGE_KEY = "crmse-bookings";
const CHANGE_EVENT = "crmse-bookings-change";

function readBookings(): Booking[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return initialBookings;
    const parsed: unknown = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed as Booking[] : initialBookings;
  } catch {
    return initialBookings;
  }
}

export function useBookingCatalog() {
  const [bookings, setBookings] = useState<Booking[]>(readBookings);
  useEffect(() => {
    const sync = () => setBookings(readBookings());
    window.addEventListener("storage", sync);
    window.addEventListener(CHANGE_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(CHANGE_EVENT, sync);
    };
  }, []);
  const save = useCallback((next: Booking[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setBookings(next);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);
  const addBooking = useCallback((booking: Omit<Booking, "id">) => save([{ ...booking, id: `BK-${Date.now().toString().slice(-6)}` }, ...readBookings()]), [save]);
  const updateBooking = useCallback((booking: Booking) => save(readBookings().map((item) => item.id === booking.id ? booking : item)), [save]);
  return { bookings, addBooking, updateBooking };
}