import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Page() {
  return (
    <div className="fixed inset-x-0 top-[80px] h-[calc(100dvh-80px)] flex justify-center items-center">
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-xl md:text-4xl font-bold">
          US Civics Practice (2025)
        </h1>
        <Button asChild>
          <Link href="/practice">Practice</Link>
        </Button>
      </div>
    </div>
  );
}
