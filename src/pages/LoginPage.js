import { useState } from "react";
const BASE_URL = "http://185.234.247.196:8082";
export default function LoginPage({ onLogin }) {
  const [customerName, setCustomerName] = useState("");
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    if (!customerName.trim()) {
      setError("Tên khách hàng không được để trống.");
      return;
    }

    try {
      const response = await fetch(`${BASE_URL}/customer/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: customerName.trim() }),
      });

      if (!response.ok) {
        throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
      }

      const result = await response.json();
      if (result && result.data) {
        onLogin(result.data); // Pass the `data` object to the parent component
      } else {
        throw new Error("Đăng nhập thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-80">
        <h1 className="text-xl font-bold text-center mb-4">Tên Khách Hàng</h1>
        <input
          type="text"
          placeholder="Nhập tên khách hàng"
          value={customerName}
          onChange={(e) => {
            setCustomerName(e.target.value);
            setError(null);
          }}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <button
          onClick={handleLogin}
          className="w-full mt-4 bg-orange-500 text-white py-2 rounded-lg font-medium hover:bg-orange-600"
        >
          Đăng Nhập
        </button>
      </div>
    </div>
  );
}