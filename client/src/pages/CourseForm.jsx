// Jiayu
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  getCourse,
  createCourse,
  updateCourse,
} from "../services/courseService";
import { getRoleFromToken, getToken } from "../utils/auth";

const CATEGORY_OPTIONS = ["Dance", "Yoga", "Workshop"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function CourseForm() {
  const { id } = useParams(); // courseId
  const isEdit = !!id;
  const nav = useNavigate();
  const loc = useLocation();
  const role = (getRoleFromToken?.() || "").toLowerCase();
  const isStaff = role === "staff";

  const search = new URLSearchParams(loc.search);
  const returnTo = search.get("return"); // optional: return to a specific page after

  const [form, setForm] = useState({
    name: "",
    description: "",
    defaultPrice: "0",
    category: "",
    level: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  // load course data if editing
  useEffect(() => {
    if (!isEdit) return;
    setLoading(true);
    getCourse(id)
      .then((c) => {
        setForm({
          name: c.name || c.title || "",
          description: c.description || "",
          defaultPrice: (c.defaultPrice ?? 0).toString(),
          category: c.category || "",
          level: c.level || "",
        });
      })
      .catch((e) => setErr(e.message || "Failed to load course"))
      .finally(() => setLoading(false));
  }, [id, isEdit]);
  // restrict to staff only
  if (!isStaff)
    return <div className="p-6 text-red-600">Forbidden — Staff only.</div>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const goBack = () => {
    if (returnTo) nav(returnTo);
    else nav("/admin/courses");
  };

  // validation
  const priceNeg =
    String(form.defaultPrice).trim() !== "" && Number(form.defaultPrice) < 0;
  const categoryEmpty = String(form.category).trim() === "";
  const levelEmpty = String(form.level).trim() === "";
  // handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr("");

    if (categoryEmpty) {
      setErr("Please select a category.");
      return;
    }
    if (levelEmpty) {
      setErr("Please select a level.");
      return;
    }
    if (priceNeg) {
      setErr("Price cannot be negative.");
      return;
    }

    setLoading(true);
    try {
      const token = getToken?.();
      if (!token) {
        alert("Please login as staff.");
        nav("/login", {
          replace: false,
          state: { redirectTo: location.pathname },
        }); // redirect to login
        return;
      }
      // prepare payload
      const priceStr = String(form.defaultPrice).trim();
      const payload = {
        name: form.name?.trim(),
        description: form.description?.trim(),

        defaultPrice: priceStr === "" ? 0 : Number(priceStr),
        category: form.category?.trim(),
        level: form.level?.trim(),
      };

      if (isEdit) {
        await updateCourse(id, payload);
        alert("Course updated.");
      } else {
        await createCourse(payload);
        alert("Course created.");
      }

      nav("/admin/courses");
      return;
    } catch (e2) {
      setErr(e2.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };
  // render form
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">
        {isEdit ? "Edit Course" : "Create New Course"}
      </h1>

      {err && <p className="text-red-600 mb-4">{err}</p>}

      <form
        onSubmit={handleSubmit}
        className="space-y-5 bg-white p-6 rounded-xl shadow"
      >
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            className="w-full border rounded px-3 py-2"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            placeholder="e.g. Contemporary Dance (Beginner)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded px-3 py-2"
            rows={4}
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Course overview, requirements, who it's for…"
          />
        </div>

        {/* Category & Level */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">Category</span>
            <select
              className="w-full border rounded px-3 py-2"
              name="category"
              value={form.category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {CATEGORY_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {categoryEmpty && (
              <p className="text-xs text-red-600 mt-1">
                Please select a category.
              </p>
            )}
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-1">Level</span>
            <select
              className="w-full border rounded px-3 py-2"
              name="level"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Level --</option>
              {LEVEL_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {levelEmpty && (
              <p className="text-xs text-red-600 mt-1">
                Please select a level.
              </p>
            )}
          </label>
        </div>

        {/* Price */}
        <div className="grid grid-cols-2 gap-4">
          <label className="block">
            <span className="block text-sm font-medium mb-1">
              Default Price (AUD)
            </span>
            <input
              type="number"
              min="0"
              step="1"
              className="w-full border rounded px-3 py-2"
              name="defaultPrice"
              value={form.defaultPrice}
              onChange={handleChange}
              placeholder="e.g. 49.00 (≥ 0)"
              required
            />
            {priceNeg && (
              <p className="text-xs text-red-600 mt-1">
                Price cannot be less than 0.
              </p>
            )}
          </label>
        </div>

        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
          >
            ← Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow"
          >
            {loading ? "Saving..." : isEdit ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
}
