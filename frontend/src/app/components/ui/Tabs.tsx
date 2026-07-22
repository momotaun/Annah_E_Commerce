"use client";

import { useState } from "react";
import { cn } from "@/src/lib/utils";

export interface TabItem {
  value: string;
  label: string;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultValue?: string;
}

function Tabs({ tabs, defaultValue }: TabsProps) {
  const [active, setActive] = useState(defaultValue ?? tabs[0]?.value);
  const activeTab = tabs.find((t) => t.value === active);

  return (
    <div>
      <div role="tablist" className="flex gap-8 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => setActive(tab.value)}
            className={cn(
              "border-b-2 pb-3 text-sm font-medium transition-colors",
              active === tab.value
                ? "border-primary-600 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="pt-8">
        {activeTab?.content}
      </div>
    </div>
  );
}

export default Tabs;