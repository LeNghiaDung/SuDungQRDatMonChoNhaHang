"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "http://185.234.247.196:8082"
const diningTableId = "1b0ca475-5323-475c-8671-e5ce91cb8428"
export default function CheckoutPage() {
  const navigate = useNavigate()
  const { cart, clearCart } = useCart()
  const [paymentMethod, setPaymentMethod] = useState("")
  const [paymentMethods, setPaymentMethods] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const totalAmount = cart.reduce((total, item) => {
    return total + item.price * item.quantity
  }, 0)

  // Lấy danh sách phương thức thanh toán
  useEffect(() => {
    // Giả sử API không có endpoint cho phương thức thanh toán, nên chúng ta sử dụng dữ liệu tĩnh
    setPaymentMethods([
      { id: "CASH", name: "Tiền mặt", color: "green", icon: "/icons/cash.png" },
      { id: "CARD", name: "Thẻ tín dụng/ghi nợ", color: "blue", icon: "/icons/card.png" },
      { id: "MOMO", name: "Ví MoMo", color: "purple", icon: "/icons/momo.png" },
      { id: "VNPAY", name: "VNPay", color: "blue", icon: "/icons/zalopay.png" },
    ])
  }, [])

  const handlePayment = async () => {
    if (!paymentMethod) {
      alert("Vui lòng chọn phương thức thanh toán");
      return;
    }

    if (cart.length === 0) {
      alert("Giỏ hàng của bạn đang trống");
      return;
    }

    try {
      setSubmitting(true);

      // Chuẩn bị dữ liệu hóa đơn
      const invoiceData = {
        items: cart.map((item) => ({
          id: item.id,
          name: item.name,
          imageUrl: item.imageUrl || "",
          priceAtOrder: item.price,
          quantity: item.quantity,
          totalPrice: item.price * item.quantity,
        })),
        diningTableName: "Table 1", // Replace with actual table name if available
        customer: {
          id: parseInt(localStorage.getItem("userId") || "1"), // Mặc định là '1' nếu không có
          name: localStorage.getItem("userName") || "Guest", // Replace with actual customer name if available
        },
        paymentStatus: "PENDING",
        paymentMethod: paymentMethod,
        totalPrice: totalAmount,
      };

      console.log("Sending invoice data:", invoiceData);

      // Gọi API để tạo hóa đơn
      const response = await fetch(`${BASE_URL}/invoice/customer/${invoiceData.customer.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const text = await response.text();

      if (!text) {
        throw new Error("Empty response from API");
      }

      const result = JSON.parse(text);
      console.log("Invoice created:", result);

      if (result && result.status === 0) {
        // Gọi API để xác nhận thanh toán
        const confirmResponse = await fetch(`${BASE_URL}/invoice/confirmPayment/${result.data.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const confirmResult = await confirmResponse.json();
        console.log("Payment confirmed:", confirmResult);

        if (confirmResult && confirmResult.status === 0) {
          // Xóa giỏ hàng sau khi thanh toán thành công
          clearCart();

          // Chuyển hướng đến trang thanh toán thành công
          navigate("/payment-success");
        } else {
          throw new Error(confirmResult.message || "Không thể xác nhận thanh toán");
        }
      } else {
        throw new Error(result.message || "Không thể tạo hóa đơn");
      }
    } catch (err) {
      setError("Không thể hoàn tất thanh toán. Vui lòng thử lại sau.");
      console.error("Error processing payment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 md:p-6 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-medium">Thanh toán</h1>
        </div>

        <div className="px-4 md:px-6 max-w-4xl mx-auto">
          <h2 className="font-medium mb-4 md:mb-6 text-base md:text-xl">Phương thức thanh toán</h2>

          {error && <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-4">{error}</div>}

          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {paymentMethods.map((method) => (
              <label
                key={method.id}
                className={`flex items-center p-3 md:p-5 border rounded-lg cursor-pointer ${
                  paymentMethod === method.id ? "border-orange-500 bg-orange-50" : ""
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="mr-3 md:mr-4 h-4 w-4 md:h-5 md:w-5"
                />
                <div
                  className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 bg-${method.color}-100 rounded-full flex items-center justify-center mr-3 md:mr-4`}
                >
                  <img
                    src={method.icon || "/placeholder.svg"}
                    alt={method.name}
                    className="w-5 h-5 md:w-6 md:h-6 lg:w-8 lg:h-8"
                  />
                </div>
                <span className="text-sm md:text-base lg:text-lg">{method.name}</span>
              </label>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              className="w-full md:w-2/3 lg:w-1/2 bg-orange-500 text-white py-3 md:py-4 rounded-full font-medium text-base md:text-lg"
              onClick={handlePayment}
              disabled={submitting}
            >
              {submitting ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin h-5 w-5 mr-3 border-t-2 border-b-2 border-white rounded-full"></span>
                  Đang xử lý...
                </span>
              ) : (
                `Thanh toán ${totalAmount.toLocaleString()}đ`
              )}
            </button>
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

