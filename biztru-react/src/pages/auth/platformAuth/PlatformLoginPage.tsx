
import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  ArrowRight,
  ShieldCheck,
  LockKeyhole,
  Eye,
  EyeOff,
  Server,
  Fingerprint,
  AlertCircle,
} from "lucide-react";

import {
  usePlatformSession,
} from "../../../Biztru/services/PlatformSession/PlatformSessionContext";

/* -------------------------------------------------------------------------- */
/* PLATFORM LOGIN PAGE                                                        */
/* -------------------------------------------------------------------------- */

export default function PlatformLoginPage() {
  const navigate = useNavigate();

  const {
    login,
    isAuthenticated,
    status,
  } = usePlatformSession();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* REDIRECT AUTHENTICATED USERS                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (status === "AUTHENTICATED" && isAuthenticated) {
      navigate("/command/dashboard", {
        replace: true,
      });
    }
  }, [status, isAuthenticated, navigate]);

  /* ------------------------------------------------------------------------ */
  /* LOGIN HANDLER                                                            */
  /* ------------------------------------------------------------------------ */


const handleSubmit = async (
  event: FormEvent<HTMLFormElement>
) => {
  event.preventDefault();

  if (submitting || !email.trim() || !password) {
    return;
  }

  setSubmitting(true);
  setServerError(null);

  try {
    const authenticatedSession = await login({
      email: email.trim().toLowerCase(),
      password,
    });

    if (
      !authenticatedSession.user ||
      authenticatedSession.user.status !== "ACTIVE"
    ) {
      throw new Error(
        "Your platform account is inactive or unavailable."
      );
    }

    navigate("/command/dashboard", {
      replace: true,
    });
  } catch (error: unknown) {
    setServerError(
      error instanceof Error
        ? error.message
        : "Unable to sign in. Please try again."
    );
  } finally {
    setSubmitting(false);
  }
};


  /* ------------------------------------------------------------------------ */
  /* RENDER                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">

      {/* BACKGROUND */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="absolute left-1/2 top-[-140px] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-teal-500/15 blur-[130px]" />

        <div className="absolute bottom-[-120px] right-[-80px] h-[360px] w-[360px] rounded-full bg-cyan-500/15 blur-[130px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:50px_50px] opacity-[0.035]" />
      </div>

      {/* CONTENT */}

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">

        <div className="w-full max-w-md space-y-7">

          {/* HEADER */}

          <header className="space-y-4 text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-teal-400/20 bg-teal-400/10 shadow-[0_0_50px_rgba(45,212,191,0.12)]">
              <ShieldCheck className="h-8 w-8 text-teal-400" />
            </div>

            <div className="space-y-2">

              <div className="inline-flex items-center gap-2 rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-teal-300">
                <LockKeyhole className="h-3 w-3" />
                Restricted Platform Access
              </div>

              <h1 className="text-3xl font-semibold tracking-tight">
                Command Centre
              </h1>

              <p className="text-sm text-gray-400">
                Sign in to manage the BizTru platform.
              </p>

            </div>

          </header>

          {/* SECURITY FEATURE CHIPS */}

          <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-gray-400">

            <FeatureChip
              icon={<Fingerprint className="h-5 w-5" />}
              label="Identity"
            />

            <FeatureChip
              icon={<Server className="h-5 w-5" />}
              label="Platform"
            />

            <FeatureChip
              icon={<ShieldCheck className="h-5 w-5" />}
              label="Protected"
            />

          </div>

          {/* LOGIN CARD */}

          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-7">

            <div className="mb-6 space-y-1">
              <h2 className="text-lg font-semibold">
                Platform sign in
              </h2>

              <p className="text-xs text-gray-500">
                Use your authorized platform account.
              </p>
            </div>

            {/* SERVER ERROR */}

            {serverError && (
              <div
                role="alert"
                aria-live="polite"
                className="mb-5 flex gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs leading-5 text-red-300"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                <span>{serverError}</span>
              </div>
            )}

            {/* LOGIN FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* EMAIL */}

              <div className="space-y-2">

                <label
                  htmlFor="platform-email"
                  className="text-xs font-medium text-gray-300"
                >
                  Email address
                </label>

                <input
                  id="platform-email"
                  type="email"
                  autoComplete="username"
                  inputMode="email"
                  required
                  disabled={submitting}
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setServerError(null);
                  }}
                  placeholder="you@biztru.com"
                  className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                />

              </div>

              {/* PASSWORD */}

              <div className="space-y-2">

                <label
                  htmlFor="platform-password"
                  className="text-xs font-medium text-gray-300"
                >
                  Password
                </label>

                <div className="relative">

                  <input
                    id="platform-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={submitting}
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setServerError(null);
                    }}
                    placeholder="Enter your password"
                    className="min-h-12 w-full rounded-2xl border border-white/10 bg-white/5 py-3 pl-4 pr-12 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-teal-400/60 focus:ring-2 focus:ring-teal-400/10 disabled:cursor-not-allowed disabled:opacity-60"
                  />

                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() =>
                      setShowPassword((current) => !current)
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    aria-pressed={showPassword}
                    className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-gray-400 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-teal-400/40 disabled:opacity-50"
                  >
                    {showPassword ? (
                      <EyeOff className="h-[18px] w-[18px]" />
                    ) : (
                      <Eye className="h-[18px] w-[18px]" />
                    )}
                  </button>

                </div>

              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={
                  submitting ||
                  !email.trim() ||
                  !password
                }
                className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 px-4 py-3 text-sm font-semibold text-black shadow-[0_15px_45px_rgba(20,184,166,0.2)] transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-teal-400/50 focus:ring-offset-2 focus:ring-offset-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign in to Command Centre
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

            </form>

            {/* CARD FOOTER */}

            <div className="mt-6 border-t border-white/10 pt-5 text-center">
              <p className="text-[11px] leading-5 text-gray-500">
                Access is restricted to authorized BizTru
                platform personnel.
              </p>
            </div>

          </section>

          {/* FOOTER */}

          <footer className="space-y-2 text-center">

            <p className="text-[10px] text-gray-600">
              BizTru Platform Administration
            </p>

            <Link
              to="/login"
              className="text-[10px] text-gray-500 transition hover:text-teal-400"
            >
              Return to business login
            </Link>

          </footer>

        </div>

      </div>

    </main>
  );
}

/* -------------------------------------------------------------------------- */
/* FEATURE CHIP                                                               */
/* -------------------------------------------------------------------------- */

interface FeatureChipProps {
  icon: ReactNode;
  label: string;
}

function FeatureChip({
  icon,
  label,
}: FeatureChipProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-3">

      <div className="mb-1 flex justify-center text-teal-400">
        {icon}
      </div>

      <span>{label}</span>

    </div>
  );
}