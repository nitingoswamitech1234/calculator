import React, { useState, useEffect } from "react";
import axios from "../../utils/api"; // centralized axios instance
import toast, { Toaster } from "react-hot-toast";

const initialForm = {
  name: "",
  company: "",
  address: "",
  phone: "",
  email: "",
};

export default function CustomerMaster() {
  const [form, setForm] = useState(initialForm);
  const [customers, setCustomers] = useState([]);
  const [editId, setEditId] = useState(null);

  // Fetch customers
  const fetchCustomers = async () => {
    try {
      const res = await axios.get("/customers");
      setCustomers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch customers");
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`/customers/${editId}`, form);
        toast.success("Customer updated");
      } else {
        await axios.post("/customers", form);
        toast.success("Customer added");
      }
      setForm(initialForm);
      setEditId(null);
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Error saving customer");
    }
  };

  const handleEdit = (customer) => {
    setForm({
      name: customer.name,
      company: customer.company,
      address: customer.address,
      phone: customer.phone,
      email: customer.email,
    });
    setEditId(customer.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete?")) return;
    try {
      await axios.delete(`/customers/${id}`);
      toast.success("Customer deleted");
      fetchCustomers();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="p-4">
      <Toaster />
      <h2 className="text-xl font-bold mb-4">Customer Master</h2>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mb-6 space-y-2">
        <div>
          <input
            placeholder="Customer Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <input
            placeholder="Company"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <input
            placeholder="Address"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <input
            placeholder="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="border p-2 w-full"
          />
        </div>
        <div>
          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="border p-2 w-full"
            type="email"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 mt-2 rounded"
        >
          {editId ? "Update Customer" : "Add Customer"}
        </button>
        {editId && (
          <button
            type="button"
            onClick={() => {
              setForm(initialForm);
              setEditId(null);
            }}
            className="bg-gray-500 text-white px-4 py-2 mt-2 ml-2 rounded"
          >
            Cancel
          </button>
        )}
      </form>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-200">
            <th className="border p-2">Name</th>
            <th className="border p-2">Company</th>
            <th className="border p-2">Phone</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((c) => (
            <tr key={c.id}>
              <td className="border p-2">{c.name}</td>
              <td className="border p-2">{c.company}</td>
              <td className="border p-2">{c.phone}</td>
              <td className="border p-2">{c.email}</td>
              <td className="border p-2 space-x-2">
                <button
                  onClick={() => handleEdit(c)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
