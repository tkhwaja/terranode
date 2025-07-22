import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sun, User, LogOut, Bell, Settings, Trophy, Users, Coins, Activity, Vote, Clock, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import WattTicker from "@/components/WattTicker";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Get notifications count for badge
  const { data: notifications } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000,
    enabled: !!user,
  });

  const unreadNotifications = Array.isArray(notifications) ? notifications.filter((n: any) => !n.isRead).length : 0;

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
      {/* Live WATT Ticker */}
      <WattTicker />
      
      {/* Navigation Header */}
      <header className="bg-gray-900/50 border-b border-cyan-900/30 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                <Sun className="w-6 h-6 text-cyan-400" />
              </div>
              <h1 className="text-xl font-light tracking-wider text-white hidden sm:block">TERRANODE</h1>
              <h1 className="text-lg font-light tracking-wider text-white sm:hidden">TERRA</h1>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-4">
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
                  {user && user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {user && user.firstName ? user.firstName : user && user.email ? user.email : 'User'}
                </span>
              </div>
              <Button 
                onClick={() => window.location.href = '/api/logout'}
                variant="outline"
                size="sm"
                className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              >
                <LogOut className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Navigation */}
          <TabsList className="hidden sm:grid w-full grid-cols-8 bg-gray-900/50 border border-cyan-900/30 h-auto gap-1 p-1">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Sun className="w-4 h-4" />
              <span>Overview</span>
            </TabsTrigger>
            <TabsTrigger 
              value="wallet" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Coins className="w-4 h-4" />
              <span>Wallet</span>
            </TabsTrigger>
            <TabsTrigger 
              value="milestones" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Trophy className="w-4 h-4" />
              <span>Milestones</span>
            </TabsTrigger>
            <TabsTrigger 
              value="uptime" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Activity className="w-4 h-4" />
              <span>Uptime</span>
            </TabsTrigger>
            <TabsTrigger 
              value="alliances" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Users className="w-4 h-4" />
              <span>Alliances</span>
            </TabsTrigger>
            <TabsTrigger 
              value="governance" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Vote className="w-4 h-4" />
              <span>Governance</span>
            </TabsTrigger>
            <TabsTrigger 
              value="notifications" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm relative"
            >
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
              {unreadNotifications > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs h-4 w-4 rounded-full flex items-center justify-center p-0">
                  {unreadNotifications}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-cyan-600/20 data-[state=active]:text-cyan-400 text-gray-300 flex items-center gap-2 py-2 px-3 text-sm"
            >
              <Settings className="w-4 h-4" />
              <span>Profile</span>
            </TabsTrigger>
          </TabsList>

          {/* Mobile Navigation - Horizontal Scroll + Hamburger Menu */}
          <div className="sm:hidden space-y-3 mb-4">
            {/* Current tab indicator with hamburger menu */}
            <div className="flex items-center justify-between bg-gray-900/50 border border-cyan-900/30 rounded-lg p-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-cyan-500/10 rounded-lg flex items-center justify-center">
                  {activeTab === "overview" && <Sun className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "wallet" && <Coins className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "milestones" && <Trophy className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "uptime" && <Activity className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "alliances" && <Users className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "governance" && <Vote className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "notifications" && <Bell className="w-5 h-5 text-cyan-400" />}
                  {activeTab === "profile" && <Settings className="w-5 h-5 text-cyan-400" />}
                </div>
                <span className="text-cyan-400 font-medium capitalize">
                  {activeTab === "overview" ? "Home" : activeTab}
                </span>
              </div>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-600/10"
                  >
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gray-950 border-cyan-900/30 w-80">
                  <SheetHeader>
                    <SheetTitle className="text-cyan-400 text-lg font-light">Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-2 mt-6">
                    {[
                      { value: "overview", icon: Sun, label: "Home" },
                      { value: "wallet", icon: Coins, label: "Wallet" },
                      { value: "milestones", icon: Trophy, label: "Milestones" },
                      { value: "uptime", icon: Activity, label: "Uptime" },
                      { value: "alliances", icon: Users, label: "Alliances" },
                      { value: "governance", icon: Vote, label: "Governance" },
                      { value: "notifications", icon: Bell, label: "Notifications" },
                      { value: "profile", icon: Settings, label: "Profile" },
                    ].map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={activeTab === value ? "secondary" : "ghost"}
                        className={`justify-start h-12 ${
                          activeTab === value
                            ? "bg-cyan-600/20 text-cyan-400 border-cyan-600/50"
                            : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-600/10"
                        }`}
                        onClick={() => {
                          setActiveTab(value);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon className="w-5 h-5 mr-3" />
                        <span>{label}</span>
                        {value === "notifications" && unreadNotifications > 0 && (
                          <Badge className="ml-auto bg-red-500 text-white text-xs h-5 w-5 rounded-full flex items-center justify-center p-0">
                            {unreadNotifications}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Horizontal scroll tabs as fallback */}
            <div className="overflow-x-auto scrollbar-hide">
              <div className="flex space-x-2 pb-2 whitespace-nowrap">
                {[
                  { value: "overview", icon: Sun, label: "Home" },
                  { value: "wallet", icon: Coins, label: "Wallet" },
                  { value: "milestones", icon: Trophy, label: "Goals" },
                  { value: "uptime", icon: Activity, label: "Uptime" },
                  { value: "alliances", icon: Users, label: "Teams" },
                  { value: "governance", icon: Vote, label: "Vote" },
                  { value: "notifications", icon: Bell, label: "Alerts" },
                  { value: "profile", icon: Settings, label: "Settings" },
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={activeTab === value ? "secondary" : "ghost"}
                    size="sm"
                    className={`flex-shrink-0 h-10 px-3 ${
                      activeTab === value
                        ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/50"
                        : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-600/10 border border-transparent"
                    }`}
                    onClick={() => setActiveTab(value)}
                  >
                    <Icon className="w-4 h-4 mr-1.5" />
                    <span className="text-xs font-medium">{label}</span>
                    {value === "notifications" && unreadNotifications > 0 && (
                      <Badge className="ml-1.5 bg-red-500 text-white text-xs h-4 w-4 rounded-full flex items-center justify-center p-0">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <EnergySnapshot />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <WattWallet />
              <ReferralSystem />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <EnergyChart />
              <EnergyMap />
            </div>
            
            {/* Test WATT Ticker Button - for testing live updates */}
            <div className="bg-gray-900/50 border border-cyan-900/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-cyan-400">Test Live WATT Ticker</h3>
                  <p className="text-sm text-gray-400 mt-1">Click to simulate earning WATT tokens and test the live ticker</p>
                </div>
                <Button
                  onClick={async () => {
                    try {
                      const response = await fetch('/api/test/token-update', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' }
                      });
                      const result = await response.json();
                      console.log('Test token update result:', result);
                    } catch (error) {
                      console.error('Test failed:', error);
                    }
                  }}
                  className="bg-cyan-600 hover:bg-cyan-700 text-white"
                >
                  <Coins className="w-4 h-4 mr-2" />
                  Test Earn WATT
                </Button>
              </div>
            </div>

          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <WattWallet />
              <TokenLedger />
            </div>
          </TabsContent>

          {/* Milestones Tab */}
          <TabsContent value="milestones" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Milestones />
          </TabsContent>

          {/* Uptime Tab */}
          <TabsContent value="uptime" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <UptimeTracker />
          </TabsContent>

          {/* Alliances Tab */}
          <TabsContent value="alliances" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <SolarAlliances />
          </TabsContent>

          {/* Governance Tab */}
          <TabsContent value="governance" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <AllianceGovernance allianceId={1} isLeader={true} />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <Notifications />
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            <UserProfile />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}