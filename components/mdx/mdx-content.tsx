'use client';

// "use client": Velite compiles MDX to a function body that must be
// evaluated and handed the JSX runtime at render time. That evaluation
// cannot happen in a Server Component, so this thin wrapper is the client
// boundary for rendered content. The MDX components it mounts are plain
// presentational components; only CopyButton and Tabs carry their own
// client logic.

import { useMemo } from 'react';
import * as runtime from 'react/jsx-runtime';

import { mdxComponents } from '@/components/mdx/mdx-components';

function useMDXComponent(code: string) {
  return useMemo(() => {
    const fn = new Function(code);
    return fn({ ...runtime }).default as React.ComponentType<{
      components?: Record<string, unknown>;
    }>;
  }, [code]);
}

export function MDXContent({ code }: { code: string }) {
  const Component = useMDXComponent(code);
  // react-hooks/static-components warns that components built during render
  // lose state when re-created. That is the normal hazard; here the
  // component IS the compiled document, `code` is constant for the life of
  // the page, and useMemo keys on it, so the identity never changes. There
  // is no way to hoist a component that only exists once the content is
  // known.
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={mdxComponents} />;
}
