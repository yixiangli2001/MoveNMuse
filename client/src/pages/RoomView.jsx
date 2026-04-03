// Xinyi
import { useEffect, useState, useMemo } from "react";
import { fetchRooms } from "../services/roomService";
import { Link } from "react-router-dom";

export default function RoomView() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [err, setErr] = useState("");

    const [q, setQ] = useState("");
    const [type, setType] = useState("all");
    const [minCapacity, setMinCapacity] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minRating, setMinRating] = useState("");

    useEffect(() => {
        fetchRooms()
        .then((res) => setRooms(res.data || res))
        .catch((e) => setErr(e.message || "Failed"))
        .finally(() => setLoading(false));
    }, []);

    const types = useMemo(
        () => Array.from(new Set(rooms.map((r) => r.type).filter(Boolean))), [rooms]
    );

    const filtered = useMemo(() => {
        const qlc = q.trim().toLowerCase();
        return rooms.filter((r) => {
            const nameHit = 
            !qlc || (r.name && r.name.toLowerCase().includes(qlc)) || (r.location && r.location.toLowerCase().includes(qlc)) || (r.type && r.type.toLowerCase().includes(qlc));

            const typeHit = type === "all" || r.type === type;

            const cap = Number(r.capacity ?? 0);
            const capHit = minCapacity === "" ? true : cap >= Number(minCapacity);

            const price = Number(r.pricePerHour ?? r.defaultPrice ?? 0);
            const priceHit = maxPrice === "" ? true : price <= Number(maxPrice);

            const rating = Number(r.rating ?? 0);
            const ratingHit = minRating === "" ? true : rating >=Number(minRating);

            return nameHit && typeHit &&capHit && priceHit && ratingHit;
        });
    }, [rooms, q, type, minCapacity, maxPrice, minRating]);

    const resetFilters = () => {
        setQ("");
        setType("all");
        setMinCapacity("");
        setMaxPrice("");
        setMinRating("");
    };

    if (loading) return <div className="p-10 text-center animate-pulse font-display text-2xl text-neutral-400">Curating spaces...</div>;
    if (err) return <div className="p-10 text-center text-red-600">{err}</div>;

    return (
        <div className="max-w-7xl mx-auto p-6 pt-32 space-y-12">
            {/* Header Section */}
            <div className="reveal-up">
                <h1 className="text-6xl font-display font-light mb-4">Artistic <span className="italic">Spaces</span></h1>
                <p className="text-xl text-neutral-500 font-light max-w-2xl">Find the perfect sanctuary for your practice, teaching, or creative events.</p>
            </div>

            {/* FILTERS - Softened */}
            <div className="glass rounded-3xl p-8 reveal-up shadow-xl shadow-neutral-900/5" style={{ animationDelay: "100ms" }}>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="lg:col-span-2">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Search</label>
                        <input value={q} onChange={(e) => setQ(e.target.value)}
                        placeholder="Name, type, location..."
                        className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Type</label>
                        <select value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all">
                            <option value ="all">All Genres</option>
                            {types.map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Min Capacity</label>
                        <input type="number" min="0" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}
                        className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all" />
                    </div>

                    <div>
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Max Price ($/h)</label>
                        <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-white/50 rounded-xl border border-neutral-200 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"/>
                    </div>
                    
                    <div className="flex items-end">
                        <button onClick={resetFilters} className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-50 transition-all">
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex items-baseline justify-between reveal-up" style={{ animationDelay: "200ms" }}>
                <h2 className="text-3xl font-display">Available Sanctuaries</h2>
                <span className="text-sm text-neutral-400 font-light italic">{filtered.length} found</span>
            </div>

            {filtered.length === 0 ? (
                <div className="py-20 text-center text-neutral-400 italic reveal-up">No spaces match your current selection.</div>
            ) : (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 reveal-up" style={{ animationDelay: "300ms" }}>
                {filtered.map((r) => {
                    const id = r.id || r._id;
                    const coverRaw = r.images?.[0] || r.img || "/room.jpg";
                    const cover = encodeURI(coverRaw);
                    const price = r.pricePerHour ?? r.defaultPrice ?? 0;
                
                    return (
                        <Link key={id} to={`/rooms/${id}`}
                        className="dynamic-card group block overflow-hidden border-none">
                            <div className="aspect-[4/3] overflow-hidden">
                                <img src={cover}
                                alt={r.name || "Room image"}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                onError={(e) => {
                                    e.currentTarget.src = "/room.jpg";
                                }}/>
                            </div>
                            <div className="p-8 space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600">{r.type}</span>
                                    <h3 className="text-2xl font-display font-medium text-neutral-900 group-hover:text-blue-600 transition-colors">{r.name}</h3>
                                </div>
                                <div className="text-sm text-neutral-500 font-light flex items-center justify-between">
                                    <span>Capacity {r.capacity} guests</span>
                                    <span className="flex items-center gap-1">⭐️ {r.rating ?? 0}</span>
                                </div>
                                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs text-neutral-400 uppercase tracking-widest">Rate</span>
                                        <span className="text-lg font-medium text-neutral-900">${price}/hr</span>
                                    </div>
                                    <span className="text-sm font-semibold text-neutral-900 group-hover:text-blue-600 flex items-center gap-2 transition-all">
                                        View Space
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="transition-transform group-hover:translate-x-1">
                                            <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </span>
                                </div>
                            </div>
                        </Link>
                );
                })}
                </div>
            )}
        </div>
    );
}
