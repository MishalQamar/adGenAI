import { useCallback } from 'react';

export const useSmoothScroll = () => {
  const scrollToSection = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
      e.preventDefault();
      // Remove # from id if present
      const sectionId = id.startsWith('#') ? id.slice(1) : id;
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.scrollY - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    },
    []
  );
  return { scrollToSection };
};
