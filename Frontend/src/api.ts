import type { Bid, Booking, Load, Transporter, Truck } from "./types";

const BASE = (import.meta.env.VITE_API_BASE_URL || "").replace(/\/$/, "");
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

const sampleLoads: Load[] = [
  { id: "LD-2048", origin: "Hyderabad, TS", destination: "Bengaluru, KA", cargoType: "Electronics", weight: 8.5, weightUnit: "TON", price: 28500, pickupDate: "2026-11-02", deliveryDate: "2026-11-04", trucksRequired: 2, remainingTrucks: 1, truckType: "Container", status: "OPEN_FOR_BIDS", datePosted: "2026-10-24" },
  { id: "LD-2047", origin: "Vijayawada, AP", destination: "Chennai, TN", cargoType: "Packaged food", weight: 12, weightUnit: "TON", price: 42000, pickupDate: "2026-11-03", deliveryDate: "2026-11-05", trucksRequired: 3, remainingTrucks: 3, truckType: "Heavy Truck", status: "POSTED", datePosted: "2026-10-23" },
  { id: "LD-2046", origin: "Pune, MH", destination: "Hyderabad, TS", cargoType: "Industrial parts", weight: 6, weightUnit: "TON", price: 19500, pickupDate: "2026-10-29", deliveryDate: "2026-10-31", trucksRequired: 1, remainingTrucks: 0, truckType: "Mini Truck", status: "BOOKED", datePosted: "2026-10-21" },
  { id: "LD-2045", origin: "Visakhapatnam, AP", destination: "Warangal, TS", cargoType: "Steel coils", weight: 15, weightUnit: "TON", price: 36000, pickupDate: "2026-11-06", deliveryDate: "2026-11-07", trucksRequired: 2, remainingTrucks: 2, truckType: "Flatbed", status: "POSTED", datePosted: "2026-10-20" }
];
const sampleBids: Bid[] = [
  { id: "BD-101", loadId: "LD-2048", transporterId: "TR-301", transporterName: "BlueRoute Logistics", proposedRate: 24800, trucksOffered: 2, truckType: "Container", status: "PENDING", rating: 4.8, score: 0.3002, submittedAt: "2026-10-25" },
  { id: "BD-102", loadId: "LD-2048", transporterId: "TR-302", transporterName: "Apex Freight Co.", proposedRate: 25500, trucksOffered: 2, truckType: "Container", status: "PENDING", rating: 4.6, score: 0.2935, submittedAt: "2026-10-25" },
  { id: "BD-103", loadId: "LD-2047", transporterId: "TR-303", transporterName: "Deccan Carriers", proposedRate: 39000, trucksOffered: 3, truckType: "Heavy Truck", status: "PENDING", rating: 4.5, score: 0.2849, submittedAt: "2026-10-24" }
];
const sampleBookings: Booking[] = [
  { id: "BK-701", loadId: "LD-2046", bidId: "BD-099", transporterId: "TR-301", allocatedTrucks: 1, finalRate: 19200, status: "CONFIRMED", bookedAt: "2026-10-22" },
  { id: "BK-700", loadId: "LD-2044", bidId: "BD-098", transporterId: "TR-303", allocatedTrucks: 2, finalRate: 33200, status: "CANCELLED", bookedAt: "2026-10-19" }
];
const sampleTransporters: Transporter[] = [
  { id: "TR-301", companyName: "BlueRoute Logistics", rating: 4.8, trucks: [{ truckType: "Container", count: 8 }, { truckType: "Mini Truck", count: 3 }] },
  { id: "TR-302", companyName: "Apex Freight Co.", rating: 4.6, trucks: [{ truckType: "Container", count: 5 }, { truckType: "Flatbed", count: 2 }] },
  { id: "TR-303", companyName: "Deccan Carriers", rating: 4.5, trucks: [{ truckType: "Heavy Truck", count: 12 }] }
];

