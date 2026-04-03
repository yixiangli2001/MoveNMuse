// Xinyi
import { useEffect, useState } from "react";
import { fetchRooms as listRooms, createRoom, deleteRoom, updateRoom } from "../services/roomService";

export default function RoomManagement() {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);

    const emptyForm = {
        _id: "",
        roomId: "",
        name: "",
        type: "Dance Studio",
        location: "",
        capacity: "",
        defaultPrice: "",
        images: "",
    };
    
    const [form, setForm] = useState(emptyForm);
    const [editingId, setEditingId] = useState(null);

    const loadRooms = async () => {
        try {
            setLoading(true);
            const res = await listRooms();
            setRooms(res.data || res);
        } catch (err) {
            console.error("Failed to load rooms:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadRooms();
    }, []);

    const toPayload = (f) => ({
        roomId: f.roomId ? Number(f.roomId) : undefined,
        name: f.name,
        type: f.type,
        location: f.location,
        capacity: f.capacity !== "" ? Number(f.capacity) : undefined,
        defaultPrice: f.defaultPrice !== "" ? Number(f.defaultPrice) : undefined,
        images: f.images
            ? f.images.split(",").map(normImage).filter(Boolean)
            : [],
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = toPayload(form);

        try {
        if (editingId) {
            await updateRoom(editingId, payload);
        } else {
            await createRoom(payload);
        }
        setForm(emptyForm);
        setEditingId(null);
        await loadRooms();
    } catch (err) {
        alert("failed to save room");
        console.error(err);
    }
        };

        const handleEdit = (r) => {
            setEditingId(r._id || r.roomId);
            setForm({
                _id: r._id || "",
                roomId: r.roomId ?? "",
                name: r.name ?? "",
                type: r.type ?? "Dance Studio",
                location: r.location ?? "",
                capacity: r.capacity ?? "",
                defaultPrice: (r.pricePerHour ?? r.defaultPrice ?? "") || "",
                images: Array.isArray(r.images) ? r.images.join(", ") : "",
                });
                window.scrollTo({ top: 0, behavior: "smooth" });
            };
        
        const handleCancelEdit = () => {
            setForm(emptyForm);
            setEditingId(null);
        };

        const handleDelete = async (id) => {
            if (!window.confirm("Delete this room?")) return;
            try {
              await deleteRoom(id);
              await loadRooms();
            } catch (err) {
                alert("Failed to delete room");
                console.error(err);
              }
          };
        

          return (
            <div className="p-6 max-w-5xl mx-auto">
              <h1 className="text-2xl font-semibold mb-4">
                {editingId ? "Edit Room" : "Room Management"}
                </h1>

                <form 
                onSubmit={handleSubmit}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 border rounded-xl p-4 bg-white">
                
                <input placeholder="Room ID"
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
                className="border rounded px-3 py-2" />
                
                <input placeholder="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value})}
                required
                className="border rounded px-3 py-2" />
                
                <input placeholder="Type"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="border rounded px-3 py-2" />
                
                <input placeholder="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                className="border rounded px-3 py-2" />
                
                <input type="number"
                placeholder="Capacity"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
                className="border rounded px-3 py-2" />
                
                <input type="number"
                step="0.01"
                placeholder="Default Price"
                value={form.defaultPrice}
                onChange={(e) => setForm({ ...form, defaultPrice: e.target.value })}
                className="border rounded px-3 py-2" />
                
                <input
                placeholder="Image URLs (comma separated)"
                value={form.images}
                onChange={(e) => setForm({ ...form, images: e.target.value })}
                className="sm:col-span-2 border rounded px-3 py-2" />
                
                <div className="sm:col-span-2 flex gap-3">
                <button className="rounded bg-zinc-900 text-white px-4 py-2 hover:bg-black"
                    type="submit">
                        {editingId ? "Save Changes" : "Add Room"}
                </button>
                {editingId && (
                    <button type="button"
                    onClick={handleCancelEdit}
                    className="rounded border px-4 py-2 hover:bg-zinc-100">
                        Cancel
                    </button>
                )}
                </div>
              </form>

              <h2 className="mt-6 mb-2 text-lg font-semibold">Existing Rooms</h2>
                {loading ? (
                    <p>Loading rooms...</p>
                ) : (
                    <ul className="space-y-2">
                    {rooms.map((r) => (
                        <li
                        key={r._id || r.roomId}
                        className="border rounded-xl p-3 bg-white flex items-center justify-between"
                        >
                        <div>
                            <div className="font-medium">{r.name}</div>
                            <div className="text-sm text-zinc-600">
                            {r.type} • {r.location} • Capacity {r.capacity} • $
                            {Number(r.pricePerHour ?? r.defaultPrice ?? 0).toFixed(2)}
                            </div>
                        </div>
                    <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(r)}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-zinc-100"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(r._id || r.roomId)}
                  className="rounded border px-3 py-1.5 text-sm hover:bg-red-50 text-red-600 border-red-300"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}