'use client';

import { useState } from 'react';
import { Address } from '@/lib/types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';

interface PostcodeStepProps {
  initialPostcode: string;
  initialAddresses: Address[];
  initialSelectedAddressId: string | null;
  initialManualAddress: string | null;
  onComplete: (
    postcode: string,
    addresses: Address[],
    selectedAddressId: string | null,
    manualAddress: string | null
  ) => void;
}

export function PostcodeStep({
  initialPostcode,
  initialAddresses,
  initialSelectedAddressId,
  initialManualAddress,
  onComplete,
}: PostcodeStepProps) {
  const [postcode, setPostcode] = useState(initialPostcode);
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    initialSelectedAddressId
  );
  const [manualAddress, setManualAddress] = useState(initialManualAddress || '');
  const [showManualEntry, setShowManualEntry] = useState(!!initialManualAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const formatPostcode = (value: string) => {
    // Auto-format to uppercase
    return value.toUpperCase().trim();
  };

  const handlePostcodeChange = (value: string) => {
    setPostcode(formatPostcode(value));
    setError(null);
  };

  const validatePostcode = (pc: string): boolean => {
    // Basic UK postcode regex
    const regex = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/;
    return regex.test(pc);
  };

  const handleFindAddress = async () => {
    if (!postcode) {
      setError('Please enter a postcode');
      return;
    }

    if (!validatePostcode(postcode)) {
      setError('Please enter a valid UK postcode');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAddresses([]);
    setSelectedAddressId(null);
    setShowManualEntry(false);

    try {
      const response = await fetch('/api/postcode/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postcode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to lookup postcode');
      }

      setAddresses(data.addresses);
      setRetryCount(0);

      if (data.addresses.length === 0) {
        setShowManualEntry(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setRetryCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleFindAddress();
  };

  const handleNext = () => {
    if (showManualEntry && !manualAddress.trim()) {
      setError('Please enter your address manually');
      return;
    }

    if (!showManualEntry && !selectedAddressId) {
      setError('Please select an address');
      return;
    }

    onComplete(
      postcode,
      addresses,
      showManualEntry ? null : selectedAddressId,
      showManualEntry ? manualAddress : null
    );
  };

  const canProceed = showManualEntry
    ? manualAddress.trim().length > 0
    : selectedAddressId !== null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-2">Enter your location</h2>
        <p className="text-text-secondary">We'll use this to find available skips in your area</p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="flex-1">
            <Input
              label="Postcode"
              placeholder="e.g. SW1A 1AA"
              value={postcode}
              onChange={handlePostcodeChange}
              data-testid="postcode-input"
              disabled={isLoading}
              maxLength={8}
            />
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleFindAddress}
              isLoading={isLoading}
              disabled={!postcode || isLoading}
              data-testid="find-address-btn"
            >
              Find address
            </Button>
          </div>
        </div>

        {error && retryCount > 0 && (
          <Alert variant="error">
            <div className="flex items-center justify-between gap-4">
              <span>{error}</span>
              <Button variant="secondary" onClick={handleRetry} data-testid="retry-btn">
                Try again
              </Button>
            </div>
          </Alert>
        )}

        {error && retryCount === 0 && <Alert variant="error">{error}</Alert>}

        {addresses.length > 0 && (
          <div>
            <label
              htmlFor="address-select"
              className="block text-sm font-medium text-text-primary mb-2"
            >
              Select your address
            </label>
            <select
              id="address-select"
              data-testid="address-select"
              value={selectedAddressId || ''}
              onChange={(e) => setSelectedAddressId(e.target.value)}
              className="w-full px-4 py-3 rounded-card text-sm text-text-primary bg-surface border border-border focus:outline-none focus:border-primary focus:shadow-focus transition-all"
            >
              <option value="">-- Select an address --</option>
              {addresses.map((addr) => (
                <option key={addr.id} value={addr.id}>
                  {addr.line1}, {addr.city}
                </option>
              ))}
            </select>
          </div>
        )}

        {addresses.length === 0 && !isLoading && postcode && !error && (
          <Alert variant="info">
            <div className="space-y-2">
              <p>No addresses found for this postcode.</p>
              <button
                onClick={() => setShowManualEntry(true)}
                className="text-primary font-medium hover:underline"
              >
                Enter address manually
              </button>
            </div>
          </Alert>
        )}

        {showManualEntry && (
          <Input
            label="Enter your address manually"
            placeholder="e.g. 10 Downing Street, London"
            value={manualAddress}
            onChange={setManualAddress}
            data-testid="manual-address-input"
          />
        )}
      </div>

      <div className="flex justify-end pt-4">
        <Button
          onClick={handleNext}
          disabled={!canProceed}
          data-testid="next-btn"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
