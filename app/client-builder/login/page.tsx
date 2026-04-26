import { ZentrixaLoginForm } from "@/components/zentrixa-login-form";

export default function ClientBuilderLoginPage() {
  return (
    <ZentrixaLoginForm
      next="/client-builder"
      title="Secure access to Zentrixa Client Builder."
      description="Build onboarding packages, plans, and client portal previews from one private workspace."
    />
  );
}
