import { useEffect, useState } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import { useIngredientsGlobalContext } from '../../context/IngredientsGlobalContext';
import useSandwich from '../../hooks/use-sandwich';
import Modal from '../Modal/Modal';
import SandwichCard from '../Sandwich/Card/SandwichCard';

const SandwichModal = ({ closeLink = '' }) => {
  const [isModalLoading, setIsModalLoading] = useState(true);
  const { areIngredientsReady } = useIngredientsGlobalContext();
  const { sandwich, getSandwich } = useSandwich();
  // Get sandwichId from route params (for /sandwich/$sandwichId route) or query params (for gallery routes)
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const sandwichId = params?.sandwichId || search?.sandwichId;

  useEffect(() => {
    if (!sandwichId) return;

    (async () => {
      await getSandwich(sandwichId);

      areIngredientsReady && setIsModalLoading(false);
    })();
  }, [areIngredientsReady, getSandwich, sandwichId]);

  if (!sandwichId) {
    return null;
  }

  return (
    <Modal modalId="sandwich" isModalLoading={isModalLoading} closeLink={closeLink}>
      <div className="mx-auto max-w-xs text-white sm:max-w-sm md:max-w-screen-md">
        <SandwichCard index={Math.ceil(Math.random() * 4)} sandwich={sandwich} galleryPath="" isModal={true} />
      </div>
    </Modal>
  );
};

export default SandwichModal;
