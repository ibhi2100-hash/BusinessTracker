import React from 'react'

export const CartPanel = () => {
  return (
  <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Cart</h3>

      <div className="space-y-2">
        {/* Cart items */}
      </div>

      <div className="border-t mt-3 pt-3 flex justify-between">
        <span>Total</span>
        <span className="font-bold">₦0</span>
      </div>
    </div>
  )
}
