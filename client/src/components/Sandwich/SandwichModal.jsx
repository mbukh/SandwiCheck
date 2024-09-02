import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { useIngredientsGlobalContext } from '../../context/IngredientsGlobalContext';

import useSandwich from '../../hooks/use-sandwich';

import SandwichCard from '../Sandwich/Card/SandwichCard';
import Modal from '../Modal/Modal';

const SandwichModal = ({ closeLink = '' }) => {
  const [isModalLoading, setIsModalLoading] = useState(true);
  const { areIngredientsReady } = useIngredientsGlobalContext();
  const { sandwich, getSandwich } = useSandwich();
  const { sandwichId } = useParams();

  useEffect(() => {
    (async () => {
      await getSandwich(sandwichId);

      areIngredientsReady && setIsModalLoading(false);
    })();
  }, [areIngredientsReady, getSandwich, sandwichId]);

  return (
    <Modal isModalLoading={isModalLoading} closeLink={closeLink}>
      <div className="max-w-xs sm:max-w-sm md:max-w-screen-md mx-auto text-white">
        <SandwichCard index={Math.ceil(Math.random() * 4)} sandwich={sandwich} closeBasePath="" isModal={true} />
      </div>
    </Modal>
  );
};

export default SandwichModal;
