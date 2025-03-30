"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Check, ChevronLeft } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

export default function PaymentSuccessPage() {
  const navigate = useNavigate()
  const { clearCart } = useCart()

  useEffect(() => {
    // Xóa giỏ hàng sau khi thanh toán thành công
    clearCart()
  }, [clearCart])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto bg-white min-h-screen pb-20">
        <div className="p-6 flex items-center">
          <button onClick={() => navigate("/")} className="mr-4">
            <ChevronLeft size={28} />
          </button>
        </div>

        <div className="flex flex-col items-center justify-center px-6 py-20">
          <div className="w-32 h-32 border-4 border-green-500 rounded-full flex items-center justify-center mb-8 success-icon">
            <Check size={64} className="text-green-500" />
          </div>

          <h1 className="text-3xl font-bold mb-4">Bạn đã thanh toán thành công</h1>
          <p className="text-gray-500 text-center mb-16 text-xl max-w-2xl">
            Cảm ơn quý khách đã ủng hộ chúng tôi, hẹn gặp lại quý khách!
          </p>

          <div className="flex justify-center">
            <button
              className="w-1/3 bg-orange-500 text-white py-4 rounded-full font-medium text-lg"
              onClick={() => navigate("/")}
            >
              Trở về trang chủ
            </button>
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

