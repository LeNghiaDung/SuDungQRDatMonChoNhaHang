"use client"

export default function PaymentMethod({ method, selected, onChange }) {
  return (
    <label className={`flex items-center p-5 border rounded-lg cursor-pointer ${
      selected === method.id ? "border-orange-500 bg-orange-50" : ""
    }`}>
      <input
        type="radio"
        name="payment"
        value={method.id}
        checked={selected === method.id}
        onChange={() => onChange(method.id)}
        className="mr-4 h-5 w-5"
      />
      <div className={`w-12 h-12 bg-${method.color}-100 rounded-full flex items-center justify-center mr-4`}>
        <img src={method.icon || "/placeholder.svg"} alt={method.name} className="w-8 h-8" />
      </div>
      <span className="text-lg">{method.name}</span>
    </label>
  )
}