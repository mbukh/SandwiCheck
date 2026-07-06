import { render, screen } from '@testing-library/react';
import SandwichModal from '@/components/Sandwich/SandwichModal';
import { fetchSandwichById } from '@/services/api-sandwiches';
import type { ApiResult } from '@/types/api';
import type { Sandwich } from '@/types/domain';

const useParamsMock = vi.fn();
const useSearchMock = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useParams: () => useParamsMock(),
  useSearch: () => useSearchMock(),
}));

vi.mock('@/context/IngredientsGlobalContext', () => ({
  useIngredientsGlobalContext: () => ({ areIngredientsReady: true }),
}));

vi.mock('@/services/api-sandwiches', () => ({
  fetchSandwichById: vi.fn(),
}));

// Isolate the modal: a passthrough Modal renders its children only once it is no longer loading.
vi.mock('@/components/Modal/Modal', () => ({
  default: ({ children, isModalLoading }: { children: React.ReactNode; isModalLoading?: boolean }) =>
    isModalLoading ? <div>loading</div> : <div>{children}</div>,
}));

// Stub the card so the test can assert on exactly the sandwich name it was handed.
vi.mock('@/components/Sandwich/Card/SandwichCard', () => ({
  default: ({ sandwich }: { sandwich: Sandwich }) => <div>card:{sandwich.name}</div>,
}));

const fetchSandwichByIdMock = vi.mocked(fetchSandwichById);

const fetched = (name: string): ApiResult<Sandwich> => ({ success: true, data: { name } as unknown as Sandwich });
const failed = (status: number): ApiResult<Sandwich> => ({ success: false, error: { status, message: 'err' } });

describe('SandwichModal', () => {
  beforeEach(() => {
    useParamsMock.mockReturnValue({ sandwichId: 'shared-1' });
    useSearchMock.mockReturnValue({});
    fetchSandwichByIdMock.mockReset();
    // A leftover builder draft in cache must never leak into the shared view.
    localStorage.setItem('sandwich', JSON.stringify({ name: 'DRAFT SANDWICH', ingredients: [] }));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('renders the fetched shared sandwich, not the cached builder draft', async () => {
    fetchSandwichByIdMock.mockResolvedValue(fetched('Shared BLT'));

    render(<SandwichModal />);

    expect(await screen.findByText('card:Shared BLT')).toBeInTheDocument();
    expect(screen.queryByText(/DRAFT SANDWICH/)).not.toBeInTheDocument();
    expect(fetchSandwichByIdMock).toHaveBeenCalledWith('shared-1');
  });

  it('shows a not-found message with no retry on a 404, never the draft', async () => {
    fetchSandwichByIdMock.mockResolvedValue(failed(404));

    render(<SandwichModal />);

    expect(await screen.findByText("This sandwich doesn't exist or was removed.")).toBeInTheDocument();
    expect(screen.queryByText(/DRAFT SANDWICH/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  it('shows a retryable error on a non-404 failure', async () => {
    fetchSandwichByIdMock.mockResolvedValue(failed(500));

    render(<SandwichModal />);

    expect(await screen.findByText('We could not load this sandwich. Please try again.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });
});
