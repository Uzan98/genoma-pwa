import { Suspense } from 'react';
import SimuladoContent from './simulado-content';

interface PageProps {
  params: {
    id: string;
  };
}

export default async function SimuladoPage({ params }: PageProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    }>
      <SimuladoContent id={params.id} />
    </Suspense>
  );
} 