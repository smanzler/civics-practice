import { Badge } from "@/components/ui/badge";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Label } from "@/components/ui/label";
import civics from "@/lib/civics";
import Link from "next/link";

const formatSectionHeader = (text: string) => {
  return text
    .split(" ")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

export default function Page() {
  const grouped = Object.groupBy(civics, (c) => c.section);

  return (
    <div className="mx-auto space-y-8 max-w-sm">
      {Object.entries(grouped).map(([section, questions]) => (
        <div key={section} className="space-y-2">
          <Label>{formatSectionHeader(section)}</Label>
          <div className="flex flex-wrap gap-1">
            {questions?.map((q) => (
              <HoverCard key={q.id}>
                <HoverCardTrigger asChild>
                  <Link href={`/questions/${q.id}`}>
                    <Badge>{q.id}</Badge>
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="space-y-1">
                  <h3 className="font-medium">Question {q.id}</h3>
                  <p className="text-muted-foreground">{q.question}</p>
                </HoverCardContent>
              </HoverCard>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
