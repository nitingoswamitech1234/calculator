import React, { useState, useEffect } from "react";
import axiosInstance from "../../utils/api";
import { toast } from "react-hot-toast";

function VendorMaster() {
  const [vendorList, setVendorList] = useState([]);
  const [formData, setFormData] = useState({ vendor_name: "", contact: "", gst_no: "", address: "" });
  const [editId, setEditId] = useState(null);

  const fetchVendors = async () => {
    const res = await axiosInstance.get("masters/vendor");
    setVendorList(res.data);
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.vendor_name) return toast.error("Vendor Name is required");
      if (editId) {
        await axiosInstance.put(`masters/vendor/${editId}`, formData);
        toast.success("Updated successfully");
      } else {
        await axiosInstance.post("masters/vendor", formData);
        toast.success("Added successfully");
      }
      setFormData({ vendor_name: "", contact: "", gst_no: "", address: "" });
      setEditId(null);
      fetchVendors();
    } catch {
      toast.error("Error saving record");
    }
  };

  const handleEdit = (item) => {
    setFormData({
      vendor_name: item.vendor_name,
      contact: item.contact || "",
      gst_no: item.material_type || "",
      address: item.address || ""
    });
    setEditId(item.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;
    await axiosInstance.delete(`masters/vendor/${id}`);
    toast.success("Deleted successfully");
    fetchVendors();
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Vendor Master</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          type="text"
          placeholder="Vendor Name"
          value={formData.vendor_name}
          onChange={(e) => setFormData({ ...formData, vendor_name: e.target.value })}
          className="border p-2 w-full rounded"
          required
        />
        <input
          type="text"
          placeholder="Contact"
          value={formData.contact}
          onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="GST Number"
          value={formData.gst_no}
          onChange={(e) => setFormData({ ...formData, gst_no: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          className="border p-2 w-full rounded"
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Vendor Name</th>
            <th className="border p-2">Contact</th>
            <th className="border p-2">GST No</th>
            <th className="border p-2">Address</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vendorList.length === 0 ? (
            <tr><td colSpan="5" className="text-center py-4 text-gray-500">No records found</td></tr>
          ) : (
            vendorList.map((item) => (
              <tr key={item.id}>
                <td className="border p-2">{item.vendor_name}</td>
                <td className="border p-2">{item.contact}</td>
                <td className="border p-2">{item.material_type}</td>
                <td className="border p-2">{item.address}</td>
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

export default VendorMaster;
