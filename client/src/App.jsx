import { BrowserRouter as Router, Routes, Route } from "react-router";
import Pos from "./Pages/Pos";
import "./App.css";
import { CartProvider } from "./CartContext";
import RestaurantDashboard from "./Pages/ManagerDashboard";
import LoginPage from "./Pages/Login";
import Orders from "./Pages/Orders";
import KitchenDisplay from "./Pages/KitchenDisplay";
import { OrderProvider } from "./Pages/OrderContext";

function App() {
  return (
    <>
      <CartProvider>
        <OrderProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Pos />} />
            <Route path="/dashboard" element={<RestaurantDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/kitchen" element={<KitchenDisplay />} />
          </Routes>
        </Router>
      </OrderProvider>
      </CartProvider>
    </>
  );
}

export default App;
