import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex justify-center items-center">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <strong>404</strong>
          </EmptyMedia>
          <EmptyTitle>Not Found</EmptyTitle>
          <EmptyDescription>Could not find requested resource</EmptyDescription>
        </EmptyHeader>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </Empty>
    </div>
  );
}
