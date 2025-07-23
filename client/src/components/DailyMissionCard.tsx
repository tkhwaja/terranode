import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, CheckCircle, Clock } from "lucide-react";

interface DailyMissionData {
  id: number;
  userId: string;
  missionType: string;
  targetValue: number;
  currentValue: number;
  status: 'incomplete' | 'complete';
  dateAssigned: string;
  completedAt?: string;
  emoji?: string;
  description?: string;
}

const getMissionDisplay = (mission: DailyMissionData) => {
  const baseDescriptions = {
    'generate_energy': `Generate ${mission.targetValue} kWh of solar energy today`,
    'export_surplus': `Export ${mission.targetValue} kWh surplus energy to the grid`,
    'stay_uptime': `Maintain ${mission.targetValue}% system uptime all day`,
    'invite_friend': `Invite ${mission.targetValue} friend using your referral code`
  };

  const emojis = {
    'generate_energy': '💡',
    'export_surplus': '⚡',
    'stay_uptime': '🌞',
    'invite_friend': '🔗'
  };

  return {
    emoji: mission.emoji || emojis[mission.missionType as keyof typeof emojis] || '🎯',
    description: mission.description || baseDescriptions[mission.missionType as keyof typeof baseDescriptions] || 'Complete your mission'
  };
};

export default function DailyMissionCard() {
  const { data: mission, isLoading, error } = useQuery<DailyMissionData>({
    queryKey: ['/api/daily-mission'],
    refetchInterval: 30000, // Refresh every 30 seconds to update progress
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

  if (error || !mission) {
    return (
      <Card className="bg-gray-900/80 border border-red-900/30 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex items-center justify-center space-x-3 text-gray-400">
            <Target className="w-5 h-5" />
            <span className="text-sm">Unable to load daily mission</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { emoji, description } = getMissionDisplay(mission);
  const progress = Math.min((mission.currentValue / mission.targetValue) * 100, 100);
  const isComplete = mission.status === 'complete';

  return (
    <Card className={`bg-gray-900/80 border backdrop-blur-sm transition-all duration-300 ${
      isComplete 
        ? 'border-green-500/50 shadow-green-500/20' 
        : 'border-cyan-900/30 hover:border-cyan-700/50'
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-cyan-400">
            <Target className="w-5 h-5" />
            Daily Mission
          </CardTitle>
          <div className="flex items-center gap-2">
            {isComplete ? (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Complete
              </Badge>
            ) : (
              <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                In Progress
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mission Description */}
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div className="flex-1">
            <p className="text-white font-medium">{description}</p>
          </div>
          {isComplete && (
            <CheckCircle className="w-6 h-6 text-green-400 animate-pulse" />
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-300">Progress</span>
            <span className={isComplete ? "text-green-400 font-bold" : "text-cyan-400 font-medium"}>
              {mission.currentValue.toFixed(1)} / {mission.targetValue.toFixed(1)}
              {mission.missionType.includes('energy') || mission.missionType.includes('surplus') ? ' kWh' : 
               mission.missionType === 'stay_uptime' ? '%' : ''}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <Progress 
              value={progress} 
              className={`h-3 ${isComplete ? 'bg-green-900/50' : 'bg-gray-800'} border border-gray-700`}
            />
            {/* Glow effect for completed missions */}
            {isComplete && (
              <div className="absolute inset-0 h-3 bg-gradient-to-r from-green-500/30 to-green-400/30 rounded-full blur-sm animate-pulse" />
            )}
          </div>

          {/* Progress Percentage */}
          <div className="text-center">
            <span className={`text-sm font-medium ${
              isComplete ? 'text-green-400' : 
              progress >= 50 ? 'text-cyan-400' : 'text-gray-400'
            }`}>
              {progress.toFixed(0)}% Complete
            </span>
          </div>
        </div>

        {/* Completion Message */}
        {isComplete && (
          <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <p className="text-green-400 text-sm font-medium">
              🎉 Mission accomplished! Check back tomorrow for a new challenge.
            </p>
          </div>
        )}

        {/* Encouragement for incomplete missions */}
        {!isComplete && progress > 0 && (
          <div className="text-center">
            <p className="text-gray-400 text-xs">
              {progress >= 75 ? "🔥 Almost there! You're doing great!" :
               progress >= 50 ? "💪 Halfway there! Keep it up!" :
               progress >= 25 ? "🌱 Good start! You're on your way!" :
               "⚡ Every step counts! You've got this!"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}