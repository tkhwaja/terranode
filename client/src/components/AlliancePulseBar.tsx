import { useQuery } from "@tanstack/react-query";
import { Users, Target, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface AlliancePulseData {
  currentTotal: number;
  weeklyGoal: number;
  progressPercent: number;
  statusEmoji: string;
  hasAlliance: boolean;
  allianceName?: string;
}

export default function AlliancePulseBar() {
  const { data: pulseData, isLoading } = useQuery<AlliancePulseData>({
    queryKey: ['/api/alliance-pulse'],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm animate-pulse">
        <CardContent className="p-4 sm:p-6">
          <div className="h-20 bg-gray-800/20 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!pulseData) {
    return null;
  }

  const { currentTotal, weeklyGoal, progressPercent, statusEmoji, hasAlliance, allianceName } = pulseData;

  if (!hasAlliance) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-3 text-gray-400">
            <Users className="w-5 h-5" />
            <span className="text-sm sm:text-base">Join an alliance to activate your pulse!</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Determine glow color based on progress
  const getGlowColor = (percent: number) => {
    if (percent >= 100) return 'shadow-green-500/50';
    if (percent >= 75) return 'shadow-orange-500/50';
    if (percent >= 50) return 'shadow-cyan-500/50';
    return 'shadow-purple-500/50';
  };

  const glowClass = getGlowColor(progressPercent);

  return (
    <Card className={`bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm ${glowClass} transition-shadow duration-300`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-cyan-400">
            <Zap className="w-5 h-5" />
            Alliance Pulse
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{statusEmoji}</span>
            <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {allianceName || 'Community'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Stats */}
        <div className="flex justify-between items-center text-sm">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-400" />
            <span className="text-gray-300">Weekly Goal</span>
          </div>
          <span className="text-white font-medium">{weeklyGoal} kWh</span>
        </div>

        {/* Current Progress */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-300">Current Surplus</span>
          <span className="text-cyan-400 font-bold">
            {currentTotal} kWh ({progressPercent}%)
          </span>
        </div>

        {/* Progress Bar with Glow Effect */}
        <div className="relative">
          <Progress 
            value={progressPercent} 
            className="h-3 bg-gray-800 border border-gray-700"
          />
          {/* Glow overlay */}
          <div 
            className={`absolute inset-0 h-3 rounded-full opacity-50 ${
              progressPercent >= 100 ? 'bg-gradient-to-r from-green-500/20 to-green-400/20' :
              progressPercent >= 75 ? 'bg-gradient-to-r from-orange-500/20 to-orange-400/20' :
              progressPercent >= 50 ? 'bg-gradient-to-r from-cyan-500/20 to-cyan-400/20' :
              'bg-gradient-to-r from-purple-500/20 to-purple-400/20'
            } blur-sm animate-pulse`}
            style={{ width: `${Math.min(progressPercent, 100)}%` }}
          />
        </div>

        {/* Status Message */}
        <div className="text-center text-xs text-gray-400">
          {progressPercent >= 100 && "🎉 Goal exceeded! Amazing collective effort!"}
          {progressPercent >= 75 && progressPercent < 100 && "🔥 Almost there! Keep up the great work!"}
          {progressPercent >= 50 && progressPercent < 75 && "💪 Halfway there! Building momentum!"}
          {progressPercent >= 25 && progressPercent < 50 && "🌱 Growing strong! Every kWh counts!"}
          {progressPercent < 25 && "⚡ Just getting started! Let's power up together!"}
        </div>

        {/* Remaining to Goal */}
        {progressPercent < 100 && (
          <div className="text-center text-xs">
            <span className="text-gray-400">Need </span>
            <span className="text-cyan-400 font-medium">
              {(weeklyGoal - currentTotal).toFixed(1)} kWh
            </span>
            <span className="text-gray-400"> more to reach our goal</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}