import { checkAuth } from "@/actions/login";
import Dashboard from "@/components/dashboard";

export default async function Home() {
  const user = await checkAuth();

  return <Dashboard user={user} />;
}
