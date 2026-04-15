'use client';

import { useState } from 'react';
import { Step, Address, Skip, PlasterboardOption } from '@/lib/types';
import { StepIndicator } from '@/components/booking/StepIndicator';
import { PostcodeStep } from '@/components/booking/PostcodeStep';
import { WasteTypeStep } from '@/components/booking/WasteTypeStep';
import { SkipSelectionStep } from '@/components/booking/SkipSelectionStep';
import { ReviewStep } from '@/components/booking/ReviewStep';

interface BookingState {
  step: Step;
  postcode: string;
  addresses: Address[];
  selectedAddressId: string | null;
  manualAddress: string | null;
  wasteType: 'general' | 'heavy' | 'plasterboard' | null;
  plasterboardOption: PlasterboardOption | null;
  skips: Skip[];
  selectedSkip: Skip | null;
}

export default function BookingPage() {
  const [state, setState] = useState<BookingState>({
    step: Step.POSTCODE,
    postcode: '',
    addresses: [],
    selectedAddressId: null,
    manualAddress: null,
    wasteType: null,
    plasterboardOption: null,
    skips: [],
    selectedSkip: null,
  });

  const [completedSteps, setCompletedSteps] = useState<Step[]>([]);

  const goToStep = (step: Step) => {
    setState((prev) => ({ ...prev, step }));
  };

  const completeStep = (step: Step) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps((prev) => [...prev, step]);
    }
  };

  const handlePostcodeComplete = (
    postcode: string,
    addresses: Address[],
    selectedAddressId: string | null,
    manualAddress: string | null
  ) => {
    setState((prev) => ({
      ...prev,
      postcode,
      addresses,
      selectedAddressId,
      manualAddress,
    }));
    completeStep(Step.POSTCODE);
    goToStep(Step.WASTE_TYPE);
  };

  const handleWasteTypeComplete = (
    wasteType: 'general' | 'heavy' | 'plasterboard',
    plasterboardOption: PlasterboardOption | null
  ) => {
    setState((prev) => ({
      ...prev,
      wasteType,
      plasterboardOption,
    }));
    completeStep(Step.WASTE_TYPE);
    goToStep(Step.SKIP_SELECTION);
  };

  const handleSkipComplete = (skip: Skip) => {
    setState((prev) => ({
      ...prev,
      selectedSkip: skip,
    }));
    completeStep(Step.SKIP_SELECTION);
    goToStep(Step.REVIEW);
  };

  const handleBack = () => {
    const stepOrder = [Step.POSTCODE, Step.WASTE_TYPE, Step.SKIP_SELECTION, Step.REVIEW];
    const currentIndex = stepOrder.indexOf(state.step);
    if (currentIndex > 0) {
      goToStep(stepOrder[currentIndex - 1]);
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Book a Skip</h1>
          <p className="text-text-secondary">Complete the steps below to book your skip hire</p>
        </div>

        <StepIndicator currentStep={state.step} completedSteps={completedSteps} />

        <div className="bg-surface rounded-card shadow-card p-6 sm:p-8">
          {state.step === Step.POSTCODE && (
            <PostcodeStep
              initialPostcode={state.postcode}
              initialAddresses={state.addresses}
              initialSelectedAddressId={state.selectedAddressId}
              initialManualAddress={state.manualAddress}
              onComplete={handlePostcodeComplete}
            />
          )}

          {state.step === Step.WASTE_TYPE && (
            <WasteTypeStep
              initialWasteType={state.wasteType}
              initialPlasterboardOption={state.plasterboardOption}
              onComplete={handleWasteTypeComplete}
              onBack={handleBack}
            />
          )}

          {state.step === Step.SKIP_SELECTION && (
            <SkipSelectionStep
              postcode={state.postcode}
              heavyWaste={state.wasteType === 'heavy'}
              selectedSkip={state.selectedSkip}
              onComplete={handleSkipComplete}
              onBack={handleBack}
            />
          )}

          {state.step === Step.REVIEW && (
            <ReviewStep
              postcode={state.postcode}
              addressId={state.selectedAddressId}
              manualAddress={state.manualAddress}
              addresses={state.addresses}
              wasteType={state.wasteType!}
              plasterboardOption={state.plasterboardOption}
              selectedSkip={state.selectedSkip!}
              onBack={handleBack}
              onNewBooking={() => {
                setState({
                  step: Step.POSTCODE,
                  postcode: '',
                  addresses: [],
                  selectedAddressId: null,
                  manualAddress: null,
                  wasteType: null,
                  plasterboardOption: null,
                  skips: [],
                  selectedSkip: null,
                });
                setCompletedSteps([]);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
