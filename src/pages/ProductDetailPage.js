"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronLeft, Minus, Plus } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "http://54.85.77.70:8082"

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [showFullDescription, setShowFullDescription] = useState(false)
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProductDetail = async () => {
      try {
        setLoading(true)

        const response = await fetch(`${BASE_URL}/food/${id}`)
        if (!response.ok) {
          throw new Error("Không tìm thấy sản phẩm")
        }

        const result = await response.json()
        console.log("Fetched product detail:", result)

        if (result && result.status === 200 && result.data) {
          setProduct(result.data) 
        } else {
          throw new Error("Không tìm thấy sản phẩm")
        }

        setLoading(false)
      } catch (err) {
        setError(err.message || "Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.")
        setLoading(false)
        console.error("Error fetching product details:", err)
      }
    }

    if (id) {
      fetchProductDetail()
    }
  }, [id])

  const handleAddToCart = () => {
    if (product) {
      const productWithQuantity = { ...product, quantity }
      addToCart(productWithQuantity)
      navigate("/cart")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-red-500 mb-2">Lỗi</h2>
          <p>{error || "Không tìm thấy sản phẩm"}</p>
          <button className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 md:p-6 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 md:mr-4">
            <ChevronLeft size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-medium">Chi tiết sản phẩm</h1>
        </div>

        <div className="px-4 md:px-6 mx-auto max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10">
            <div className="rounded-2xl overflow-hidden">
              <img
                src={product.image || "/placeholder.svg?height=400&width=600"}
                alt={product.name}
                className="w-full h-64 md:h-80 lg:h-[400px] object-cover"
              />
            </div>

            <div>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold mb-3 md:mb-4">{product.name}</h2>

              <div className="inline-block rounded-full border border-gray-300 px-4 py-2 md:px-6 md:py-2 lg:px-8 lg:py-3 mb-4 md:mb-5 lg:mb-6">
                <span className="text-red-500 font-medium text-lg md:text-xl">
                  {product.price?.toLocaleString() || 0}đ
                </span>
              </div>

              <div className="mb-6 md:mb-7 lg:mb-8">
                <p
                  className={`text-gray-600 text-sm md:text-base lg:text-lg ${showFullDescription ? "" : "line-clamp-3 md:line-clamp-4"}`}
                >
                  {product.description}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-gray-500 mt-2 flex items-center"
                >
                  <ChevronDown
                    size={20}
                    className={`md:w-6 md:h-6 transition-transform ${showFullDescription ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              <div className="flex items-center mb-6 md:mb-7 lg:mb-8">
                <div className="flex items-center bg-orange-500 rounded-full text-white">
                  <button
                    className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  >
                    <Minus size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </button>
                  <span className="w-10 md:w-11 lg:w-12 text-center text-base md:text-lg">{quantity}</span>
                  <button
                    className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 flex items-center justify-center"
                    onClick={() => setQuantity((prev) => prev + 1)}
                  >
                    <Plus size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
                  </button>
                </div>
              </div>

              <div className="flex justify-center md:justify-start">
                <button
                  className="w-full md:w-2/3 lg:w-1/2 bg-orange-500 text-white py-3 md:py-4 rounded-full font-medium text-base md:text-lg"
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </button>
              </div>
            </div>
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

