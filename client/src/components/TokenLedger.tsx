import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Award, Users } from "lucide-react";
import { format } from "date-fns";

export default function TokenLedger() {
  const { data: ledger, isLoading } = useQuery({
    queryKey: ['/api/tokens/ledger'],
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="animate-pulse space-y-3 sm:space-y-4">
            <div className="h-6 bg-gray-800/50 rounded w-1/3"></div>
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-10 sm:h-12 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const entries = ledger || [];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'generation':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'referral':
        return <Users className="w-4 h-4 text-blue-400" />;
      case 'milestone':
        return <Award className="w-4 h-4 text-purple-400" />;
      default:
        return <Coins className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'generation':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'referral':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'milestone':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default:
        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
          <Coins className="w-5 h-5 text-cyan-400" />
          <span>TOKEN LEDGER</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {entries.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Coins className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No token transactions yet</p>
              <p className="text-sm">Start generating energy to earn WATT tokens!</p>
            </div>
          ) : (
            entries.map((entry: any) => (
              <div
                key={entry.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-cyan-600/30 transition-colors"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 flex items-center justify-center">
                    {getTypeIcon(entry.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                      <Badge variant="outline" className={`${getTypeColor(entry.type)} text-xs`}>
                        {entry.type.toUpperCase()}
                      </Badge>
                      <span className="text-white font-medium text-sm sm:text-base">
                        +{entry.amount.toFixed(2)} WATT
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-400 mt-1">
                      {entry.description || `${entry.type} reward`}
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs sm:text-sm text-gray-400">
                    {format(new Date(entry.createdAt), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(new Date(entry.createdAt), 'h:mm a')}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}