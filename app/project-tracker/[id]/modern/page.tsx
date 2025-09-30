import ModernProjectDetail from './ModernProjectDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function ModernProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('ModernProjectPage component - received project ID:', id);
  return <ModernProjectDetail projectId={id} />;
}
