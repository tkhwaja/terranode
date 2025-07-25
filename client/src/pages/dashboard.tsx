import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sun, User, LogOut, Bell, Settings, Trophy, Users, Coins, Activity, Vote, Clock, MapPin, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
// Removed Tabs import - using simple state-based navigation instead
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
import AlliancePulseBar from "@/components/AlliancePulseBar";
import DailyMissionCard from "@/components/DailyMissionCard";

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
      {/* Hidden text for screen readers - ensure it's properly hidden */}
      <span className="sr-only" aria-hidden="true">TerraNode Solar Energy Dashboard</span>
      
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
                  {user && (user as any).profileImageUrl ? (
                    <img src={(user as any).profileImageUrl} alt="Profile" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <User className="w-4 h-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  {user && (user as any).firstName ? (user as any).firstName : user && (user as any).email ? (user as any).email : 'User'}
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
        <div className="w-full">
          {/* Navigation - Hamburger Menu for all screen sizes */}
          <div className="mb-4">
            <div className="flex items-center justify-between bg-gray-900/50 border border-cyan-900/30 rounded-lg p-3">
              <div className="flex items-center gap-3">
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
                <div>
                  <span className="text-cyan-400 font-medium capitalize text-lg">
                    {activeTab === "overview" ? "Home" : activeTab}
                  </span>
                  {activeTab === "notifications" && unreadNotifications > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white text-xs">
                      {unreadNotifications} new
                    </Badge>
                  )}
                </div>
              </div>

              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:text-cyan-400 hover:bg-cyan-600/10 p-2"
                  >
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-gray-950 border-cyan-900/30 w-80">
                  <SheetHeader>
                    <SheetTitle className="text-cyan-400 text-xl font-light">Navigation</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col space-y-3 mt-8">
                    {[
                      { value: "overview", icon: Sun, label: "Home Overview" },
                      { value: "wallet", icon: Coins, label: "WATT Wallet" },
                      { value: "milestones", icon: Trophy, label: "Milestones & Goals" },
                      { value: "uptime", icon: Activity, label: "System Uptime" },
                      { value: "alliances", icon: Users, label: "Solar Alliances" },
                      { value: "governance", icon: Vote, label: "Alliance Governance" },
                      { value: "notifications", icon: Bell, label: "Notifications" },
                      { value: "profile", icon: Settings, label: "Profile & Settings" },
                    ].map(({ value, icon: Icon, label }) => (
                      <Button
                        key={value}
                        variant={activeTab === value ? "secondary" : "ghost"}
                        className={`justify-start h-14 px-4 ${
                          activeTab === value
                            ? "bg-cyan-600/20 text-cyan-400 border border-cyan-600/50"
                            : "text-gray-300 hover:text-cyan-400 hover:bg-cyan-600/10"
                        }`}
                        onClick={() => {
                          setActiveTab(value);
                          setIsMenuOpen(false);
                        }}
                      >
                        <Icon className="w-5 h-5 mr-4" />
                        <span className="text-sm">{label}</span>
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
          </div>



          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-4 sm:space-y-6">
            <EnergySnapshot />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <WattWallet />
              <ReferralSystem />
            </div>

            {/* Alliance Pulse - Community Progress */}
            <AlliancePulseBar />

            {/* Daily Mission - Gamified Goals */}
            <DailyMissionCard />

            <div className="grid grid-cols-1 gap-4 sm:gap-6">
              <EnergyChart />
              <EnergyMap />
            </div>
            
            {/* Demo Data Seeder - for presentations and demos */}
            <div className="bg-gray-900/50 border border-cyan-900/30 rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-cyan-400">Demo Data Seeder</h3>
                  <p className="text-sm text-gray-400 mt-1">Generate realistic energy and token data for the last 7 days</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/seed-demo-data', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ days: 7, hoursPerDay: 24 })
                        });
                        const result = await response.json();
                        console.log('Demo data seeded:', result);
                        toast({
                          title: "Demo Data Generated",
                          description: `Created ${result.energyRecords} energy readings and earned ${result.totalTokensEarned} WATT tokens`,
                        });
                      } catch (error) {
                        console.error('Seeding failed:', error);
                        toast({
                          title: "Error",
                          description: "Failed to generate demo data",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                  >
                    <Coins className="w-4 h-4 mr-2" />
                    Seed Demo Data
                  </Button>
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
                    variant="outline"
                    className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
                  >
                    Test Ticker
                  </Button>
                </div>
              </div>
            </div>

            </div>
          )}

          {/* Wallet Tab */}
          {activeTab === "wallet" && (
            <div className="space-y-4 sm:space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <WattWallet />
                <TokenLedger />
              </div>
            </div>
          )}

          {/* Milestones Tab */}
          {activeTab === "milestones" && (
            <div className="space-y-4 sm:space-y-6">
              <Milestones />
            </div>
          )}

          {/* Uptime Tab */}
          {activeTab === "uptime" && (
            <div className="space-y-4 sm:space-y-6">
              <UptimeTracker />
            </div>
          )}

          {/* Alliances Tab */}
          {activeTab === "alliances" && (
            <div className="space-y-4 sm:space-y-6">
              <SolarAlliances />
            </div>
          )}

          {/* Governance Tab */}
          {activeTab === "governance" && (
            <div className="space-y-4 sm:space-y-6">
              <AllianceGovernance allianceId={1} isLeader={true} />
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="space-y-4 sm:space-y-6">
              <Notifications />
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4 sm:space-y-6">
              <UserProfile />
            </div>
          )}
        </div>
      </main>
    </div>
  );
}