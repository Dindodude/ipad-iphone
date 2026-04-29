import { ZentrixaLoginForm } from "@/components/zentrixa-login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <ZentrixaLoginForm
      next={resolvedSearchParams?.next || "/admin-portal"}
      title="Sign in to the Zentrixa Admin Portal."
      description="Access LeadOS or the Client Portal Builder from one private admin hub."
    />
  );
}
