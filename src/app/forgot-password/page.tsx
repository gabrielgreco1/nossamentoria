import { AuthCard } from "@/components/marketing/auth-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ResetForm } from "./reset-form";

export default function ForgotPasswordPage() {
  return <AuthCard eyebrow="Recuperação" title="Redefinir senha" description="Enviaremos um link seguro para o e-mail da sua conta.">
    <ResetForm />
    <GlassButton href="/login" variant="secondary">Voltar ao login</GlassButton>
  </AuthCard>;
}
