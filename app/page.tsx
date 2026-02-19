import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="fixed inset-x-0 top-[80px] h-[calc(100dvh-80px)] flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl md:text-4xl font-bold">
          US Civics Practice (2025)
        </h1>
        <div className="flex flex-row gap-2">
          <Button variant="outline" asChild>
            <Link href="/practice">Practice</Link>
          </Button>
          <Button asChild>
            <Link href="/quiz">Take a quiz</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
