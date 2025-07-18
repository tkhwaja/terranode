import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sun, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import EnergySnapshot from "@/components/EnergySnapshot";
import EnergyChart from "@/components/EnergyChart";
import WattWallet from "@/components/WattWallet";
import ReferralSystem from "@/components/ReferralSystem";
import SolarAlliances from "@/components/SolarAlliances";
import EnergyMap from "@/components/EnergyMap";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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
      <div className="min-h-screen bg-cyber-black flex items-center justify-center">
        <div className="text-cyber-cyan text-xl">Loading...</div>
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
            
            <nav className="hidden md:flex space-x-8">
              <a href="#dashboard" className="hover:text-cyber-cyan transition-colors">Dashboard</a>
              <a href="#energy" className="hover:text-cyber-cyan transition-colors">Energy</a>
              <a href="#wallet" className="hover:text-cyber-cyan transition-colors">Wallet</a>
              <a href="#alliances" className="hover:text-cyber-cyan transition-colors">Alliances</a>
              <a href="#map" className="hover:text-cyber-cyan transition-colors">Map</a>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyber-cyan to-cyber-purple flex items-center justify-center">
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
                className="border-cyber-cyan/30 text-cyber-cyan hover:bg-cyber-cyan/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-2 glow-text text-cyber-cyan">
              Welcome back, {user?.firstName || 'Solar Producer'}!
            </h2>
            <p className="text-gray-400">Real-time monitoring of your solar energy production</p>
          </div>
        </section>

        {/* Live Energy Snapshot */}
        <section id="energy" className="mb-12">
          <EnergySnapshot />
        </section>

        {/* Historical Trends Chart */}
        <section className="mb-12">
          <EnergyChart />
        </section>

        {/* $WATT Token Simulation & Referral System */}
        <section id="wallet" className="mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <WattWallet />
            <ReferralSystem />
          </div>
        </section>

        {/* Solar Alliances */}
        <section id="alliances" className="mb-12">
          <SolarAlliances />
        </section>

        {/* Energy Map */}
        <section id="map" className="mb-12">
          <EnergyMap />
        </section>
      </main>
    </div>
  );
}
