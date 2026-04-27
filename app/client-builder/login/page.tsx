import { ZentrixaLoginForm } from "@/components/zentrixa-login-form";

export default async function ClientBuilderLoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <ZentrixaLoginForm
      next={resolvedSearchParams?.next || "/client-builder"}
      title="Secure access to Zentrixa Client Builder."
      description="Build onboarding packages, plans, and client portal previews from one private workspace."
    />
  );
}
