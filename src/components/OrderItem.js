export default function OrderItem({ order }) {
  return (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-500 text-lg">{order.date}</span>
        <span className={`${order.delivered ? "text-green-600" : "text-yellow-600"} font-medium text-lg`}>{order.status}</span>
      </div>
      <div className="relative">
        <div
          className={`absolute -right-4 -top-2 ${order.delivered ? "bg-green-600" : "bg-yellow-600"} text-white text-sm py-1 px-3 rotate-12`}
        >
          {order.delivered ? "Đã giao" : "Đang nấu"}
        </div>
        <div className="space-y-4">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center">
              <img
                src={item.image || "/placeholder.svg"}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="ml-4 flex-1">
                <h3 className="font-medium text-lg">
                  {item.name} x{item.quantity}
                </h3>
                <p className="text-red-500">{(item.price * item.quantity).toLocaleString()}đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      {order.total && (
        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between">
          <span className="text-lg">Tổng tiền</span>
          <span className="font-medium text-red-500 text-lg">{order.total.toLocaleString()}đ</span>
        </div>
      )}
    </div>
  )
}