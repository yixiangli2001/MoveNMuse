// Shirley, Xinyi
const API = `${import.meta.env.VITE_BACKEND_URL || ''}/api/rooms`;

fetch("/")
.then(r => r.text())
// .then(txt => console.log("[TEST] Backend / =>", txt))
// .catch(err => console.error("[TEST] Failed to reach backend /:", err));

export async function fetchRooms() {
    // console.log("[room.js] GET", API);
    const res = await fetch(API);
    if (!res.ok) throw new Error("Failed");
    return res.json();
}

export async function fetchRoomById(id) {
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) throw new Error("Room not found");
    return res.json();
}

//Staff create rooms
export async function createRoom(data) {
    const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Create failed");
    return res.json();
}

export async function updateRoom(id, data) {
    const res = await fetch (`${API}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error("Update failed");
    return res.json();
}

export async function deleteRoom(id) {
    const res = await fetch(`${API}/${id}`, { method: "DELETE"});
    if (!res.ok) throw new Error("Delete failed");
}