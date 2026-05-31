import { useEffect, useState } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import Modal from '@/components/Modal/Modal';
import SandwichCard from '@/components/Sandwich/Card/SandwichCard';
import { useIngredientsGlobalContext } from '@/context/IngredientsGlobalContext';
import useSandwich from '@/hooks/use-sandwich';
import type { Sandwich } from '@/types/domain';

interface SandwichModalProps {
  closeLink?: string;
}

const SandwichModal = ({ closeLink = '' }: SandwichModalProps): React.JSX.Element | null => {
  const [isModalLoading, setIsModalLoading] = useState(true);
  // Decorative card background, chosen once per mount so it stays stable across re-renders (keeps render pure).
  const [cardBackgroundIndex] = useState(() => Math.ceil(Math.random() * 4));
  const { areIngredientsReady } = useIngredientsGlobalContext();
  const { sandwich, getSandwich } = useSandwich();
  // Get sandwichId from route params (for /sandwich/$sandwichId route) or query params (for gallery routes)
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const sandwichId = params?.sandwichId || search?.sandwichId;

  useEffect(() => {
    if (!sandwichId) return;

    void (async () => {
      await getSandwich(sandwichId);

      if (areIngredientsReady) setIsModalLoading(false);
    })();
  }, [areIngredientsReady, getSandwich, sandwichId]);

  if (!sandwichId) {
    return null;
  }

  return (
    <Modal modalId="sandwich" isModalLoading={isModalLoading} closeLink={closeLink}>
      <div className="mx-auto max-w-xs text-white sm:max-w-sm md:max-w-screen-md">
        <SandwichCard index={cardBackgroundIndex} sandwich={sandwich as Sandwich} galleryPath="" isModal={true} />
      </div>
    </Modal>
  );
};

export default SandwichModal;
