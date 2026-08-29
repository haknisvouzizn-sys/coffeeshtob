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

        // 1. First fetch fresh content from public/content.json (with cache buster timestamp)
        try {
          const response = await fetch(`/content.json?t=${Date.now()}`, {
            cache: 'no-store',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache'
            }
          });

          if (response.ok) {
            const json = await response.json();
            if (isMounted && json) {
              setContent(json);
              setIsLoading(false);
              return;
            }
          }
        } catch (fetchErr) {
          console.warn('Could not fetch /content.json dynamically, checking localStorage:', fetchErr);
        }

        // 2. Check local storage if remote fetch is not available
        const savedLocal = localStorage.getItem(STORAGE_KEY);
        if (savedLocal && isMounted) {
          try {
            const parsed = JSON.parse(savedLocal);
            if (parsed && typeof parsed === 'object') {
              setContent(parsed);
              setIsLoading(false);
              return;
            }
          } catch (e) {
            console.warn('Failed to parse local storage content', e);
          }
        }
      } catch (err) {
        console.warn('Could not load content:', err);
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
