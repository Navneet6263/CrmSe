// All CRM demo data lives here. Replace with real backend data later.

export type Gender = "Male" | "Female";
export type BookingStatus = "Confirmed" | "Pending" | "Completed" | "Cancelled" | "Rescheduled" | "No show";
export type LeadSource = "Instagram Ad" | "Instagram Story" | "Facebook Ad" | "Organic" | "WhatsApp" | "Walk-in" | "Phone" | "Referral";

export const businessCategories = [
  { id: "salon", name: "Salon & Spa", emoji: "💇", active: true, desc: "Bookings, services, slots & turnover" },
  { id: "pg-hotel", name: "PG / Hotel", emoji: "🏨", active: false, desc: "Rooms, stays & check-ins" },
  { id: "restaurant", name: "Restaurant", emoji: "🍽️", active: false, desc: "Tables, orders & reservations" },
] as const;

export interface Service {
  id: string;
  name: string;
  gender: Gender;
  price: number;
  duration: number; // minutes
  active: boolean;
}

export const services: Service[] = [
  { id: "m1", name: "Haircut & Styling", gender: "Male", price: 350, duration: 30, active: true },
  { id: "m2", name: "Beard Trim & Shape", gender: "Male", price: 200, duration: 20, active: true },
  { id: "m3", name: "Hair Spa", gender: "Male", price: 800, duration: 45, active: true },
  { id: "m4", name: "Charcoal Facial", gender: "Male", price: 1200, duration: 50, active: true },
  { id: "f1", name: "Haircut & Blow Dry", gender: "Female", price: 700, duration: 45, active: true },
  { id: "f2", name: "Keratin Treatment", gender: "Female", price: 4500, duration: 120, active: true },
  { id: "f3", name: "Gold Facial", gender: "Female", price: 1800, duration: 60, active: true },
  { id: "f4", name: "Bridal Makeup", gender: "Female", price: 12000, duration: 180, active: true },
  { id: "f5", name: "Manicure & Pedicure", gender: "Female", price: 1100, duration: 60, active: true },
];

export const branches = [
  { id: "vastrapur", name: "Vastrapur", address: "Judges Bungalow Road", appointments: 120, revenue: 245000 },
  { id: "bodakdev", name: "Bodakdev", address: "Sindhu Bhavan Road", appointments: 98, revenue: 192000 },
  { id: "satellite", name: "Satellite", address: "Shyamal Cross Road", appointments: 76, revenue: 146000 },
] as const;

export const timeSlots = [
  "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM",
  "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM", "08:00 PM",
];

// Booked / blocked slots for today (slot -> status)
export const slotStatus: Record<string, "Available" | "Booked" | "Blocked"> = {
  "10:00 AM": "Booked", "11:00 AM": "Available", "12:00 PM": "Booked",
  "01:00 PM": "Blocked", "02:00 PM": "Available", "03:00 PM": "Available",
  "04:00 PM": "Booked", "05:00 PM": "Available", "06:00 PM": "Booked",
  "07:00 PM": "Booked", "08:00 PM": "Available",
};

export interface Booking {
  id: string;
  customer: string;
  phone: string;
  gender: Gender;
  service: string;
  amount: number;
  date: string;
  slot: string;
  status: BookingStatus;
  source: LeadSource;
  calendarSynced: boolean;
  branchId: string;
  discount: number;
  notes: string;
  duration: number;
}

export const bookings: Booking[] = [
  { id: "BK-1048", customer: "Riya Sharma", phone: "+91 98765 43210", gender: "Female", service: "Keratin Treatment", amount: 4500, date: "Today", slot: "10:00 AM", status: "Confirmed", source: "Instagram Ad", calendarSynced: true, branchId: "vastrapur", discount: 0, notes: "Prefers a senior stylist", duration: 120 },
  { id: "BK-1047", customer: "Arjun Mehta", phone: "+91 99887 66554", gender: "Male", service: "Haircut & Styling", amount: 350, date: "Today", slot: "12:00 PM", status: "Completed", source: "Instagram Story", calendarSynced: true, branchId: "bodakdev", discount: 0, notes: "", duration: 30 },
  { id: "BK-1046", customer: "Sneha Kapoor", phone: "+91 91234 56789", gender: "Female", service: "Gold Facial", amount: 1800, date: "Today", slot: "04:00 PM", status: "Confirmed", source: "Instagram Ad", calendarSynced: true, branchId: "satellite", discount: 0, notes: "Sensitive skin", duration: 60 },
  { id: "BK-1045", customer: "Vikram Singh", phone: "+91 90000 11122", gender: "Male", service: "Charcoal Facial", amount: 1100, date: "Today", slot: "06:00 PM", status: "Pending", source: "Facebook Ad", calendarSynced: false, branchId: "vastrapur", discount: 100, notes: "First visit offer", duration: 50 },
  { id: "BK-1044", customer: "Ananya Iyer", phone: "+91 88776 55443", gender: "Female", service: "Bridal Makeup", amount: 12000, date: "Today", slot: "07:00 PM", status: "Confirmed", source: "Instagram Ad", calendarSynced: true, branchId: "bodakdev", discount: 0, notes: "Trial completed", duration: 180 },
  { id: "BK-1043", customer: "Rohan Das", phone: "+91 77665 44332", gender: "Male", service: "Beard Trim & Shape", amount: 200, date: "Yesterday", slot: "05:00 PM", status: "Completed", source: "Walk-in", calendarSynced: true, branchId: "vastrapur", discount: 0, notes: "", duration: 20 },
  { id: "BK-1042", customer: "Priya Nair", phone: "+91 99001 22334", gender: "Female", service: "Manicure & Pedicure", amount: 1100, date: "Yesterday", slot: "03:00 PM", status: "Cancelled", source: "Instagram Ad", calendarSynced: false, branchId: "satellite", discount: 0, notes: "Cancelled by customer", duration: 60 },
  { id: "BK-1041", customer: "Kabir Khan", phone: "+91 98111 22233", gender: "Male", service: "Hair Spa", amount: 800, date: "Yesterday", slot: "11:00 AM", status: "No show", source: "Phone", calendarSynced: true, branchId: "bodakdev", discount: 0, notes: "Follow up before next booking", duration: 45 },
];

