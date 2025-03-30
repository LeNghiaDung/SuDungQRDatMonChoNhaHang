import { Link, useLocation } from "react-router-dom"
import { Home, Search, ShoppingCart } from 'lucide-react'
import { useCart } from "../context/CartContext"

export default function Navbar() {
  const location = useLocation()
  const { cart } = useCart()

  const totalItems = cart.reduce((total, item) => total + item.quantity, 0)

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 mx-auto">
      <div className="flex justify-between items-center px-8 md:px-12 lg:px-20 py-3 md:py-4">
        <Link to="/" className={`navbar-icon ${location.pathname === "/" ? "text-red-500" : "text-gray-500"}`}>
          <Home size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
        </Link>

        <div className="relative -mt-6 md:-mt-8 lg:-mt-10">
          <div className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 bg-orange-500 rounded-full flex items-center justify-center shadow-lg search-button">
            <Search size={20} className="md:w-6 md:h-6 lg:w-8 lg:h-8 text-white" />
          </div>
        </div>

        <Link
          to="/cart"
          className={`navbar-icon ${location.pathname.includes("/cart") ? "text-red-500" : "text-gray-500"}`}
        >
          <div className="relative">
            <ShoppingCart size={24} className="md:w-7 md:h-7 lg:w-8 lg:h-8" />
            {totalItems > 0 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {totalItems}
              </div>
            )}
          </div>
        </Link>
      </div>
    </div>
  )
}