import React from 'react';
import { useHonestyEscrow } from '../hooks/useHonestyEscrow';
import { ShieldCheck, Coins } from 'lucide-react';
import { Card } from '@scango/ui';

interface Props {
  sessionId: string | null;
}

export const HonestyBonusTracker: React.FC<Props> = ({ sessionId }) => {
  const { points_pending, multiplier, loading } = useHonestyEscrow(sessionId);

  if (!sessionId) return null;

  return (
    <div className="p-4 w-full">
      <Card padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full text-green-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 m-0">
                Honesty Bonus Pending
              </h3>
              <p className="text-xs text-gray-500 m-0">
                Unlock upon a clean exit!
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-lg font-bold text-amber-500">
              <Coins size={20} />
              <span>{loading ? '...' : points_pending}</span>
            </div>
            {multiplier > 1 && (
              <div className="text-xs font-semibold text-green-600 bg-green-50 px-2 rounded">
                {multiplier}x Multiplier Active
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};
