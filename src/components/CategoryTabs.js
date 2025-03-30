"use client"

export default function CategoryTabs({ categories, activeCategory, setActiveCategory }) {
  return (
    <div className="flex justify-start md:justify-center space-x-2 md:space-x-4 p-4 md:p-6 overflow-x-auto scrollbar-hide">
      {categories.map((category) => (
        <button
          key={category.id}
          className={`px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-3 rounded-full whitespace-nowrap text-sm md:text-base lg:text-lg font-medium category-tab ${
            activeCategory === category.name ? "active" : "bg-gray-100 text-gray-500"
          }`}
          onClick={() => setActiveCategory(category.name)}
        >
          {category.name}
        </button>
      ))}
    </div>
  )
}