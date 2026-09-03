import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Button } from '@scango/ui';
import { Tag } from 'lucide-react';

interface Ad {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText: string;
}

interface Props {
  sku: string | null;
}

export const InAisleAdSlot: React.FC<Props> = ({ sku }) => {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    if (!sku) {
      setAd(null);
      return;
    }

    const fetchAd = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/v1/rmn/ads?sku=${sku}`);
        if (isMounted) {
          // Assume API returns an array or single object.
          const fetchedAd = Array.isArray(res.data) ? res.data[0] : res.data;
          setAd(fetchedAd || null);
        }
      } catch (err) {
        if (isMounted) setAd(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAd();
    return () => {
      isMounted = false;
    };
  }, [sku]);

  if (!sku || loading || !ad) return null;

  return (
    <div className="p-4 w-full">
      <Card padding="md" style={{ border: '1px solid var(--color-primary-light)' }}>
        <div className="flex gap-4 items-center">
          {ad.imageUrl ? (
            <img 
              src={ad.imageUrl} 
              alt={ad.title} 
              className="w-16 h-16 object-cover rounded-md flex-shrink-0" 
            />
          ) : (
            <div className="w-16 h-16 bg-blue-50 rounded-md flex items-center justify-center text-blue-500 flex-shrink-0">
              <Tag size={24} />
            </div>
          )}
          <div className="flex-1">
            <h4 className="text-sm font-bold text-gray-800 m-0 mb-1">{ad.title}</h4>
            <p className="text-xs text-gray-600 m-0 mb-3">{ad.description}</p>
            <Button size="sm" variant="outline" className="w-full text-xs">
              {ad.ctaText || 'Learn More'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
