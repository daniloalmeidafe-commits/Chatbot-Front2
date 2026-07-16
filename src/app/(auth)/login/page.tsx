"use client";

import { BrandMark } from "@/components/BrandMark";
import { useBranding } from "@/hooks/useBranding";
import { useLogin } from "@/hooks/useLogin";
import { useSetupStatus } from "@/hooks/useSetup";
import { DEFAULT_BRAND_NAME, resolveBrandName } from "@/lib/branding";
import { useAuthStore } from "@/store/authStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();
  const token = useAuthStore((state) => state.token);
  const isHydrated = useAuthStore((state) => state.isHydrated);
  const brandingQuery = useBranding({
    enabled: isHydrated && !token,
  });
  const setupStatusQuery = useSetupStatus({
    enabled: isHydrated && !token,
  });
  const [showPassword, setShowPassword] = useState(false);
  const brandName = resolveBrandName(
    brandingQuery.data?.brandName,
    DEFAULT_BRAND_NAME,
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (token) {
      router.replace("/dashboard");
      return;
    }

    if (setupStatusQuery.data?.setupRequired) {
      router.replace("/setup");
    }
  }, [isHydrated, router, setupStatusQuery.data?.setupRequired, token]);

  const onSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        setTimeout(() => router.replace("/dashboard"), 50);
      },
    });
  };

  const isLoading = loginMutation.status === "pending";
  const isError = loginMutation.status === "error";
  const shouldShowLoading =
    !isHydrated ||
    !!token ||
    setupStatusQuery.isPending ||
    setupStatusQuery.data?.setupRequired;

  if (shouldShowLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4 text-white">
        <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-6 py-4 backdrop-blur-sm">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando...</span>
        </div>
      </main>
    );
  }

  if (setupStatusQuery.isError) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center backdrop-blur-sm">
          <h1 className="text-xl font-semibold">Falha ao carregar o login</h1>
          <p className="mt-2 text-sm text-red-100">
            Não foi possível verificar o estado inicial do sistema.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0e1629] to-[#1f2a44] px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md backdrop-blur-sm bg-white/10 dark:bg-gray-800/30 border border-white/10 dark:border-gray-700 rounded-2xl shadow-2xl p-8"
      >
        <div className="mb-6 flex justify-center">
          <BrandMark
            titleClassName="text-2xl"
            size={48}
            overrideLogoUrl={brandingQuery.data?.logoUrl ?? null}
            overrideTitle={brandName}
          />
        </div>
        <h1 className="text-3xl font-bold text-center text-white mb-6 tracking-tight">
          Bem-vindo de volta
        </h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              {...register("email")}
              className="w-full rounded-lg px-4 py-2 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                {...register("password")}
                className="w-full rounded-lg px-4 py-2 pr-10 bg-gray-100/10 border border-gray-600 text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="••••••••"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <AnimatePresence>
            {isError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="text-sm text-red-400 bg-red-400/10 border border-red-500/30 px-3 py-2 rounded-lg"
              >
                E-mail ou senha inválidos.
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-white font-semibold transition-all bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-400 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isLoading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <p
            onClick={() => router.push("/policy")}
            style={{ cursor: "pointer" }}
            className="text-xs text-gray-400 text-center mt-6"
          >
            Política de Privacidade
          </p>
          <p className="text-xs text-gray-400 text-center mt-6">|</p>
          <p
            onClick={() => router.push("/terms")}
            style={{ cursor: "pointer" }}
            className="text-xs text-gray-400 text-center mt-6"
          >
            Termos de Uso
          </p>
        </div>
        <p className="text-xs text-gray-400 text-center mt-6">
          {brandName} © {new Date().getFullYear()} • Todos os direitos
          reservados
        </p>
      </motion.div>
    </main>
  );
}
