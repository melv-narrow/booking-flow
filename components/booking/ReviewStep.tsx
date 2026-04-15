'use client';

import { useState, useRef } from 'react';
import { Address, Skip, PlasterboardOption } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface ReviewStepProps {
  postcode: string;
  addressId: string | null;
  manualAddress: string | null;
  addresses: Address[];
  wasteType: 'general' | 'heavy' | 'plasterboard';
  plasterboardOption: PlasterboardOption | null;
  selectedSkip: Skip;
  onBack: () => void;
  onNewBooking: () => void;
}

export function ReviewStep({
  postcode,
  addressId,
  manualAddress,
  addresses,
  wasteType,
  plasterboardOption,
  selectedSkip,
  onBack,
  onNewBooking,
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const submitAttemptedRef = useRef(false);

  const selectedAddress = addressId
    ? addresses.find((a) => a.id === addressId)
    : null;

  const displayAddress = manualAddress || selectedAddress
    ? manualAddress || `${selectedAddress!.line1}, ${selectedAddress!.city}`
    : 'Unknown';

  const wasteTypeLabel =
    wasteType === 'general'
      ? 'General Waste'
      : wasteType === 'heavy'
        ? 'Heavy Waste'
        : 'Plasterboard';

  const plasterboardOptionLabel = plasterboardOption
    ? plasterboardOption === 'bag_it'
      ? "I'll bag it separately"
      : plasterboardOption === 'mixed_load'
        ? 'It will be mixed with other waste'
        : 'I need a separate collection'
    : null;

  const handleConfirm = async () => {
    // BUG-006: The synchronous `submitAttemptedRef` guard has been removed.
    // The function now relies solely on the `isSubmitting` state flag, which is
    // set asynchronously in the next render cycle. If the user double-clicks
    // before that re-render, a second call fires — both requests race to the API.
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        postcode,
        addressId: addressId || undefined,
        manualAddress: manualAddress || undefined,
        heavyWaste: wasteType === 'heavy',
        plasterboard: wasteType === 'plasterboard',
        plasterboardOption: plasterboardOption || undefined,
        skipSize: selectedSkip.size,
        price: selectedSkip.price,
      };

      const response = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to confirm booking');
      }

      setBookingId(data.bookingId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state
  if (bookingId) {
    return (
      <div className="space-y-6" data-testid="booking-confirmation">
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-text-primary mb-2">Booking Confirmed!</h2>
          <p className="text-text-secondary mb-4">
            Your skip has been successfully booked
          </p>
          <div className="bg-surface-muted rounded-card p-4 inline-block">
            <div className="text-sm text-text-secondary mb-1">Booking Reference</div>
            <div className="text-xl font-bold text-primary" data-testid="booking-id">
              {bookingId}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Button onClick={onNewBooking} data-testid="new-booking-btn">
            Start a new booking
          </Button>
        </div>
      </div>
    );
  }

  // Review state
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Review your booking</h2>
        <p className="text-text-secondary">Check the details before confirming</p>
      </div>

      <div className="space-y-4">
        <div className="bg-surface-muted rounded-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Location</h3>
          <div className="text-text-primary" data-testid="review-postcode">
            <div className="font-medium">{postcode}</div>
            <div className="text-sm text-text-secondary mt-1">{displayAddress}</div>
          </div>
        </div>

        <div className="bg-surface-muted rounded-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Waste Type</h3>
          <div className="text-text-primary" data-testid="review-waste-type">
            <div className="font-medium">{wasteTypeLabel}</div>
            {plasterboardOptionLabel && (
              <div className="text-sm text-text-secondary mt-1">{plasterboardOptionLabel}</div>
            )}
          </div>
        </div>

        <div className="bg-surface-muted rounded-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Skip Size</h3>
          <div className="text-text-primary" data-testid="review-skip-size">
            <div className="font-medium">{selectedSkip.size}</div>
          </div>
        </div>

        <div className="bg-surface-muted rounded-card p-4">
          <h3 className="text-sm font-semibold text-text-secondary mb-3">Price</h3>
          <div className="text-2xl font-bold text-primary" data-testid="review-price">
            £{selectedSkip.price}
          </div>
        </div>
      </div>

      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting} data-testid="back-btn">
          Back
        </Button>
        <Button
          onClick={handleConfirm}
          isLoading={isSubmitting}
          disabled={isSubmitting}
          data-testid="confirm-btn"
        >
          {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
        </Button>
      </div>
    </div>
  );
}
