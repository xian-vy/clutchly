import { useState, useEffect } from 'react';

type ScreenSize = 'mobile' | 'large' | 'xlarge';

export const useScreenSize = (): ScreenSize => {
  const [screenSize, setScreenSize] = useState<ScreenSize>('large');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      console.log("width",width)

      if (width < 768) {
        setScreenSize('mobile');
      } else if (width > 768 && width < 1800) {
        setScreenSize('large');
      } else {
        setScreenSize('xlarge');
      }
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return screenSize;
};