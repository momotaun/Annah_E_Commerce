import LegalPageEditor from "./LegalPageEditor";

export default async function AdminLegalPageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <LegalPageEditor slug={slug} />;
}