let demoLoads = [...sampleLoads], demoBids = [...sampleBids], demoBookings = [...sampleBookings], demoTransporters = [...sampleTransporters];
const wait = <T,>(value: T): Promise<T> => new Promise(resolve => setTimeout(() => resolve(value), 180));
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) }
  });
  const raw = await response.text();
  let data: unknown = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const message = typeof data === "object" && data !== null
      ? String((data as Record<string, unknown>).message || (data as Record<string, unknown>).error || response.statusText)
      : String(data || response.statusText);
    throw new Error(`${response.status}: ${message}`);
  }
  return data as T;
}
function unwrap<T>(data: unknown): T {
  if (data && typeof data === "object" && "content" in data) return (data as {content: T}).content;
  if (data && typeof data === "object" && "data" in data) return (data as {data: T}).data;
  return data as T;
}
const asArray = <T,>(data: unknown): T[] => {
  const value = unwrap<unknown>(data);
  if (Array.isArray(value)) return value as T[];
  if (value && typeof value === "object" && "content" in value && Array.isArray((value as {content: unknown}).content)) return (value as {content: T[]}).content;
  return [];
};

export const api = {
  async loads(): Promise<Load[]> {
    if (DEMO_MODE) return wait([...demoLoads]);
    return asArray<Load>(await request("/load?size=100&sort=datePosted,desc"));
  },
  async createLoad(body: Record<string, unknown>): Promise<Load> {
    if (DEMO_MODE) {
      const created: Load = { ...body, id: `LD-${Math.floor(2100 + Math.random() * 800)}`, remainingTrucks: Number(body.trucksRequired || 1), status: "POSTED", datePosted: new Date().toISOString().slice(0, 10) };
      demoLoads = [created, ...demoLoads]; return wait(created);
    }
    return unwrap<Load>(await request("/load", { method: "POST", body: JSON.stringify(body) }));
  },
  async cancelLoad(id: string): Promise<void> {
    if (DEMO_MODE) { demoLoads = demoLoads.map(x => x.id === id ? {...x, status: "CANCELLED"} : x); return wait(undefined); }
    await request(`/load/${encodeURIComponent(id)}/cancel`, { method: "PATCH" });
  },
  async bids(): Promise<Bid[]> {
    if (DEMO_MODE) return wait([...demoBids]);
    return asArray<Bid>(await request("/bid?size=100"));
  },
  async bestBids(loadId: string): Promise<Bid[]> {
    if (DEMO_MODE) return wait(demoBids.filter(b => b.loadId === loadId).sort((a,b) => Number(b.score || 0)-Number(a.score || 0)));
    return asArray<Bid>(await request(`/load/${encodeURIComponent(loadId)}/best-bids`));
  },
  async rejectBid(id: string): Promise<void> {
    if (DEMO_MODE) { demoBids = demoBids.map(x => x.id === id ? {...x, status: "REJECTED"} : x); return wait(undefined); }
    await request(`/bid/${encodeURIComponent(id)}/reject`, { method: "PATCH" });
  },
  async createBid(body: Record<string, unknown>): Promise<Bid> {
    if (DEMO_MODE) { const item: Bid = {...body, id:`BD-${Math.floor(200 + Math.random()*700)}`, status:"PENDING", submittedAt:new Date().toISOString()}; demoBids=[item,...demoBids]; return wait(item); }
    return unwrap<Bid>(await request("/bid", {method:"POST", body:JSON.stringify(body)}));
  },
  async booking(id: string): Promise<Booking> {
    if (DEMO_MODE) { const item = demoBookings.find(x => x.id === id); if (!item) throw new Error("Booking not found in demo data."); return wait(item); }
    return unwrap<Booking>(await request(`/booking/${encodeURIComponent(id)}`));
  },
  async cancelBooking(id: string): Promise<void> {
    if (DEMO_MODE) { demoBookings = demoBookings.map(x => x.id === id ? {...x,status:"CANCELLED"} : x); return wait(undefined); }
    await request(`/booking/${encodeURIComponent(id)}/cancel`, {method:"PATCH"});
  },
  async transporter(id: string): Promise<Transporter> {
    if (DEMO_MODE) { const item = demoTransporters.find(x=>x.id===id); if (!item) throw new Error("Transporter not found in demo data."); return wait(item); }
    return unwrap<Transporter>(await request(`/transporter/${encodeURIComponent(id)}`));
  },
  async updateTrucks(id: string, trucks: Truck[]): Promise<void> {
    if (DEMO_MODE) { demoTransporters = demoTransporters.map(x => x.id === id ? {...x, trucks} : x); return wait(undefined); }
    await request(`/transporter/${encodeURIComponent(id)}/trucks`, {method:"PUT", body:JSON.stringify({trucks})});
  }
};