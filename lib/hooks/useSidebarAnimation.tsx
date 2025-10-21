import { useEffect } from "react";

interface Props {
  isCollapsed: boolean;
}
const useSidebarAnimation = ({ isCollapsed }: Props) => {
  // Update CSS variable when sidebar is collapsed/expanded
  useEffect(() => {
    // First set the transition on the document
    document.documentElement.classList.add("sidebar-transitioning");

    // Then update the CSS variable
    document.documentElement.style.setProperty(
      "--sidebar-width",
      isCollapsed ? "4rem" : "19rem"
    );

    // Update for 3xl screens
    document.documentElement.style.setProperty(
      "--sidebar-width-3xl",
      isCollapsed ? "4rem" : "22rem"
    );

    // Remove the transition class after the transition completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove("sidebar-transitioning");
    }, 250);

    return () => clearTimeout(timer);
  }, [isCollapsed]);
};

export default useSidebarAnimation;
