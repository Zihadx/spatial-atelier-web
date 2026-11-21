import { cn } from "@/lib/utils";

export default function Container({ children, className, as: Tag = "div" }: { children: React.ReactNode; className?: string; as?: React.ElementType }) {
  return <Tag className={cn("container-x", className)}>{children}</Tag>;
}
