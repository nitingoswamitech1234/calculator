import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/api";
import { toast } from "react-hot-toast";

function TransportMaster() {
  const [transportList, setTransportList] = useState([]);
  const [formData, setFormData] = useState({ vendor: "", rate_per_km: "", fixed_charge: "", contact: "" });
  const [editId, setEditId] = useState(null);

  const fetchTransport = async () => {
    try {
      const res = await axiosInstance.get("masters/transport");
      setTransportList(res.data);
    } catch {
      toast.error("Failed to fetch data");
    }
  };

  useEffect(() => { fetchTransport(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axiosInstance.put(`masters/transport/${editId}`, formData);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post("masters/transport", formData);
        toast.success("Added successfully");
      }
      setFormData({ vendor: "", rate_per_km: "", fixed_charge: "", contact: "" });
      setEditId(null);
      fetchTransport();
    } catch {
      toast.error("Error saving record");
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await axiosInstance.delete(`masters/transport/${id}`);
    toast.success("Deleted successfully");
    fetchTransport();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Transport Master</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Vendor Name"
          value={formData.vendor}
          onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Rate per KM"
          value={formData.rate_per_km}
          onChange={(e) => setFormData({ ...formData, rate_per_km: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="number"
          placeholder="Fixed Charge"
          value={formData.fixed_charge}
          onChange={(e) => setFormData({ ...formData, fixed_charge: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Vendor</th>
            <th className="border p-2">Rate per KM</th>
            <th className="border p-2">Fixed Charge</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transportList.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">No records found</td>
            </tr>
          ) : (
            transportList.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.vendor}</td>
                <td className="border p-2">{item.rate_per_km}</td>
                <td className="border p-2">{item.fixed_charge}</td>
                <td className="border p-2">{item.contact}</td>
                <td className="border p-2 space-x-2">
                  <button onClick={() => handleEdit(item)} className="bg-yellow-500 text-white px-2 py-1 rounded">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500 text-white px-2 py-1 rounded">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TransportMaster;
