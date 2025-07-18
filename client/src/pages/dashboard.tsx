import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sun, User, LogOut, Bell, Settings, Trophy, Users, Coins, Activity, Vote, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import EnergySnapshot from "@/components/EnergySnapshot";
import EnergyChart from "@/components/EnergyChart";
import WattWallet from "@/components/WattWallet";
import ReferralSystem from "@/components/ReferralSystem";
import SolarAlliances from "@/components/SolarAlliances";
import EnergyMap from "@/components/EnergyMap";
import UserProfile from "@/components/UserProfile";
import TokenLedger from "@/components/TokenLedger";
import Milestones from "@/components/Milestones";
import UptimeTracker from "@/components/UptimeTracker";
import Notifications from "@/components/Notifications";
import AllianceGovernance from "@/components/AllianceGovernance";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Get notifications count for badge
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadNotifications = notifications?.filter((n: any) => !n.isRead).length || 0;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-cyan-400 text-xl font-light">Loading TerraNode...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Navigation Header */}
      <header className="bg-gray-900/50 border-b border-cyan-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Sun className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-xl font-light tracking-wider text-white">TERRANODE</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveTab("notifications")}
                  className="text-gray-300 hover:text-white relative"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                  {user?.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium">
                  {user?.firstName || user?.email || 'User'}
                </span>
              </div>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                size="sm"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8 bg-gray-900/50 border border-cyan-900/30">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Sun className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Coins className="w-4 h-4 mr-2" />
              Wallet
            </TabsTrigger>
            <TabsTrigger 
              value="milestones" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Milestones
            </TabsTrigger>
            <TabsTrigger 
              value="uptime" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Activity className="w-4 h-4 mr-2" />
              Uptime
            </TabsTrigger>
            <TabsTrigger 
              value="alliances" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Alliances
            </TabsTrigger>
            <TabsTrigger 
              value="governance" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Vote className="w-4 h-4 mr-2" />
              Governance
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 relative"
            >
              <Bell className="w-4 h-4 mr-2" />
              Notifications
              {unreadNotifications > 0 && (
                <Badge className="ml-2 bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300"
            >
              <Settings className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergySnapshot />
              <WattWallet />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EnergyChart />
              <div className="space-y-6">
                <ReferralSystem />
                <div className="lg:col-span-2">
                  <EnergyMap />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <WattWallet />
              <TokenLedger />
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-6">
            <Milestones />
          </TabsContent>

          {/* Uptime Tab */}
          <TabsContent value="uptime" className="space-y-6">
            <UptimeTracker />
          </TabsContent>

          {/* Alliances Tab */}
          <TabsContent value="alliances" className="space-y-6">
            <SolarAlliances />
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-6">
            <AllianceGovernance allianceId={1} isLeader={true} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <Notifications />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}