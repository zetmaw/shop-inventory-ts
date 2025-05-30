import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function GuitarWorkflow() {
  const [step, setStep] = useState(0);
  const [guitarName, setGuitarName] = useState('');
  const [woodType, setWoodType] = useState('');
  const [pickupType, setPickupType] = useState('');
  const [summary, setSummary] = useState('');

  const steps = [
    {
      label: 'Name your guitar',
      content: (
        <Input
          placeholder="e.g., Delta 5 Custom"
          value={guitarName}
          onChange={(e) => setGuitarName(e.target.value)}
        />
      ),
    },
    {
      label: 'Select wood type',
      content: (
        <Input
          placeholder="e.g., Mahogany"
          value={woodType}
          onChange={(e) => setWoodType(e.target.value)}
        />
      ),
    },
    {
      label: 'Choose pickup type',
      content: (
        <Input
          placeholder="e.g., Lipstick / Piezo combo"
          value={pickupType}
          onChange={(e) => setPickupType(e.target.value)}
        />
      ),
    },
    {
      label: 'Summary',
      content: (
        <div>
          <p className="mb-2">Guitar Name: {guitarName}</p>
          <p className="mb-2">Wood Type: {woodType}</p>
          <p className="mb-2">Pickup Type: {pickupType}</p>
          <p className="italic text-gray-600">Looks good? Save it.</p>
        </div>
      ),
    },
  ];

  const handleNext = () => {
    if (step === steps.length - 1) {
      const result = `Name: ${guitarName}, Wood: ${woodType}, Pickups: ${pickupType}`;
      setSummary(result);
    }
    setStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 0));
  };

  return (
    <Card className="p-4 max-w-xl mx-auto">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">🎸 Guitar Build Workflow</h2>
        <h3 className="text-lg font-medium mb-2">Step {step + 1}: {steps[step].label}</h3>
        <div className="mb-4">{steps[step].content}</div>
        <div className="flex gap-2">
          <Button disabled={step === 0} onClick={handleBack} variant="outline">
            Back
          </Button>
          <Button onClick={handleNext}>{step === steps.length - 1 ? 'Finish' : 'Next'}</Button>
        </div>
        {summary && (
          <div className="mt-6 p-3 border rounded bg-green-50">
            <p className="font-semibold">✅ Build saved:</p>
            <p>{summary}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}