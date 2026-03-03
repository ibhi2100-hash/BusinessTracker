"use client";

import React, { useState } from "react";
import { useCashflows } from "@/hooks/useCashflow";
import { ArrowUp, ArrowDown, DollarSign, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CashflowTableProps {
  mode: "OPENING" | "LIVE";
  onCompleted: ()=> void;
}
const CashflowTable = ({ mode, onCompleted}: CashflowTableProps) => {
  const { cashflows, loading, injectCash, withdrawCash, refetch } = useCashflows();
  const [rawAmount, setRawAmount] = useState<string>("");
  const [formattedAmount, setFormattedAmount] = useState<string>("");

  // Format number with commas (₦ for display)
  const formatNumber = (value: string | number) => {
    if (!value) return "";
    const num = typeof value === "string" ? Number(value.replace(/,/g, "")) : value;
    return num.toLocaleString("en-NG");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    if (/^\d*$/.test(value)) {
      setRawAmount(value);
      setFormattedAmount(formatNumber(value));
    }
  };

  const handleInject = async () => {
    const amount = Number(rawAmount);
    if (amount <= 0) return;
    const source = 
      mode === "OPENING"
        ? "Opening capital"
        : "Owner top-up"
    await injectCash(amount, source);
    setRawAmount("");
    setFormattedAmount("");

     if (mode === "OPENING" && onCompleted) {
    // Notify parent / refetch onboarding status
        onCompleted(); // optional callback prop
  }
  };

  const handleWithdraw = async () => {
    if(mode === "OPENING") return;
    const amount = Number(rawAmount);
    if (amount <= 0) return;
    await withdrawCash(amount, "Owner withdrawal");
    setRawAmount("");
    setFormattedAmount("");
  };

  return (
    <div className="max-w-md mx-auto p-4 space-y-6">
      {mode === "OPENING" && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded text-sm">
          Opening Mode: Cash added here will be recorded as initial capital.
        </div>
      )}
      {/* Input Panel */}
      <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg font-semibold text-green-600">₦</span>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Enter amount"
            className="flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={formattedAmount}
            onChange={handleChange}
          />
        </div>

       <div className="flex gap-2 flex-wrap">
        <Button
            onClick={handleInject}
            variant="success"
            className="flex-1 gap-2"
            disabled={!rawAmount || Number(rawAmount) <= 0}
        >
            <ArrowUp className="w-5 h-5" />
            Inject
        </Button>

        <Button
            onClick={handleWithdraw}
            variant="danger"
            disabled={mode === "OPENING"}
            className="flex-1 gap-2"
        >
            <ArrowDown className="w-5 h-5" />
            Withdraw
        </Button>

        <Button
            onClick={()=>refetch()}
            variant="secondary"
            className="gap-1"
        >
            <RefreshCw className="w-4 h-4" />
            Refresh
        </Button>
        </div>
      </div>

      {/* Recent Cashflow Table */}
      <div className="bg-white shadow rounded-xl p-4">
        <h3 className="text-lg font-semibold mb-3">Recent Cashflow Activity</h3>
        {loading ? (
          <p>Loading...</p>
        ) : cashflows.length === 0 ? (
          <p className="text-gray-500">No activity yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="py-2 px-2">Type</th>
                  <th className="py-2 px-2">Amount</th>
                  <th className="py-2 px-2">Source</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {cashflows
                  .slice()
                  .reverse()
                  .slice(0, 5) // show last 5 transactions
                  .map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-2 flex items-center gap-1">
                        {c.type === "INFLOW" ? (
                          <ArrowUp className="w-4 h-4 text-green-500" />
                        ) : (
                          <ArrowDown className="w-4 h-4 text-red-500" />
                        )}
                        {c.type}
                      </td>
                      <td className="py-2 px-2">
                        ₦{Number(c.amount).toLocaleString("en-NG")}
                      </td>
                      <td className="py-2 px-2 capitalize">
                        {c.source.replace("_", " ")}
                      </td>
                      <td className="py-2 px-2">
                        {c.isOpening ? (
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-xs">
                            Opening
                          </span>
                        ) : (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                            Running
                          </span>
                        )}
                      </td>
                      <td className="py-2 px-2 text-gray-500 text-xs">
                        {new Date(c.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CashflowTable;