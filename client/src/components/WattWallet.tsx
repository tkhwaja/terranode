import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Coins } from "lucide-react";

export default function WattWallet() {
  const { data: wallet, isLoading } = useQuery({
    queryKey: ['/api/wallet'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4 sm:p-6">
          <div className="h-48 sm:h-64 bg-gray-800/20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  const walletData = wallet || {
    wattBalance: 0,
    lifetimeEarnings: 0,
    todaysEarnings: 0
  };

  const nextMilestone = 2000;
  const currentBalance = walletData.wattBalance;
  const progress = Math.min((currentBalance / nextMilestone) * 100, 100);
  const remaining = Math.max(nextMilestone - currentBalance, 0);

  return (
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <CardTitle className="text-lg sm:text-xl font-light text-white">
            WATT WALLET
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400" />
            <span className="text-xl sm:text-2xl font-light text-cyan-400">
              {walletData.wattBalance.toFixed(0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm sm:text-base">Today's Earnings</span>
            <span className="text-orange-400 font-bold text-sm sm:text-base">
              +{walletData.todaysEarnings.toFixed(0)} WATT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm sm:text-base">Lifetime Earnings</span>
            <span className="text-orange-400 font-bold text-sm sm:text-base">
              {walletData.lifetimeEarnings.toFixed(0)} WATT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400 text-sm sm:text-base">Current Rate</span>
            <span className="text-orange-400 font-bold text-sm sm:text-base">0.75 WATT/kW</span>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-cyber-gray/50 rounded-lg">
          <h4 className="font-semibold mb-2 text-sm sm:text-base">Next Milestone</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs sm:text-sm text-gray-400">Solar Champion</span>
            <span className="text-xs sm:text-sm text-cyber-orange">{nextMilestone} WATT</span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-xs sm:text-sm text-gray-400">
            {remaining.toFixed(0)} WATT remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
