import { cn } from '@/utils/cn';

interface SandwichLayerEditButtonProps {
  originalIndex: number;
  handleEditLayer: (e: React.MouseEvent<HTMLButtonElement>, index: number) => void;
  className?: string;
}

const SandwichLayerEditButton = ({
  originalIndex,
  handleEditLayer,
  className = '',
}: SandwichLayerEditButtonProps): React.JSX.Element => {
  return (
    <button
      className={cn(
        'layer-edit-button flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-lg bg-white px-2 py-1.5 text-xs font-medium text-magenta shadow-lg transition-all hover:scale-105 hover:bg-magenta hover:text-white active:scale-95 sm:gap-1.5 sm:px-3 sm:py-2 sm:text-sm md:gap-2 md:px-4 md:py-2.5 md:text-base lg:min-h-0 lg:min-w-0',
        className,
      )}
      onClick={(e) => handleEditLayer(e, originalIndex)}
      title="Edit layer"
      aria-label="Edit layer"
    >
      <svg
        className="h-4 w-4 sm:h-[18px] sm:w-[18px] md:h-5 md:w-5"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
      </svg>
      <span className="hidden lg:inline">Edit</span>
    </button>
  );
};

export default SandwichLayerEditButton;
