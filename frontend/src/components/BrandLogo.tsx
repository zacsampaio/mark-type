import Image from "next/image";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  size?: number;
  className?: string;
  priority?: boolean;
};

export function BrandLogo({
  size = 40,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src="/logo.png"
      alt="MarkType"
      width={size}
      height={size}
      className={cn("object-contain", className)}
      priority={priority}
    />
  );
}
