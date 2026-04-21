import { ZentrixaLoginForm } from "@/components/zentrixa-login-form";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ next?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ZentrixaLoginForm next={resolvedSearchParams?.next || "/app"} />;
}
