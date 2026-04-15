'use client';

import { useState, useEffect } from 'react';
import { Skip } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { SkipCard } from '@/components/ui/SkipCard';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';

interface SkipSelectionStepProps {
  postcode: string;
  heavyWaste: boolean;
  selectedSkip: Skip | null;
  onComplete: (skip: Skip) => void;
  onBack: () => void;
}

export function SkipSelectionStep({
  postcode,
  heavyWaste,
  selectedSkip: initialSelectedSkip,
  onComplete,
  onBack,
}: SkipSelectionStepProps) {
  const [skips, setSkips] = useState<Skip[]>([]);
  const [selectedSkip, setSelectedSkip] = useState<Skip | null>(initialSelectedSkip);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSkips = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const params = new URLSearchParams({
          postcode,
          heavyWaste: heavyWaste.toString(),
        });

        const response = await fetch(`/api/skips?${params}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to load skips');
        }

        setSkips(data.skips);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSkips();
  }, [postcode, heavyWaste]);

  const handleSkipSelect = (skip: Skip) => {
    if (skip.disabled) return;
    setSelectedSkip(skip);
  };

  const handleNext = () => {
    if (selectedSkip) {
      onComplete(selectedSkip);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Choose your skip size</h2>
          <p className="text-text-secondary">Select the skip that best fits your needs</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div
              key={idx}
              className="h-32 bg-surface-muted rounded-card animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Choose your skip size</h2>
          <p className="text-text-secondary">Select the skip that best fits your needs</p>
        </div>

        <Alert variant="error">{error}</Alert>

        <div className="flex justify-between pt-4">
          <Button variant="ghost" onClick={onBack} data-testid="back-btn">
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Choose your skip size</h2>
        <p className="text-text-secondary">Select the skip that best fits your needs</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" role="radiogroup">
        {skips.map((skip) => (
          <SkipCard
            key={skip.size}
            skip={skip}
            isSelected={selectedSkip?.size === skip.size}
            onSelect={() => handleSkipSelect(skip)}
            data-testid={`skip-card-${skip.size}`}
          />
        ))}
      </div>

      {selectedSkip && (
        <div className="sticky bottom-0 left-0 right-0 bg-surface border-t border-border p-4 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            <div>
              <div className="text-sm text-text-secondary">Selected skip</div>
              <div className="text-lg font-bold text-text-primary">
                {selectedSkip.size} — £{selectedSkip.price}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} data-testid="back-btn">
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedSkip}
          aria-disabled={!selectedSkip}
          data-testid="next-btn"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
