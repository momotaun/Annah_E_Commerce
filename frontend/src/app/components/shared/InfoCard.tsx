export interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function InfoCard({ icon, title, description }: InfoCardProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
      <span className="text-primary-600">{icon}</span>
      <span className="text-sm font-semibold text-gray-900">{title}</span>
      <span className="text-sm text-gray-500">{description}</span>
    </div>
  );
}

export default InfoCard;