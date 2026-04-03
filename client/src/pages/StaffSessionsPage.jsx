// Jiayu
import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import SessionTable from "../components/Course/SessionTable.jsx";
import { listSessions, deleteSession } from "../services/sessionService.js";

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState([]); // session data
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(""); // error message
  const [refreshKey, setRefreshKey] = useState(0); // to trigger data refresh
  const nav = useNavigate();
  // fetch session data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await listSessions({ limit: 50 });
      const result = res.data || res;
      setSessions(result.items || []);
    } catch (e) {
      setErr(e.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);
  // handle session deletion
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteSession(id);
      setRefreshKey((k) => k + 1);
    } catch (e) {
      alert("Failed: " + e.message);
    }
  };
  // main render
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Course Sessions</h1>
        <button
          onClick={() => nav("/admin/sessions/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + New Session
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}
      {!loading && <SessionTable sessions={sessions} onDelete={handleDelete} />}
    </div>
  );
}
