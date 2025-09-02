import React from 'react';

// Skip Links Component for keyboard navigation
export function SkipLinks() {
  return (
    <div className="sr-only focus-within:not-sr-only">
      <a
        href="#main-content"
        className="fixed top-4 left-4 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium 
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                   transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Skip to main content
      </a>
      <a
        href="#navigation"
        className="fixed top-4 left-32 z-50 bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium
                   focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                   transform -translate-y-full focus:translate-y-0 transition-transform"
      >
        Skip to navigation
      </a>
    </div>
  );
}

// Visually hidden component for screen readers
export function VisuallyHidden({ children }: { children: React.ReactNode }) {
  return <span className="sr-only">{children}</span>;
}

// Announcement region for dynamic content
export function AnnouncementRegion({ 
  children, 
  priority = 'polite' 
}: { 
  children: React.ReactNode;
  priority?: 'polite' | 'assertive';
}) {
  return (
    <div
      role="region"
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
    >
      {children}
    </div>
  );
}

// Focus trap for modals and dropdowns
export function useFocusTrap(isActive: boolean) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }

    function handleEscapeKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && container) {
        // Close modal/dropdown
        const closeButton = container.querySelector('[data-close]') as HTMLElement;
        if (closeButton) closeButton.click();
      }
    }

    container.addEventListener('keydown', handleTabKey);
    container.addEventListener('keydown', handleEscapeKey);

    // Focus first element when trap activates
    if (firstElement) firstElement.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
      container.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isActive]);

  return containerRef;
}

// Loading announcement for screen readers
export function LoadingAnnouncement({ 
  isLoading, 
  message = 'Loading content' 
}: { 
  isLoading: boolean;
  message?: string;
}) {
  return (
    <AnnouncementRegion priority="polite">
      {isLoading ? message : ''}
    </AnnouncementRegion>
  );
}