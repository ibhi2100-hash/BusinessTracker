import React from 'react'

export const PaymentSection = () => {
  return (
       <div className="bg-white p-4 rounded-xl shadow">
      <h3 className="font-semibold mb-3">Payment</h3>

      <div className="flex gap-2">
        <button className="flex-1 bg-gray-100 rounded-xl p-2">
          Cash
        </button>
        <button className="flex-1 bg-gray-100 rounded-xl p-2">
          Transfer
        </button>
        <button className="flex-1 bg-gray-100 rounded-xl p-2">
          POS
        </button>
      </div>

      <button className="mt-4 w-full bg-black text-white rounded-xl p-3">
        Complete Sale
      </button>
    </div>
  )
}
