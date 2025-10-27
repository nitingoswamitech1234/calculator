import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

function PaperMaster() {
  const [brands, setBrands] = useState([]);
  const [newBrand, setNewBrand] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [sizeForm, setSizeForm] = useState({ size: "", rate_per_kg: "" });
  const [editId, setEditId] = useState(null);

  const fetchBrands = async () => {
    const res = await axios.get("https://calculator-g6ve.onrender.com/api/masters/paper");
    setBrands(res.data);
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // Add brand
  const addBrand = async () => {
    if (!newBrand.trim()) return toast.error("Enter brand name");
    await axios.post("https://calculator-g6ve.onrender.com/api/masters/paper/brand", { name: newBrand });
    toast.success("Brand added");
    setNewBrand("");
    fetchBrands();
  };

  // Add or update size
  const handleSizeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBrand) return toast.error("Select a brand first");
    if (!sizeForm.size || !sizeForm.rate_per_kg)
      return toast.error("Fill all fields");

    if (editId) {
      await axios.put(`https://calculator-g6ve.onrender.com/api/masters/paper/size/${editId}`, sizeForm);
      toast.success("Updated successfully");
      setEditId(null);
    } else {
      await axios.post("https://calculator-g6ve.onrender.com/api/masters/paper/size", {
        brand_id: selectedBrand.id,
        ...sizeForm,
      });
      toast.success("Size added");
    }

    setSizeForm({ size: "", rate_per_kg: "" });
    fetchBrands();
  };

  const handleEdit = (size) => {
    setEditId(size.id);
    setSizeForm({ size: size.size, rate_per_kg: size.rate_per_kg });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this size?")) return;
    await axios.delete(`https://calculator-g6ve.onrender.com/api/masters/paper/size/${id}`);
    toast.success("Deleted");
    fetchBrands();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">📄 Paper Brand Master</h1>

      {/* Add Brand */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={newBrand}
          onChange={(e) => setNewBrand(e.target.value)}
          placeholder="Enter Brand Name (e.g. Duplex)"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addBrand}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
        >
          Add Brand
        </button>
      </div>

      {/* Brand List */}
      <div className="flex flex-wrap gap-2 mb-6">
        {brands.map((b) => (
          <button
            key={b.id}
            onClick={() => setSelectedBrand(b)}
            className={`px-4 py-1 rounded-lg border ${
              selectedBrand?.id === b.id
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {b.name}
          </button>
        ))}
      </div>

      {/* Size Form */}
      {selectedBrand && (
        <div className="bg-white shadow p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-3">
            Add Sizes for: {selectedBrand.name}
          </h2>

          <form onSubmit={handleSizeSubmit} className="flex gap-3 mb-4">
            <input
              type="text"
              name="size"
              placeholder="Size (e.g. 20x30 inch)"
              value={sizeForm.size}
              onChange={(e) =>
                setSizeForm({ ...sizeForm, size: e.target.value })
              }
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              name="rate_per_kg"
              placeholder="Rate per Kg (₹)"
              value={sizeForm.rate_per_kg}
              onChange={(e) =>
                setSizeForm({ ...sizeForm, rate_per_kg: e.target.value })
              }
              className="border p-2 rounded w-40"
            />
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
            >
              {editId ? "Update" : "Add"}
            </button>
          </form>

          {/* Size Table */}
          <table className="w-full border text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-2 py-1 text-left">Size</th>
                <th className="border px-2 py-1 text-right">Rate (₹/Kg)</th>
                <th className="border px-2 py-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedBrand.sizes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-gray-500">
                    No sizes added
                  </td>
                </tr>
              ) : (
                selectedBrand.sizes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{s.size}</td>
                    <td className="border px-2 py-1 text-right">
                      {s.rate_per_kg}
                    </td>
                    <td className="border px-2 py-1 text-center">
                      <button
                        onClick={() => handleEdit(s)}
                        className="bg-yellow-400 text-white px-2 py-1 rounded mr-2"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default PaperMaster;
