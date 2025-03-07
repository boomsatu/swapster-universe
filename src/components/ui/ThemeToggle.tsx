
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDarkMode } from "@/hooks/useDarkMode";

export function ThemeToggle() {
  const { theme, toggleTheme } = useDarkMode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="rounded-full w-9 h-9 transition-all duration-200 hover:bg-muted"
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-5 w-5 transition-all duration-300 ease-in-out ${
          theme === "dark" ? "opacity-0 rotate-90 scale-0 absolute" : "opacity-100 rotate-0"
        }`}
      />
      <Moon
        className={`h-5 w-5 transition-all duration-300 ease-in-out ${
          theme === "light" ? "opacity-0 -rotate-90 scale-0 absolute" : "opacity-100 rotate-0"
        }`}
      />
    </Button>
  );
}
