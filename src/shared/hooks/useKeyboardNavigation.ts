import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useKeyboardNavigation = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check Cmd or Ctrl modifier
      if (!e.metaKey && !e.ctrlKey) return;
      if (
        ['input', 'textarea', 'select'].includes(
          (e.target as HTMLElement)?.tagName?.toLowerCase()
        )
      )
        return;

      switch (e.key) {
        case '1':
          e.preventDefault();
          navigate('/dashboard');
          break;
        case '2':
          e.preventDefault();
          navigate('/vocabulary');
          break;
        case '3':
          e.preventDefault();
          navigate('/curriculum/today');
          break;
        case '4':
          e.preventDefault();
          navigate('/tools/work');
          break;
        case '5':
          e.preventDefault();
          navigate('/team');
          break;
        case '6':
          e.preventDefault();
          navigate('/profile/overview');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);
};
