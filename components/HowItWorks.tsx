// components/HowItWorks.tsx
import React from 'react';

export interface Step {
  step: string;
  title: string;
  desc: string;
}

interface HowItWorksProps {
  id: string;
  heading: string;
  steps: Step[];
}

/**
 * Renders a “How It Works” section with a heading and up to 3 steps.
 * Each step shows a circle with the step number, a title, and a description.
 */
export const HowItWorks: React.FC<HowItWorksProps> = ({ id, heading, steps }) => (
  <section id={id} className="bg-primary/90 py-20 px-4 text-center">
    <h2 className="text-3xl md:text-4xl font-semibold mb-12">{heading}</h2>
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">
      {steps.map(({ step, title, desc }) => (
        <div key={step}>
          <div className="mx-auto mb-4 w-12 h-12 bg-secondary rounded-full flex items-center justify-center text-lg font-bold">
            {step}
          </div>
          <h4 className="text-lg font-semibold mb-2">{title}</h4>
          <p className="text-base">{desc}</p>
        </div>
      ))}
    </div>
  </section>
);
