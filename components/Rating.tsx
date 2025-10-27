import { Star } from "lucide-react";

export function Rating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1 text-yellow-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className={"h-4 w-4 " + (i < value ? "fill-yellow-500" : "opacity-30")} />
      ))}
    </div>
  );
}


