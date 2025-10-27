import React, { useState, useEffect } from "react";
import axios from "axios";

function LaminationMaster() {
  // Only lamination_type and rate_per_sqft
  const [form, setForm] = useState({ lamination_type: "", rate_per_sqft: "" });
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/masters/lamination");
      setList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`http://localhost:5000/api/masters/lamination/${editId}`, form);
      } else {
        await axios.post("http://localhost:5000/api/masters/lamination", form);
      }
      setForm({ lamination_type: "", rate_per_sqft: "" });
      setEditId(null);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (item) => { setForm(item); setEditId(item.id); };
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this record?")) return;
    try {
      await axios.delete(`http://localhost:5000/api/masters/lamination/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Lamination Master</h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-2 mb-4">
        <input
          placeholder="Lamination Type"
          className="border p-2"
          value={form.lamination_type}
          onChange={(e) => setForm({ ...form, lamination_type: e.target.value })}
        />
        <input
          placeholder="Rate per sqft"
          className="border p-2"
          value={form.rate_per_sqft}
          onChange={(e) => setForm({ ...form, rate_per_sqft: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 rounded col-span-full">{editId ? "Update" : "Add"}</button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Lamination Type</th>
            <th>Rate/sqft</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">No records found</td>
            </tr>
          ) : (
            list.map((item) => (
              <tr key={item.id} className="border-t text-center">
                <td>{item.lamination_type}</td>
                <td>{item.rate_per_sqft}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="text-blue-600 mx-2">Edit</button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default LaminationMaster;
