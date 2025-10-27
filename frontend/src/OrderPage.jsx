import React, { useState, useEffect } from "react";
import api from "./utils/api";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (search = "") => {
    const res = await api.get(`/orders?search=${encodeURIComponent(search)}`);
    setOrders(res.data);
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    fetchOrders(value);
  };

  const selectOrder = async (id) => {
    const res = await api.get(`/orders/${id}`);
    setSelectedOrder(res.data);
  };

  const updateStatus = async () => {
    if (!selectedOrder) return;
    const newStatus = selectedOrder.status === "pending" ? "Complete" : "pending";
    await api.patch(`/orders/status/${selectedOrder.id}`, { status: newStatus });
    setSelectedOrder({ ...selectedOrder, status: newStatus });
    fetchOrders(searchTerm);
  };

  // ✅ Remark update function
  const saveRemark = async () => {
    if (!selectedOrder) return;
    try {
      await api.patch(`/orders/${selectedOrder.id}`, { remark: selectedOrder.remark });
      alert("Remark updated successfully!");
      fetchOrders(searchTerm);
    } catch (err) {
      console.error("Error updating remark:", err);
      alert("Failed to update remark.");
    }
  };

  const statusColor = (status) => {
    if (status === "Complete") return "#28a745";
    if (status === "pending") return "#dc3545";
    return "#6c757d";
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "auto", padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px", color: "#333" }}>📦 Orders Dashboard</h2>

      <div style={{ marginBottom: "20px", textAlign: "center" }}>
        <input
          type="text"
          placeholder="🔍 Search by Customer or Box Name..."
          value={searchTerm}
          onChange={handleSearch}
          style={{
            padding: "10px 15px",
            width: "60%",
            borderRadius: "25px",
            border: "1px solid #ccc",
            outline: "none",
            fontSize: "16px",
          }}
        />
      </div>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {/* Orders List */}
        <div style={{
          flex: 1,
          minWidth: "250px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          padding: "10px",
          maxHeight: "600px",
          overflowY: "auto",
          backgroundColor: "#f9f9f9"
        }}>
          <h3 style={{ marginBottom: "10px", color: "#555" }}>Orders List</h3>
          {orders.length === 0 && <p style={{ color: "#888" }}>No orders found</p>}
          {orders.map((o) => (
            <div
              key={o.id}
              style={{
                padding: "10px",
                marginBottom: "8px",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: selectedOrder?.id === o.id ? "#e6f7ff" : "white",
                border: "1px solid #ddd",
                transition: "0.2s",
              }}
              onClick={() => selectOrder(o.id)}
            >
              <b>{o.order_number}</b> <br />
              <span style={{ color: "#555" }}>{o.customer_name || "Unknown"}</span> <br />
              <span style={{ color: statusColor(o.status), fontWeight: "bold" }}>{o.status || "pending"}</span>
            </div>
          ))}
        </div>

        {/* Selected Order Detail */}
        <div
          style={{
            flex: 2,
            minWidth: "350px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "20px",
            maxHeight: "600px",
            overflowY: "auto",
            backgroundColor: "#fff",
          }}
        >
          {selectedOrder ? (
            <>
              <h3 style={{ marginBottom: "15px", color: "#333" }}>
                Order Details: {selectedOrder.order_number}
              </h3>
              <p><b>Customer:</b> {selectedOrder.customer_name || "N/A"}</p>
              <p><b>Box Name:</b> {selectedOrder.box_name}</p>
              <p>
                <b>Dimensions (Sheet x Box):</b> {selectedOrder.sheet_length} x {selectedOrder.sheet_breadth} (Sheet),{" "}
                {selectedOrder.box_length} x {selectedOrder.box_breadth} (Box)
              </p>
              <p><b>Quantity:</b> {selectedOrder.quantity}</p>
              <p><b>GSM:</b> {selectedOrder.gsm}</p>

              {/* ✅ Editable Remark */}
              <p><b>Remark:</b></p>
              <textarea
                value={selectedOrder.remark || ""}
                onChange={(e) =>
                  setSelectedOrder({ ...selectedOrder, remark: e.target.value })
                }
                style={{ width: "100%", minHeight: "60px", padding: "8px", borderRadius: "5px", border: "1px solid #ccc" }}
              />
              <button
                onClick={saveRemark}
                style={{ marginTop: "10px", padding: "5px 12px", borderRadius: "5px", border: "none", backgroundColor: "#28a745", color: "white", cursor: "pointer" }}
              >
                Save Remark
              </button>

              <p>
                <b>Status:</b>{" "}
                <span
                  style={{
                    color: "#fff",
                    backgroundColor: statusColor(selectedOrder.status),
                    padding: "5px 10px",
                    borderRadius: "5px",
                    marginRight: "10px",
                  }}
                >
                  {selectedOrder.status}
                </span>
                <button
                  onClick={updateStatus}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "5px",
                    border: "none",
                    backgroundColor: "#007bff",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  Toggle Status
                </button>
              </p>

              <hr style={{ margin: "15px 0" }} />
              <h4 style={{ color: "#555" }}>Materials</h4>
              <p><b>Paper:</b> {selectedOrder.printing_name}</p>
              {/* <p><b>Corrugation:</b> {selectedOrder.corrugation_name}</p> */}
              <p><b>Pasting:</b> {selectedOrder.pasting_name}</p>

              <hr style={{ margin: "15px 0" }} />
              <h4 style={{ color: "#555" }}>Costs</h4>
              <p><b>Total Price:</b> ₹{selectedOrder.total_price}</p>
            </>
          ) : (
            <p style={{ color: "#888" }}>Select an order to see details</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
