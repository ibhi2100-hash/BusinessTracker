import React from 'react'
import { PlusCircle, DollarSign, Package, CreditCard } from 'lucide-react';

export const QuickActions = () => {
   const actions = [
    { label: "New Sale", icon: PlusCircle },
    { label: "Add Expense", icon: DollarSign },
    { label: "Add Asset", icon: Package },
    { label: "Record Payment", icon: CreditCard },
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Quick Actions</h3>

      <div className="grid grid-cols-2 gap-4">
        {actions.map((action, i) => {
          const Icon = action.icon;
          return (
            <button
              key={i}
              className="bg-white rounded-2xl p-4 shadow flex flex-col items-center justify-center gap-2"
            >
              <Icon className="w-6 h-6" />
              <span className="text-sm">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  )
}
