import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";


export default function Page() {
    return(
    <div className="max-w-6xl mx-auto px-6 py-20 space-y-16">

      {/* HERO */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-4xl font-semibold">
          Simple pricing for growing businesses
        </h1>
        <p className="text-gray-500">
          Start free and upgrade when your business grows.
        </p>
      </div>

      {/* PRICING CARDS */}
      <div className="grid md:grid-cols-3 gap-8">

        {/* STARTER */}
        <Card className="p-8 space-y-6">
          <h3 className="text-lg font-semibold">Starter</h3>

          <div className="text-4xl font-bold">
            ₦0
            <span className="text-sm text-gray-500"> / month</span>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>Inventory management</li>
            <li>Sales tracking</li>
            <li>Opening cash tracking</li>
            <li>1 branch</li>
          </ul>

          <Button className="w-full">
            Start Free
          </Button>
        </Card>

        {/* BUSINESS */}
        <Card className="p-8 space-y-6 border-2 border-primary relative">

          <span className="absolute top-4 right-4 text-xs bg-primary text-white px-3 py-1 rounded-full">
            Most Popular
          </span>

          <h3 className="text-lg font-semibold">Business</h3>

          <div className="text-4xl font-bold">
            ₦5,000
            <span className="text-sm text-gray-500"> / month</span>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>Unlimited inventory</li>
            <li>Staff accounts</li>
            <li>Sales analytics</li>
            <li>Expense tracking</li>
          </ul>

          <Button className="w-full">
            Upgrade
          </Button>
        </Card>

        {/* PRO */}
        <Card className="p-8 space-y-6">
          <h3 className="text-lg font-semibold">Pro</h3>

          <div className="text-4xl font-bold">
            ₦15,000
            <span className="text-sm text-gray-500"> / month</span>
          </div>

          <ul className="space-y-2 text-sm text-gray-600">
            <li>Multi-branch support</li>
            <li>Advanced analytics</li>
            <li>Profit & loss reports</li>
            <li>Priority support</li>
          </ul>

          <Button className="w-full">
            Go Pro
          </Button>
        </Card>

      </div>

    </div>
    )
}
