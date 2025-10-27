import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

function DieCuttingMaster() {
  const [machines, setMachines] = useState([]);
  const [newMachine, setNewMachine] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [sizeForm, setSizeForm] = useState({ size: "", rate_per_unit: "" });
  const [editId, setEditId] = useState(null);

  // Fetch all machines + sizes
  const fetchMachines = async () => {
    const res = await axios.get("https://calculator-g6ve.onrender.com/api/masters/die-cutting");
    setMachines(res.data);
  };

  useEffect(() => {
    fetchMachines();
  }, []);

  // Add Machine Brand
  const addMachine = async () => {
    if (!newMachine.trim()) return toast.error("Enter machine name");
    await axios.post("https://calculator-g6ve.onrender.com/api/masters/die-cutting/brand", { machine_name: newMachine });
    toast.success("Machine added");
    setNewMachine("");
    fetchMachines();
  };

  // Add or update size
  const handleSizeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMachine) return toast.error("Select a machine first");
    if (!sizeForm.size || !sizeForm.rate_per_unit) return toast.error("Fill all fields");

    if (editId) {
      await axios.put(`https://calculator-g6ve.onrender.com/api/masters/die-cutting/size/${editId}`, sizeForm);
      toast.success("Updated successfully");
      setEditId(null);
    } else {
      await axios.post("https://calculator-g6ve.onrender.com/api/masters/die-cutting/size", {
        machine_id: selectedMachine.id,
        ...sizeForm,
      });
      toast.success("Size added");
    }

    setSizeForm({ size: "", rate_per_unit: "" });
    fetchMachines();
  };

  const handleEdit = (size) => {
    setEditId(size.id);
    setSizeForm({ size: size.size, rate_per_unit: size.rate_per_unit });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this size?")) return;
    await axios.delete(`https://calculator-g6ve.onrender.com/api/masters/die-cutting/size/${id}`);
    toast.success("Deleted");
    fetchMachines();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Toaster />
      <h1 className="text-2xl font-bold mb-4 text-gray-800">✂️ Die Cutting Master</h1>

      {/* Add Machine Brand */}
      <div className="flex gap-3 mb-4">
        <input
          type="text"
          value={newMachine}
          onChange={(e) => setNewMachine(e.target.value)}
          placeholder="Enter Machine Brand (e.g. Machine A)"
          className="border p-2 rounded flex-1"
        />
        <button
          onClick={addMachine}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded"
        >
          Add Machine
        </button>
      </div>

      {/* Machine List */}
      <div className="flex flex-wrap gap-2 mb-6">
        {machines.map((m) => (
          <button
            key={m.id}
            onClick={() => setSelectedMachine(m)}
            className={`px-4 py-1 rounded-lg border ${
              selectedMachine?.id === m.id ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            {m.machine_name}
          </button>
        ))}
      </div>

      {/* Size Form */}
      {selectedMachine && (
        <div className="bg-white shadow p-4 rounded-2xl">
          <h2 className="text-lg font-semibold mb-3">
            Add Sizes for: {selectedMachine.machine_name}
          </h2>

          <form onSubmit={handleSizeSubmit} className="flex gap-3 mb-4">
            <input
              type="text"
              placeholder="Size (e.g. 31x41)"
              value={sizeForm.size}
              onChange={(e) => setSizeForm({ ...sizeForm, size: e.target.value })}
              className="border p-2 rounded flex-1"
            />
            <input
              type="number"
              placeholder="Rate per unit (₹)"
              value={sizeForm.rate_per_unit}
              onChange={(e) => setSizeForm({ ...sizeForm, rate_per_unit: e.target.value })}
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
                <th className="border px-2 py-1 text-right">Rate (₹/unit)</th>
                <th className="border px-2 py-1 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedMachine.sizes.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-3 text-gray-500">
                    No sizes added
                  </td>
                </tr>
              ) : (
                selectedMachine.sizes.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="border px-2 py-1">{s.size}</td>
                    <td className="border px-2 py-1 text-right">{s.rate_per_unit}</td>
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

export default DieCuttingMaster;
