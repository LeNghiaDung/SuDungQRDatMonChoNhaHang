"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ChevronDown, ChevronLeft, Minus, Plus } from "lucide-react"
import { useCart } from "../context/CartContext"
import Navbar from "../components/Navbar"

// URL cơ sở cho API
const BASE_URL = "http://185.234.247.196:8082"

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
        <div className="p-4 flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-lg font-medium">Chi tiết sản phẩm</h1>
        </div>

        <div className="px-4 mx-auto max-w-md">
          <div className="rounded-2xl overflow-hidden mb-4">
            <img
              src={product.image || "/placeholder.svg?height=400&width=600"}
              alt={product.name}
              className="w-full h-64 object-cover"
            />
          </div>

          <h2 className="text-xl font-bold text-center mb-3">{product.name}</h2>

          <div className="flex justify-center items-center mb-4">
            <div className="inline-block rounded-full border border-gray-300 px-6 py-2">
              <span className="text-red-500 font-medium text-lg">
                {product.price?.toLocaleString() || 0}đ
              </span>
            </div>
          </div>

          <p className={`text-gray-600 text-center mb-4 ${showFullDescription ? "" : "line-clamp-3"}`}>
            {product.description}
          </p>
          <button
            onClick={() => setShowFullDescription(!showFullDescription)}
            className="text-gray-500 flex items-center justify-center mb-4"
          >
            <ChevronDown
              size={20}
              className={`transition-transform ${showFullDescription ? "rotate-180" : ""}`}
            />
          </button>

          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center bg-orange-500 rounded-full text-white">
              <button
                className="w-10 h-10 flex items-center justify-center"
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                <Minus size={18} />
              </button>
              <span className="w-10 text-center text-base">{quantity}</span>
              <button
                className="w-10 h-10 flex items-center justify-center"
                onClick={() => setQuantity((prev) => prev + 1)}
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button
              className="w-full bg-orange-500 text-white py-3 rounded-full font-medium text-base"
              onClick={handleAddToCart}
            >
              Thêm vào giỏ hàng
            </button>
          </div>
        </div>

        <Navbar />
      </div>
    </div>
  )
}

