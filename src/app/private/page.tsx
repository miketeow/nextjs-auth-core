import { getCurrentUser } from "@/auth/nextjs/current-user";
import ToggleRoleButton from "@/components/toggle-role-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function PrivatePage() {
  const user = await getCurrentUser({ redirectIfNotFound: true });

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl mb-8">Private: {user.role} </h1>
      <div className="flex gap-2">
        <ToggleRoleButton />
        <Button asChild>
          <Link href="/">Home</Link>
        </Button>
      </div>
    </div>
  );
}
