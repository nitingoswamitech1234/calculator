import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/api";
import { toast } from "react-hot-toast";

function PastingMaster() {
  const [pastingList, setPastingList] = useState([]);
  const [formData, setFormData] = useState({ method: "", rate: "" });
  const [editId, setEditId] = useState(null);

  const fetchPasting = async () => {
    try {
      const res = await axiosInstance.get("masters/pasting");
      setPastingList(res.data);
    } catch (err) {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => { fetchPasting(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`masters/pasting/${editId}`, formData);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post("masters/pasting", formData);
        toast.success("Added successfully");
      }
      setFormData({ method: "", rate: "" });
      setEditId(null);
      fetchPasting();
    } catch {
      toast.error("Error saving record");
    }
  };

  const handleEdit = (item) => {
    setFormData({ method: item.method, rate: item.rate });
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await axiosInstance.delete(`masters/pasting/${id}`);
    toast.success("Deleted successfully");
    fetchPasting();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Pasting Master</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Pasting Method"
          value={formData.method}
          onChange={(e) => setFormData({ ...formData, method: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Rate"
          value={formData.rate}
          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Method</th>
            <th className="border p-2">Rate</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pastingList.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">No records found</td>
            </tr>
          ) : (
            pastingList.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.method}</td>
                <td className="border p-2">{item.rate}</td>
                <td className="border p-2 space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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
  );
}

export default PastingMaster;
