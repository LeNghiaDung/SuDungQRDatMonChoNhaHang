export const foodItems = [
    {
      id: 1,
      name: "Phở Hà Nội",
      price: 40000,
      image: "/images/pho.jpg",
      category: "Món chính",
      description: "Phở là món ăn truyền thống của Hà Nội, sẽ thật tuyệt khi thưởng thức vào 1 chiều thu Hà Nội",
    },
    {
      id: 2,
      name: "Bánh mì",
      price: 70000,
      image: "/images/banh-mi.jpg",
      category: "Món chính",
      description: "Bánh mì là món ăn truyền thống của Hà Nội, sẽ thật tuyệt khi thưởng thức vào 1 chiều thu Hà Nội",
    },
    {
      id: 3,
      name: "Bánh xèo",
      price: 50000,
      image: "/images/banh-xeo.jpg",
      category: "Món chính",
      description: "Bánh xèo là món ăn truyền thống miền Nam, giòn rụm với nhân tôm thịt và rau sống",
    },
    {
      id: 4,
      name: "Bún bò Huế",
      price: 35000,
      image: "/images/bun-bo-hue.jpg",
      category: "Món chính",
      description: "Bún bò Huế là đặc sản xứ Huế với vị cay nồng đặc trưng và thịt bò thơm ngon",
    },
    {
      id: 5,
      name: "Bún đậu",
      price: 50000,
      image: "/images/bun-dau.jpg",
      category: "Món chính",
      description: "Bún đậu mắm tôm là món ăn đơn giản nhưng đầy đủ hương vị với đậu phụ rán giòn và bún tươi",
    },
    {
      id: 6,
      name: "Cơm cuốn",
      price: 35000,
      image: "/images/com-cuon.jpg",
      category: "Món chính",
      description: "Cơm cuốn là món ăn nhẹ nhàng với hương vị tinh tế của cơm Nhật và hải sản tươi ngon",
    },
  ]
  
  export const categories = [
    { id: "mon-chinh", name: "Món chính", active: true },
    { id: "trang-mieng", name: "Tráng miệng", active: false },
    { id: "nuoc", name: "Nước", active: false },
  ]
  
  export const orderHistory = [
    {
      id: 1,
      date: "17:24:01 25/09/2024",
      status: "Đã thanh toán",
      items: [
        { id: 3, name: "Bánh xèo", price: 40000, quantity: 3, image: "/images/banh-xeo.jpg" },
        { id: 2, name: "Bánh mì", price: 50000, quantity: 4, image: "/images/banh-mi.jpg" },
        { id: 6, name: "Cơm cuốn", price: 35000, quantity: 2, image: "/images/com-cuon.jpg" },
        { id: 4, name: "Bún bò Huế", price: 35000, quantity: 1, image: "/images/bun-bo-hue.jpg" },
      ],
      total: 390000,
      delivered: true,
    },
    {
      id: 2,
      date: "15:24:01 25/09/2024",
      status: "Đang nấu",
      items: [
        { id: 3, name: "Bánh xèo", price: 40000, quantity: 3, image: "/images/banh-xeo.jpg" },
        { id: 3, name: "Bánh xèo", price: 40000, quantity: 1, image: "/images/banh-xeo.jpg" },
        { id: 3, name: "Bánh xèo", price: 40000, quantity: 1, image: "/images/banh-xeo.jpg" },
      ],
      total: 200000,
      delivered: false,
    },
    {
      id: 3,
      date: "15:15:01 25/09/2024",
      status: "Đã giao",
      items: [{ id: 3, name: "Bánh xèo", price: 40000, quantity: 2, image: "/images/banh-xeo.jpg" }],
      total: 80000,
      delivered: true,
    },
  ]
  
  export const paymentMethods = [
    { id: "cash", name: "Tiền mặt", icon: "/images/cash-icon.png", color: "green" },
    { id: "bank", name: "Chuyển khoản ngân hàng", icon: "/images/bank-icon.png", color: "green" },
    { id: "momo", name: "Ví MOMO", icon: "/images/momo-icon.png", color: "pink" },
    { id: "vnpay", name: "VNPay", icon: "/images/vnpay-icon.png", color: "blue" },
  ]
  
  