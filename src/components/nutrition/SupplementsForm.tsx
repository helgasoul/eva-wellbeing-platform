import React, { useState } from 'react';
import type { SupplementEntry } from '@/pages/patient/NutritionTracker';

interface SupplementsFormProps {
  supplements: SupplementEntry[];
  onSupplementsUpdate: (supplements: SupplementEntry[]) => void;
}

export const SupplementsForm: React.FC<SupplementsFormProps> = ({
  supplements,
  onSupplementsUpdate
}) => {
  const [newSupplement, setNewSupplement] = useState({
    name: '',
    dosage: '',
    time: '',
    type: 'vitamin' as SupplementEntry['type']
  });

  const addSupplement = () => {
    if (!newSupplement.name.trim()) return;

    const supplement: SupplementEntry = {
      id: Date.now().toString(),
      ...newSupplement
    };

    onSupplementsUpdate([...supplements, supplement]);
    setNewSupplement({ name: '', dosage: '', time: '', type: 'vitamin' });
  };

  return (
    <div className="space-y-4">
      {supplements.map(supplement => (
        <div key={supplement.id} className="flex items-center justify-between bg-white rounded-lg p-3 border border-bloom-cream">
          <div>
            <div className="font-medium gentle-text">{supplement.name}</div>
            <div className="text-sm soft-text">{supplement.dosage} • {supplement.time}</div>
          </div>
          <button
            onClick={() => onSupplementsUpdate(supplements.filter(s => s.id !== supplement.id))}
            className="text-red-500 hover:text-red-700"
          >
            🗑️
          </button>
        </div>
      ))}

      <div className="bg-white rounded-lg border-2 border-dashed border-bloom-cream p-4">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            value={newSupplement.name}
            onChange={(e) => setNewSupplement(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Название добавки"
            className="p-2 border border-bloom-cream rounded-lg"
          />
          <input
            type="text"
            value={newSupplement.dosage}
            onChange={(e) => setNewSupplement(prev => ({ ...prev, dosage: e.target.value }))}
            placeholder="Дозировка"
            className="p-2 border border-bloom-cream rounded-lg"
          />
        </div>
        <button
          onClick={addSupplement}
          disabled={!newSupplement.name.trim()}
          className="w-full mt-2 bg-gradient-to-r from-primary to-primary-glow text-white py-2 rounded-lg disabled:opacity-50"
        >
          Добавить добавку
        </button>
      </div>
    </div>
  );
};