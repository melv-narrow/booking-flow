import { Step } from '@/lib/types';

interface StepIndicatorProps {
  currentStep: Step;
  completedSteps: Step[];
}

const STEPS: { id: Step; label: string; shortLabel: string }[] = [
  { id: Step.POSTCODE,       label: 'Location',   shortLabel: '01' },
  { id: Step.WASTE_TYPE,     label: 'Waste Type', shortLabel: '02' },
  { id: Step.SKIP_SELECTION, label: 'Skip',       shortLabel: '03' },
  { id: Step.REVIEW,         label: 'Review',     shortLabel: '04' },
];

function CheckIcon() {
  return (
    <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5" aria-hidden="true">
      <path d="M2.5 7l3 3L11.5 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/**
 * StepIndicator — 4-step progress bar.
 * aria-current="step" on active step.
 * Completed steps show a checkmark.
 * Connector line fills teal once step is complete.
 */
export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep);

  return (
    <nav aria-label="Booking progress" className="w-full pb-6">
      <ol className="flex items-center justify-between">
        {STEPS.map((step, idx) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = step.id === currentStep;
          const isUpcoming = !isCompleted && !isCurrent;

          return (
            <li key={step.id} className="flex items-center flex-1 last:flex-none">
              {/* Step node */}
              <div className="relative flex justify-center">
                {/* Circle */}
                <div
                  aria-current={isCurrent ? 'step' : undefined}
                  className={[
                    'flex relative z-10 items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-all duration-slow',
                    isCompleted
                      ? 'bg-primary border-primary text-white'
                      : isCurrent
                        ? 'bg-primary-light border-primary text-primary'
                        : 'bg-surface border-border text-text-muted',
                  ].join(' ')}
                >
                  {isCompleted ? <CheckIcon /> : <span>{step.shortLabel}</span>}
                </div>

                {/* Absolute Label */}
                <span
                  className={[
                    'absolute top-10 left-1/2 -translate-x-1/2 text-xs font-medium leading-none text-center whitespace-nowrap',
                    isCurrent
                      ? 'text-primary'
                      : isCompleted
                        ? 'text-text-secondary'
                        : 'text-text-muted',
                  ].join(' ')}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector — shown between all steps except last */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 h-0.5 rounded-full overflow-hidden bg-border">
                  <div
                    className="h-full bg-primary transition-all duration-slow"
                    style={{ width: completedSteps.includes(step.id) ? '100%' : '0%' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
