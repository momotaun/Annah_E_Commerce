import Link from "next/link";
import Badge from "@/src/app/components/ui/Badge";

export interface ActivityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  comingSoon?: boolean;
  href?: string;
}

function ActivityCard({ icon, title, description, comingSoon, href }: ActivityCardProps) {
  const content = (
    <>
      <div className="flex items-start justify-between">
        <span className="text-gray-400">{icon}</span>
        {comingSoon && <Badge variant="default">Coming Soon</Badge>}
      </div>
      <div>
        <p className="text-base font-semibold text-gray-900">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      </div>
    </>
  );

  if (href && !comingSoon) {
    return (
      <Link
        href={href}
        className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-5 transition-colors hover:border-primary-600"
      >
        {content}
      </Link>
    );
  }

  return <div className="flex flex-col gap-3 rounded-md border border-gray-200 bg-white p-5">{content}</div>;
}

export default ActivityCard;