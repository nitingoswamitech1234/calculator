import React, { useState, useEffect } from "react";
import axios from "axios";

function PrintingMaster() {
  const [form, setForm] = useState({ printing_type: "", rate: "" });
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://calculator-g6ve.onrender.com/api/masters/printing");
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
        await axios.put(`https://calculator-g6ve.onrender.com/api/masters/printing/${editId}`, form);
      } else {
        await axios.post("https://calculator-g6ve.onrender.com/api/masters/printing", form);
      }
      setForm({ printing_type: "", rate: "" });
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
      await axios.delete(`https://calculator-g6ve.onrender.com/api/masters/printing/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Printing Master</h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-2 mb-4">
        <input
          type="text"
          placeholder="Printing Type"
          className="border p-2"
          value={form.printing_type}
          onChange={(e) => setForm({ ...form, printing_type: e.target.value })}
        />
        <input
          type="number"
          placeholder="Rate (₹)"
          className="border p-2"
          value={form.rate}
          onChange={(e) => setForm({ ...form, rate: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 rounded col-span-full">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Printing Type</th>
            <th>Rate (₹)</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {list.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No records found
              </td>
            </tr>
          ) : (
            list.map((item) => (
              <tr key={item.id} className="text-center border-t">
                <td>{item.printing_type}</td>
                <td>{item.rate}</td>
                <td>
                  <button onClick={() => handleEdit(item)} className="text-blue-600 mx-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-red-600">
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

export default PrintingMaster;
