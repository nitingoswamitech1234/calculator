import React, { useState, useEffect } from "react";
import api from "./utils/api";

function FullOrderEntry() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    customer_id: "",
    box_name: "",
    quantity: "",
    remark: "",
    boxLength: "",
    boxBreadth: "",
    sheetLength: "",
    sheetBreadth: "",
    gsm: "",
    totalSheets: "",
    sheetWeight: "",
    corrType: "",
    printing_name: "",
    lamination_name: "",
    lamination_price: "",
    pasting_name: "",
    dieCuttingMachine: "",
    dieCuttingSize: "",
    dieCuttingPrice: "",
    transport_price: "",
    totalPrice: "",
  });

  // ✅ Fetch only customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const res = await api.get("/customers");
        setCustomers(res.data);
      } catch (err) {
        console.error("Error fetching customers:", err);
      }
    };
    fetchCustomers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ✅ Save Order
  const handleSave = async () => {
    if (!form.customer_id) return alert("⚠️ Please select a customer");
    if (!form.box_name.trim()) return alert("⚠️ Please enter box name");
    if (!form.quantity || Number(form.quantity) <= 0)
      return alert("⚠️ Please enter valid quantity");

    try {
      setLoading(true);
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 0,
        gsm: Number(form.gsm) || 0,
        totalSheets: Number(form.totalSheets) || 0,
        sheetWeight: Number(form.sheetWeight) || 0,
        lamination_price: Number(form.lamination_price) || 0,
        dieCuttingPrice: Number(form.dieCuttingPrice) || 0,
        transport_price: Number(form.transport_price) || 0,
        totalPrice: Number(form.totalPrice) || 0,
        final_total: Number(form.totalPrice) || 0,
      };

      const res = await api.post("/orders/save", payload);
      if (res.data.success) {
        alert("✅ Order saved successfully!");
        setForm({
          customer_id: "",
          box_name: "",
          quantity: "",
          remark: "",
          boxLength: "",
          boxBreadth: "",
          sheetLength: "",
          sheetBreadth: "",
          gsm: "",
          totalSheets: "",
          sheetWeight: "",
          corrType: "",
          printing_name: "",
          lamination_name: "",
          lamination_price: "",
          pasting_name: "",
          dieCuttingMachine: "",
          dieCuttingSize: "",
          dieCuttingPrice: "",
          transport_price: "",
          totalPrice: "",
        });
      } else {
        alert("⚠️ Error saving order.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("❌ Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "25px",
        borderRadius: "10px",
        border: "1px solid #ccc",
        backgroundColor: "#f9f9f9",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>🧾 Manual Order Entry</h2>

      {/* Customer Dropdown */}
      <label>Customer</label>
      <select
        name="customer_id"
        value={form.customer_id}
        onChange={handleChange}
        style={inputStyle}
      >
        <option value="">-- Select Customer --</option>
        {customers.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Manual Inputs */}
      <input name="box_name" placeholder="Box Name" value={form.box_name} onChange={handleChange} style={inputStyle} />
      <input name="quantity" type="number" placeholder="Quantity" value={form.quantity} onChange={handleChange} style={inputStyle} />

      <div style={row}>
        <input name="boxLength" placeholder="Box Length" value={form.boxLength} onChange={handleChange} style={halfInput} />
        <input name="boxBreadth" placeholder="Box Breadth" value={form.boxBreadth} onChange={handleChange} style={halfInput} />
      </div>

      <div style={row}>
        <input name="sheetLength" placeholder="Sheet Length" value={form.sheetLength} onChange={handleChange} style={halfInput} />
        <input name="sheetBreadth" placeholder="Sheet Breadth" value={form.sheetBreadth} onChange={handleChange} style={halfInput} />
      </div>

      <input name="gsm" type="number" placeholder="GSM" value={form.gsm} onChange={handleChange} style={inputStyle} />
      {/* <input name="totalSheets" type="number" placeholder="Total Sheets" value={form.totalSheets} onChange={handleChange} style={inputStyle} /> */}
      {/* <input name="sheetWeight" type="number" placeholder="Sheet Weight" value={form.sheetWeight} onChange={handleChange} style={inputStyle} /> */}

      {/* <input name="corrType" placeholder="Corrugation Type" value={form.corrType} onChange={handleChange} style={inputStyle} /> */}
      <input name="printing_name" placeholder="Printing Name" value={form.printing_name} onChange={handleChange} style={inputStyle} />
      {/* <input name="lamination_name" placeholder="Lamination Name" value={form.lamination_name} onChange={handleChange} style={inputStyle} /> */}
      {/* <input name="lamination_price" type="number" placeholder="Lamination Price" value={form.lamination_price} onChange={handleChange} style={inputStyle} /> */}
      <input name="pasting_name" placeholder="Pasting Name" value={form.pasting_name} onChange={handleChange} style={inputStyle} />

      {/* <input name="dieCuttingMachine" placeholder="Die Cutting Machine" value={form.dieCuttingMachine} onChange={handleChange} style={inputStyle} /> */}
      {/* <input name="dieCuttingSize" placeholder="Die Cutting Size" value={form.dieCuttingSize} onChange={handleChange} style={inputStyle} /> */}
      {/* <input name="dieCuttingPrice" type="number" placeholder="Die Cutting Price" value={form.dieCuttingPrice} onChange={handleChange} style={inputStyle} /> */}
      {/* <input name="transport_price" type="number" placeholder="Transport Price" value={form.transport_price} onChange={handleChange} style={inputStyle} /> */}
      <input name="totalPrice" type="number" placeholder="Total Price" value={form.totalPrice} onChange={handleChange} style={inputStyle} />

      <textarea
        name="remark"
        placeholder="Remark"
        value={form.remark}
        onChange={handleChange}
        style={{ width: "100%", minHeight: "60px", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={handleSave}
        disabled={loading}
        style={{
          width: "100%",
          padding: "10px",
          borderRadius: "5px",
          border: "none",
          backgroundColor: "#007bff",
          color: "white",
          fontSize: "16px",
          cursor: loading ? "not-allowed" : "pointer",
        }}
      >
        {loading ? "Saving..." : "💾 Save Order"}
      </button>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  borderRadius: "5px",
  border: "1px solid #ccc",
};
const row = { display: "flex", gap: "10px" };
const halfInput = { ...inputStyle, flex: 1 };

export default FullOrderEntry;
