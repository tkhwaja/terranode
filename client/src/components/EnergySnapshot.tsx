import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Home, Upload } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function EnergySnapshot() {
  const { data: latestReading, isLoading } = useQuery({
    queryKey: ['/api/energy/latest'],
    refetchInterval: 30000, // Refresh every 30 seconds
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
      <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Solar Generated</CardTitle>
                <p className="text-sm text-gray-400">Current Production</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyber-orange glow-text">
                {reading.solarGenerated.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">kW</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={solarPercent} className="mb-2" />
          <div className="text-sm text-gray-400">{solarPercent.toFixed(0)}% of peak capacity</div>
        </CardContent>
      </Card>

      {/* Energy Consumed */}
      <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Home className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Energy Consumed</CardTitle>
                <p className="text-sm text-gray-400">Home Usage</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyber-purple glow-text">
                {reading.energyConsumed.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">kW</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={Math.min(consumedPercent, 100)} className="mb-2" />
          <div className="text-sm text-gray-400">{consumedPercent.toFixed(0)}% of generation</div>
        </CardContent>
      </Card>

      {/* Surplus Exported */}
      <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Surplus Exported</CardTitle>
                <p className="text-sm text-gray-400">Grid Export</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-cyber-cyan glow-text">
                {reading.surplusExported.toFixed(1)}
              </div>
              <div className="text-sm text-gray-400">kW</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={reading.surplusExported > 0 ? 100 : 0} className="mb-2" />
          <div className="text-sm text-gray-400">
            {reading.surplusExported > 0 ? 'Earning WATT tokens' : 'No surplus'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
