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
      <Card className="bg-cyber-dark border-cyber-cyan/20 holographic animate-pulse">
        <CardContent className="p-6">
          <div className="h-64 bg-cyber-gray/20 rounded"></div>
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
    <Card className="bg-cyber-dark/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-light text-white">
            WATT WALLET
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Coins className="w-6 h-6 text-cyan-400" />
            <span className="text-2xl font-light text-cyan-400">
              {walletData.wattBalance.toFixed(0)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Today's Earnings</span>
            <span className="text-cyber-orange font-bold">
              +{walletData.todaysEarnings.toFixed(0)} WATT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Lifetime Earnings</span>
            <span className="text-cyber-orange font-bold">
              {walletData.lifetimeEarnings.toFixed(0)} WATT
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Current Rate</span>
            <span className="text-cyber-orange font-bold">0.75 WATT/kW</span>
          </div>
        </div>

        <div className="mt-6 p-4 bg-cyber-gray/50 rounded-lg">
          <h4 className="font-semibold mb-2">Next Milestone</h4>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Solar Champion</span>
            <span className="text-sm text-cyber-orange">{nextMilestone} WATT</span>
          </div>
          <Progress value={progress} className="mb-2" />
          <div className="text-sm text-gray-400">
            {remaining.toFixed(0)} WATT remaining
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
