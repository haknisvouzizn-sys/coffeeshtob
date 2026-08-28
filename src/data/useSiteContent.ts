import { useState, useEffect } from 'react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from './defaultContent';

export function useSiteContent(): { content: SiteContent; isLoading: boolean } {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        const response = await fetch('/content.json', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const json = await response.json();
          if (isMounted && json) {
            setContent((prev) => ({
              ...prev,
              ...json,
              header: { ...prev.header, ...(json.header || {}) },
              hero: { ...prev.hero, ...(json.hero || {}) },
              about: { ...prev.about, ...(json.about || {}) },
              menu: { ...prev.menu, ...(json.menu || {}) },
              eventsAndCraft: { ...prev.eventsAndCraft, ...(json.eventsAndCraft || {}) },
              hoursAndTourists: { ...prev.hoursAndTourists, ...(json.hoursAndTourists || {}) },
              footer: { ...prev.footer, ...(json.footer || {}) },
            }));
          }
        }
      } catch (err) {
        console.warn('Could not dynamically load /content.json, using default content:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadContent();

    return () => {
      isMounted = false;
    };
  }, []);

  return { content, isLoading };
}
