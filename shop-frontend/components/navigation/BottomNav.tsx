import { Home, ShoppingCart, Package, BarChart2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

export default function BottomNav(){
    const navItems = [
    { label: "Home", icon: Home, href: "/dashboard" },
    { label: "Sales", icon: ShoppingCart, href: "/sales" },
    { label: "Inventory", icon: Package, href: "/inventory" },
    { label: "Reports", icon: BarChart2, href: "/reports" },
    { label: "More", icon: MoreHorizontal, href: "/more" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner border-t flex justify-around py-2">
      {navItems.map((item, i) => {
        const Icon = item.icon;
        return (
          <Link
            key={i}
            href={item.href}
            className="flex flex-col items-center text-xs"
          >
            <Icon className="w-5 h-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}