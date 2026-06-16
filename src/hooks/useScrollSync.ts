import { useEffect, RefObject } from "react";

/**
 * Custom React Hook that synchronizes scrolling behavior between the main application area
 * and open side drawers. It locks body/background scrolling while a drawer is open, prevents
 * layout shifts across browsers by compensating for scrollbar widths, halts iOS background
 * scroll chaining (overscroll leakages), and returns optimized hover/touch events.
 * 
 * @param isOpen - Flag indicating physical drawer opening state
 * @param drawerRef - React Ref matching the Scrollable Drawer inner box container
 */
export function useScrollSync(
  isOpen: boolean,
  drawerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    if (!isOpen) return;

    const drawer = drawerRef.current;
    if (!drawer) return;

    // Increment global active scroll locks counter
    (window as any).__activeScrollLocks = ((window as any).__activeScrollLocks || 0) + 1;

    // 1. Prevent Layout Shifting: Calculate Scrollbar Width dynamically
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    const originalBodyOverflow = document.body.style.overflow;
    const originalBodyPadding = document.body.style.paddingRight;

    // Get the fixed header to prevent its shifting
    const header = document.getElementById("main-app-header");
    const originalHeaderPadding = header ? header.style.paddingRight : "";

    // Apply clean lock to prevent double-scrollable page experiences
    document.body.style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      if (header) {
        header.style.paddingRight = `${scrollbarWidth}px`;
      }
    }

    // 2. Prevent iOS Scroll Leakage / Body Scroll chaining on touch events
    let startY = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        startY = e.touches[0].pageY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!drawer) return;

      const touch = e.touches[0];
      const currentY = touch.pageY;
      const direction = startY - currentY; // positive = scrolling down, negative = scrolling up

      const scrollTop = drawer.scrollTop;
      const scrollHeight = drawer.scrollHeight;
      const clientHeight = drawer.clientHeight;

      const isTargetInsideDrawer = drawer.contains(e.target as Node);

      // Scroll event target outside drawer (like modal backdrop / blurred margins)
      if (!isTargetInsideDrawer) {
        if (e.cancelable) {
          e.preventDefault();
        }
        return;
      }

      // Scrolling up at the boundaries of the scrollable container
      if (scrollTop <= 0 && direction < 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }

      // Scrolling down at the boundaries of the scrollable container
      if (scrollTop + clientHeight >= scrollHeight && direction > 0) {
        if (e.cancelable) {
          e.preventDefault();
        }
      }
    };

    // Attach passive touchstart but active cancelable touchmove to intercept scroll chain
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    // Set CSS parameters to handle viewport boundaries and overscroll constraints
    const originalOverscroll = drawer.style.overscrollBehaviorY;
    drawer.style.overscrollBehaviorY = "contain";

    // Clean up hook state to restore the main application's natural scrolling flow
    return () => {
      // Decrement counter
      (window as any).__activeScrollLocks = Math.max(0, ((window as any).__activeScrollLocks || 1) - 1);

      // Only restore scroll when NO more drawers are locking it
      if (((window as any).__activeScrollLocks) === 0) {
        document.body.style.overflow = "";
        document.body.style.paddingRight = "";
        if (header) {
          header.style.paddingRight = "";
        }
      }

      drawer.style.overscrollBehaviorY = originalOverscroll;
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [isOpen, drawerRef]);

  // Backwards-compatible mouse events to ensure seamless desktop container synching
  const handleMouseEnter = () => {
    // Already locked via useEffect
  };

  const handleMouseLeave = () => {
    // Already unlocked via useEffect cleanup when closed
  };

  return {
    handleMouseEnter,
    handleMouseLeave,
    handleTouchStart: handleMouseEnter,
    handleTouchEnd: handleMouseLeave,
    handleTouchCancel: handleMouseLeave,
  };
}
