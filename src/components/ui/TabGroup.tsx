
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

type TabGroupProps<T extends string> = {
  tabs: ReadonlyArray<{ id: T; label: string }>;
  activeTab: T;
  onTabChange: (value: T) => void;
  className?: string;
};

function TabGroup<T extends string>({ tabs, activeTab, onTabChange, className = '' }: TabGroupProps<T>) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange as (value: string) => void} className={className}>
      <TabsList className="bg-bullion-purple-50 border border-bullion-purple-100 overflow-x-auto flex w-full">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id} 
            value={tab.id}
            className="data-[state=active]:bg-white data-[state=active]:text-bullion-purple data-[state=active]:shadow-sm whitespace-nowrap"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}

export default TabGroup;
