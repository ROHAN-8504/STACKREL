import { CtaBand } from '@/components/site/sections/cta';
import { FeaturedWork } from '@/components/site/sections/featured-work';
import { Hero } from '@/components/site/sections/hero';
import { Latest } from '@/components/site/sections/latest';
import { OpenSource } from '@/components/site/sections/open-source';
import { Process } from '@/components/site/sections/process';
import { Services } from '@/components/site/sections/services';

// SPEC.md § Landing page sections. Header (1) and Footer (9) live in the
// root layout; sections 2–8 are below.
export default function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <FeaturedWork />
      <Process />
      <Latest />
      <OpenSource />
      <CtaBand />
    </>
  );
}
