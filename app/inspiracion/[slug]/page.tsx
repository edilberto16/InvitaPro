import { notFound } from 'next/navigation';
import { InspirationExperience } from '@/components/inspiracion/inspiration-experience';
import { getInspiration, inspirationItems } from '@/components/inspiracion/inspiration-data';

export function generateStaticParams() {
  return inspirationItems.map((item) => ({ slug: item.slug }));
}

export default async function InspirationDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getInspiration(slug);
  if (!item) notFound();
  return <InspirationExperience item={item} />;
}
