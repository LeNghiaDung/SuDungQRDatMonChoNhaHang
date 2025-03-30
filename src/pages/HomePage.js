"use client";

import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import Navbar from "../components/Navbar";
import CategoryTabs from "../components/CategoryTabs";
import FoodCard from "../components/FoodCard";

const BASE_URL = "http://54.85.77.70:8082";

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState("Tất cả");
  const [categories, setCategories] = useState([{ id: "all", name: "Tất cả" }]);
  const [foodItems, setFoodItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [showSearchBar, setShowSearchBar] = useState(false); // State to toggle search bar visibility

  //Lấy danh sách danh mục
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${BASE_URL}/category/`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        console.log("response:", response);
        const data = await response.json();
        console.log("Categories response:", data);

        if (data?.status === 200 && Array.isArray(data.data)) {
          setCategories([
            { id: "all", name: "Tất cả" },
            ...data.data.map((cat) => ({ id: cat.id, name: cat.name })),
          ]);
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Không thể tải danh mục. Vui lòng thử lại sau.");
      }
    };

    fetchCategories();
  }, []);

  // Lấy danh sách món ăn
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`${BASE_URL}/food/`);
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }

        const data = await response.json();
        console.log("Fetched food data:", data);

        if (data?.status === 200 && data.data?.items && Array.isArray(data.data.items)) {
          const formattedFoods = data.data.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            image: item.imageUrl || "",
            status: item.status || "UNAVAILABLE",
            available: item.status === "AVAILABLE",
            category: item.categoryId, // Ensure categoryId is used for filtering
          }));
          setFoodItems(formattedFoods);
        } else {
          console.warn("Unexpected API response structure:", data);
          setFoodItems([]);
        }
      } catch (err) {
        console.error("Error fetching foods:", err);
        setError("Không thể tải danh sách món ăn. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchFoods();
  }, []);

  // Lọc món ăn theo danh mục và tìm kiếm
  useEffect(() => {
    let filtered = foodItems;

    if (activeCategory !== "Tất cả") {
      const categoryObj = categories.find((cat) => cat.name === activeCategory);
      filtered = filtered.filter((item) =>
        categoryObj ? item.category === categoryObj.id : false
      );
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [activeCategory, foodItems, categories, searchQuery]);

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl text-red-500 mb-2">Lỗi</h2>
          <p>{error}</p>
          <button
            className="mt-4 bg-orange-500 text-white px-4 py-2 rounded-lg"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto bg-white min-h-screen pb-20">
        <div className="p-4 md:p-6 font-bold text-xl md:text-2xl lg:text-3xl text-center">LOGO</div>

        {showSearchBar && (
          <div className="p-4 md:p-6 flex justify-center">
            <input
              type="text"
              placeholder="Tìm kiếm món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-lg p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : (
          <>
            <CategoryTabs
              categories={categories}
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-6 lg:gap-8 p-4 md:p-6">
              {filteredItems.length > 0 ? (
                filteredItems.map((item) => (
                  <FoodCard key={item.id} item={item} addToCart={addToCart} disabled={item.status === "UNAVAILABLE"} />
                ))
              ) : (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Không có món ăn nào phù hợp
                </div>
              )}
            </div>
          </>
        )}

        <Navbar />

        {/* Search button at the bottom */}
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2">
          <button
            onClick={() => setShowSearchBar((prev) => !prev)}
            className="bg-gradient-to-r from-orange-400 to-orange-500 text-white p-5 rounded-full shadow-lg flex items-center justify-center"
            style={{
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.25)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-10 w-10"
              fill="none"
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16" y1="16" x2="20" y2="20" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

