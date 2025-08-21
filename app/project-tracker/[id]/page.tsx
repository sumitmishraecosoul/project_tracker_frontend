import ProjectDetail from './ProjectDetail';

export async function generateStaticParams() {
  return [
    { id: '1' },
    { id: '2' },
    { id: '3' },
  ];
}

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  console.log('ProjectPage component - received project ID:', id);
  return <ProjectDetail projectId={id} />;
}