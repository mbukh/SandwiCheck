import { useEffect, useState } from 'react';
import { useParams, useSearch } from '@tanstack/react-router';
import Modal from '@/components/Modal/Modal';
import SandwichCard from '@/components/Sandwich/Card/SandwichCard';
import { useIngredientsGlobalContext } from '@/context/IngredientsGlobalContext';
import { fetchSandwichById } from '@/services/api-sandwiches';
import type { Sandwich } from '@/types/domain';
import { logResponse } from '@/utils/log';

interface SandwichModalProps {
  closeLink?: string;
}

interface LoadResult {
  /** `${sandwichId}:${reloadKey}` the result belongs to; lets us ignore results from a previous request. */
  key: string;
  sandwich: Sandwich | null;
  error: { status?: number } | null;
}

const SandwichModal = ({ closeLink = '' }: SandwichModalProps): React.JSX.Element | null => {
  // Decorative card background, chosen once per mount so it stays stable across re-renders (keeps render pure).
  const [cardBackgroundIndex] = useState(() => Math.ceil(Math.random() * 4));
  const { areIngredientsReady } = useIngredientsGlobalContext();
  /*
   * Fetch the shared sandwich locally — never the builder draft. `useSandwich` seeds its reducer
   * from the localStorage builder draft, so reading it here showed a stranger the visitor's own
   * unsaved sandwich until (and unless) the fetch happened to overwrite it.
   */
  const [result, setResult] = useState<LoadResult | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  // Get sandwichId from route params (for /sandwich/$sandwichId route) or query params (for gallery routes)
  const params = useParams({ strict: false });
  const search = useSearch({ strict: false });
  const sandwichId = params?.sandwichId || search?.sandwichId;

  useEffect(() => {
    if (!sandwichId) return;

    const key = `${sandwichId}:${reloadKey}`;
    let active = true;

    void (async () => {
      const res = await fetchSandwichById(sandwichId);
      logResponse('🥪 Read sandwich', res);
      // Ignore a stale response if the id/reloadKey changed or the modal unmounted mid-flight.
      if (!active) return;

      setResult({
        key,
        sandwich: res.success && res.data ? res.data : null,
        error: res.success && res.data ? null : { status: res.error?.status },
      });
    })();

    return () => {
      active = false;
    };
  }, [sandwichId, reloadKey]);

  if (!sandwichId) {
    return null;
  }

  // Only trust a result fetched for the current request; otherwise we're still loading.
  const requestKey = `${sandwichId}:${reloadKey}`;
  const activeResult = result?.key === requestKey ? result : null;
  const sandwich = activeResult?.sandwich ?? null;
  const loadError = activeResult?.error ?? null;

  /*
   * Derive loading instead of tracking it in state: show the loader until the sandwich has
   * loaded AND ingredients are ready to hydrate the card. A load error must short-circuit the
   * loader — otherwise a failed fetch would spin forever while ingredients load, then try to
   * render the card with a null sandwich.
   */
  const isModalLoading = !loadError && (!sandwich || !areIngredientsReady);

  return (
    <Modal modalId="sandwich" isModalLoading={isModalLoading} closeLink={closeLink}>
      <div className="mx-auto max-w-xs text-white sm:max-w-sm md:max-w-screen-md">
        {loadError ? (
          <div className="flex flex-col items-center py-8 text-center">
            <h2 className="text-yellow mb-3 text-xl font-bold uppercase md:text-2xl">
              {loadError.status === 404 ? 'Sandwich not found' : 'Something went wrong'}
            </h2>
            <p className="mb-6 max-w-md text-base leading-relaxed font-normal text-white">
              {loadError.status === 404
                ? "This sandwich doesn't exist or was removed."
                : 'We could not load this sandwich. Please try again.'}
            </p>
            {loadError.status !== 404 && (
              <button
                type="button"
                onClick={() => setReloadKey((key) => key + 1)}
                className="box-shadow-10 inline-flex h-8 appearance-none items-center justify-center rounded-lg bg-magenta px-5 py-2 text-sm font-bold text-white uppercase transition-opacity hover:opacity-90 focus:outline-none md:h-12 md:px-6 md:py-3 md:text-base"
              >
                Try again
              </button>
            )}
          </div>
        ) : sandwich ? (
          <SandwichCard index={cardBackgroundIndex} sandwich={sandwich} galleryPath="" isModal={true} />
        ) : null}
      </div>
    </Modal>
  );
};

export default SandwichModal;
