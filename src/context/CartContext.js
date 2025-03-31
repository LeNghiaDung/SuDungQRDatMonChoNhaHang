"use client"

import { createContext, useContext, useState, useEffect } from "react"

// Base URL for API
const BASE_URL = "http://185.234.247.196:8082"

const CartContext = createContext()

export function CartProvider({ children }) {
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Fetch cart from API on initial mount
  useEffect(() => {
    fetchCartFromAPI()
  }, [])

  // Fetch cart from API
  const fetchCartFromAPI = async () => {
    try {
      setLoading(true)
      setError(null)

      const customerId = localStorage.getItem("customerId")
      if (!customerId) {
        console.warn("CartContext: No customerId found")
        setLoading(false)
        return
      }

      console.log("CartContext: Fetching cart from API for customer", customerId)

      const response = await fetch(`${BASE_URL}/cart/customer/${customerId}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.status}`)
      }

      const data = await response.json()
      console.log("CartContext: API response", data)

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

        console.log("CartContext: Processed cart items", apiItems)
        setCart(apiItems)
      } else {
        console.warn("CartContext: Unexpected API response format", data)
        setCart([])
      }
    } catch (error) {
      console.error("CartContext: Error fetching cart from API", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Add to Cart via API
  const addToCart = async (product) => {
    try {
      setLoading(true)

      const customerId = localStorage.getItem("customerId")
      if (!customerId) {
        console.error("CartContext: No customerId found. Cannot add to cart.")
        return
      }

      // Check if product already exists in cart
      const existingItem = cart.find((item) => item.id === product.id)
      const quantity = existingItem ? existingItem.quantity + 1 : 1

      // Prepare request data
      const requestData = {
        foodId: product.id,
        quantity: quantity,
        customerId: customerId,
      }

      console.log("CartContext: Adding to cart via API", requestData)

      // Call API to add/update cart
      const response = await fetch(`${BASE_URL}/cart/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.status}`)
      }

      // Refresh cart from API
      await fetchCartFromAPI()
    } catch (error) {
      console.error("CartContext: Error adding to cart", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Update Quantity via API
  const updateQuantity = async (id, quantity) => {
    try {
      setLoading(true)

      const customerId = localStorage.getItem("customerId")
      if (!customerId) {
        console.error("CartContext: No customerId found. Cannot update quantity.")
        return
      }

      // Prepare request data
      const requestData = {
        id: id,
        quantity: quantity,
        customerId: customerId,
      }

      console.log("CartContext: Updating quantity via API", requestData)

      // Call API to update quantity
      const response = await fetch(`${BASE_URL}/cart/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update quantity: ${response.status}`)
      }

      // Update local state immediately for better UX
      setCart((prevCart) => prevCart.map((item) => (item.id === id ? { ...item, quantity: quantity } : item)))

      // Refresh cart from API
      await fetchCartFromAPI()
    } catch (error) {
      console.error("CartContext: Error updating quantity", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Remove from Cart via API
  const removeFromCart = async (id) => {
    try {
      setLoading(true)

      console.log("CartContext: Removing item from cart via API", id)

      // Call API to remove item
      const response = await fetch(`${BASE_URL}/cart/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.status}`)
      }

      // Update local state immediately for better UX
      setCart((prevCart) => prevCart.filter((item) => item.id !== id))

      // Refresh cart from API
      await fetchCartFromAPI()
    } catch (error) {
      console.error("CartContext: Error removing from cart", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Clear cart via API
  const clearCart = async () => {
    try {
      setLoading(true)

      // Remove each item from the cart via API
      for (const item of cart) {
        await fetch(`${BASE_URL}/cart/${item.id}`, {
          method: "DELETE",
        })
      }

      // Clear local state
      setCart([])
    } catch (error) {
      console.error("CartContext: Error clearing cart", error)
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        setCart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        loading,
        error,
        refreshCart: fetchCartFromAPI,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  return useContext(CartContext)
}

