import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, CheckCircle, Zap, Users, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Milestones() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: milestones, isLoading: milestonesLoading } = useQuery({
    queryKey: ['/api/milestones'],
  });

  const { data: userMilestones, isLoading: userMilestonesLoading } = useQuery({
    queryKey: ['/api/milestones/user'],
  });

  const unlockMilestoneMutation = useMutation({
    mutationFn: async (milestoneId: number) => {
      return await apiRequest(`/api/milestones/${milestoneId}/unlock`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      toast({
        title: "Milestone Unlocked!",
        description: "Congratulations on your achievement!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/milestones/user'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Unlock Failed",
        description: "Failed to unlock milestone. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getMilestoneIcon = (type: string) => {
    switch (type) {
      case 'uptime':
        return <Clock className="w-5 h-5" />;
      case 'energy':
        return <Zap className="w-5 h-5" />;
      case 'referral':
        return <Users className="w-5 h-5" />;
      default:
        return <Trophy className="w-5 h-5" />;
    }
  };

  const getMilestoneColor = (type: string) => {
    switch (type) {
      case 'uptime':
        return 'from-blue-500 to-purple-600';
      case 'energy':
        return 'from-green-500 to-cyan-600';
      case 'referral':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-yellow-500 to-orange-600';
    }
  };

  if (milestonesLoading || userMilestonesLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800/50 rounded w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const allMilestones = milestones || [];
  const userMilestoneMap = new Map(
    (userMilestones || []).map((um: any) => [um.milestoneId, um])
  );

  const completedMilestones = allMilestones.filter((m: any) => {
    const userMilestone = userMilestoneMap.get(m.id);
    return userMilestone?.isCompleted;
  });

  const availableMilestones = allMilestones.filter((m: any) => {
    const userMilestone = userMilestoneMap.get(m.id);
    return !userMilestone?.isCompleted;
  });

  return (
    <div className="space-y-6">
      {/* Milestone Stats */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-cyan-400" />
            <span>ACHIEVEMENTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-light text-cyan-400 mb-2">
                {completedMilestones.length}
              </div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Completed
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-purple-400 mb-2">
                {availableMilestones.length}
              </div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Available
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-light text-green-400 mb-2">
                {allMilestones.length}
              </div>
              <p className="text-sm text-gray-400 uppercase tracking-wider">
                Total
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Milestones */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white">
            AVAILABLE MILESTONES
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {availableMilestones.map((milestone: any) => {
              const userMilestone = userMilestoneMap.get(milestone.id);
              const progress = userMilestone?.progress || 0;
              const canUnlock = progress >= 100;

              return (
                <div
                  key={milestone.id}
                  className="relative p-4 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-cyan-600/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMilestoneColor(milestone.type)} flex items-center justify-center text-white`}>
                        {getMilestoneIcon(milestone.type)}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{milestone.name}</h4>
                        <Badge variant="outline" className="text-xs mt-1">
                          {milestone.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    {canUnlock && (
                      <Button
                        size="sm"
                        onClick={() => unlockMilestoneMutation.mutate(milestone.id)}
                        disabled={unlockMilestoneMutation.isPending}
                        className="bg-cyan-600 hover:bg-cyan-700 text-white"
                      >
                        Unlock
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-400 mb-3">
                    {milestone.description}
                  </p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Target: {milestone.threshold}</span>
                      <span>{canUnlock ? 'Ready to unlock!' : 'Keep going!'}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Completed Milestones */}
      {completedMilestones.length > 0 && (
        <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg font-light text-white">
              COMPLETED ACHIEVEMENTS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {completedMilestones.map((milestone: any) => {
                const userMilestone = userMilestoneMap.get(milestone.id);

                return (
                  <div
                    key={milestone.id}
                    className="relative p-4 bg-gradient-to-br from-green-500/10 to-cyan-500/10 rounded-lg border border-green-500/20"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getMilestoneColor(milestone.type)} flex items-center justify-center text-white`}>
                          {getMilestoneIcon(milestone.type)}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{milestone.name}</h4>
                          <Badge variant="outline" className="text-xs mt-1 bg-green-500/20 text-green-400 border-green-500/30">
                            COMPLETED
                          </Badge>
                        </div>
                      </div>
                      <CheckCircle className="w-6 h-6 text-green-400" />
                    </div>
                    
                    <p className="text-sm text-gray-400 mb-3">
                      {milestone.description}
                    </p>
                    
                    <div className="text-xs text-gray-500">
                      Unlocked {userMilestone?.unlockedAt && 
                        new Date(userMilestone.unlockedAt).toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}