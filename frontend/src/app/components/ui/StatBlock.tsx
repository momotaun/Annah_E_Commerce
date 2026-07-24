export interface StatBlockProps {
  value: string;
  label: string;
}

function StatBlock({ value, label }: StatBlockProps) {
  return (
    <div>
      <span className="block text-4xl font-extrabold text-primary-600">
        {value}
      </span>
      <span className="text-sm text-gray-500">{label}</span>
    </div>
  );
}

export default StatBlock;