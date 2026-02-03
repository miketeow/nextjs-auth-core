import { getCurrentUser } from "@/auth/nextjs/currentUser";
import LogOutButton from "@/auth/nextjs/log-out-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  return (
    <div className="container mx-auto p-4">
      {user == null ? (
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/sign-up">Sign Up</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-in">Sign In</Link>
          </Button>
        </div>
      ) : (
        <Card className="max-w-125 mt-4">
          <CardHeader>
            <CardTitle>User: {user.id}</CardTitle>
            <CardDescription>Role: {user.role}</CardDescription>
          </CardHeader>
          <CardFooter className="flex gap-4">
            <Button asChild variant="outline">
              <Link href="/private">Private Page</Link>
            </Button>

            {user.role == "admin" && (
              <Button asChild variant="outline">
                <Link href="/admin">Admin Page</Link>
              </Button>
            )}
            <LogOutButton />
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
