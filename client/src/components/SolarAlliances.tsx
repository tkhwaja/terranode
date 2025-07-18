import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

export default function SolarAlliances() {
  const { data: alliances } = useQuery({
    queryKey: ['/api/alliances'],
  });

  const { data: userAlliances } = useQuery({
    queryKey: ['/api/alliances/user'],
  });

  const joinAllianceMutation = useMutation({
    mutationFn: (allianceId: number) => 
      apiRequest('POST', `/api/alliances/${allianceId}/join`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alliances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alliances/user'] });
    },
  });

  const isUserInAlliance = (allianceId: number) => {
    return userAlliances?.some((alliance: any) => alliance.id === allianceId);
  };

  return (
    <Card className="bg-cyber-dark border-cyber-cyan/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold glow-text text-cyber-cyan">
          Solar Alliances
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* User's Current Alliances */}
          {userAlliances?.map((alliance: any) => (
            <Card key={alliance.id} className="bg-cyber-gray/30 border-cyber-cyan/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-cyber-cyan">{alliance.name}</CardTitle>
                  <Badge variant="secondary" className="bg-cyber-cyan/20 text-cyber-cyan">
                    Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span>{alliance.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Surplus</span>
                    <span className="text-cyber-cyan">{alliance.totalSurplus?.toFixed(1) || 0} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-cyber-orange">#--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Available Alliances to Join */}
          {alliances?.filter((alliance: any) => !isUserInAlliance(alliance.id)).slice(0, 2).map((alliance: any) => (
            <Card key={alliance.id} className="bg-cyber-gray/30 border-cyber-purple/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-cyber-purple">{alliance.name}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => joinAllianceMutation.mutate(alliance.id)}
                    disabled={joinAllianceMutation.isPending}
                    className="bg-cyber-purple hover:bg-cyber-purple/80"
                  >
                    Join
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span>{alliance.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Surplus</span>
                    <span className="text-cyber-purple">{alliance.totalSurplus?.toFixed(1) || 0} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-cyber-orange">#--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Alliance */}
          <Card className="bg-cyber-gray/30 border-cyber-orange/30 flex items-center justify-center">
            <CardContent className="text-center py-8">
              <div className="w-12 h-12 bg-cyber-orange/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Plus className="w-6 h-6 text-cyber-orange" />
              </div>
              <CardTitle className="text-lg text-cyber-orange mb-1">Create Alliance</CardTitle>
              <p className="text-xs text-gray-400">Start your own solar community</p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
