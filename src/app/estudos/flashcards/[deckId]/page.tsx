import type { Metadata } from 'next';
import { FlashcardsLayout } from '../components/FlashcardsLayout';
import { CreateFlashcardButton } from '../components/CreateFlashcardButton';
import { getDeckAction } from '../actions';

type Props = {
  params: {
    deckId: string;
  };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const response = await getDeckAction(params.deckId);
  const deck = response.data;

  return {
    title: deck ? `${deck.title} | Genoma` : 'Deck | Genoma',
    description: deck?.description || 'Deck de flashcards no Genoma',
  };
}

export default async function DeckPage({ params }: Props) {
  const response = await getDeckAction(params.deckId);
  const deck = response.data;

  if (!deck) {
    return (
      <FlashcardsLayout
        title="Deck não encontrado"
        backUrl="/estudos/flashcards"
      >
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500">
            O deck que você está procurando não existe ou você não tem permissão para acessá-lo.
          </p>
        </div>
      </FlashcardsLayout>
    );
  }

  return (
    <FlashcardsLayout
      title={deck.title}
      subtitle={deck.description || undefined}
      backUrl="/estudos/flashcards"
    >
      <div className="space-y-8">
        <div className="flex justify-end">
          <CreateFlashcardButton deckId={deck.id} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cards do deck serão renderizados aqui */}
        </div>
      </div>
    </FlashcardsLayout>
  );
} 