import React, { useState, useEffect } from "react";
import axios from "axios";

function CorrugationMaster() {
  const [form, setForm] = useState({ corrugation_type: "", rate_per_kg: "" });
  const [list, setList] = useState([]);
  const [editId, setEditId] = useState(null);

  const fetchData = async () => {
    try {
      const res = await axios.get("https://calculator-g6ve.onrender.com/api/masters/corrugation");
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
        await axios.put(`https://calculator-g6ve.onrender.com/api/masters/corrugation/${editId}`, form);
      } else {
        await axios.post("https://calculator-g6ve.onrender.com/api/masters/corrugation", form);
      }
      setForm({ corrugation_type: "", rate_per_kg: "" });
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
      await axios.delete(`https://calculator-g6ve.onrender.com/api/masters/corrugation/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Corrugation Master</h2>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-2 mb-4">
        <input
          placeholder="Corrugation Type"
          className="border p-2"
          value={form.corrugation_type}
          onChange={(e) => setForm({ ...form, corrugation_type: e.target.value })}
        />
        <input
          placeholder="Rate per kg"
          className="border p-2"
          value={form.rate_per_kg}
          onChange={(e) => setForm({ ...form, rate_per_kg: e.target.value })}
        />
        <button className="bg-blue-600 text-white p-2 rounded col-span-full">
          {editId ? "Update" : "Add"}
        </button>
      </form>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Corrugation Type</th>
            <th>Rate/kg</th>
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
                <td>{item.corrugation_type}</td>
                <td>{item.rate_per_kg}</td>
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

export default CorrugationMaster;
