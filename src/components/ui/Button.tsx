import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import MagneticButton from "./MagneticButton";

interface Props {
  href: string;
  children: React.ReactNode;
  variant?: "solid" | "line" | "dark" | "line-dark";
  arrow?: boolean;
  className?: string;
  magnetic?: boolean;
}

const variants = {
  solid: "btn btn-solid",
  line: "btn btn-line",
  dark: "btn btn-dark",
  "line-dark": "btn btn-line btn-line-dark",
};

export default function Button({ href, children, variant = "solid", arrow = true, className, magnetic = true }: Props) {
  const link = (
    <Link href={href} className={cn(variants[variant], className)}>
      <span>{children}</span>
      {arrow && <ArrowRight size={16} aria-hidden />}
    </Link>
  );
  return magnetic ? <MagneticButton>{link}</MagneticButton> : link;
}
