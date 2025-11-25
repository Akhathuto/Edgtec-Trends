'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/contexts/ToastContext';

const AffiliateProgram = () => {
  const { showToast } = useToast();

  const handleCopyLink = () => {
    navigator.clipboard.writeText('https://edgtec.com/affiliate?ref=12345');
    showToast('Affiliate link copied to clipboard!');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Affiliate Program</h1>
      <p className="text-lg mb-8">
        Join our affiliate program and earn a 20% commission on all sales generated through your unique referral link.
      </p>

      <div className="bg-gray-100 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Your Referral Link</h2>
        <div className="flex items-center space-x-4">
          <Input type="text" value="https://edgtec.com/affiliate?ref=12345" readOnly />
          <Button onClick={handleCopyLink}>Copy Link</Button>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">Clicks</h3>
            <p className="text-3xl">123</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">Sign Ups</h3>
            <p className="text-3xl">45</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-bold">Earnings</h3>
            <p className="text-3xl">$1,234.56</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateProgram;
