"use client";

import React from "react";
import { Languages } from "lucide-react";
import { useLanguage } from "@/lib/context/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="inline-flex items-center rounded-lg border border-border/80 bg-background/60 p-0.5 text-xs shadow-sm backdrop-blur-sm">
      <div className="flex items-center px-1.5 py-1 text-muted-foreground">
        <Languages className="mr-1 h-3.5 w-3.5" />
      </div>
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
          language === "en"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        English
      </button>
      <button
        type="button"
        onClick={() => setLanguage("hi")}
        className={`rounded-md px-2 py-0.5 font-medium transition-colors ${
          language === "hi"
            ? "bg-primary text-primary-foreground shadow-xs"
            : "text-muted-foreground hover:text-foreground"
        }`}
      >
        हिन्दी
      </button>
    </div>
  );
}
