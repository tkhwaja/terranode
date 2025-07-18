import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

export default function ReferralSystem() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const { data: referralStats } = useQuery({
    queryKey: ['/api/referrals/stats'],
  });

  const { data: leaderboard } = useQuery({
    queryKey: ['/api/referrals/leaderboard'],
  });

  const stats = referralStats || {
    totalReferrals: 0,
    referralBonus: 0
  };

  const referralCode = user?.referralCode || 'TERRA-XXXXX';

  const copyReferralCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
      <CardHeader>
        <CardTitle className="text-2xl font-bold glow-text text-cyber-purple">
          Referral System
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Label className="block text-sm font-medium mb-2">Your Referral Code</Label>
          <div className="flex items-center space-x-2">
            <Input
              value={referralCode}
              readOnly
              className="bg-cyber-gray/50 border-cyber-purple/30 text-cyber-purple font-mono"
            />
            <Button
              onClick={copyReferralCode}
              className={`${
                copied
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-cyber-purple hover:bg-cyber-purple/80'
              } px-4 py-2 transition-colors`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Total Referrals</span>
            <span className="text-cyber-purple font-bold">{stats.totalReferrals}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Referral Bonus</span>
            <span className="text-cyber-purple font-bold">+{stats.referralBonus} WATT</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Your Rank</span>
            <span className="text-cyber-purple font-bold">#--</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cyber-gray/50 rounded-lg">
          <h4 className="font-semibold mb-2">Leaderboard</h4>
          <div className="space-y-2">
            {leaderboard?.slice(0, 3).map((leader: any, index: number) => (
              <div key={leader.userId} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="text-sm">
                    {leader.firstName || 'Anonymous'}
                  </span>
                </div>
                <span className="text-sm text-cyber-purple">
                  {leader.referralCount} referrals
                </span>
              </div>
            )) || (
              <div className="text-sm text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
