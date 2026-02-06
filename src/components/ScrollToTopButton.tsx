import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { ClayButton } from '@/components/ui/clay-button';
import { cn } from '@/lib/utils';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <ClayButton
      variant="default"
      size="icon"
      onClick={scrollToTop}
      className={cn(
        'fixed bottom-20 right-4 z-[110] h-12 w-12 rounded-full shadow-clay-strong opacity-75 transition-all duration-300 hover:opacity-100',
        isVisible ? 'scale-100' : 'scale-0'
      )}
    >
      <ArrowUp className="h-6 w-6" />
    </ClayButton>
  );
};