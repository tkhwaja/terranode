import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Users, X } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function SolarAlliances() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newAllianceName, setNewAllianceName] = useState("");
  const [newAllianceDescription, setNewAllianceDescription] = useState("");
  const { toast } = useToast();

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
      toast({
        title: "Alliance Joined",
        description: "Welcome to your new solar alliance!",
      });
    },
  });

  const createAllianceMutation = useMutation({
    mutationFn: (data: { name: string; description?: string }) => 
      apiRequest('POST', '/api/alliances', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alliances'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alliances/user'] });
      setIsCreateDialogOpen(false);
      setNewAllianceName("");
      setNewAllianceDescription("");
      toast({
        title: "Alliance Created",
        description: "Your solar alliance has been successfully created!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to create alliance. Please try again.",
        variant: "destructive",
      });
    },
  });

  const isUserInAlliance = (allianceId: number) => {
    return userAlliances?.some((alliance: any) => alliance.id === allianceId);
  };

  const handleCreateAlliance = () => {
    if (!newAllianceName.trim()) {
      toast({
        title: "Error",
        description: "Please enter an alliance name.",
        variant: "destructive",
      });
      return;
    }
    createAllianceMutation.mutate({
      name: newAllianceName.trim(),
      description: newAllianceDescription.trim() || undefined,
    });
  };

  return (
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-lg sm:text-xl font-light text-white">
          SOLAR ALLIANCES
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* User's Current Alliances */}
          {userAlliances?.map((alliance: any) => (
            <Card key={alliance.id} className="bg-gray-800/30 border border-cyan-900/30">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg text-cyan-400 truncate">{alliance.name}</CardTitle>
                  <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30 self-start sm:self-auto">
                    Member
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span className="text-white">{alliance.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Surplus</span>
                    <span className="text-cyan-400">{alliance.totalSurplus?.toFixed(1) || 0} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-orange-400">#--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Available Alliances to Join */}
          {alliances?.filter((alliance: any) => !isUserInAlliance(alliance.id)).slice(0, 2).map((alliance: any) => (
            <Card key={alliance.id} className="bg-gray-800/30 border border-purple-900/30">
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <CardTitle className="text-base sm:text-lg text-purple-400 truncate">{alliance.name}</CardTitle>
                  <Button
                    size="sm"
                    onClick={() => joinAllianceMutation.mutate(alliance.id)}
                    disabled={joinAllianceMutation.isPending}
                    className="bg-purple-600 hover:bg-purple-700 text-white min-h-[44px] sm:min-h-0 w-full sm:w-auto"
                  >
                    Join
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Members</span>
                    <span className="text-white">{alliance.memberCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Surplus</span>
                    <span className="text-purple-400">{alliance.totalSurplus?.toFixed(1) || 0} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Rank</span>
                    <span className="text-orange-400">#--</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Create New Alliance */}
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Card className="bg-gray-800/30 border border-orange-900/30 flex items-center justify-center cursor-pointer hover:border-orange-700/50 transition-colors">
                <CardContent className="text-center py-6 sm:py-8">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-orange-400" />
                  </div>
                  <CardTitle className="text-base sm:text-lg text-orange-400 mb-1">Create Alliance</CardTitle>
                  <p className="text-xs text-gray-400">Start your own solar community</p>
                </CardContent>
              </Card>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border border-cyan-900/30 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-xl text-cyan-400">Create Solar Alliance</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="alliance-name" className="text-sm text-gray-300">Alliance Name *</Label>
                  <Input
                    id="alliance-name"
                    value={newAllianceName}
                    onChange={(e) => setNewAllianceName(e.target.value)}
                    placeholder="Enter alliance name..."
                    className="bg-gray-800 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alliance-description" className="text-sm text-gray-300">Description (optional)</Label>
                  <Textarea
                    id="alliance-description"
                    value={newAllianceDescription}
                    onChange={(e) => setNewAllianceDescription(e.target.value)}
                    placeholder="Describe your alliance's mission..."
                    className="bg-gray-800 border-gray-600 text-white resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateAlliance}
                    disabled={createAllianceMutation.isPending || !newAllianceName.trim()}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                  >
                    {createAllianceMutation.isPending ? "Creating..." : "Create Alliance"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
