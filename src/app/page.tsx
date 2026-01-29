import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex gap-4">
        <Button>Sign In</Button>
        <Button>Sign Up</Button>
      </div>
    </div>
  );
}
