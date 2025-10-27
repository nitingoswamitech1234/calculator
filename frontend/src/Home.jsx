import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const masters = [
    { name: "Paper Master", path: "/masters/paper" },
    { name: "Printing Master", path: "/masters/printing" },
    { name: "Corrugation Master", path: "/masters/corrugation" },
    { name: "Pasting Master", path: "/masters/pasting" },
    { name: "Die cutting", path: "/die-cutting" },
    { name: "All Orders", path: "/orders-detail" },
  ];

  const otherModules = [
    { name: "Customer Master", path: "/customers" },
    { name: "Order Data Entry", path: "/order-data-entry" },
    { name: "Add Orders", path: "/auto" },
  ];

  const colors = [
    "linear-gradient(to right, #ef4444, #f87171)", // red
    "linear-gradient(to right, #3b82f6, #60a5fa)", // blue
    "linear-gradient(to right, #10b981, #34d399)", // green
    "linear-gradient(to right, #f59e0b, #fbbf24)", // yellow
    "linear-gradient(to right, #a855f7, #c084fc)", // purple
    "linear-gradient(to right, #ec4899, #f472b6)", // pink
    "linear-gradient(to right, #f97316, #fb923c)", // orange
  ];

  const cardStyle = {
    padding: "25px 35px",
    borderRadius: "12px",
    color: "white",
    cursor: "pointer",
    transition: "all 0.3s ease",
    fontWeight: "600",
    textAlign: "center",
    minWidth: "160px",
    userSelect: "none",
    backgroundSize: "200% 200%",
  };

  const cardHover = {
    transform: "translateY(-5px) scale(1.05)",
    boxShadow: "0 10px 15px rgba(0,0,0,0.2)",
    opacity: 0.95,
  };

  const renderCards = (items) =>
    items.map((item, index) => (
      <div
        key={item.path}
        onClick={() => navigate(item.path)}
        style={{ ...cardStyle, backgroundImage: colors[index % colors.length] }}
        onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
        onMouseLeave={(e) =>
          Object.assign(e.currentTarget.style, { ...cardStyle, backgroundImage: colors[index % colors.length] })
        }
      >
        {item.name}
      </div>
    ));

  return (
    <div style={{ padding: "40px", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
      <h1 style={{ marginBottom: "30px", fontSize: "2.2rem" }}>🏠 Home Dashboard</h1>

      <h2 style={{ marginBottom: "20px", fontSize: "1.5rem" }}>Masters</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {renderCards(masters)}
      </div>

      <h2 style={{ marginTop: "50px", marginBottom: "20px", fontSize: "1.5rem" }}>Other Modules</h2>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
        {renderCards(otherModules)}
      </div>
    </div>
  );
}

export default Home;
