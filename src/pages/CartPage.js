"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// Base URL for API
const BASE_URL = "http://185.234.247.196:8082"
const diningTableId = "b704c7d1-708a-40de-b5ad-2e45c8da26c0"

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, setCart } = useCart()
  const [activeTab, setActiveTab] = useState("cart")
  const [orderHistory, setOrderHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0)

  // Fetch cart details from API
  const fetchCartDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const customerId = localStorage.getItem("customerId")
      if (!customerId) {
        console.warn("No customerId found.")
        setLoading(false)
        return
      }

      const response = await fetch(`${BASE_URL}/cart/customer/${customerId}`)
      if (!response.ok) {
        console.error("API request failed when fetching cart:", response.status)
        setLoading(false)
        return
      }

      const data = await response.json()
      console.log("Cart API response:", data) // Debug log

      if (data?.status === 200 && data.data) {
        // Handle both array and object responses
        const apiItems = Array.isArray(data.data)
          ? data.data.map((item) => ({
              id: item.id,
              name: item.food?.name,
              price: item.food?.price || 0,
              quantity: item.quantity || 1,
              image: item.food?.imageUrl,
            }))
          : Object.values(data.data).map((item) => ({
              id: item.id,
              name: item.food?.name,
              price: item.food?.price || 0,
              quantity: item.quantity || 1,
              image: item.food?.imageUrl,
            }))

        console.log("Processed cart items:", apiItems) // Debug log
        setCart(apiItems)
      } else {
        console.warn("Unexpected API response format:", data)
        setCart([])
      }
    } catch (error) {
      console.error("Error fetching cart:", error)
      setError("Không thể tải giỏ hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Load cart from API on mount and whenever the component is focused
  useEffect(() => {
    fetchCartDetails()

    // Add event listener for when the page becomes visible again
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        fetchCartDetails()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [])

  // API function to update cart item quantity
  const handleUpdateQuantity = async (itemId, newQuantity) => {
    try {
      const customerId = localStorage.getItem("customerId")
      if (!customerId) {
        console.error("No customerId found.")
        return
      }

      // Call the API to update quantity
      const response = await fetch(`${BASE_URL}/cart/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: itemId,
          quantity: newQuantity,
          customerId: customerId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update cart item quantity")
      }

      // Update local state to reflect the change without reloading the cart
      setCart((prevCart) =>
        prevCart.map((item) =>
          item.id === itemId
            ? { ...item, quantity: newQuantity }
            : item
        )
      )
    } catch (error) {
      console.error("Error updating quantity:", error)
      setError("Không thể cập nhật số lượng. Vui lòng thử lại.")
    }
  }

  // API function to remove item from cart
  const handleRemoveFromCart = async (itemId) => {
    try {
      setLoading(true)

      // Call the API to remove item
      const response = await fetch(`${BASE_URL}/cart/${itemId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to remove cart item")
      }

      // Update local state to reflect the change
      setCart((prevCart) => prevCart.filter((item) => item.id !== itemId))

      // Refresh cart from API
      await fetchCartDetails()
    } catch (error) {
      console.error("Error removing item:", error)
      setError("Không thể xóa sản phẩm. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Load orders from backend
  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${BASE_URL}/order/diningTable/${diningTableId}`)
      if (response.ok) {
        const data = await response.json()
        console.log("Orders API response:", data) // Debug log

        if (data?.status === 200 && Array.isArray(data.data)) {
          setOrderHistory(data.data)
        } else {
          console.warn("Unexpected orders API response format:", data)
          setOrderHistory([])
        }
      } else {
        console.error("Failed to fetch orders for dining table:", response.status)
        setOrderHistory([])
      }
    } catch (err) {
      console.error("Error fetching orders for dining table:", err)
      setError("Không thể tải đơn hàng. Vui lòng thử lại sau.")
    } finally {
      setLoading(false)
    }
  }

  // Load orders when tab changes to orders or history
  useEffect(() => {
    if (activeTab === "orders" || activeTab === "history") {
      loadOrders()
    }
  }, [activeTab])

  const handleCheckout = async () => {
    if (cart.length > 0) {
      try {
        setLoading(true)
        const customerId = localStorage.getItem("customerId")
        if (!customerId) {
          console.error("No customerId found. Cannot proceed to checkout.")
          setError("Không tìm thấy ID khách hàng. Vui lòng đăng nhập lại.")
          return
        }

        // Prepare order data
        const newOrder = {
          customerId: parseInt(customerId, 10), // Ensure customerId is a number
          diningTableId,
        }

        console.log("Sending order data:", newOrder) // Debug log

        // Save the order to the backend
        const response = await fetch(`${BASE_URL}/order/`, {
          method: "POST", // Correct HTTP method
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newOrder),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error("Order API error response:", errorText)
          throw new Error(`Failed to save order. Status: ${response.status}`)
        }

        const responseData = await response.json()
        console.log("Order API response:", responseData)

        // Clear the cart in the API
        

        // Clear local cart state
        setCart([])

        // Load updated orders
        await loadOrders()

        // Navigate to the orders tab
        setActiveTab("orders")
      } catch (err) {
        console.error("Error during checkout:", err)
        setError("Đã xảy ra lỗi khi đặt món. Vui lòng thử lại.")
      } finally {
        setLoading(false)
      }
    } else {
      console.warn("Cart is empty. Cannot proceed to checkout.")
      setError("Giỏ hàng trống. Không thể đặt món.")
    }
  }

  // Calculate total price of all orders
  const totalOrderAmount = orderHistory.reduce((total, order) => total + order.totalPrice, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto bg-white min-h-screen pb-40 md:pb-32">
        <div className="p-4 md:p-6 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-medium">Giỏ hàng</h1>
        </div>

        <div className="flex border-b mb-4 md:mb-6 max-w-4xl mx-auto">
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${
              activeTab === "cart" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("cart")}
          >
            Giỏ hàng
          </button>
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${
              activeTab === "orders" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("orders")}
          >
            Đơn hàng
          </button>
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${
              activeTab === "history" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"
            }`}
            onClick={() => setActiveTab("history")}
          >
            Lịch sử mua hàng
          </button>
        </div>

        {error && (
          <div className="text-center py-4 px-4 mb-4 bg-red-50 text-red-500 max-w-4xl mx-auto rounded-lg">
            <p>{error}</p>
            <button
              className="mt-2 text-sm underline"
              onClick={() => {
                setError(null)
                fetchCartDetails()
              }}
            >
              Thử lại
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "cart" && (
              <div className="px-4 md:px-6 max-w-4xl mx-auto">
                {!cart || cart.length === 0 ? (
                  <div className="text-center py-10 md:py-16">
                    <p className="text-gray-500 text-base md:text-xl">Giỏ hàng của bạn đang trống</p>
                    <button
                      className="mt-4 md:mt-6 px-6 md:px-8 py-2 md:py-3 bg-orange-500 text-white rounded-full text-base md:text-lg"
                      onClick={() => navigate("/")}
                    >
                      Tiếp tục mua sắm
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-4 md:space-y-6 mb-6 md:mb-8">
                      {cart.map((item) => (
                        <div key={item.id} className="flex items-center bg-gray-50 p-3 md:p-5 rounded-xl">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover"
                          />
                          <div className="ml-3 md:ml-5 lg:ml-6 flex-1">
                            <h3 className="font-medium text-base md:text-lg lg:text-xl">{item.name}</h3>
                            <p className="text-red-500 text-sm md:text-base lg:text-lg">
                              {item.price.toLocaleString()}đ
                            </p>
                          </div>
                          <div className="flex items-center">
                            <button
                              className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
                              onClick={() => handleUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                              disabled={loading}
                            >
                              <Minus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            </button>
                            <span className="w-8 md:w-10 lg:w-12 text-center text-sm md:text-base lg:text-lg">
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
                              onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                              disabled={loading}
                            >
                              <Plus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            </button>
                            <button
                              className="ml-2 md:ml-3 lg:ml-4 text-red-400"
                              onClick={() => handleRemoveFromCart(item.id)}
                              disabled={loading}
                            >
                              <Trash2 size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-6 md:mb-8 border-t border-b py-4 px-2">
                      <span className="font-medium text-lg md:text-xl">Tổng</span>
                      <span className="font-bold text-xl md:text-2xl">{totalAmount.toLocaleString()}đ</span>
                    </div>

                    <div className="flex justify-center">
                      <button
                        className="w-full md:w-2/3 lg:w-1/2 bg-orange-500 text-white py-3 md:py-4 rounded-full font-medium text-base md:text-lg"
                        onClick={handleCheckout}
                        disabled={loading}
                      >
                        {loading ? "Đang xử lý..." : "Đặt món"}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {(activeTab === "orders" || activeTab === "history") && (
              <div className="px-4 md:px-6 max-w-4xl mx-auto">
                {orderHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {activeTab === "orders"
                        ? "Bạn không có đơn hàng đang xử lý nào"
                        : "Bạn chưa có lịch sử mua hàng nào"}
                    </p>
                    <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg" onClick={loadOrders}>
                      Tải lại
                    </button>
                  </div>
                ) : (
                  <>
                    {orderHistory.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                          <span className="text-gray-500 text-sm md:text-base lg:text-lg">
                            {new Date(order.createdAt).toLocaleString()}
                          </span>
                          <span
                            className={`${
                              order.status === "PENDING" ? "bg-yellow-500" : "bg-green-500"
                            } text-white text-xs md:text-sm py-1 px-3 rounded-full`}
                          >
                            {order.status === "PENDING" ? "Đang nấu" : "Đã giao"}
                          </span>
                        </div>
                        <div className="space-y-3 md:space-y-4">
                          {order.orderDetail.map((item) => (
                            <div key={item.id} className="flex items-center">
                              <img
                                src={item.food.imageUrl || "/placeholder.svg"}
                                alt={item.food.name}
                                className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover"
                              />
                              <div className="ml-3 md:ml-4 flex-1">
                                <h3 className="font-medium text-base md:text-lg">{item.food.name}</h3>
                                <p className="text-gray-500 text-sm md:text-base">Số lượng: {item.quantity}</p>
                                <p className="text-gray-500 text-sm md:text-base">
                                  Giá: {item.food.price.toLocaleString()}đ
                                </p>
                                <p className="text-red-500 text-sm md:text-base font-medium">
                                  Tổng: {(item.food.price * item.quantity).toLocaleString()}đ
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex justify-between">
                          <span className="text-sm md:text-base lg:text-lg font-medium">Tổng tiền</span>
                          <span className="font-bold text-red-500 text-lg md:text-xl lg:text-2xl">
                            {order.totalPrice.toLocaleString()}đ
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center mt-4">
                      <button
                        className="w-full md:w-2/3 lg:w-1/2 bg-orange-500 text-white py-3 md:py-4 rounded-full font-medium text-base md:text-lg"
                        onClick={() => navigate("/checkout")}
                      >
                        Thanh toán
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}

        <Navbar />
      </div>
    </div>
  )
}

