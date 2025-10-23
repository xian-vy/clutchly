"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiMail,
  FiLock,
  FiAlertCircle,
  FiCheckCircle,
  FiKey,
} from "react-icons/fi";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "./AuthLayout";
import { signup, SignupState } from "@/app/auth/signup/actions";
import { TopLoader } from "@/components/ui/TopLoader";
import { Input } from "../ui/input";
import { APP_NAME } from "@/lib/constants/app";
import { useActionState } from "react";
import { useState } from "react";

const initialState: SignupState = {
  errors: {},
  message: "",
};

function SubmitButton({ isPending }: { isPending: boolean }) {
  return (
    <motion.button
      type="submit"
      className="relative w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group cursor-pointer"
      disabled={isPending}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <span className="relative z-10">
        {isPending ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin ml-1 mr-3 h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Creating account...
          </span>
        ) : (
          "Create Account"
        )}
      </span>
      <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
    </motion.button>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signup, initialState);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Handle successful signup
  if (state?.message && !state.errors) {
    // Redirect to verify email page after a short delay
    setTimeout(() => {
      router.push("/auth/verify-email");
    }, 2000);
  }

  const handleSubmit = (e: React.FormEvent) => {
    // Simple client-side password confirmation check
    if (password !== confirmPassword) {
      e.preventDefault();
      setPasswordError("Passwords don't match");
      return;
    }
    setPasswordError("");
  };

  return (
    <AuthLayout mode="signup">
      {isPending && <TopLoader />}
      <div className="w-full max-w-md space-y-3 sm:space-y-5 md:space-y-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#333] dark:text-foreground">
            Create Account
          </h2>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
            Join {APP_NAME} today and start managing your collection.
          </p>
        </div>

        <form
          action={formAction}
          onSubmit={handleSubmit}
          className="space-y-4 sm:space-y-5 3xl:!space-y-6"
        >
          <div>
            <label className="text-sm font-medium text-foreground/80">
              Email Address
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-2">
              <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full px-10 py-6 transition-all duration-500"
                required
              />
            </div>
            {state?.errors && "email" in state.errors && state.errors.email && (
              <p className="mt-2 text-sm text-destructive">
                {state.errors.email[0]}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80">
              Password
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-2">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="••••••••"
                className="w-full px-10 pr-12 py-6 transition-all duration-500"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-color cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {state?.errors &&
              "password" in state.errors &&
              state.errors.password && (
                <p className="mt-2 text-sm text-destructive">
                  {state.errors.password[0]}
                </p>
              )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80">
              Confirm Password
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-2">
              <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="••••••••"
                className="w-full px-10 pr-12 py-6 transition-all duration-500"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-color cursor-pointer"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p className="mt-2 text-sm text-destructive">{passwordError}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-foreground/80">
              Invite Code
              <span className="ml-1 text-primary">*</span>
            </label>
            <div className="relative mt-2">
              <FiKey className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                name="inviteCode"
                placeholder="XXXXXXXX"
                className="w-full px-10 py-6 transition-all duration-500 uppercase"
                maxLength={16}
                required
                onChange={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                }}
              />
            </div>
            {state?.errors &&
              "inviteCode" in state.errors &&
              state.errors.inviteCode && (
                <p className="mt-2 text-sm text-destructive">
                  {state.errors.inviteCode[0]}
                </p>
              )}
          </div>

          {state?.message && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 flex items-start gap-3"
            >
              <FiCheckCircle className="text-green-500 shrink-0 mt-0.5" />
              <p className="text-sm text-green-500">{state.message}</p>
            </motion.div>
          )}

          {state?.errors && "_form" in state.errors && state.errors._form && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3"
            >
              <FiAlertCircle className="text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">
                {state.errors._form[0]}
              </p>
            </motion.div>
          )}

          <SubmitButton isPending={isPending} />

          <div className="text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?
            </span>{" "}
            <Link
              href="/auth/signin"
              className="font-medium text-primary hover:text-primary/90 transition-colors"
            >
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </AuthLayout>
  );
}
