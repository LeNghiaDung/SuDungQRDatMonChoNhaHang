import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import { CartProvider } from "./context/CartContext";
import HomePage from "./pages/HomePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import LoginPage from "./pages/LoginPage";
import "./App.css";
import { use, useEffect } from "react";

function App() {
  const [customerId, setCustomerId] = useState("");

  // Lấy customerId mà không cần đăng nhập, nếu có trong localStorage thì sẽ vào luôn
  const storedCustomerId = localStorage.getItem("customerId");
  useEffect(() => {
    const storedCustomerId = localStorage.getItem("customerId");
    if (storedCustomerId) {
      setCustomerId(storedCustomerId);
    }
  }, []);
  const handleLogin = (Id) => {
    setCustomerId(Id);
    localStorage.setItem("customerId", Id);
  };

  return (
    <CartProvider>
      <div className="App">
        {!customerId ? (
          <LoginPage onLogin={handleLogin} />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
          </Routes>
        )}
      </div>
    </CartProvider>
  );
}

export default App;

