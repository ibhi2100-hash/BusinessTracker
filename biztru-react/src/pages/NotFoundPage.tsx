import { useEffect } from "react";
import {
    ArrowLeft,
    ArrowRight,
    Compass,
    Home,
    MapPinOff,
    RefreshCw,
    Route,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import { GlassButton } from "../components/ui/GlassButton";
import { GlassCard } from "../components/ui/GlassCard";
import { GlassIcon } from "../components/ui/GlassIcon";

export default function NotFoundPage() {
    const navigate = useNavigate();
    const location = useLocation();

    /*
     * Keep the browser title useful when this page is reached
     * directly or through a stale/invalid remembered route.
     */
    useEffect(() => {
        const previousTitle = document.title;

        document.title = "Page not found — BizTru";

        return () => {
            document.title = previousTitle;
        };
    }, []);

    const handleGoBack = () => {
        /*
         * history.length can be greater than 1 even when the
         * previous page belongs to another origin/session.
         *
         * Using navigate(-1) is still the correct browser
         * navigation behavior for a 404 reached inside the SPA.
         */
        if (window.history.length > 1) {
            navigate(-1);
            return;
        }

        navigate("/app", { replace: true });
    };

    const handleHome = () => {
        navigate("/app", { replace: true });
    };

    const handleReload = () => {
        window.location.reload();
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6">
            {/* =====================================================
             * Ambient background
             * ===================================================== */}

            <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 overflow-hidden"
            >
                <div className="absolute left-[8%] top-[12%] h-40 w-40 rounded-full bg-primary/10 blur-3xl animate-[float_7s_ease-in-out_infinite]" />

                <div className="absolute bottom-[10%] right-[8%] h-56 w-56 rounded-full bg-primary/5 blur-3xl animate-[float_9s_ease-in-out_infinite_reverse]" />

                <div className="absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.025] blur-3xl" />

                {/* subtle grid */}
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* =====================================================
             * Main card
             * ===================================================== */}

            <GlassCard
                variant="elevated"
                className="relative z-10 w-full max-w-2xl overflow-hidden border-white/10"
            >
                {/* top accent */}
                <div
                    aria-hidden="true"
                    className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
                />

                <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-14">
                    {/* =================================================
                     * Animated route illustration
                     * ================================================= */}

                    <div className="relative mb-8 h-36 w-64">
                        {/* connection path */}
                        <div
                            aria-hidden="true"
                            className="absolute left-1/2 top-1/2 h-px w-40 -translate-x-1/2 -translate-y-1/2 overflow-hidden"
                        >
                            <div className="h-full w-full border-t border-dashed border-primary/30" />

                            <div className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_12px_rgba(15,118,110,0.7)] animate-[route-dot_2.4s_linear_infinite]" />
                        </div>

                        {/* left node */}
                        <div className="absolute left-2 top-1/2 -translate-y-1/2">
                            <div className="rounded-2xl border border-white/10 bg-background/60 p-3 shadow-lg backdrop-blur-xl">
                                <GlassIcon
                                    size="lg"
                                    variant="primary"
                                > <Route  className="w-4 h-4" /></GlassIcon>
                            </div>
                        </div>

                        {/* broken middle */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-primary/20 bg-background/80 shadow-xl backdrop-blur-xl">
                                <div className="absolute inset-0 rounded-full border border-primary/10 animate-[pulse-ring_2.2s_ease-out_infinite]" />

                                <MapPinOff
                                    className="h-9 w-9 text-primary animate-[soft-bounce_3s_ease-in-out_infinite]"
                                    strokeWidth={1.6}
                                />
                            </div>
                        </div>

                        {/* right node */}
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="rounded-2xl border border-white/10 bg-background/60 p-3 shadow-lg backdrop-blur-xl">
                                <GlassIcon
                                    size="lg"
                                    variant="primary"
                                >
                                   <Compass className="w-4 h-4" />   
                                </GlassIcon>
                            </div>
                        </div>
                    </div>

                    {/* =================================================
                     * Status
                     * ================================================= */}

                    <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/60" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                        </span>

                        Navigation unavailable
                    </div>

                    {/* =================================================
                     * 404
                     * ================================================= */}

                    <div className="relative">
                        <h1 className="select-none text-7xl font-black tracking-[-0.08em] text-foreground/10 sm:text-8xl">
                            404
                        </h1>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                                Page not found
                            </span>
                        </div>
                    </div>

                    <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
                        The BizTru page you're looking for doesn't
                        exist, may have moved, or the address is no
                        longer valid.
                    </p>

                    {/* =================================================
                     * Current path
                     * ================================================= */}

                    <div className="mt-6 flex max-w-full items-center gap-2 rounded-xl border border-white/10 bg-muted/30 px-3 py-2 text-left">
                        <Route
                            className="h-4 w-4 shrink-0 text-muted-foreground"
                            strokeWidth={1.7}
                        />

                        <span className="truncate font-mono text-xs text-muted-foreground">
                            {location.pathname}
                            {location.search}
                        </span>
                    </div>

                    {/* =================================================
                     * Actions
                     * ================================================= */}

                    <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                        <GlassButton
                            variant="primary"
                            onClick={handleHome}
                        >
                            <Home className="mr-2 h-4 w-4" />
                            Go to workspace
                        </GlassButton>

                        <GlassButton
                            variant="secondary"
                            onClick={handleGoBack}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Go back
                        </GlassButton>

                        <GlassButton
                            variant="tertiary"
                            onClick={handleReload}
                            icon
                            aria-label="Reload page"
                            title="Reload page"
                        >
                            <RefreshCw className="h-4 w-4" />
                        </GlassButton>
                    </div>

                    {/* =================================================
                     * Footer hint
                     * ================================================= */}

                    <div className="mt-8 flex items-center gap-2 text-xs text-muted-foreground/70">
                        <ArrowRight className="h-3.5 w-3.5" />

                        <span>
                            If you followed an old bookmark, return to
                            your workspace and continue from there.
                        </span>
                    </div>
                </div>
            </GlassCard>

            {/* =====================================================
             * Animation definitions
             *
             * Kept local so the 404 page does not require another
             * animation library.
             * ===================================================== */}

            <style>
                {`
                    @keyframes float {
                        0%, 100% {
                            transform: translate3d(0, 0, 0);
                        }

                        50% {
                            transform: translate3d(0, -14px, 0);
                        }
                    }

                    @keyframes route-dot {
                        0% {
                            transform: translate3d(0, -50%, 0);
                            opacity: 0;
                        }

                        12% {
                            opacity: 1;
                        }

                        50% {
                            opacity: 1;
                        }

                        88% {
                            opacity: 1;
                        }

                        100% {
                            transform: translate3d(160px, -50%, 0);
                            opacity: 0;
                        }
                    }

                    @keyframes pulse-ring {
                        0% {
                            transform: scale(0.8);
                            opacity: 0.8;
                        }

                        70% {
                            transform: scale(1.35);
                            opacity: 0;
                        }

                        100% {
                            transform: scale(1.35);
                            opacity: 0;
                        }
                    }

                    @keyframes soft-bounce {
                        0%, 100% {
                            transform: translateY(0);
                        }

                        50% {
                            transform: translateY(-4px);
                        }
                    }

                    @media (prefers-reduced-motion: reduce) {
                        *,
                        *::before,
                        *::after {
                            animation-duration: 0.01ms !important;
                            animation-iteration-count: 1 !important;
                            scroll-behavior: auto !important;
                        }
                    }
                `}
            </style>
        </main>
    );
}