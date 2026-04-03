// Jiayu
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  listInstructors,
  deleteInstructor,
} from "../services/instructorService";
import { getRoleFromToken } from "../utils/auth";

export default function StaffInstructorsPage() {
  const nav = useNavigate();
  const role = (getRoleFromToken?.() || "").toLowerCase(); // get user role
  const isStaff = role === "staff"; // check staff role

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [items, setItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  // fetch instructors data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await listInstructors({ page: 1, pageSize: 100 });
      const result = res.data || res;
      const list = Array.isArray(result) ? result : result.items || [];
      setItems(list);
    } catch (e) {
      setErr(e.message || "Failed to load instructors");
    } finally {
      setLoading(false);
    }
  }, []);
  // fetch data on mount and when refreshKey changes
  useEffect(() => {
    fetchData();
  }, [fetchData, refreshKey]);

  if (!isStaff)
    return <div className="p-6 text-red-600">Forbidden — Staff only.</div>;

  const handleDelete = async (id) => {
    if (!confirm("Delete this instructor?")) return;
    try {
      await deleteInstructor(id);
      setItems((prev) =>
        prev.filter(
          (x) => (x._id || x.instructorId) !== id && x.instructorId !== id
        )
      );
      alert("Deleted.");
    } catch (e) {
      alert(e.message || "Delete failed");
    }
  };
  // main render
  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">All Instructors</h1>
        <button
          onClick={() => nav("/admin/instructors/new")}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          + New Instructor
        </button>
      </div>

      {loading && <p>Loading…</p>}
      {err && <p className="text-red-600">{err}</p>}

      {!loading && items.length === 0 && (
        <div className="p-6 text-gray-500">No instructors found.</div>
      )}

      {!loading && items.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-xl shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Name
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Email
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Phone
                </th>
                <th className="px-4 py-2 text-left text-sm font-semibold">
                  Status
                </th>
                <th className="px-4 py-2 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((it) => (
                <tr
                  key={it._id || it.instructorId}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-2 text-sm">
                    {it.instructorId || it._id}
                  </td>
                  <td className="px-4 py-2 text-sm">{it.name}</td>
                  <td className="px-4 py-2 text-sm">{it.email || "-"}</td>
                  <td className="px-4 py-2 text-sm">{it.phone || "-"}</td>
                  <td className="px-4 py-2 text-sm">{it.status || "Active"}</td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() =>
                        nav(
                          `/admin/instructors/${it.instructorId || it._id}/edit`
                        )
                      }
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(it.instructorId || it._id)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑 Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex items-center justify-end px-4 py-3 border-t bg-gray-50 rounded-b-xl">
            <button
              onClick={() => setRefreshKey((k) => k + 1)}
              className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded"
            >
              Refresh
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
