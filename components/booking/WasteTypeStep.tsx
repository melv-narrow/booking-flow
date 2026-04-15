'use client';

import { useState, useEffect } from 'react';
import { PlasterboardOption } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface WasteTypeStepProps {
  initialWasteType: 'general' | 'heavy' | 'plasterboard' | null;
  initialPlasterboardOption: PlasterboardOption | null;
  onComplete: (
    wasteType: 'general' | 'heavy' | 'plasterboard',
    plasterboardOption: PlasterboardOption | null
  ) => void;
  onBack: () => void;
}

type WasteType = 'general' | 'heavy' | 'plasterboard';

const WASTE_TYPES: {
  id: WasteType;
  label: string;
  description: string;
}[] = [
  {
    id: 'general',
    label: 'General Waste',
    description: 'Household waste, garden waste, and general rubbish',
  },
  {
    id: 'heavy',
    label: 'Heavy Waste',
    description: 'Includes soil, concrete, rubble, and similar dense materials',
  },
  {
    id: 'plasterboard',
    label: 'Plasterboard',
    description: 'Plasterboard must be separated or declared. Choose how you will handle it below',
  },
];

const PLASTERBOARD_OPTIONS: {
  id: PlasterboardOption;
  label: string;
}[] = [
  { id: 'bag_it', label: 'I will bag it separately' },
  { id: 'mixed_load', label: 'It will be mixed with other waste' },
  { id: 'separate_collection', label: 'I need a separate collection' },
];

export function WasteTypeStep({
  initialWasteType,
  initialPlasterboardOption,
  onComplete,
  onBack,
}: WasteTypeStepProps) {
  const [selectedWasteType, setSelectedWasteType] = useState<WasteType | null>(
    initialWasteType
  );
  const [selectedPlasterboardOption, setSelectedPlasterboardOption] =
    useState<PlasterboardOption | null>(initialPlasterboardOption);

  // BUG-004: plasterboardOption is NOT cleared when the user switches away from
  // 'plasterboard'. The useEffect that should reset it has been removed.
  // This causes a state leak: if the user picks plasterboard + an option, then
  // switches to general/heavy, the stale plasterboardOption remains in local
  // state and is passed to onComplete, appearing in the Review step summary.

  const handleNext = () => {
    if (!selectedWasteType) return;

    if (selectedWasteType === 'plasterboard' && !selectedPlasterboardOption) {
      return;
    }

    onComplete(selectedWasteType, selectedPlasterboardOption);
  };

  const canProceed =
    selectedWasteType !== null &&
    (selectedWasteType !== 'plasterboard' || selectedPlasterboardOption !== null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">What type of waste?</h2>
        <p className="text-text-secondary">Select the type of waste you need to dispose of</p>
      </div>

      <div className="space-y-3">
        {WASTE_TYPES.map((wasteType) => (
          <Card
            key={wasteType.id}
            className={[
              'p-4 cursor-pointer transition-all border-2',
              selectedWasteType === wasteType.id
                ? 'border-primary bg-primary-light'
                : 'border-border hover:border-primary-hover',
            ].join(' ')}
            onClick={() => setSelectedWasteType(wasteType.id)}
            data-testid={`waste-type-${wasteType.id}`}
          >
            <div className="flex items-start gap-3">
              <div
                className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5',
                  selectedWasteType === wasteType.id
                    ? 'border-primary bg-primary'
                    : 'border-border',
                ].join(' ')}
              >
                {selectedWasteType === wasteType.id && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-text-primary mb-1">{wasteType.label}</div>
                <div className="text-sm text-text-secondary">{wasteType.description}</div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Plasterboard options - revealed when plasterboard is selected */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{
          maxHeight: selectedWasteType === 'plasterboard' ? '500px' : '0',
          opacity: selectedWasteType === 'plasterboard' ? 1 : 0,
        }}
      >
        {selectedWasteType === 'plasterboard' && (
          <div className="space-y-3 pt-2">
            <h3 className="text-lg font-semibold text-text-primary">
              How will you handle the plasterboard?
            </h3>
            {PLASTERBOARD_OPTIONS.map((option) => (
              <Card
                key={option.id}
                className={[
                  'p-4 cursor-pointer transition-all border-2',
                  selectedPlasterboardOption === option.id
                    ? 'border-primary bg-primary-light'
                    : 'border-border hover:border-primary-hover',
                ].join(' ')}
                onClick={() => setSelectedPlasterboardOption(option.id)}
                data-testid={`plasterboard-option-${option.id}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0',
                      selectedPlasterboardOption === option.id
                        ? 'border-primary bg-primary'
                        : 'border-border',
                    ].join(' ')}
                  >
                    {selectedPlasterboardOption === option.id && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                  <div className="font-medium text-text-primary">{option.label}</div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} data-testid="back-btn">
          Back
        </Button>
        <Button onClick={handleNext} disabled={!canProceed} data-testid="next-btn">
          Next
        </Button>
      </div>
    </div>
  );
}
