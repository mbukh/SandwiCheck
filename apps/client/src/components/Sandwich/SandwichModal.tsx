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
    void getSandwich(sandwichId);
  }, [getSandwich, sandwichId]);

  if (!sandwichId) {
    return null;
  }

  /*
   * Derive loading instead of tracking it in state: show the loader until the sandwich has
   * loaded AND ingredients are ready to hydrate the card. The previous effect only cleared a
   * loading flag when ingredients happened to be ready as the fetch resolved, so a late
   * ingredients load left it stuck until a redundant re-fetch.
   */
  const isModalLoading = !sandwich || !areIngredientsReady;

  return (
    <Modal modalId="sandwich" isModalLoading={isModalLoading} closeLink={closeLink}>
      <div className="mx-auto max-w-xs text-white sm:max-w-sm md:max-w-screen-md">
        <SandwichCard index={cardBackgroundIndex} sandwich={sandwich as Sandwich} galleryPath="" isModal={true} />
      </div>
    </Modal>
  );
};

export default SandwichModal;
