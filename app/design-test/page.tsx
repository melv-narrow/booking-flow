/**
 * /app/design-test/page.tsx
 *
 * Visual QA page — renders all UI components in every state.
 * DELETE THIS ROUTE BEFORE SUBMISSION.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { Card } from '@/components/ui/Card';
import { SkipCard } from '@/components/ui/SkipCard';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { Step } from '@/lib/types';
import type { Skip } from '@/lib/types';

const MOCK_SKIPS: Skip[] = [
  { size: '4-yard skip', price: 120, disabled: false },
  { size: '6-yard skip', price: 155, disabled: false },
  { size: '8-yard skip', price: 185, disabled: true },
  { size: '10-yard skip', price: 215, disabled: false },
  { size: '12-yard skip', price: 260, disabled: true },
  { size: '14-yard skip', price: 295, disabled: false },
];

export default function DesignTestPage() {
  const [inputValue, setInputValue] = useState('');
  const [selectedSkip, setSelectedSkip] = useState<Skip | null>(null);
  const [currentStep, setCurrentStep] = useState<Step>(Step.WASTE_TYPE);

  const completed = (() => {
    const idx = Object.values(Step).indexOf(currentStep);
    return Object.values(Step).slice(0, idx) as Step[];
  })();

  return (
    <div className="min-h-screen bg-surface-muted p-4 sm:p-8">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="border-b border-border pb-4">
          <p className="text-xs font-mono text-error uppercase tracking-widest mb-1">
            ⚠ Design Test — Delete Before Submission
          </p>
          <h1 className="text-2xl font-bold text-text-primary">Component Gallery</h1>
          <p className="text-sm text-text-secondary mt-1">
            Visual QA for all Phase 2 components. Review every state before building steps.
          </p>
        </div>

        {/* ── StepIndicator ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Step Indicator
          </h2>
          <Card className="p-6 space-y-6">
            {Object.values(Step).map((step, i) => {
              const completes = Object.values(Step).slice(0, i) as Step[];
              return (
                <div key={step}>
                  <p className="text-xs font-mono text-text-muted mb-3">Active: {step}</p>
                  <StepIndicator currentStep={step} completedSteps={completes} />
                </div>
              );
            })}
          </Card>

          {/* Interactive */}
          <Card className="p-6 mt-4">
            <p className="text-xs font-mono text-text-muted mb-3">Interactive — clicking steps</p>
            <StepIndicator currentStep={currentStep} completedSteps={completed} />
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.values(Step).map((s) => (
                <button
                  key={s}
                  onClick={() => setCurrentStep(s)}
                  className="text-xs px-2 py-1 rounded bg-primary-light text-primary font-medium"
                >
                  {s}
                </button>
              ))}
            </div>
          </Card>
        </section>

        {/* ── Buttons ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Buttons
          </h2>
          <Card className="p-6">
            <div className="space-y-4">
              {/* Primary */}
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="primary">Find address</Button>
                <Button variant="primary" isLoading>Searching…</Button>
                <Button variant="primary" disabled>Disabled</Button>
              </div>
              {/* Secondary */}
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="secondary">Back</Button>
                <Button variant="secondary" isLoading>Loading</Button>
                <Button variant="secondary" disabled>Disabled</Button>
              </div>
              {/* Ghost */}
              <div className="flex flex-wrap gap-3 items-center">
                <Button variant="ghost">Enter manually</Button>
                <Button variant="ghost" isLoading>Loading</Button>
                <Button variant="ghost" disabled>Disabled</Button>
              </div>
            </div>
          </Card>
        </section>

        {/* ── Input ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Input
          </h2>
          <Card className="p-6 space-y-4">
            <Input
              label="Postcode"
              placeholder="e.g. SW1A 1AA"
              value={inputValue}
              onChange={setInputValue}
              helperText="Enter a valid UK postcode"
              required
              data-testid="postcode-input"
            />
            <Input
              label="Postcode — error state"
              placeholder="e.g. SW1A 1AA"
              value="INVALID"
              onChange={() => {}}
              error="Enter a valid UK postcode (e.g. SW1A 1AA)"
              required
            />
            <Input
              label="Postcode — disabled"
              placeholder="e.g. SW1A 1AA"
              value="SW1A 1AA"
              onChange={() => {}}
              disabled
            />
          </Card>
        </section>

        {/* ── Alerts ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Alerts
          </h2>
          <Card className="p-6 space-y-3">
            <Alert variant="error" title="Something went wrong">
              We couldn&apos;t look up that postcode. Please try again.
            </Alert>
            <Alert variant="warning">
              That postcode returned no addresses. You can enter your address manually below.
            </Alert>
            <Alert variant="info">
              We&apos;re finding addresses for your postcode…
            </Alert>
            <Alert variant="success" title="Booking confirmed">
              Your skip hire has been booked. Reference: <strong>BK-00142</strong>
            </Alert>
          </Card>
        </section>

        {/* ── Spinners ──────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Spinner
          </h2>
          <Card className="p-6 flex gap-6 items-center">
            <Spinner size="sm" label="Loading addresses" />
            <Spinner size="md" label="Loading skips" />
            <Spinner size="lg" label="Confirming booking" />
          </Card>
        </section>

        {/* ── Skip Cards ────────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Skip Cards
          </h2>
          <div
            role="radiogroup"
            aria-label="Select a skip size"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {MOCK_SKIPS.map((skip) => (
              <SkipCard
                key={skip.size}
                skip={skip}
                selected={selectedSkip?.size === skip.size}
                onSelect={setSelectedSkip}
                showHeavyWasteLabel
              />
            ))}
          </div>
          {selectedSkip && (
            <p className="mt-3 text-sm text-text-secondary">
              Selected: <strong>{selectedSkip.size}</strong> — £{selectedSkip.price}
            </p>
          )}
        </section>

        {/* ── Card variants ─────────────────────────────────────────── */}
        <section>
          <h2 className="text-base font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Card Container
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-5">
              <p className="text-sm text-text-secondary">Default Card — renders as div</p>
            </Card>
            <Card as="article" className="p-5">
              <p className="text-sm text-text-secondary">Article card — polymorphic</p>
            </Card>
          </div>
        </section>

        <p className="text-xs text-center font-mono text-text-muted pt-4 pb-8">
          ⚠ Delete <code>/app/design-test</code> before final submission
        </p>
      </div>
    </div>
  );
}
