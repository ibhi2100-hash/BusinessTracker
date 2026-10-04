// FeatureCard.tsx

import type { ReactNode } from "react";

import { GlassCard } from "../ui/GlassCard";
import { GlassIcon } from "../ui/GlassIcon";

interface FeatureCardProps {
    icon: ReactNode;
    title: string;
    description: string;
}

export function FeatureCard({
    icon,
    title,
    description,
}: FeatureCardProps) {
    return (
        <GlassCard
            className="
                group
                p-6
                transition-all
                duration-300
                hover:-translate-y-1
                hover:bg-white/8
            "
        >
            <GlassIcon>
                {icon}
            </GlassIcon>

            <h3 className="mt-4 text-lg font-semibold">
                {title}
            </h3>

            <p className="mt-2 text-sm text-gray-400">
                {description}
            </p>
        </GlassCard>
    );
}