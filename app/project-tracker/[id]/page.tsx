import ModernProjectDetailNew from './modern/ModernProjectDetailNew';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('Server  ModernProjectPage component - received project ID:', id);
  return <ModernProjectDetailNew projectId={id} />;
}