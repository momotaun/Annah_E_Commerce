import Image from "next/image";

export interface TeamMemberCardProps {
  name: string;
  role: string;
  image: string;
}

function TeamMemberCard({ name, role, image }: TeamMemberCardProps) {
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-md bg-gray-100">
        <Image src={image} alt={name} fill className="object-cover" />
      </div>
      <p className="mt-3 text-base font-semibold text-gray-900">{name}</p>
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {role}
      </p>
    </div>
  );
}

export default TeamMemberCard;