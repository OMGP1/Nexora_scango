import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card } from '@scango/ui';
import { Shield, CheckCircle, Activity } from 'lucide-react';

interface TrustProfile {
  tier: 'Bronze' | 'Silver' | 'Gold';
  totalCleanExits: number;
  currentAuditRate: number; // e.g. 5 for 5%
}

export const TransparencyDashboard: React.FC = () => {
  const [profile, setProfile] = useState<TrustProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // Assuming this endpoint exists based on prompt context
        const res = await axios.get('/api/v1/gamification/profile');
        if (isMounted) {
          setProfile(res.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError('Could not load transparency data');
          // Fallback mock data for demonstration
          setProfile({
            tier: 'Silver',
            totalCleanExits: 12,
            currentAuditRate: 15,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-sm text-gray-500">Loading your profile...</div>;
  }

  if (!profile) return null;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return 'text-yellow-500 bg-yellow-50 border-yellow-200';
      case 'Silver': return 'text-slate-500 bg-slate-50 border-slate-200';
      default: return 'text-amber-700 bg-amber-50 border-amber-200';
    }
  };

  return (
    <div className="p-4 w-full">
      <Card padding="md">
        <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2 m-0">
          <Shield size={18} className="text-indigo-600" />
          Trust & Transparency
        </h3>
        
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100">
            <div className={`px-2 py-1 rounded text-xs font-bold border mb-2 ${getTierColor(profile.tier)}`}>
              {profile.tier}
            </div>
            <span className="text-xs text-gray-500 text-center">Trust Tier</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100">
            <CheckCircle size={24} className="text-green-500 mb-2" />
            <div className="text-lg font-bold text-gray-800 leading-tight">{profile.totalCleanExits}</div>
            <span className="text-xs text-gray-500 text-center">Clean Exits</span>
          </div>

          <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-gray-50 border border-gray-100">
            <Activity size={24} className="text-blue-500 mb-2" />
            <div className="text-lg font-bold text-gray-800 leading-tight">{profile.currentAuditRate}%</div>
            <span className="text-xs text-gray-500 text-center">Audit Rate</span>
          </div>
        </div>
        
        {error && <p className="text-xs text-red-500 mt-3 m-0 text-center">{error}</p>}
      </Card>
    </div>
  );
};
