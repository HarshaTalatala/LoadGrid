import { useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowRight, ArrowUpRight, Boxes, CalendarDays, Check,
  ChevronDown, CircleAlert, Clock3, FilePlus2, Gauge, LayoutDashboard, MapPin,
  Menu, PackageCheck, Plus, RefreshCw, Search, Settings2, ShieldCheck, Truck,
  Wallet, X, Zap
} from "lucide-react";
import { api, DEMO_MODE } from "./api";
import type { Bid, Booking, Load, Transporter, Truck as TruckItem } from "./types";

type Section = "Overview" | "Loads" | "Bids" | "Bookings" | "Transporters";
const money = (value?: number) => typeof value === "number" ? new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(value) : "—";
const shortId = (id?: string) => id ? id.length > 13 ? `${id.slice(0,8)}…${id.slice(-3)}` : id : "—";
const get = (item: Record<string, unknown>, ...keys: string[]) => {
  for (const key of keys) if (item[key] !== undefined && item[key] !== null && item[key] !== "") return item[key];
  return undefined;
};
const idOf = (x: {id?: string}) => x.id || "—";
function statusClass(status?: string) { return `status status-${(status || "unknown").toLowerCase().replaceAll("_","-")}`; }

export default function App() {
  const [section, setSection] = useState<Section>("Overview");
  const [loads, setLoads] = useState<Load[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [showCreate, setShowCreate] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [bestBids, setBestBids] = useState<Bid[]>([]);
  const [bestLoadId, setBestLoadId] = useState("");
  const [bookingId, setBookingId] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [transporterId, setTransporterId] = useState("");
  const [transporter, setTransporter] = useState<Transporter | null>(null);
  const [busy, setBusy] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);

  const refresh = async () => {
    setLoading(true); setError("");
    try {
      const [loadData, bidData] = await Promise.all([api.loads(), api.bids()]);
      setLoads(loadData); setBids(bidData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not load data. Check the backend URL and CORS settings.");
    } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);

  const filteredLoads = useMemo(() => loads.filter(load => {
    const blob = [load.id, load.origin, load.destination, load.cargoType, load.truckType, load.status].join(" ").toLowerCase();
    return blob.includes(search.toLowerCase()) && (statusFilter === "ALL" || load.status === statusFilter);
  }), [loads, search, statusFilter]);
  const activeLoads = loads.filter(l => l.status === "POSTED" || l.status === "OPEN_FOR_BIDS").length;
  const pendingBids = bids.filter(b => b.status === "PENDING").length;
  const bookedLoads = loads.filter(l => l.status === "BOOKED").length;
  const totalValue = loads.filter(l => l.status !== "CANCELLED").reduce((sum,l)=>sum+(Number(l.price)||0),0);

  const doAction = async (fn: () => Promise<unknown>, message: string) => {
    setBusy(true); setError(""); setNotice("");
    try { await fn(); setNotice(message); await refresh(); }
    catch (e) { setError(e instanceof Error ? e.message : "Action failed."); }
    finally { setBusy(false); }
  };
  const openBestBids = async (loadId: string) => {
    setBestLoadId(loadId); setError(""); setBestBids([]);
    try { setBestBids(await api.bestBids(loadId)); }
    catch(e) { setError(e instanceof Error ? e.message : "Could not load ranked bids."); }
  };
  const findBooking = async () => {
    if (!bookingId.trim()) return;
    try { setError(""); setBooking(await api.booking(bookingId.trim())); }
    catch(e) { setBooking(null); setError(e instanceof Error ? e.message : "Booking lookup failed."); }
  };
  const findTransporter = async () => {
    if (!transporterId.trim()) return;
    try { setError(""); setTransporter(await api.transporter(transporterId.trim())); }
    catch(e) { setTransporter(null); setError(e instanceof Error ? e.message : "Transporter lookup failed."); }
  };

  const nav: {label: Section; icon: typeof LayoutDashboard; tag?: string}[] = [
    {label:"Overview",icon:LayoutDashboard},{label:"Loads",icon:Boxes},{label:"Bids",icon:Activity,tag:String(pendingBids)},
    {label:"Bookings",icon:PackageCheck},{label:"Transporters",icon:Truck}
  ];
  const changeSection = (next: Section) => { setSection(next); setMobileNav(false); setError(""); setNotice(""); };

  return <div className="app-shell">
    <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
      <div className="brand"><div className="brand-mark"><Truck size={21}/></div><div><b>haulwise</b><span>TRANSPORT OPS</span></div></div>
      <div className="workspace"><div className="workspace-avatar">HW</div><div><b>Operations team</b><span>Workspace · India</span></div><ChevronDown size={15}/></div>
      <div className="nav-label">WORKSPACE</div>
      <nav>{nav.map(item => <button key={item.label} className={`nav-item ${section===item.label?"active":""}`} onClick={()=>changeSection(item.label)}><item.icon size={18}/><span>{item.label}</span>{item.tag && <i>{item.tag}</i>}</button>)}</nav>
      <div className="sidebar-bottom">
        <div className="help-card"><div className="help-icon"><ShieldCheck size={17}/></div><b>Operations, in control.</b><p>Track freight activity and keep every booking moving.</p><button onClick={()=>changeSection("Overview")}>View overview <ArrowRight size={13}/></button></div>
        <button className="nav-item muted-nav"><Settings2 size={18}/><span>Settings</span></button>
        <div className="profile"><div className="profile-avatar">HT</div><div><b>Harsha's workspace</b><span>Transport operator</span></div><ChevronDown size={15}/></div>
      </div>
    </aside>

    <main className="main">
      <header className="topbar">
        <button className="mobile-menu icon-btn" aria-label="Open menu" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button>
        <div className="breadcrumb">Workspace <span>/</span> <b>{section}</b></div>
        <div className="top-actions"><span className={`connection ${DEMO_MODE?"demo":"api"}`}><i/>{DEMO_MODE?"Demo data":"API mode"}</span><button className="icon-btn" aria-label="Refresh data" onClick={()=>void refresh()}><RefreshCw size={17}/></button><div className="top-avatar">HT</div></div>
      </header>

      <div className="page-wrap">
        <div className="page-heading">
          <div><div className="eyebrow"><span className="eyebrow-dot"/>{section==="Overview"?"MONDAY, OCTOBER 26, 2026":"TRANSPORT OPERATIONS"}</div><h1>{section==="Overview"?"Good afternoon, Harsha.":section==="Loads"?"Load management":section==="Bids"?"Bid control":section==="Bookings"?"Bookings": "Transporter fleet"}</h1><p>{section==="Overview"?"Your freight network at a glance. Here’s what needs attention today.":section==="Loads"?"Create, monitor and manage loads across your network.":section==="Bids"?"Compare proposals and manage incoming transporter bids.":section==="Bookings"?"Find booking records and manage cancellation workflows.":"Look up transporter profiles and maintain truck inventory."}</p></div>
          <div className="heading-actions"><button className="btn btn-secondary" onClick={()=>void refresh()}><RefreshCw size={15}/> Refresh</button>{(section==="Overview"||section==="Loads")&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={16}/> Create load</button>}{section==="Bids"&&<button className="btn btn-primary" onClick={()=>setShowBidForm(true)}><Plus size={16}/> Submit bid</button>}</div>
        </div>

        {error && <div className="alert alert-error"><CircleAlert size={17}/><span>{error}</span><button onClick={()=>setError("")} aria-label="Dismiss"><X size={15}/></button></div>}
        {notice && <div className="alert alert-success"><Check size={17}/><span>{notice}</span><button onClick={()=>setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
        {DEMO_MODE && <div className="demo-banner"><Zap size={16}/><span><b>Interactive demo</b> — sample data is stored in this browser only; it is not connected to the live database.</span></div>}

        {section==="Overview" && <Overview loads={loads} bids={bids} activeLoads={activeLoads} pendingBids={pendingBids} bookedLoads={bookedLoads} totalValue={totalValue} loading={loading} onSection={changeSection} onCreate={()=>setShowCreate(true)} onBest={openBestBids} />}
        {section==="Loads" && <section className="panel">
          <div className="panel-heading"><div><h2>Loads <span className="count-pill">{filteredLoads.length}</span></h2><p>Manage active and completed freight requests.</p></div><div className="table-tools"><div className="searchbox"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search loads..." /></div><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="ALL">All statuses</option><option>POSTED</option><option>OPEN_FOR_BIDS</option><option>BOOKED</option><option>CANCELLED</option></select></div></div>
          <LoadsTable loads={filteredLoads} loading={loading} onBest={openBestBids} onCancel={id=>void doAction(()=>api.cancelLoad(id),"Load cancellation requested.")}/>
        </section>}
        {section==="Bids" && <section className="panel"><div className="panel-heading"><div><h2>Incoming bids <span className="count-pill">{bids.length}</span></h2><p>Rank bids against each load and review transporter offers.</p></div><div className="searchbox"><Search size={15}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search bids..." /></div></div><BidsTable bids={bids.filter(b=>[b.id,b.loadId,b.transporterName,b.transporterId,b.status].join(" ").toLowerCase().includes(search.toLowerCase()))} onReject={id=>void doAction(()=>api.rejectBid(id),"Bid rejection requested.")}/></section>}
        {section==="Bookings" && <div className="two-col"><section className="panel"><div className="panel-heading"><div><h2>Find a booking</h2><p>Look up a booking by its ID.</p></div><div className="panel-icon"><PackageCheck size={18}/></div></div><form className="lookup-form" onSubmit={e=>{e.preventDefault();void findBooking();}}><label>Booking ID<input value={bookingId} onChange={e=>setBookingId(e.target.value)} placeholder="e.g. BK-701" required/></label><button className="btn btn-primary" type="submit">Find booking <ArrowRight size={15}/></button></form>{booking&&<div className="record-card"><div className="record-top"><span className="record-id">{shortId(booking.id)}</span><span className={statusClass(booking.status)}>{booking.status}</span></div><div className="record-grid"><Info label="Load ID" value={shortId(booking.loadId)}/><Info label="Transporter ID" value={shortId(booking.transporterId)}/><Info label="Allocated trucks" value={String(booking.allocatedTrucks??"—")}/><Info label="Final rate" value={money(booking.finalRate)}/></div>{booking.status!=="CANCELLED"&&<button className="btn btn-danger" disabled={busy} onClick={()=>void doAction(async()=>{await api.cancelBooking(booking.id);setBooking({...booking,status:"CANCELLED"});},"Booking cancelled.")}>Cancel booking</button>}</div>}</section><section className="panel side-note"><div className="panel-icon purple"><CalendarDays size={18}/></div><h2>Booking lifecycle</h2><p>Bookings are created as confirmed after the backend validates load capacity and transporter inventory. Cancellation should restore capacity through the backend workflow.</p><div className="lifecycle"><span className="life-step done"><i>1</i><b>Bid selected</b></span><span className="life-line"/><span className="life-step done"><i>2</i><b>Confirmed</b></span><span className="life-line"/><span className="life-step"><i>3</i><b>Cancelled</b></span></div></section></div>}
        {section==="Transporters" && <div className="two-col"><section className="panel"><div className="panel-heading"><div><h2>Transporter lookup</h2><p>View profile and available truck inventory.</p></div><div className="panel-icon"><Truck size={18}/></div></div><form className="lookup-form" onSubmit={e=>{e.preventDefault();void findTransporter();}}><label>Transporter ID<input value={transporterId} onChange={e=>setTransporterId(e.target.value)} placeholder="e.g. TR-301" required/></label><button className="btn btn-primary" type="submit">Find transporter <ArrowRight size={15}/></button></form>{transporter&&<TransporterEditor transporter={transporter} busy={busy} onSave={trucks=>void doAction(()=>api.updateTrucks(transporter.id,trucks),"Truck inventory updated.")}/>}</section><section className="panel side-note"><div className="panel-icon green"><Boxes size={18}/></div><h2>Fleet inventory</h2><p>Truck inventory is used to validate bids and bookings. Keep the counts accurate before confirming a load.</p><div className="note-stat"><span>Known transporters in demo</span><b>{DEMO_MODE?"3":"API lookup"}</b></div><div className="note-stat"><span>Inventory updates</span><b>API-backed</b></div></section></div>}
        {bestLoadId && <div className="modal-backdrop" onClick={()=>{setBestLoadId("");setBestBids([]);}}><div className="modal best-modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">LOAD {shortId(bestLoadId)}</span><h2>Ranked bids</h2><p>Sorted by the backend's weighted score.</p></div><button className="icon-btn" aria-label="Close" onClick={()=>{setBestLoadId("");setBestBids([]);}}><X size={18}/></button></div>{bestBids.length===0?<div className="empty-state"><Activity size={22}/><b>No bids available</b><span>There may be no bids for this load yet.</span></div>:<div className="rank-list">{bestBids.map((b,i)=><div className="rank-row" key={b.id}><div className={`rank-num ${i===0?"rank-first":""}`}>{String(i+1).padStart(2,"0")}</div><div className="rank-main"><b>{b.transporterName||shortId(b.transporterId)}</b><span>{shortId(b.id)} · {b.trucksOffered??"—"} trucks offered</span></div><div className="rank-rate"><b>{money(b.proposedRate)}</b><span>proposed rate</span></div><div className="rank-score"><b>{typeof b.score==="number"?b.score.toFixed(4):"—"}</b><span>score</span></div></div>)}</div>}</div></div>}
      </div>
      <footer className="footer"><span>HAULWISE <b>TRANSPORT MANAGEMENT</b></span><span>{DEMO_MODE?"DEMO ENVIRONMENT":"CONNECTED API"} <i/> <span>v1.0</span></span></footer>
    </main>
    {showCreate && <CreateLoadModal busy={busy} onClose={()=>setShowCreate(false)} onSubmit={body=>void doAction(async()=>{await api.createLoad(body);setShowCreate(false);},"Load created successfully.")}/>}
    {showBidForm && <CreateBidModal loads={loads} busy={busy} onClose={()=>setShowBidForm(false)} onSubmit={body=>void doAction(async()=>{await api.createBid(body);setShowBidForm(false);},"Bid submitted successfully.")}/>}
  </div>;
}

function Overview({loads,bids,activeLoads,pendingBids,bookedLoads,totalValue,loading,onSection,onCreate,onBest}:{loads:Load[];bids:Bid[];activeLoads:number;pendingBids:number;bookedLoads:number;totalValue:number;loading:boolean;onSection:(s:Section)=>void;onCreate:()=>void;onBest:(id:string)=>void}) {
  const recent = [...loads].sort((a,b)=>String(b.datePosted||"").localeCompare(String(a.datePosted||""))).slice(0,4);
  return <>
    <div className="metrics">
      <Metric icon={Boxes} label="Active loads" value={loading?"—":String(activeLoads)} note="Posted or open for bids" trend="+12.5%" trendUp/>
      <Metric icon={Activity} label="Pending bids" value={loading?"—":String(pendingBids)} note="Awaiting review" trend={`${pendingBids} to review`} />
      <Metric icon={PackageCheck} label="Booked loads" value={loading?"—":String(bookedLoads)} note="Capacity fully allocated" trend="Current total"/>
      <Metric icon={Wallet} label="Listed load value" value={loading?"—":money(totalValue)} note="Excludes cancelled loads" trend="INR" />
    </div>
    <div className="overview-grid">
      <section className="panel recent-panel"><div className="panel-heading"><div><h2>Recent loads</h2><p>Latest freight requests across your network.</p></div><button className="text-button" onClick={()=>onSection("Loads")}>View all <ArrowRight size={14}/></button></div><LoadsTable loads={recent} loading={loading} compact onBest={onBest} onCancel={()=>{}}/></section>
      <section className="panel attention-panel"><div className="panel-heading"><div><h2>Needs attention</h2><p>Quick actions for the operations team.</p></div><div className="panel-icon amber"><Zap size={17}/></div></div>
        <button className="attention-item" onClick={()=>onSection("Bids")}><div className="attention-icon amber"><Activity size={17}/></div><div><b>Review pending bids</b><span>{pendingBids} proposals waiting for review</span></div><ArrowRight size={15}/></button>
        <button className="attention-item" onClick={()=>onSection("Loads")}><div className="attention-icon blue"><Boxes size={17}/></div><div><b>Check open loads</b><span>{activeLoads} loads accepting activity</span></div><ArrowRight size={15}/></button>
        <button className="attention-item" onClick={()=>onSection("Transporters")}><div className="attention-icon green"><Truck size={17}/></div><div><b>Verify fleet inventory</b><span>Review available truck counts</span></div><ArrowRight size={15}/></button>
        <button className="btn btn-primary attention-cta" onClick={onCreate}><Plus size={15}/> Create a new load</button>
      </section>
    </div>
    <section className="panel flow-panel"><div className="panel-heading"><div><h2>Load workflow</h2><p>Core lifecycle implemented by the Spring Boot service.</p></div><span className="workflow-label"><Activity size={14}/> OPERATIONS FLOW</span></div><div className="workflow"><div className="workflow-step"><div className="workflow-icon blue"><FilePlus2 size={19}/></div><div><span>STEP 01</span><b>Post a load</b><p>Publish route, cargo and truck requirements.</p></div></div><div className="workflow-arrow"><ArrowRight size={18}/></div><div className="workflow-step"><div className="workflow-icon purple"><Wallet size={19}/></div><div><span>STEP 02</span><b>Compare bids</b><p>Review rates and transporter ratings.</p></div></div><div className="workflow-arrow"><ArrowRight size={18}/></div><div className="workflow-step"><div className="workflow-icon green"><PackageCheck size={19}/></div><div><span>STEP 03</span><b>Confirm booking</b><p>Allocate trucks and update capacity.</p></div></div></div></section>
  </>;
}

function Metric({icon:Icon,label,value,note,trend,trendUp}:{icon:typeof Boxes;label:string;value:string;note:string;trend:string;trendUp?:boolean}) {
  return <div className="metric-card"><div className="metric-top"><div className="metric-icon"><Icon size={18}/></div><span className="metric-context">{label==="Listed load value"?"FINANCIALS":"LIVE SUMMARY"}</span></div><div className="metric-value">{value}</div><div className="metric-label">{label}</div><div className="metric-foot"><span>{note}</span><span className={`metric-trend ${trendUp?"up":""}`}>{trendUp?<ArrowUpRight size={13}/>:null}{trend}</span></div></div>;
}

function LoadsTable({loads,loading,compact,onBest,onCancel}:{loads:Load[];loading:boolean;compact?:boolean;onBest:(id:string)=>void;onCancel:(id:string)=>void}) {
  if (loading) return <div className="table-loading"><RefreshCw size={17}/> Loading records…</div>;
  if (!loads.length) return <div className="empty-state"><Boxes size={22}/><b>No loads found</b><span>Try a different filter or create a new load.</span></div>;
  return <div className="table-scroll"><table><thead><tr><th>LOAD / ROUTE</th><th>TRUCKS</th><th>RATE</th><th>STATUS</th><th>{compact?"":"ACTIONS"}</th></tr></thead><tbody>{loads.map(l=><tr key={l.id}><td><div className="load-cell"><span className="load-id">{shortId(l.id)}</span><b>{get(l as Record<string,unknown>,"origin","pickupLocation") as string||"Origin"} <ArrowRight size={12}/> {get(l as Record<string,unknown>,"destination","deliveryLocation") as string||"Destination"}</b><span>{String(l.cargoType||l.cargo||"General cargo")} · {l.pickupDate||"Pickup date not set"}</span></div></td><td><span className="truck-count">{l.remainingTrucks??l.trucksRequired??"—"} <small>/ {l.trucksRequired??"—"}</small></span><span className="sub-cell">{l.truckType||"Truck type"}</span></td><td><b className="table-money">{money(l.price)}</b><span className="sub-cell">Listed rate</span></td><td><span className={statusClass(l.status)}>{l.status||"UNKNOWN"}</span></td><td>{!compact&&<div className="row-actions"><button className="mini-action" title="Rank bids" onClick={()=>onBest(l.id)}><Activity size={14}/></button>{l.status!=="CANCELLED"&&l.status!=="BOOKED"&&<button className="mini-action danger-mini" title="Cancel load" onClick={()=>onCancel(l.id)}><X size={14}/></button>}</div>}{compact&&<button className="mini-action" title="Rank bids" onClick={()=>onBest(l.id)}><ArrowRight size={14}/></button>}</td></tr>)}</tbody></table></div>;
}

function BidsTable({bids,onReject}:{bids:Bid[];onReject:(id:string)=>void}) {
  if (!bids.length) return <div className="empty-state"><Activity size={22}/><b>No bids found</b><span>Bids submitted to the backend will appear here.</span></div>;
  return <div className="table-scroll"><table><thead><tr><th>BID / LOAD</th><th>TRANSPORTER</th><th>OFFER</th><th>STATUS</th><th>ACTIONS</th></tr></thead><tbody>{bids.map(b=><tr key={b.id}><td><div className="load-cell"><span className="load-id">{shortId(b.id)}</span><b>Load {shortId(b.loadId)}</b><span>{b.trucksOffered??"—"} trucks · {b.truckType||"—"}</span></div></td><td><b>{b.transporterName||shortId(b.transporterId)}</b><span className="sub-cell">Rating {b.rating??"—"} / 5</span></td><td><b className="table-money">{money(b.proposedRate)}</b><span className="sub-cell">Proposed rate</span></td><td><span className={statusClass(b.status)}>{b.status||"UNKNOWN"}</span></td><td>{b.status==="PENDING"?<button className="btn btn-small btn-danger" onClick={()=>onReject(b.id)}>Reject</button>:<span className="sub-cell">—</span>}</td></tr>)}</tbody></table></div>;
}

function CreateLoadModal({busy,onClose,onSubmit}:{busy:boolean;onClose:()=>void;onSubmit:(body:Record<string,unknown>)=>void}) {
  const [form,setForm] = useState({shipperId:"",origin:"",destination:"",cargoType:"",weight:"",weightUnit:"TON",price:"",pickupDate:"",deliveryDate:"",trucksRequired:"1",truckType:"Container"});
  const change=(key:string,value:string)=>setForm(p=>({...p,[key]:value}));
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">NEW FREIGHT REQUEST</span><h2>Create a load</h2><p>Add the route, cargo details and capacity needed.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button></div><form className="modal-form" onSubmit={e=>{e.preventDefault();onSubmit({...form,weight:Number(form.weight),price:Number(form.price),trucksRequired:Number(form.trucksRequired)});}}><label className="full">Shipper UUID<input value={form.shipperId} onChange={e=>change("shipperId",e.target.value)} placeholder="UUID supplied by the backend" required/></label><label>Origin<input value={form.origin} onChange={e=>change("origin",e.target.value)} placeholder="Pickup city" required/></label><label>Destination<input value={form.destination} onChange={e=>change("destination",e.target.value)} placeholder="Delivery city" required/></label><label>Cargo type<input value={form.cargoType} onChange={e=>change("cargoType",e.target.value)} placeholder="e.g. Electronics" required/></label><label>Truck type<input value={form.truckType} onChange={e=>change("truckType",e.target.value)} placeholder="e.g. Container" required/></label><label>Weight<input type="number" min="0.1" step="0.1" value={form.weight} onChange={e=>change("weight",e.target.value)} required/></label><label>Weight unit<select value={form.weightUnit} onChange={e=>change("weightUnit",e.target.value)}><option>TON</option><option>KG</option></select></label><label>Listed rate (₹)<input type="number" min="1" value={form.price} onChange={e=>change("price",e.target.value)} required/></label><label>Trucks required<input type="number" min="1" value={form.trucksRequired} onChange={e=>change("trucksRequired",e.target.value)} required/></label><label>Pickup date<input type="date" min={new Date().toISOString().slice(0,10)} value={form.pickupDate} onChange={e=>change("pickupDate",e.target.value)} required/></label><label>Delivery date<input type="date" min={form.pickupDate||new Date().toISOString().slice(0,10)} value={form.deliveryDate} onChange={e=>change("deliveryDate",e.target.value)} required/></label><div className="form-foot full"><span><ShieldCheck size={14}/> Validated by Spring Boot</span><button className="btn btn-primary" disabled={busy} type="submit">{busy?"Creating…":"Create load"} <ArrowRight size={15}/></button></div></form></div></div>;
}

function CreateBidModal({loads,busy,onClose,onSubmit}:{loads:Load[];busy:boolean;onClose:()=>void;onSubmit:(body:Record<string,unknown>)=>void}) {
  const available=loads.filter(l=>l.status==="POSTED"||l.status==="OPEN_FOR_BIDS");
  const [form,setForm]=useState({loadId:available[0]?.id||"",transporterId:"",proposedRate:"",trucksOffered:"1",truckType:"Container"});
  const change=(k:string,v:string)=>setForm(p=>({...p,[k]:v}));
  return <div className="modal-backdrop" onClick={onClose}><div className="modal" onClick={e=>e.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">TRANSPORTER OFFER</span><h2>Submit a bid</h2><p>Submit a rate and truck availability against a load.</p></div><button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18}/></button></div><form className="modal-form" onSubmit={e=>{e.preventDefault();onSubmit({...form,proposedRate:Number(form.proposedRate),trucksOffered:Number(form.trucksOffered)});}}><label className="full">Load<select value={form.loadId} onChange={e=>change("loadId",e.target.value)} required>{available.map(l=><option key={l.id} value={l.id}>{shortId(l.id)} · {l.origin} → {l.destination}</option>)}</select></label><label className="full">Transporter UUID<input value={form.transporterId} onChange={e=>change("transporterId",e.target.value)} placeholder="Existing transporter UUID" required/></label><label>Proposed rate (₹)<input type="number" min="1" value={form.proposedRate} onChange={e=>change("proposedRate",e.target.value)} required/></label><label>Trucks offered<input type="number" min="1" value={form.trucksOffered} onChange={e=>change("trucksOffered",e.target.value)} required/></label><label className="full">Truck type<input value={form.truckType} onChange={e=>change("truckType",e.target.value)} required/></label><div className="form-foot full"><span><Activity size={14}/> Ranked by backend score</span><button className="btn btn-primary" disabled={busy||!available.length} type="submit">Submit bid <ArrowRight size={15}/></button></div></form></div></div>;
}

function TransporterEditor({transporter,busy,onSave}:{transporter:Transporter;busy:boolean;onSave:(trucks:TruckItem[])=>void}) {
  const [trucks,setTrucks]=useState<TruckItem[]>(transporter.trucks||[]);
  useEffect(()=>setTrucks(transporter.trucks||[]),[transporter]);
  const update=(i:number,key:"truckType"|"count",value:string)=>setTrucks(old=>old.map((x,n)=>n===i?{...x,[key]:key==="count"?Number(value):value}:x));
  return <div className="transporter-record"><div className="transporter-title"><div className="transporter-logo">{(transporter.companyName||"T").slice(0,1).toUpperCase()}</div><div><b>{transporter.companyName||"Transporter"}</b><span>{shortId(transporter.id)} · Rating {transporter.rating??"—"}/5</span></div></div><div className="fleet-title"><b>Truck inventory</b><button className="text-button" onClick={()=>setTrucks(old=>[...old,{truckType:"",count:1}])}><Plus size={14}/> Add type</button></div>{trucks.map((t,i)=><div className="truck-edit-row" key={`${t.id||t.truckType}-${i}`}><input aria-label="Truck type" value={t.truckType} onChange={e=>update(i,"truckType",e.target.value)} placeholder="Truck type"/><input aria-label="Truck count" type="number" min="0" value={t.count} onChange={e=>update(i,"count",e.target.value)}/><button className="mini-action danger-mini" aria-label="Remove truck type" onClick={()=>setTrucks(old=>old.filter((_,n)=>n!==i))}><X size={14}/></button></div>)}<button className="btn btn-primary save-inventory" disabled={busy} onClick={()=>onSave(trucks)}><Check size={15}/> Save inventory</button></div>;
}

function Info({label,value}:{label:string;value:string}) { return <div className="info-item"><span>{label}</span><b>{value}</b></div>; }