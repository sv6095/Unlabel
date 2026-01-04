import React, { useState } from "react";

const menuItems = [
  "Analyze",
  "History",
  "Profile",
  "About",
  "Contact",
];

export default function NavMenu() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="absolute inset-0 bg-background">
      {/* Mobile toggle */}
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="md:hidden absolute top-6 right-6 z-20 p-2"
        aria-label="Toggle menu"
      >
        <div className={`w-6 h-0.5 bg-foreground mb-1.5 transition-transform ${isMenuOpen ? "rotate-45 translate-y-2" : ""}`} />
        <div className={`w-6 h-0.5 bg-foreground mb-1.5 ${isMenuOpen ? "opacity-0" : ""}`} />
        <div className={`w-6 h-0.5 bg-foreground ${isMenuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
      </button>

      <div
        className={`flex items-center justify-center h-full ${
          isMenuOpen ? "block" : "hidden md:flex"
        }`}
      >
        <ul className="flex flex-col md:flex-row gap-6">
          {menuItems.map((item) => (
            <li key={item}>
              <a
                href="#"
                className="relative group uppercase font-semibold text-lg text-foreground"
              >
                <span className="relative z-10 px-4 py-2 group-hover:text-background">
                  {item}
                </span>
                <span className="absolute inset-0 bg-foreground scale-0 group-hover:scale-100 transition-transform origin-center" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
