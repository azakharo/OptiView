import {useNavigate} from 'react-router-dom';
import {Button} from 'flowbite-react';

// Plus icon as inline SVG (in case lucide-react is not installed)
const PlusIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export function FAB() {
  const navigate = useNavigate();

  return (
    <Button
      className="fixed right-6 bottom-6 h-14 w-14 rounded-full p-0 shadow-lg transition-transform hover:scale-105"
      color="blue"
      onClick={() => void navigate('/upload')}
      aria-label="Upload new image"
    >
      <PlusIcon />
    </Button>
  );
}
