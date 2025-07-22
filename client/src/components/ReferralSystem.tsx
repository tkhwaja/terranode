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
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg sm:text-xl font-light text-white">
          REFERRAL SYSTEM
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div>
          <Label className="block text-xs sm:text-sm font-medium mb-2 text-cyan-400 uppercase tracking-wider">Your Referral Code</Label>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <Input
              value={referralCode}
              readOnly
              className="bg-gray-800/50 border-cyan-900/30 text-cyan-400 font-mono text-sm flex-1 min-h-[44px]"
            />
            <Button
              onClick={copyReferralCode}
              className={`${
                copied
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-cyan-600 hover:bg-cyan-700'
              } min-h-[44px] px-4 sm:px-6 transition-colors`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span className="ml-2 sm:hidden">{copied ? 'Copied!' : 'Copy'}</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-light text-cyan-400 mb-1">
              {stats.totalReferrals}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Total Referrals</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-light text-orange-400 mb-1">
              +{stats.referralBonus}
            </div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Bonus WATT</div>
          </div>
          <div className="text-center sm:text-left">
            <div className="text-xl sm:text-2xl font-light text-purple-400 mb-1">
              #--
            </div>
            <div className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">Your Rank</div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gray-800/50 rounded-lg">
          <h4 className="font-medium mb-3 text-white text-sm sm:text-base">Top Referrers</h4>
          <div className="space-y-2">
            {(leaderboard || []).slice(0, 3).map((leader: any, index: number) => (
              <div key={leader.userId} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </span>
                  <span className="text-xs sm:text-sm text-white">
                    {leader.firstName || 'Anonymous'}
                  </span>
                </div>
                <span className="text-xs sm:text-sm text-cyan-400">
                  {leader.referralCount} referrals
                </span>
              </div>
            ))}
            {(!leaderboard || leaderboard.length === 0) && (
              <div className="text-xs sm:text-sm text-gray-400">No data available</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
