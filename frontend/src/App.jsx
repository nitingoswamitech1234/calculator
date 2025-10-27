import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Masters
import PaperMaster from "./components/masters/PaperMaster";
import PrintingMaster from "./components/masters/PrintingMaster";
import LaminationMaster from "./components/masters/LaminationMaster";
import CorrugationMaster from "./components/masters/CorrugationMaster";
import PastingMaster from "./components/masters/PastingMaster";
import TransportMaster from "./components/masters/TransportMaster";
import VendorMaster from "./components/masters/VendorMaster";
import DieCuttingMaster from "./components/masters/DieCuttingMaster";

// Customers / Orders / Reports
import CustomerMaster from "./components/customers/CustomerMaster";
import OrderEntry from "./OrderForm";
import Home from "./Home";
import OrdersPage from "./OrderPage";
import OrderForm from "./OrderForm";
import AutoSheetCalculator from "./components/Autosheetcalculator";

// Auth
import LoginPage from "./components/Login";
// import ProtectedRoute from "./components/ProtectedRoutes";
import QuickOrderEntry from "./QuickOrderEntry";
import FullOrderEntry from "./QuickOrderEntry";

function App() {
  return (
    <Router>
      <Routes>
        {/* Login */}
        {/* <Route path="/" element={<LoginPage />} /> */}

        {/* Protected Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/auto" element={<AutoSheetCalculator />} />

        {/* Masters */}
        <Route path="/masters/paper" element={<PaperMaster />} />
        <Route path="/masters/printing" element={<PrintingMaster />} />
        <Route path="/masters/lamination" element={<LaminationMaster />} />
        <Route path="/masters/corrugation" element={<CorrugationMaster />} />
        <Route path="/masters/pasting" element={<PastingMaster />} />
        <Route path="/masters/transport" element={<TransportMaster />} />
        <Route path="/masters/vendor" element={<VendorMaster />} />
        <Route path="/die-cutting" element={<DieCuttingMaster />} />

        {/* Customers / Orders / Reports */}
        <Route path="/customers" element={<CustomerMaster />} />
        <Route path="/orders" element={<OrderForm />} />
        <Route path="/orders-detail" element={<OrdersPage />} />
        <Route path="/order-data-entry" element={<FullOrderEntry />} />

        {/* Redirect unknown routes to home */}
        {/* <Route path="*" element={<Navigate to="/" replace />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
