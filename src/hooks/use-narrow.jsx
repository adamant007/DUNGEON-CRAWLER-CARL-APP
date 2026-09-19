import * as React from "react";

/* Wide-vs-narrow viewport flag for the character sheet's Pass 2
   composition. Wide (>=1024px) renders the two-column Ginger Dragon
   layout; narrow stacks the same panels in the approved phone order.
   Lazy-initializes from the live window width so the first paint is
   already correct (no desktop flash on phones). */
export function useNarrow(breakpoint = 1024) {
  const [narrow, setNarrow] = React.useState(
    () => typeof window !== "undefined" && window.innerWidth < breakpoint
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    /* mql.matches === true means the viewport IS narrow. */
    const onChange = () => setNarrow(mql.matches);
    mql.addEventListener("change", onChange);
    setNarrow(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, [breakpoint]);

  return narrow;
}