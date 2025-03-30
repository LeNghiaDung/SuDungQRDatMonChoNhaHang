"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, Minus, Plus, Trash2 } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "http://54.85.77.70:8082"

export default function CartPage() {
  const navigate = useNavigate()
  const { cart, updateQuantity, removeFromCart, setCart } = useCart()
  const [activeTab, setActiveTab] = useState("cart")
  const [orderHistory, setOrderHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const totalAmount = cart.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  // Lấy giỏ hàng từ localStorage khi component mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        if (Array.isArray(parsedCart) && parsedCart.length > 0) {
          console.log("Loaded cart from localStorage:", parsedCart)
          setCart(parsedCart)
        }
      } catch (err) {
        console.error("Error parsing cart from localStorage:", err)
      }
    }
  }, [setCart])

  // Lưu giỏ hàng vào localStorage khi giỏ hàng thay đổi
  useEffect(() => {
    if (cart.length > 0) {
      console.log("Saving cart to localStorage:", cart)
      localStorage.setItem("cart", JSON.stringify(cart))
    }
  }, [cart])

  // Lấy chi tiết giỏ hàng từ API và tích hợp với giỏ hàng hiện tại
  useEffect(() => {
    const fetchCartDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const customerId = localStorage.getItem("customerId");
        if (!customerId) {
          console.warn("No customerId found.");
          setLoading(false);
          return;
        }

        const savedCustomerId = localStorage.getItem("savedCustomerId");
        if (savedCustomerId === customerId) {
          console.log("Same customerId detected, loading cart from localStorage.");
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          setCart(localCart); // Load cart from localStorage
          setLoading(false);
          return;
        }

        // Clear the cart if customerId has changed
        console.log("New customerId detected, refreshing cart.");
        setCart([]); // Clear the cart
        localStorage.removeItem("cart"); // Remove cart from localStorage

        const response = await fetch(`${BASE_URL}/cart/customer/${customerId}`);
        if (!response.ok) {
          console.warn("API request failed, keeping existing cart data");
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log("Cart details data:", data);

        if (data?.status === 200 && data.data && typeof data.data === "object") {
          const apiItems = Object.values(data.data);

          const formattedApiItems = apiItems.map(item => ({
            id: item.id,
            name: item.food?.name,
            price: item.food?.price || 0,
            quantity: item.quantity || 1,
            image: item.food?.imageUrl,
          }));

          // Merge API cart with local cart
          const mergedCart = [...formattedApiItems];
          const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
          localCart.forEach(localItem => {
            const existingItem = mergedCart.find(apiItem => apiItem.id === localItem.id);
            if (existingItem) {
              existingItem.quantity += localItem.quantity;
            } else {
              mergedCart.push(localItem);
            }
          });

          setCart(mergedCart); // Update cart with merged data
          localStorage.setItem("cart", JSON.stringify(mergedCart)); // Save to localStorage
          localStorage.setItem("savedCustomerId", customerId); // Save the current customerId
        }
      } catch (error) {
        console.error("Error fetching cart:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCartDetails();
  }, [setCart]);

  // Load orders from backend when customerId changes
  useEffect(() => {
    const loadOrders = async () => {
      const customerId = localStorage.getItem("customerId");
      if (!customerId) {
        console.warn("No customerId found.");
        return;
      }

      const savedCustomerId = localStorage.getItem("savedCustomerId");
      if (savedCustomerId === customerId) {
        console.log("Same customerId detected, loading orders from localStorage.");
        const localOrders = JSON.parse(localStorage.getItem("orders") || "[]");
        setOrderHistory(localOrders); // Load orders from localStorage
        return;
      }

      // Clear the order history if customerId has changed
      console.log("New customerId detected, refreshing orders.");
      setOrderHistory([]); // Clear the order history
      localStorage.removeItem("orders"); // Remove orders from localStorage

      try {
        const response = await fetch(`${BASE_URL}/order/customer/${customerId}`);
        if (response.ok) {
          const data = await response.json();
          console.log("Loaded orders from backend:", data);
          if (data?.status === 200 && Array.isArray(data.data)) {
            setOrderHistory(data.data); // Update order history with new data
            localStorage.setItem("orders", JSON.stringify(data.data)); // Save to localStorage
            localStorage.setItem("savedCustomerId", customerId); // Save the current customerId
          }
        } else {
          console.error("Failed to fetch orders from backend");
        }
      } catch (err) {
        console.error("Error fetching orders from backend:", err);
      }
    };

    loadOrders();
  }, [setOrderHistory]);

  // Load orders from localStorage when the component mounts
  useEffect(() => {
    const savedOrders = localStorage.getItem("orders");
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          console.log("Loaded orders from localStorage:", parsedOrders);
          setOrderHistory(parsedOrders);
        }
      } catch (err) {
        console.error("Error parsing orders from localStorage:", err);
      }
    }
  }, [setOrderHistory]);

  // Save orders to localStorage whenever they change
  useEffect(() => {
    if (orderHistory.length > 0) {
      console.log("Saving orders to localStorage:", orderHistory);
      localStorage.setItem("orders", JSON.stringify(orderHistory));
    }
  }, [orderHistory]);

  const handleCheckout = () => {
    if (cart.length > 0) {
      // Create a new order object
      const newOrder = {
        id: Date.now(), // Unique ID for the order
        date: new Date().toLocaleString(),
        items: cart,
        total: totalAmount,
        status: "Đang xử lý", // Default status for new orders
        delivered: false,
      };

      // Add the new order to the order history
      const updatedOrders = [...orderHistory, newOrder];
      setOrderHistory(updatedOrders);

      // Save the updated orders to localStorage
      localStorage.setItem("orders", JSON.stringify(updatedOrders));

      // Clear the cart
      setCart([]);
      localStorage.removeItem("cart"); // Clear cart from localStorage

      // Navigate to the orders tab
      setActiveTab("orders");
    } else {
      console.warn("Cart is empty. Cannot proceed to checkout.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 md:p-6 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-medium">Giỏ hàng</h1>
        </div>

        <div className="flex border-b mb-4 md:mb-6 max-w-4xl mx-auto">
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${activeTab === "cart" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("cart")}
          >
            Giỏ hàng
          </button>
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${activeTab === "orders" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("orders")}
          >
            Đơn hàng
          </button>
          <button
            className={`flex-1 py-3 md:py-4 text-center font-medium text-base md:text-lg ${activeTab === "history" ? "text-orange-500 border-b-2 border-orange-500" : "text-gray-500"}`}
            onClick={() => setActiveTab("history")}
          >
            Lịch sử mua hàng
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            {activeTab === "cart" && (
              <div className="px-4 md:px-6 max-w-4xl mx-auto">
                {cart.length === 0 ? (
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
                            src={item.image }
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
                              onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                            >
                              <Minus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            </button>
                            <span className="w-8 md:w-10 lg:w-12 text-center text-sm md:text-base lg:text-lg">
                              {item.quantity}
                            </span>
                            <button
                              className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
                            </button>
                            <button
                              className="ml-2 md:ml-3 lg:ml-4 text-red-400"
                              onClick={() => removeFromCart(item.id)}
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
                      >
                        Đặt món
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {(activeTab === "orders" || activeTab === "history") && (
              <div className="px-4 md:px-6 max-w-4xl mx-auto">
                {error ? (
                  <div className="text-center py-10">
                    <p className="text-red-500">{error}</p>
                    <button
                      className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
                      onClick={() => window.location.reload()}
                    >
                      Thử lại
                    </button>
                  </div>
                ) : orderHistory.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {activeTab === "orders"
                        ? "Bạn không có đơn hàng đang xử lý nào"
                        : "Bạn chưa có lịch sử mua hàng nào"}
                    </p>
                  </div>
                ) : (
                  orderHistory
                    .filter((order) => (activeTab === "orders" ? !order.delivered : order.delivered))
                    .map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-xl p-4 md:p-6 mb-4 md:mb-6">
                        <div className="flex justify-between items-center mb-2 md:mb-4">
                          <span className="text-gray-500 text-sm md:text-base lg:text-lg">{order.date}</span>
                          <span
                            className={`${order.delivered ? "text-green-600" : "text-yellow-600"} font-medium text-sm md:text-base lg:text-lg`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="relative">
                          <div
                            className={`absolute -right-4 -top-2 ${order.delivered ? "bg-green-600" : "bg-yellow-600"} text-white text-xs md:text-sm py-1 px-2 md:px-3 rotate-12`}
                          >
                            {order.delivered ? "Đã giao" : "Đang nấu"}
                          </div>
                          <div className="space-y-3 md:space-y-4">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex items-center">
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover"
                                />
                                <div className="ml-3 md:ml-4 flex-1">
                                  <h3 className="font-medium text-sm md:text-base lg:text-lg">
                                    {item.name} x{item.quantity}
                                  </h3>
                                  <p className="text-red-500 text-sm md:text-base">
                                    {(item.price * item.quantity).toLocaleString()}đ
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        {order.total && (
                          <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-200 flex justify-between">
                            <span className="text-sm md:text-base lg:text-lg">Tổng tiền</span>
                            <span className="font-medium text-red-500 text-sm md:text-base lg:text-lg">
                              {order.total.toLocaleString()}đ
                            </span>
                          </div>
                        )}
                      </div>
                    ))
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