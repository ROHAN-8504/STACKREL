// Server Component — deliberately NOT 'use client'.
//
// Velite compiles MDX to a function body that has to be evaluated with the
// JSX runtime. Doing that in the browser means `new Function(...)`, which
// the Content-Security-Policy forbids without 'unsafe-eval' — under the
// production CSP every article rendered empty with an EvalError.
//
// Evaluating it here instead runs during prerender, in Node, where there is
// no CSP. The result is serialised into the static HTML, so the browser
// never evaluates a string at all. That keeps script-src free of
// 'unsafe-eval' and takes the MDX runtime out of the client bundle.
//
// Client-side MDX components (CopyButton, Tabs) still work: they are client
// islands referenced from this server-rendered tree.

import * as runtime from 'react/jsx-runtime';

import { mdxComponents } from '@/components/mdx/mdx-components';

type MDXModule = {
  default: React.ComponentType<{ components?: Record<string, unknown> }>;
};

function compile(code: string): MDXModule['default'] {
  const fn = new Function(code) as (r: typeof runtime) => MDXModule;
  return fn({ ...runtime }).default;
}

export function MDXContent({ code }: { code: string }) {
  const Component = compile(code);
  // react-hooks/static-components warns that components built during render
  // lose state when re-created. This component IS the compiled document and
  // it is built once, at build time, in a Server Component — there is no
  // client render to lose state across.
  // eslint-disable-next-line react-hooks/static-components
  return <Component components={mdxComponents} />;
}
