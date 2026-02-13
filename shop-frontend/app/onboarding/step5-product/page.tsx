'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";

interface Product {
  name: string;
  category: string;
  brand?: string;
  type: "ACCESSORY" | "PHONE" | "SERVICE" | "OTHER";
  quantity: number;
  costPrice: number;
  sellingPrice: number;
}

export default function Step4Products() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<Product>({
    name: "",
    category: "",
    brand: "",
    type: "OTHER",
    quantity: 0,
    costPrice: 0,
    sellingPrice: 0,
  });
  const [loading, setLoading] = useState(false);

  const addProduct = () => {
    if (!form.name || !form.category) return;
    setProducts([...products, form]);
    setForm({ name: "", category: "", brand: "", type: "OTHER", quantity: 0, costPrice: 0, sellingPrice: 0 });
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      await fetch("/api/products/create-many", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products }),
      });
      router.push("/onboarding/step5-summary");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={4} title="Add Products & Inventory" />

      <div className="space-y-2">
        <input placeholder="Product Name" className="input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
        <input placeholder="Category" className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} />
        <input placeholder="Brand" className="input" value={form.brand} onChange={e => setForm({ ...form, brand: e.target.value })} />
        <input type="number" placeholder="Quantity" className="input" value={form.quantity} onChange={e => setForm({ ...form, quantity: +e.target.value })} />
        <input type="number" placeholder="Cost Price" className="input" value={form.costPrice} onChange={e => setForm({ ...form, costPrice: +e.target.value })} />
        <input type="number" placeholder="Selling Price" className="input" value={form.sellingPrice} onChange={e => setForm({ ...form, sellingPrice: +e.target.value })} />

        <button type="button" className="btn-primary w-full" onClick={addProduct}>Add Product</button>
      </div>

      {products.length > 0 && (
        <div className="mt-4">
          {products.map((p, idx) => (
            <div key={idx} className="p-2 border rounded mb-2">
              <p><strong>{p.name}</strong> ({p.type})</p>
              <p>Category: {p.category}, Brand: {p.brand}</p>
              <p>Qty: {p.quantity}, Selling: ₦{p.sellingPrice}</p>
            </div>
          ))}
        </div>
      )}

      <StepFooter onNext={handleNext} loading={loading} />
    </div>
  );
}
