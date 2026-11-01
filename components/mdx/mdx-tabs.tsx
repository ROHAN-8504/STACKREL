'use client';

// "use client": wraps the Radix-backed Tabs primitive so MDX authors can
// write <Tabs items={[...]}> without a client boundary of their own.

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MdxTabs({
  items,
  children,
}: {
  items: string[];
  children: React.ReactNode;
}) {
  const panels = Array.isArray(children) ? children : [children];
  const first = items[0] ?? 'tab-0';

  return (
    <Tabs defaultValue={first} className="my-8">
      <TabsList>
        {items.map((label) => (
          <TabsTrigger key={label} value={label}>
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
      {items.map((label, i) => (
        <TabsContent key={label} value={label}>
          {panels[i]}
        </TabsContent>
      ))}
    </Tabs>
  );
}
