import { cn } from "@/src/lib/utils";

export interface SocialIconProps {
  icon: React.ReactNode;
  href?: string;
  label?: string;
  className?: string;
}

function SocialIcon({ icon, href = "#", label, className }: SocialIconProps) {
  return (
    <a
      href={href}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-primary-50 hover:text-primary-600",
        className
      )}
    >
      {icon}
    </a>
  );
}

export default SocialIcon;