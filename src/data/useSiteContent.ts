import { useState, useEffect, useCallback } from 'react';
import { SiteContent } from '../types';
import { DEFAULT_SITE_CONTENT } from './defaultContent';

const STORAGE_KEY = 'kofeshtab_site_content_v3';

export function useSiteContent() {
  const [content, setContent] = useState<SiteContent>(DEFAULT_SITE_CONTENT);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial load: check localStorage first, then fetch /content.json
  useEffect(() => {
    let isMounted = true;

    async function loadContent() {
      try {
        // Clean up legacy cached content versions
        localStorage.removeItem('kofeshtab_site_content_v1');
        localStorage.removeItem('kofeshtab_site_content_v2');

        // 1. Check local storage for user custom edits
        const savedLocal = localStorage.getItem(STORAGE_KEY);
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            if (parsed && typeof parsed === 'object' && isMounted) {
              // Ensure no stray admin item is in navItems from previous versions
              const sanitizedNavItems = (parsed.header?.navItems || DEFAULT_SITE_CONTENT.header.navItems).filter(
                (item: { id: string; label: string }) => item.id !== 'admin' && !item.label.toLowerCase().includes('админ')
              );

              // Filter out deprecated items like seasonal vzvary from legacy cache
              const rawDrinks = parsed.menu?.additionalDrinks || DEFAULT_SITE_CONTENT.menu.additionalDrinks;
              const sanitizedDrinks = rawDrinks.filter(
                (d: { title: string }) => !d.title.toLowerCase().includes('взвар')
              );

              setContent({
                ...DEFAULT_SITE_CONTENT,
                ...parsed,
                header: { 
                  ...DEFAULT_SITE_CONTENT.header, 
                  ...(parsed.header || {}),
                  navItems: sanitizedNavItems
                },
                hero: { ...DEFAULT_SITE_CONTENT.hero, ...(parsed.hero || {}) },
                about: { ...DEFAULT_SITE_CONTENT.about, ...(parsed.about || {}) },
                menu: { 
                  ...DEFAULT_SITE_CONTENT.menu, 
                  ...(parsed.menu || {}),
                  additionalDrinks: sanitizedDrinks
                },
                eventsAndCraft: { ...DEFAULT_SITE_CONTENT.eventsAndCraft, ...(parsed.eventsAndCraft || {}) },
                hoursAndTourists: { ...DEFAULT_SITE_CONTENT.hoursAndTourists, ...(parsed.hoursAndTourists || {}) },
                footer: { ...DEFAULT_SITE_CONTENT.footer, ...(parsed.footer || {}) },
              });
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse local storage content', e);
          }
        }

        // 2. Fetch from public/content.json
        const response = await fetch('/content.json', {
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });

        if (response.ok) {
          const json = await response.json();
          if (isMounted && json) {
            setContent({
              ...DEFAULT_SITE_CONTENT,
              ...json,
              header: { ...DEFAULT_SITE_CONTENT.header, ...(json.header || {}) },
              hero: { ...DEFAULT_SITE_CONTENT.hero, ...(json.hero || {}) },
              about: { ...DEFAULT_SITE_CONTENT.about, ...(json.about || {}) },
              menu: { ...DEFAULT_SITE_CONTENT.menu, ...(json.menu || {}) },
              eventsAndCraft: { ...DEFAULT_SITE_CONTENT.eventsAndCraft, ...(json.eventsAndCraft || {}) },
              hoursAndTourists: { ...DEFAULT_SITE_CONTENT.hoursAndTourists, ...(json.hoursAndTourists || {}) },
              footer: { ...DEFAULT_SITE_CONTENT.footer, ...(json.footer || {}) },
            });
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

  // Save updated content to localStorage and state
  const updateContent = useCallback((newContent: SiteContent) => {
    setContent(newContent);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newContent));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }, []);

  // Reset content to defaults
  const resetToDefault = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setContent(DEFAULT_SITE_CONTENT);
  }, []);

  // Download content as content.json file
  const exportJson = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(content, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "content.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [content]);

  return { 
    content, 
    isLoading, 
    updateContent, 
    resetToDefault,
    exportJson 
  };
}
