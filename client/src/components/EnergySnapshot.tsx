import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Home, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function EnergySnapshot() {
  const { data: latestReading, isLoading } = useQuery({
    queryKey: ['/api/energy/latest'],
    refetchInterval: 5000, // Refresh every 5 seconds for real-time updates
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-cyber-dark border-cyber-cyan/20 holographic animate-pulse">
            <CardContent className="p-6">
              <div className="h-24 bg-cyber-gray/30 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const reading = latestReading || {
    solarGenerated: 0,
    energyConsumed: 0,
    surplusExported: 0,
    wattTokensEarned: 0
  };

  const solarPercent = Math.min((reading.solarGenerated / 10) * 100, 100);
  const consumedPercent = reading.solarGenerated > 0 ? (reading.energyConsumed / reading.solarGenerated) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Solar Generated */}
      <Card className="bg-cyber-dark/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Solar Generated</p>
              <CardTitle className="text-3xl font-light text-white">
                {reading.solarGenerated.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">kW</span>
              </CardTitle>
            </div>
            <div className="w-14 h-14 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <Sun className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Peak Capacity</span>
              <span className="text-cyan-400">{solarPercent.toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${solarPercent}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Energy Consumed */}
      <Card className="bg-cyber-dark/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Energy Consumed</p>
              <CardTitle className="text-3xl font-light text-white">
                {reading.energyConsumed.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">kW</span>
              </CardTitle>
            </div>
            <div className="w-14 h-14 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <Home className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Usage Rate</span>
              <span className="text-cyan-400">{Math.min(consumedPercent, 100).toFixed(0)}%</span>
            </div>
            <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-cyan-400 transition-all duration-500"
                style={{ width: `${Math.min(consumedPercent, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Surplus Exported */}
      <Card className="bg-cyber-dark/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-1">Surplus Exported</p>
              <CardTitle className="text-3xl font-light text-white">
                {reading.surplusExported.toFixed(1)}
                <span className="text-sm text-gray-500 ml-1">kW</span>
              </CardTitle>
            </div>
            <div className="w-14 h-14 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <Upload className="w-7 h-7 text-cyan-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-center py-2 px-3 rounded ${reading.surplusExported > 0 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-gray-800 text-gray-500'}`}>
            <p className="text-xs">
              {reading.surplusExported > 0
                ? `+${(reading.surplusExported * 0.75).toFixed(2)} WATT Earned`
                : 'No Surplus Currently'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
