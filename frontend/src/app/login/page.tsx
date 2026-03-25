import { Suspense } from "react";
import { LoginClient } from "./login-client";

function LoginFallback() {
  return (
    <div className="doccraft-app flex min-h-dvh items-center justify-center bg-parchment bg-paper-texture">
      <p className="text-sm text-ink-500">Carregando…</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <LoginClient />
    </Suspense>
  );
}
