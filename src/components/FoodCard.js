"use client"
import { Link } from "react-router-dom"
import { Plus } from 'lucide-react'

export default function FoodCard({ item, addToCart }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-3 md:p-4 food-card hover:shadow-md transition-shadow">
      <Link to={`/product/${item.id}`} className="block">
        <div className="relative overflow-hidden rounded-lg mb-2 md:mb-3">
          <img
            src={item.image }
            alt={item.name}
            className="w-full h-32 sm:h-40 md:h-44 lg:h-48 object-cover"
          />
        </div>
        <h3 className="font-medium text-gray-800 text-base md:text-lg">{item.name}</h3>
        <p className="text-red-500 text-sm md:text-base lg:text-lg font-medium">{item.price.toLocaleString()}đ</p>
      </Link>
      <div className="flex justify-end mt-2 md:mt-3">
        <button
          className="bg-red-100 rounded-full p-1.5 md:p-2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-red-500 add-button hover:bg-red-200 transition-colors"
          onClick={() => addToCart(item)}
        >
          <Plus size={16} className="md:w-5 md:h-5" />
        </button>
      </div>
    </div>
  )
}