export const customerProfiles = [
  { phone: "+91 98765 43210", email: "riya@example.com", notes: "Prefers weekday mornings", previousVisits: 4, previousSpend: 13200 },
  { phone: "+91 99887 66554", email: "arjun@example.com", notes: "Regular haircut every month", previousVisits: 7, previousSpend: 4200 },
  { phone: "+91 91234 56789", email: "sneha@example.com", notes: "Avoid strongly scented products", previousVisits: 3, previousSpend: 7400 },
  { phone: "+91 88776 55443", email: "ananya@example.com", notes: "Bridal client", previousVisits: 2, previousSpend: 5600 },
] as const;

export const ownerInsights = { completed: 186, cancelled: 12, noShows: 6, walkIns: 38, newCustomers: 54, returningCustomers: 132, topService: "Haircut & Styling" };

export const kpis = {
  todayBookings: 14,
  todayBookingsDelta: 18,
  monthTurnover: 284500,
  monthTurnoverDelta: 24,
  adClicks: 3842,
  adClicksDelta: 12,
  conversionRate: 7.8,
  conversionDelta: 1.4,
  avgTicket: 1420,
};

// Hourly Instagram ad clicks (today)
export const hourlyClicks = [
  { hour: "9AM", clicks: 42, bookings: 2 },
  { hour: "10AM", clicks: 68, bookings: 4 },
  { hour: "11AM", clicks: 95, bookings: 6 },
  { hour: "12PM", clicks: 120, bookings: 7 },
  { hour: "1PM", clicks: 88, bookings: 5 },
  { hour: "2PM", clicks: 76, bookings: 4 },
  { hour: "3PM", clicks: 104, bookings: 6 },
  { hour: "4PM", clicks: 142, bookings: 9 },
  { hour: "5PM", clicks: 186, bookings: 12 },
  { hour: "6PM", clicks: 248, bookings: 18 },
  { hour: "7PM", clicks: 296, bookings: 22 },
  { hour: "8PM", clicks: 274, bookings: 19 },
  { hour: "9PM", clicks: 210, bookings: 14 },
  { hour: "10PM", clicks: 132, bookings: 8 },
];

// Last 7 days revenue
export const weeklyRevenue = [
  { day: "Mon", revenue: 32400, bookings: 22 },
  { day: "Tue", revenue: 28900, bookings: 19 },
  { day: "Wed", revenue: 36100, bookings: 25 },
  { day: "Thu", revenue: 41200, bookings: 28 },
  { day: "Fri", revenue: 48700, bookings: 33 },
  { day: "Sat", revenue: 62300, bookings: 41 },
  { day: "Sun", revenue: 55800, bookings: 37 },
];

export const sourceSplit = [
  { name: "Instagram Ad", value: 58 },
  { name: "Instagram Story", value: 21 },
  { name: "Facebook Ad", value: 12 },
  { name: "Organic", value: 9 },
];

export const campaigns = [
  { name: "Diwali Glow Offer", platform: "Instagram", clicks: 1420, bookings: 118, spend: 8500, revenue: 164000 },
  { name: "Keratin Weekend", platform: "Instagram", clicks: 980, bookings: 64, spend: 6000, revenue: 288000 },
  { name: "Men's Grooming Combo", platform: "Instagram Story", clicks: 760, bookings: 71, spend: 4200, revenue: 39800 },
  { name: "Bridal Season 2026", platform: "Facebook", clicks: 682, bookings: 12, spend: 7800, revenue: 144000 },
];

export const formatINR = (n: number) => "₹" + n.toLocaleString("en-IN");
