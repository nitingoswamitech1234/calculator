import React, { useState, useEffect } from "react";
import api from "../utils/api";

const section = { padding: "20px", border: "1px solid #ccc", borderRadius: "10px", maxWidth: "500px", margin: "20px auto" };
const input = { padding: "8px", borderRadius: "6px", border: "1px solid #999", width: "150px" };

export default function SheetAndPaperCalculator() {
    const [boxSize, setBoxSize] = useState({ length: "", width: "" });
    const [calcResult, setCalcResult] = useState(null);
    const [showPaperCalc, setShowPaperCalc] = useState(false);
    const [showCorrCalc, setShowCorrCalc] = useState(false);
    const [corrCalc, setCorrCalc] = useState({ length: "", breadth: "", type: "", result: null });


    const [brands, setBrands] = useState([]);
    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedSize, setSelectedSize] = useState(null);
    const [sheetPrice, setSheetPrice] = useState(null);

    const [showPrinting, setShowPrinting] = useState(false);
    const [showLamination, setShowLamination] = useState(false);

    // Printing state
    const [printingOptions, setPrintingOptions] = useState([]);
    const [selectedPrinting, setSelectedPrinting] = useState(null);
    const [printingPrice, setPrintingPrice] = useState(null);

    const [laminationPrice, setLaminationPrice] = useState("");
    const [showPinPasting, setShowPinPasting] = useState(false);
    const [laminationValue, setLaminationValue] = useState(null);

    const [pinPastingOptions, setPinPastingOptions] = useState([]);
    const [selectedPinPasting, setSelectedPinPasting] = useState(null);
    const [pinPastingPrice, setPinPastingPrice] = useState(null);

    // Pin/Pasting step state

    const [manualPinPrice, setManualPinPrice] = useState(""); // manual input
    const [dropdownPinPrice, setDropdownPinPrice] = useState(""); // dropdown price
    const [showPastingDropdown, setShowPastingDropdown] = useState(false);

    const [dieCuttingPrice, setDieCuttingPrice] = useState(null);
    const [showNextStep, setShowNextStep] = useState(false); // Finish step


    const [showPasting, setShowPasting] = useState(false);       // second step
    const [showDieCutting, setShowDieCutting] = useState(false); // ✅ correct spelling

    const [showTransport, setShowTransport] = useState(false);
    const [transportPrice, setTransportPrice] = useState(""); // manual input

    const [skipCorrugation, setSkipCorrugation] = useState(false);

    // State for extra %
    const [extraPercent, setExtraPercent] = useState(0);
    const [finalTotal, setFinalTotal] = useState(null);

    const [customers, setCustomers] = useState([]);
    const [form, setForm] = useState({
        customer_id: "",
        box_name: "",
        quantity: 1,
        remark: ""
    });

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


    const [paperCalc, setPaperCalc] = useState({ length: "", breadth: "", gsm: "", sheets: 1, result: null });


    const handlePaperNext = () => {
        if (!paperCalc.result) return alert("⚠️ Calculate paper weight first");

        setCorrCalc({
            length: paperCalc.length,
            breadth: paperCalc.breadth,
            type: "",
            result: null
        });

        setShowCorrCalc(true);
    };


    useEffect(() => {
        const fetchBrands = async () => {
            try {
                const res = await api.get("/masters/paper");
                setBrands(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchBrands();
    }, []);

    const handleCalc = async () => {
        const { length, width } = boxSize;
        if (!length || !width) return alert("⚠️ Enter Box Length & Width");

        try {
            const res = await api.post("/masters/auto-sheet", {
                boxLength: parseFloat(length),
                boxWidth: parseFloat(width)
            });
            setCalcResult(res.data);
        } catch (err) {
            console.error(err);
            alert("Error fetching calculation");
        }
    };

    const handleNext = () => {
        if (!calcResult?.suggestedSheet) return alert("⚠️ Calculate suggested sheet first");
        setPaperCalc({
            ...paperCalc,
            length: Number(calcResult.suggestedSheet.sheetLength),
            breadth: Number(calcResult.suggestedSheet.sheetWidth),
            sheets: 1,
            result: null
        });
        setShowPaperCalc(true);
    };
    const handlePaperCalc = async () => {
        const { length, breadth, gsm, sheets } = paperCalc;

        console.log("PaperCalc state before send:", paperCalc);

        if (!length || !breadth || !gsm) return alert("Enter Length, Breadth, GSM");

        try {
            const res = await api.post("/masters/sheet-weight", {
                length: Number(length),
                breadth: Number(breadth),
                gsm: Number(gsm),
                quantity: Number(sheets || 1)
            });

            console.log("Response from backend:", res.data);

            if (res.data.success) {
                setPaperCalc({
                    ...paperCalc,
                    result: Number(res.data.totalWeight),
                    weightPerSheet: Number(res.data.weightPerSheet)
                });
                setSheetPrice(null);
            }
        } catch (err) {
            console.error(err);
            alert("Error calculating weight");
        }
    };

    const handleTotalCalc = () => {
        const total = calculateTotal();
        const totalWithExtra = total * (1 + Number(extraPercent) / 100);
        setFinalTotal(totalWithExtra.toFixed(2));
    };





    const handlePriceCalc = async () => {
        if (!paperCalc.result) return alert("⚠️ Calculate weight first");
        if (!selectedSize) return alert("⚠️ Select brand & size first");

        try {
            // paperCalc.result backend se grams me aa raha hai, isliye divide by 1000 karke kg me convert karenge
            const totalWeightKg = Number(paperCalc.result);

            const totalPrice = totalWeightKg * Number(selectedSize.rate_per_kg);

            setSheetPrice(totalPrice.toFixed(2)); // ₹ fix

        } catch (err) {
            console.error(err);
            alert("Error calculating price");
        }
    };

    const handleCorrCalc = async () => {
        const { length, breadth, type } = corrCalc;

        if (!length || !breadth || !type) {
            alert("⚠️ Please enter length, breadth, and type");
            return;
        }

        try {
            const res = await api.post("/masters/corrugation/weight", { length, breadth, type });

            if (res.data.weight) {
                // ✅ Directly use backend result (already in grams)
                setCorrCalc({ ...corrCalc, result: res.data.weight.toFixed(2) });
            }
        } catch (err) {
            console.error(err);
            alert("Error calculating corrugation weight");
        }
    };


    const [corrPrice, setCorrPrice] = useState(null);
    const [corrList, setCorrList] = useState([]);

    // Fetch corrugation master list (RG, AGRO, DNS + rate/kg)
    useEffect(() => {
        const fetchCorr = async () => {
            try {
                const res = await api.get("/masters/corrugation");  // backend route for master list
                setCorrList(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchCorr();
    }, []);

    const handleCorrPriceCalc = async () => {
        const { length, breadth, type } = corrCalc;
        if (!length || !breadth || !type) return alert("⚠️ Select type first");

        try {
            // weight already gram me aa raha hai
            const weightKg = corrCalc.result / 1000;

            // frontend se rate utha rahe hai
            const selectedCorr = corrList.find(c => c.corrugation_type.toLowerCase() === type.toLowerCase());
            if (!selectedCorr) return alert("⚠️ Rate not found for this type");

            const price = weightKg * selectedCorr.rate_per_kg;
            setCorrPrice(price.toFixed(2));
        } catch (err) {
            console.error(err);
            alert("Error calculating price");
        }
    };

    useEffect(() => {
        const fetchPrinting = async () => {
            try {
                const res = await api.get("/masters/printing"); // <-- backend route
                setPrintingOptions(res.data); // store data in state
            } catch (err) {
                console.error("Error fetching printing list:", err);
            }
        };
        fetchPrinting();
    }, []);


    // Fetch master list on component mount
    useEffect(() => {
        const fetchPasting = async () => {
            try {
                const res = await api.get("/masters/pasting");
                setPinPastingOptions(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchPasting();
    }, []);

    // all machines + sizes
    const [selectedMachine, setSelectedMachine] = useState(null); // user-selected machine
    const [dieCuttingOptions, setDieCuttingOptions] = useState([]); // ✅ define karo
    // Fetch die-cutting machines on component mount
    useEffect(() => {
        const fetchDieCutting = async () => {
            try {
                const res = await fetch("https://calculator-g6ve.onrender.com/api/masters/die-cutting");
                const data = await res.json();
                console.log("Die Cutting Machines:", data);
                setDieCuttingOptions(data); // ✅ save in state
            } catch (err) {
                console.error("Error fetching die-cutting machines:", err);
            }
        };
        fetchDieCutting();
    }, []);

    const calculateTotal = () => {
        const laminationPriceNum = laminationValue ? Number(laminationValue) : 0;

        // Pin/Pasting prices separate
        const manualPrice = manualPinPrice ? Number(manualPinPrice) : 0;   // showPinPasting input
        const pastingPrice = dropdownPinPrice ? Number(dropdownPinPrice) : 0; // showPasting dropdown

        const total =
            (sheetPrice ? Number(sheetPrice) : 0) +
            (corrPrice ? Number(corrPrice) : 0) +
            (printingPrice ? Number(printingPrice) : 0) +
            laminationPriceNum +
            manualPrice +     // add manual pin price
            pastingPrice +    // add pasting dropdown price
            (dieCuttingPrice ? Number(dieCuttingPrice) : 0) +
            (transportPrice ? Number(transportPrice) : 0);

        return total.toFixed(2);
    };

 const handleSaveOrder = async () => {
  // 🔹 Mandatory field validation
  if (!form.customer_id) return alert("⚠️ Please select a customer");
  if (!form.box_name) return alert("⚠️ Please enter box name");
  if (!form.quantity || Number(form.quantity) <= 0) return alert("⚠️ Please enter valid quantity");
  if (!paperCalc.result) return alert("⚠️ Please calculate paper weight first");
  if (!selectedBrand || !selectedSize) return alert("⚠️ Please select brand and size");

  try {
    const payload = {
      ...form,
      boxLength: boxSize.length,
      boxBreadth: boxSize.width,
      sheetLength: paperCalc.length,
      sheetBreadth: paperCalc.breadth,
      gsm: paperCalc.gsm,
      totalSheets: paperCalc.sheets,
      sheetWeight: paperCalc.result,
      corrType: corrCalc.type || null,
      printing_id: selectedPrinting?.id || null,
      lamination_price: laminationValue || 0,
      manualPinPrice: manualPinPrice || 0,
      pasting_id: selectedPinPasting?.id || null,
      dieCuttingMachine: selectedMachine?.machine_name || "",
      dieCuttingSize: selectedSize?.size || "",
      dieCuttingPrice: dieCuttingPrice || 0,
      transport_price: transportPrice || 0,
      totalPrice: finalTotal || 0,
      final_total: finalTotal || 0,
    };

    const response = await api.post("/orders/save", payload);

    if (response.data.success) {
      alert("✅ Order saved successfully!");

      // 🔹 Full reset of all fields & dropdowns
      setForm({
        customer_id: "",
        box_name: "",
        quantity: "",
        remark: "",
      });

      setPaperCalc({
        length: "",
        breadth: "",
        gsm: "",
        sheets: "",
        result: "",
      });

      setBoxSize({
        length: "",
        width: "",
      });

      setCorrCalc({
        type: "",
        price: "",
      });

      // 🔹 Reset all selections
      setSelectedPrinting(null);
      setSelectedPinPasting(null);
      setSelectedMachine(null);
      setSelectedBrand(null);
      setSelectedSize(null);

      // 🔹 Reset numeric/price fields
      setLaminationValue(0);
      setManualPinPrice(0);
      setTransportPrice(0);
      setFinalTotal(0);

      // 🔹 (Optional) Reset dropdown UI or refresh component
      // e.g. agar dropdown select component use kar rahe ho:
      document.querySelectorAll("select").forEach((el) => (el.selectedIndex = 0));

      // 🔹 Optional: Scroll to top or refocus on first field
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      alert("⚠️ Error saving order. Please try again.");
    }
  } catch (error) {
    console.error("Save order error:", error);
    alert("❌ Something went wrong while saving the order.");
  }
};





    return (
        <div>
            {/* ====================== CUSTOMER & BOX DETAILS (TOP SECTION) ====================== */}
            <div style={{ ...section, marginBottom: "25px", border: "1px solid #4caf50" }}>
                <h3>👤 Customer & Box Details</h3>

                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>Select Customer</label>
                <select
                    style={input}
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                >
                    <option value="">Select Customer</option>
                    {customers.map((c) => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                <label style={{ display: "block", marginTop: "10px", marginBottom: "5px", fontWeight: "bold" }}>Box Name</label>
                <input
                    style={input}
                    placeholder="Enter Box Name"
                    value={form.box_name}
                    onChange={(e) => setForm({ ...form, box_name: e.target.value })}
                />

                <label style={{ display: "block", marginTop: "10px", marginBottom: "5px", fontWeight: "bold" }}>Quantity</label>
                <input
                    style={input}
                    type="number"
                    placeholder="Enter Quantity"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />

                <label style={{ display: "block", marginTop: "10px", marginBottom: "5px", fontWeight: "bold" }}>Remark</label>
                <textarea
                    style={{ ...input, width: "100%", height: "80px" }}
                    placeholder="Add remark (optional)"
                    value={form.remark}
                    onChange={(e) => setForm({ ...form, remark: e.target.value })}
                />
            </div>

            {/* Auto Sheet */}
            <div style={section}>
                <h3>📦 Auto Sheet Calculator</h3>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    <input style={input} type="number" placeholder="Box Length (inch)" value={boxSize.length} onChange={e => setBoxSize({ ...boxSize, length: e.target.value })} />
                    <input style={input} type="number" placeholder="Box Width (inch)" value={boxSize.width} onChange={e => setBoxSize({ ...boxSize, width: e.target.value })} />
                    <button onClick={handleCalc} style={{
                        padding: "8px 15px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                    }}>Calculate</button>
                    {calcResult?.suggestedSheet && <button onClick={handleNext} style={{
                        padding: "8px 15px",
                        background: "#0a9a0a",
                        color: "#fff",
                        marginLeft: "10px",
                        borderRadius: "6px",
                        cursor: "pointer",
                    }}>Next</button>}
                </div>

                {calcResult?.suggestedSheet && (
                    <div style={{ marginTop: "15px", background: "#eef", padding: "10px", borderRadius: "8px" }}>
                        <h4>📌 Suggested Sheet</h4>
                        <p>Sheet Size: <b>{calcResult.suggestedSheet.sheetLength} × {calcResult.suggestedSheet.sheetWidth} inch</b></p>
                        <p>Boxes Along Length: <b>{calcResult.suggestedSheet.boxesAlongLength}</b></p>
                        <p>Boxes Along Width: <b>{calcResult.suggestedSheet.boxesAlongWidth}</b></p>
                        <p>Total Boxes per Sheet: <b>{calcResult.suggestedSheet.totalBoxes}</b></p>
                    </div>
                )}
            </div>

            {/* Paper Gramage */}
            {showPaperCalc && (
                <div style={section}>
                    <h3>📄 Paper Gramage Calculator</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input style={input} placeholder="Length (inch)" type="number" value={paperCalc.length} readOnly />
                        <input style={input} placeholder="Breadth (inch)" type="number" value={paperCalc.breadth} readOnly />
                        <input style={input} placeholder="GSM" type="number" value={paperCalc.gsm} onChange={e => setPaperCalc({ ...paperCalc, gsm: e.target.value })} />
                        <input style={input} placeholder="Sheets" type="number" value={paperCalc.sheets} onChange={e => setPaperCalc({ ...paperCalc, sheets: e.target.value })} />
                        <button onClick={handlePaperCalc} style={{
                            padding: "8px 15px",
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}>Calculate</button>
                    </div>

                    <div style={{ marginTop: "15px" }}>
                        <select style={input} value={selectedBrand?.id || ""} onChange={e => { const brand = brands.find(b => b.id === parseInt(e.target.value)); setSelectedBrand(brand); setSelectedSize(null); }}>
                            <option value="">Select Brand</option>
                            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>

                        {selectedBrand?.sizes && (
                            <select style={input} value={selectedSize?.id || ""} onChange={e => { const sizeObj = selectedBrand.sizes.find(s => s.id === parseInt(e.target.value)); setSelectedSize(sizeObj); }}>
                                <option value="">Select Size</option>
                                {selectedBrand.sizes.map(s => <option key={s.id} value={s.id}>{s.size} ({s.rate_per_kg} ₹/kg)</option>)}
                            </select>
                        )}
                    </div>

                    {paperCalc.result && (
                        <p>
                            🧾 Weight: <b>{paperCalc.result.toFixed(3)} kg</b>
                            {sheetPrice && ` | 💰 Price: ₹${sheetPrice}`}
                        </p>
                    )}

                    <button onClick={handlePriceCalc} style={{ padding: "8px 15px", background: "#0a74da", color: "#fff", borderRadius: "6px", marginTop: "10px" }}>
                        Calculate Sheet Price
                    </button>

                    {paperCalc.result && (
                        <button
                            style={{
                                padding: "8px 15px",
                                background: "#0a9a0a",
                                color: "#fff",
                                marginLeft: "10px",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                            onClick={() => {
                                const wantCorr = window.confirm("⚠️ Do you want to include Corrugation step?");
                                if (wantCorr) {
                                    setCorrCalc({
                                        length: paperCalc.length,
                                        breadth: paperCalc.breadth,
                                        type: "",
                                        result: null
                                    });
                                    setShowCorrCalc(true); // show Corrugation box
                                } else {
                                    setSkipCorrugation(true);
                                    setShowPrinting(true); // direct printing page
                                }
                            }}
                        >
                            Next → Corrugation
                        </button>
                    )}
                </div>
            )}

            {showCorrCalc && !skipCorrugation && (
                <div style={section}>
                    <h3>📦 Corrugation Weight Calculator</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input style={input} placeholder="Length (inch)" type="number" value={corrCalc.length} readOnly />
                        <input style={input} placeholder="Breadth (inch)" type="number" value={corrCalc.breadth} readOnly />
                        <select style={input} value={corrCalc.type} onChange={(e) => setCorrCalc({ ...corrCalc, type: e.target.value })}>
                            <option value="">Select Type</option>
                            <option value="RG">RG</option>
                            <option value="AGRO">AGRO</option>
                            <option value="DNS">DNS</option>
                        </select>
                        <button onClick={handleCorrCalc} style={{
                            padding: "8px 15px",
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}>Calculate</button>
                    </div>
                    {corrCalc.result && (
                        <p>📊 Weight: <b>{corrCalc.result} g</b></p>
                    )}
                </div>
            )}

            {showCorrCalc && !skipCorrugation && (
                <div style={section}>
                    <h3>📦 Corrugation Calculator</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <input style={input} placeholder="Length (inch)" type="number" value={corrCalc.length} readOnly />
                        <input style={input} placeholder="Breadth (inch)" type="number" value={corrCalc.breadth} readOnly />
                        <select style={input} value={corrCalc.type} onChange={(e) => setCorrCalc({ ...corrCalc, type: e.target.value })}>
                            <option value="">Select Type</option>
                            {corrList.map(c => <option key={c.id} value={c.corrugation_type}>{c.corrugation_type}</option>)}
                        </select>
                        <button onClick={handleCorrPriceCalc} style={{
                            padding: "8px 15px",
                            backgroundColor: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                        }}>Calculate</button>
                    </div>

                    {corrCalc.result && (
                        <p>📊 Weight: <b>{corrCalc.result} g</b> {corrPrice && ` | 💰 Price: ₹${corrPrice}`}</p>
                    )}

                    {corrPrice && (
                        <button
                            style={{
                                padding: "8px 15px",
                                marginLeft: "10px",
                                background: "#0a9a0a",
                                color: "#fff",
                                borderRadius: "6px",
                                cursor: "pointer",
                                marginTop: "10px"
                            }}
                            onClick={() => {
                                setShowPrinting(true);

                            }}
                        // style={{ padding: "8px 15px", marginTop: "10px", background: "#0a9a0a", color: "#fff", borderRadius: "6px" }}
                        >
                            Next → Printing
                        </button>
                    )}
                </div>
            )}


            {showPrinting && (
                <div style={section}>
                    <h3>🖨️ Printing Selection</h3>

                    {/* Fetch & show dropdown */}
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                        <select
                            style={input}
                            value={selectedPrinting?.id || ""}
                            onChange={(e) => {
                                const found = printingOptions.find((p) => p.id === parseInt(e.target.value));
                                setSelectedPrinting(found);
                            }}
                        >
                            <option value="">Select Printing Type</option>
                            {printingOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.printing_type} — ₹{p.rate}/sheet
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={() => {
                                if (!selectedPrinting) return alert("⚠️ Select printing type first");
                                setPrintingPrice(selectedPrinting.rate);
                            }}
                            style={{
                                padding: "8px 15px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                        >
                            Get Price
                        </button>

                    </div>

                    {printingPrice && (
                        <p style={{ marginTop: "10px" }}>
                            💰 Printing Price: <b>₹{printingPrice}</b>
                        </p>
                    )}

                    {printingPrice && (
                        <button
                            onClick={() => {
                                setShowLamination(true);
                            }}
                            style={{
                                padding: "8px 15px",
                                marginTop: "10px",
                                background: "#0a9a0a",
                                color: "#fff",
                                borderRadius: "6px",
                            }}
                        >
                            Next → Lamination
                        </button>
                    )}
                </div>
            )}

            {showLamination && (
                <div style={section}>
                    <h3>🎞️ Lamination Calculator</h3>
                    <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
                        <input style={input} placeholder="Length (inch)" type="number" value={paperCalc.length} readOnly />
                        <input style={input} placeholder="Width (inch)" type="number" value={paperCalc.breadth} readOnly />
                        <button
                            onClick={() => {
                                if (!paperCalc.length || !paperCalc.breadth) return alert("⚠️ Sheet size missing");
                                const lamValue = (paperCalc.length * paperCalc.breadth) / 3.5;
                                setLaminationValue(lamValue.toFixed(2)); // Output in laminationValue
                            }}
                            style={{
                                padding: "8px 15px",
                                backgroundColor: "red",
                                color: "white",
                                border: "none",
                                borderRadius: "5px",
                                cursor: "pointer"
                            }}
                        >
                            Calculate
                        </button>
                    </div>

                    {/* Output of Lamination Calculation */}
                    {laminationValue && (
                        <p style={{ marginTop: "10px" }}>
                            🎞️ Lamination Price: <b>{laminationValue}</b>
                        </p>
                    )}

                    {/* Next button always available after calculation */}
                    {laminationValue && (
                        <button
                            onClick={() => {
                                setShowPinPasting(true); // Next step
                            }}
                            style={{ padding: "8px 15px", marginTop: "10px", background: "#0a9a0a", color: "#fff", borderRadius: "6px" }}
                        >
                            Next → Pin/Pasting
                        </button>
                    )}
                </div>
            )}



            {/* Pin/Pasting div */}
            {/* Step 1: Pin/Pasting */}
            {showPinPasting && (
                <div style={section}>
                    <h3>📌 Pin/Pasting</h3>

                    {/* Manual Price Input */}
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px" }}>
                        <input
                            style={input}
                            type="number"
                            placeholder="Enter Price"
                            value={manualPinPrice}
                            onChange={(e) => setManualPinPrice(e.target.value)}
                        />
                        {manualPinPrice && <span>💰 ₹{manualPinPrice}</span>}
                    </div>

                    {/* Next → Pasting Button */}
                    {manualPinPrice && (
                        <button
                            style={{ padding: "8px 15px", background: "#0a9a0a", color: "#fff", borderRadius: "6px", marginTop: "10px" }}

                            onClick={() => {
                                setShowPasting(true);  // show next box
                            }}
                        >
                            Next → Pasting
                        </button>
                    )}
                </div>
            )}

            {/* Step 2: Pasting */}
            {showPasting && (
                <div style={{ ...section, border: "1px solid #007bff" }}>
                    <h3>📌 Pasting</h3>

                    <select
                        style={{ ...input, width: "220px" }}
                        value={selectedPinPasting?.id || ""}
                        onChange={(e) => {
                            const found = pinPastingOptions.find(p => p.id === parseInt(e.target.value));
                            setSelectedPinPasting(found);
                            setDropdownPinPrice(found?.rate_per_box || "");
                        }}
                    >
                        <option value="">Select Pasting Method</option>
                        {pinPastingOptions.map(p => (
                            <option key={p.id} value={p.id}>{p.method}</option>
                        ))}
                    </select>

                    {/* Show dropdown price */}
                    {dropdownPinPrice && <span style={{ marginLeft: "10px" }}>💰 ₹{dropdownPinPrice}</span>}

                    {/* Next → Die Cutting Button */}
                    {(dropdownPinPrice || manualPinPrice) && (
                        <button
                            style={{ padding: "8px 15px", background: "#0a9a0a", color: "#fff", borderRadius: "6px", marginTop: "10px", marginLeft: "10px" }}
                            onClick={() => {
                                setShowDieCutting(true); // show die cutting box
                            }}
                        >
                            Next → Die Cutting
                        </button>
                    )}
                </div>
            )}



            {showDieCutting && (
                <div style={section}>
                    <h3>✂️ Die Cutting</h3>

                    {/* Step 1: Select Machine */}
                    <div style={{ marginBottom: "10px" }}>
                        <select
                            style={input}
                            value={selectedMachine?.id || ""}
                            onChange={e => {
                                const machineObj = dieCuttingOptions.find(d => d.id === parseInt(e.target.value));
                                setSelectedMachine(machineObj); // full machine object
                                setSelectedSize(null);           // reset size
                                setDieCuttingPrice(null);
                            }}
                        >
                            <option value="">Select Machine</option>
                            {dieCuttingOptions.map(machine => (
                                <option key={machine.id} value={machine.id}>{machine.machine_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Step 2: Select Size (only after machine selected) */}
                    {selectedMachine?.sizes && selectedMachine.sizes.length > 0 && (
                        <div style={{ marginBottom: "10px" }}>
                            <select
                                style={input}
                                value={selectedSize?.id || ""}
                                onChange={e => {
                                    const sizeObj = selectedMachine.sizes.find(s => s.id === parseInt(e.target.value));
                                    setSelectedSize(sizeObj);
                                    setDieCuttingPrice(sizeObj.rate_per_unit);
                                }}
                            >
                                <option value="">Select Size</option>
                                {selectedMachine.sizes.map(s => (
                                    <option key={s.id} value={s.id}>{s.size} — ₹{s.rate_per_unit}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Show Price */}
                    {dieCuttingPrice && <p>💰 Price: ₹{dieCuttingPrice}</p>}

                    {/* Next Button */}
                    {dieCuttingPrice && (
                        <button
                            onClick={() => setShowTransport(true)}
                            style={{ padding: "8px 15px", marginTop: "10px", background: "#0a9a0a", color: "#fff", borderRadius: "6px" }}
                        >
                            Next → Transport
                        </button>
                    )}
                </div>
            )}

            {showTransport && (
                <div style={{ ...section, border: "1px solid #ff9800" }}>
                    <h3>🚚 Transport</h3>

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <input
                            style={input}
                            type="number"
                            placeholder="Enter Transport Price"
                            value={transportPrice}
                            onChange={(e) => setTransportPrice(e.target.value)}
                        />
                        {transportPrice && <span>💰 ₹{transportPrice}</span>}
                    </div>
                </div>
            )}




            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                <div
                    style={{
                        padding: "20px",
                        border: "1px solid #ccc",
                        borderRadius: "10px",
                        maxWidth: "400px",
                        width: "100%",
                        textAlign: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        backgroundColor: "#fafafa",
                    }}
                >
                    <h3>💰 Total Price Calculator</h3>

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            alignItems: "center",
                            justifyContent: "center",
                            marginBottom: "10px",
                        }}
                    >
                        <input
                            type="number"
                            placeholder="Extra %"
                            value={extraPercent}
                            onChange={(e) => setExtraPercent(e.target.value)}
                            style={{
                                padding: "8px",
                                borderRadius: "6px",
                                border: "1px solid #999",
                                width: "100px",
                                textAlign: "center",
                            }}
                        />
                        <button
                            onClick={handleTotalCalc}
                            style={{
                                padding: "8px 15px",
                                background: "#ff5722",
                                color: "#fff",
                                borderRadius: "6px",
                                cursor: "pointer",
                            }}
                        >
                            Calculate Total
                        </button>
                    </div>

                    {finalTotal && (
                        <p style={{ fontSize: "18px", fontWeight: "bold", marginTop: "10px" }}>
                            ✅ Final Price: ₹{finalTotal}
                        </p>
                    )}
                </div>
            </div>

            {/* ====================== SAVE ORDER BUTTON (BOTTOM) ====================== */}
            <div style={{ textAlign: "center", marginTop: "30px" }}>
                <button
                    onClick={handleSaveOrder}
                    style={{
                        padding: "12px 25px",
                        background: "#007bff",
                        color: "#fff",
                        borderRadius: "8px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        marginBottom: "50px",
                    }}
                >
                    💾 Save Final Order
                </button>

            </div>







        </div>
    );
}
