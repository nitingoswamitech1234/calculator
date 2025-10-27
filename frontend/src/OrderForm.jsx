import React, { useState, useEffect } from "react";
import api from "./utils/api";

function OrderForm() {
  const [customers, setCustomers] = useState([]);
  const [papers, setPapers] = useState([]);
  const [printings, setPrintings] = useState([]);
  const [laminations, setLaminations] = useState([]);
  const [corrugations, setCorrugations] = useState([]);
  const [pastings, setPastings] = useState([]);
  const [transports, setTransports] = useState([]);

  const [form, setForm] = useState({
    order_number: "",
    customer_id: "",
    box_name: "",
    length: 0,
    width: 0,
    height: 0,
    size_unit: "inch", // ✅ default
    paper_master_id: "",
    paper_gsm: "",
    printing_master_id: "",
    lamination_master_id: "",
    corrugation_master_id: "",
    pasting_master_id: "",
    transport_master_id: "",
    quantity: 1,
    include_paper: true,
    include_printing: true,
    include_lamination: true,
    include_corrugation: true,
    include_pasting: true,
    include_pinning: false,
    include_transport: true,
    manual_mode: false,
    transport_km: 0,
    remark: "",
  });

  // ✅ For calculators
  const [paperCalc, setPaperCalc] = useState({ length: "", breadth: "", gsm: "", sheets: 1, result: null });
  const [corrCalc, setCorrCalc] = useState({ length: "", breadth: "", type: "", result: null });

  // Fetch masters
  useEffect(() => {
    api.get("/customers").then((r) => setCustomers(r.data));
    api.get("/masters/paper").then((r) => setPapers(r.data));
    api.get("/masters/printing").then((r) => setPrintings(r.data));
    api.get("/masters/lamination").then((r) => setLaminations(r.data));
    api.get("/masters/corrugation").then((r) => setCorrugations(r.data));
    api.get("/masters/pasting").then((r) => setPastings(r.data));
    api.get("/masters/transport").then((r) => setTransports(r.data));
  }, []);

  // ✅ Paper Gramage Calculation
  const handlePaperCalc = () => {
    const { length, breadth, gsm, sheets } = paperCalc;
    if (!length || !breadth || !gsm) {
      alert("⚠️ Please enter length, breadth, and GSM");
      return;
    }

    const sheetCount = sheets && sheets > 0 ? sheets : 1;
    const weight = (length * breadth * gsm * sheetCount) / 3100 / 500;
    setPaperCalc({ ...paperCalc, result: weight.toFixed(3) });

  };

  // ✅ Auto Sheet Calculator States
  const [boxSize, setBoxSize] = useState({ length: "", width: "" });
  const [calcResult, setCalcResult] = useState(null);

  const handleCalc = async () => {
    const { length, width } = boxSize;

    if (!length || !width) {
      alert("⚠️ Please enter Box Length and Width");
      return;
    }

    try {
      const res = await api.post("/masters/auto-sheet", {
        boxLength: parseFloat(length),
        boxWidth: parseFloat(width)
      });

      setCalcResult(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching calculation from backend");
    }
  };


  // ✅ Corrugation Weight Calculation
  const handleCorrCalc = () => {
  const { length, breadth, type } = corrCalc;
  if (!length || !breadth || !type) {
    alert("⚠️ Please enter length, breadth, and type");
    return;
  }

  const length_cm = length * 2.54;
  const breadth_cm = breadth * 2.54;
  let constant = 0;

  switch (type.toLowerCase()) {
    case "rg": constant = 330; break;
    case "agro": constant = 285; break;
    case "dns": constant = 350; break;
    default: alert("Invalid corrugation type!"); return;
  }

  // ✅ Now result in kg
  const weight = (length_cm * breadth_cm * constant) / (1550 * 1000);
  setCorrCalc({ ...corrCalc, result: weight.toFixed(3) });
};

  const handleCalculate = async () => {
    const res = await api.post("/orders/calculate", form);
    alert(`💰 Total: ₹${res.data.totalCost} | Per Box: ₹${res.data.perBox}`);
  };

  const handleSave = async () => {
    const res = await api.post("/orders/calculate", form);
    alert("✅ Order Saved Successfully (ID: " + res.data.id + ")");
  };

  const input = { padding: "8px", margin: "5px 0", width: "100%", boxSizing: "border-box" };
  const section = { marginBottom: "20px", padding: "15px", border: "1px solid #ccc", borderRadius: "8px", background: "#f9f9f9" };
  const label = { display: "block", marginBottom: "5px", fontWeight: "bold" };

  return (
    <div style={{ maxWidth: "800px", margin: "auto", padding: "20px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>📦 New Order</h2>

      {/* ==================== Auto Sheet Calculator ==================== */}
      <div style={section}>
        <h3>📦 Auto Sheet Calculator</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input
            style={input}
            type="number"
            placeholder="Box Length (inch)"
            value={boxSize.length}
            onChange={(e) => setBoxSize({ ...boxSize, length: e.target.value })}
          />
          <input
            style={input}
            type="number"
            placeholder="Box Width (inch)"
            value={boxSize.width}
            onChange={(e) => setBoxSize({ ...boxSize, width: e.target.value })}
          />
          <button onClick={handleCalc} style={{ padding: "8px 15px" }}>Calculate</button>
        </div>

        {calcResult && calcResult.suggestedSheet && (
          <div style={{ marginTop: "15px", background: "#eef", padding: "10px", borderRadius: "8px" }}>
            <h4>📌 Suggested Sheet</h4>
            <p>Sheet Size: <b>{calcResult.suggestedSheet.sheetLength} × {calcResult.suggestedSheet.sheetWidth} inch</b></p>
            <p>Boxes Along Length: <b>{calcResult.suggestedSheet.boxesAlongLength}</b></p>
            <p>Boxes Along Width: <b>{calcResult.suggestedSheet.boxesAlongWidth}</b></p>
            <p>Total Boxes per Sheet: <b>{calcResult.suggestedSheet.totalBoxes}</b></p>
          </div>
        )}

      </div>

      {/* ==================== TOP CALCULATORS ==================== */}
      <div style={section}>
        <h3>📄 Paper Gramage Calculator</h3>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <input style={input} placeholder="Length (inch)" type="number" value={paperCalc.length} onChange={(e) => setPaperCalc({ ...paperCalc, length: e.target.value })} />
          <input style={input} placeholder="Breadth (inch)" type="number" value={paperCalc.breadth} onChange={(e) => setPaperCalc({ ...paperCalc, breadth: e.target.value })} />
          <input style={input} placeholder="GSM" type="number" value={paperCalc.gsm} onChange={(e) => setPaperCalc({ ...paperCalc, gsm: e.target.value })} />
          <input style={input} placeholder="Sheets" type="number" value={paperCalc.sheets} onChange={(e) => setPaperCalc({ ...paperCalc, sheets: e.target.value })} />
          <button onClick={handlePaperCalc} style={{ padding: "8px 15px" }}>Calculate</button>
        </div>
        {paperCalc.result && <p>🧾 Total Weight: <b>{paperCalc.result} Kg</b></p>}
      </div>

      <div style={section}>
        <h3>📦 Corrugation Weight Calculator</h3>
        <div style={{ display: "flex", gap: "10px" }}>
          <input style={input} placeholder="Length (inch)" type="number" value={corrCalc.length} onChange={(e) => setCorrCalc({ ...corrCalc, length: e.target.value })} />
          <input style={input} placeholder="Breadth (inch)" type="number" value={corrCalc.breadth} onChange={(e) => setCorrCalc({ ...corrCalc, breadth: e.target.value })} />
          <select style={input} value={corrCalc.type} onChange={(e) => setCorrCalc({ ...corrCalc, type: e.target.value })}>
            <option value="">Select Type</option>
            <option value="RG">RG</option>
            <option value="AGRO">AGRO</option>
            <option value="DNS">DNS</option>
          </select>
          <button onClick={handleCorrCalc} style={{ padding: "8px 15px" }}>Calculate</button>
        </div>
        {corrCalc.result && <p>📊 Weight: <b>{corrCalc.result} kg</b></p>}
      </div>

      {/* ==================== ORIGINAL FORM BELOW ==================== */}
      {/* Customer Info */}
      <div style={section}>
        <h3>Customer</h3>
        <label style={label}>Select Customer</label>
        <select style={input} value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
          <option value="">Select Customer</option>
          {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Box Details */}
      <div style={section}>
        <h3>Box Details</h3>
        <label style={label}>Box Name</label>
        <input style={input} placeholder="Box Name" value={form.box_name} onChange={(e) => setForm({ ...form, box_name: e.target.value })} />

        <div style={{ display: "flex", gap: "10px" }}>
          {["length", "width", "height"].map((dim) => (
            <div style={{ flex: 1 }} key={dim}>
              <label style={label}>{dim.toUpperCase()}</label>
              <input style={input} type="number" value={form[dim]} onChange={(e) => setForm({ ...form, [dim]: e.target.value })} />
            </div>
          ))}
          <div style={{ flex: 1 }}>
            <label style={label}>Unit</label>
            <select style={input} value={form.size_unit} onChange={(e) => setForm({ ...form, size_unit: e.target.value })}>
              <option value="mm">mm</option>
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
          </div>
        </div>
      </div>

      {/* Material Selection */}
      <div style={section}>
        <h3>Material Selection</h3>
        <label style={label}>Paper Type</label>
        <select style={input} value={form.paper_master_id} onChange={(e) => setForm({ ...form, paper_master_id: e.target.value })}>
          <option value="">Select Paper</option>
          {papers.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.gsm} GSM)</option>)}
        </select>

        <label style={label}>Printing Type</label>
        <select style={input} value={form.printing_master_id} onChange={(e) => setForm({ ...form, printing_master_id: e.target.value })}>
          <option value="">Select Printing</option>
          {printings.map((p) => <option key={p.id} value={p.id}>{p.name} - ₹{p.rate_per_sqft}/sqft</option>)}
        </select>

        <label style={label}>Lamination Type</label>
        <select style={input} value={form.lamination_master_id} onChange={(e) => setForm({ ...form, lamination_master_id: e.target.value })}>
          <option value="">Select Lamination</option>
          {laminations.map((l) => <option key={l.id} value={l.id}>{l.name} - ₹{l.rate_per_sqft}/sqft</option>)}
        </select>

        <label style={label}>Corrugation Type</label>
        <select style={input} value={form.corrugation_master_id} onChange={(e) => setForm({ ...form, corrugation_master_id: e.target.value })}>
          <option value="">Select Corrugation</option>
          {corrugations.map((c) => <option key={c.id} value={c.id}>{c.name} - ₹{c.rate_per_sqft}/sqft</option>)}
        </select>

        <label style={label}>Pasting Type</label>
        <select style={input} value={form.pasting_master_id} onChange={(e) => setForm({ ...form, pasting_master_id: e.target.value })}>
          <option value="">Select Pasting</option>
          {pastings.map((p) => <option key={p.id} value={p.id}>{p.name} - ₹{p.rate_per_box}/box</option>)}
        </select>

        <label style={label}>Transport Vendor</label>
        <select style={input} value={form.transport_master_id} onChange={(e) => setForm({ ...form, transport_master_id: e.target.value })}>
          <option value="">Select Transport</option>
          {transports.map((t) => <option key={t.id} value={t.id}>{t.vendor_name} - ₹{t.rate}/km</option>)}
        </select>
      </div>

      {/* Include Options */}
      <div style={section}>
        <h3>Include Options</h3>
        {[
          "include_paper",
          "include_printing",
          "include_lamination",
          "include_corrugation",
          "include_pasting",
          "include_pinning",
          "include_transport",
        ].map((key) => (
          <label key={key} style={{ display: "block" }}>
            <input type="checkbox" checked={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.checked })} /> {key.replace("include_", "").replace("_", " ").toUpperCase()}
          </label>
        ))}
      </div>

      {/* Quantity */}
      <div style={section}>
        <h3>Quantity</h3>
        <input style={input} type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
      </div>

      {/* Remark */}
      <div style={section}>
        <h3>Remark</h3>
        <textarea style={{ ...input, height: "80px" }} value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} />
      </div>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button style={{ padding: "10px 20px", marginRight: "10px" }} onClick={handleCalculate}>💰 Calculate</button>
        <button style={{ padding: "10px 20px" }} onClick={handleSave}>💾 Save Order</button>
      </div>
    </div>
  );
}

export default OrderForm;
