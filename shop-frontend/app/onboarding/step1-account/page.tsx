'use client';
import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepHeader } from "../../../../components/onboarding/StepHeader";
import { StepFooter } from "../../../../components/onboarding/StepFooter";

export default function Step1Account() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Registration failed");
      }

      router.push("/onboarding/step2-business");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <StepHeader step={1} title="Create Your Account" />
      <div className="space-y-4">
        <input className="input" placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="input" placeholder="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} />
        <input className="input" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
        <input className="input" placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        {error && <p className="text-red-500">{error}</p>}
      </div>
      <StepFooter onNext={handleSubmit} loading={loading} />
    </div>
  );
}
