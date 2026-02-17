import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div>
      <h1>Practice</h1>
      <Button asChild>
        <Link href="/practice">Start New Test</Link>
      </Button>
    </div>
  );
}
