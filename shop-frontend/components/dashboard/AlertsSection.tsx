import React from 'react'

export const AlertsSection = () => {
  const alerts = [
    "Low stock: iPhone 11 (2 left)",
    "Subscription expires in 5 days",
  ];

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Alerts</h3>

      <div className="space-y-2">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="bg-yellow-50 text-yellow-800 p-3 rounded-xl text-sm"
          >
            {alert}
          </div>
        ))}
      </div>
    </div>
  );
}
