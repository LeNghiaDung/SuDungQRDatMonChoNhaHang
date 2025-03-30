"use client"
import { Minus, Plus, Trash2 } from 'lucide-react'

export default function CartItem({ item, updateQuantity, removeFromCart }) {
  return (
    <div className="flex items-center bg-gray-50 p-3 md:p-5 rounded-xl">
      <img 
        src={item.image || "/placeholder.svg"} 
        alt={item.name} 
        className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 rounded-lg object-cover" 
      />
      <div className="ml-3 md:ml-5 lg:ml-6 flex-1">
        <h3 className="font-medium text-base md:text-lg lg:text-xl">{item.name}</h3>
        <p className="text-red-500 text-sm md:text-base lg:text-lg">{item.price.toLocaleString()}đ</p>
      </div>
      <div className="flex items-center">
        <button
          className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
        >
          <Minus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </button>
        <span className="w-8 md:w-10 lg:w-12 text-center text-sm md:text-base lg:text-lg">{item.quantity}</span>
        <button
          className="w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 bg-orange-500 rounded-full flex items-center justify-center text-white"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Plus size={14} className="md:w-4 md:h-4 lg:w-5 lg:h-5" />
        </button>
        <button className="ml-2 md:ml-3 lg:ml-4 text-red-400" onClick={() => removeFromCart(item.id)}>
          <Trash2 size={18} className="md:w-5 md:h-5 lg:w-6 lg:h-6" />
        </button>
      </div>
    </div>
  )
}