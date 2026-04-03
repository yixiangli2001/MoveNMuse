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

    if (loading) return <div className="p-6">Loading...</div>;
    if (err) return <div className="p-6 text-red-600">{err}</div>;

    return (
        <div className="p-6 space-y-4">
            {/* FILTERS */}
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
                <div className="lg:col-span-2">
                    <label className="block text-xs text-zinc-500 mb-1">Search</label>
                    <input value={q} onChange={(e) => setQ(e.target.value)}
                    placeholder="Search name, type, location..."
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900" />
                </div>
                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Type</label>
                    <select value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm">
                        <option value ="all">All</option>
                        {types.map(t => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Min Capacity</label>
                    <input type="number" min="o" value={minCapacity} onChange={(e) => setMinCapacity(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm" />
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Max Price ($/h)</label>
                    <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"/>
                </div>

                <div>
                    <label className="block text-xs text-zinc-500 mb-1">Max Price ($/h)</label>
                    <input type="number" min="0" max ="5" step="0.1" value={minRating} onChange={(e) => setMinRating(e.target.value)}
                    className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"/>
                </div>
                
                <div className="flex items-end">
                    <button onClick={resetFilters} className="w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm hover:bg-zinc-50">
                        Reset
                    </button>
                </div>
            </div>
            </div>

            <h2 className="text-2xl font-semibold">Available Rooms
                <span className="ml-2 text-sm text-zinc-500">({filtered.length})</span>
            </h2>

            {filtered.length === 0 ? (
                <div className="text-sm text-zinc-600">No rooms match your filters.</div>
            ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filtered.map((r) => {
                    const id = r.id || r._id;
                    const coverRaw = r.images?.[0] || r.img || "/placeholder-room.jpg";
                    const cover = encodeURI(coverRaw);
                    const price = r.pricePerHour ?? r.defaultPrice ?? 0;
                
                    return (
                        <Link key={id} to={`/rooms/${id}`}
                        className="block rounded-xl border border-zinc-200 bg-white p-4 hover:shadow">
                        <div className="aspect-[16/9] bg-zinc-100 overflow-hidden rounded-lg mb-3">
                        <img src={cover}
                        alt={r.name || "Room image"}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            e.currentTarget.src = "/placeholder-room.jpg";
                        }}/>
                        </div>
                        <h3 className="text-lg font-medium">{r.name}</h3>
                        <div className="text-sm text-zinc-600">
                        {r.type} capacity {r.capacity}
                        </div>
                        <div className="mt-1 flex justify-between text-sm">
                        <span>⭐️ Rating: {r.rating ?? 0}</span>
                        <span className="font-semibold">${price}/h</span>
                        </div>
                    </Link>
                );
                })}
                </div>
            )}
        </div>
    );
}
