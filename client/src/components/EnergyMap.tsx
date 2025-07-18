import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EnergyMap() {
  const [activeFilter, setActiveFilter] = useState('homes');

  const filters = [
    { id: 'homes', label: 'Homes' },
    { id: 'groups', label: 'Groups' },
    { id: 'alliances', label: 'Alliances' },
  ];

  const energyNodes = [
    { id: 1, x: 33, y: 25, type: 'high', color: 'cyber-cyan' },
    { id: 2, x: 75, y: 50, type: 'medium', color: 'cyber-orange' },
    { id: 3, x: 25, y: 67, type: 'low', color: 'cyber-purple' },
    { id: 4, x: 67, y: 33, type: 'high', color: 'green-500' },
    { id: 5, x: 50, y: 75, type: 'medium', color: 'yellow-400' },
  ];

  return (
    <Card className="bg-cyber-dark border-cyber-cyan/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold glow-text text-cyber-cyan">
            Energy Nodes Map
          </CardTitle>
          <div className="flex items-center space-x-2">
            {filters.map((filter) => (
              <Button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                variant={activeFilter === filter.id ? "default" : "outline"}
                size="sm"
                className={
                  activeFilter === filter.id
                    ? "bg-cyber-cyan/20 text-cyber-cyan border-cyber-cyan/50"
                    : "border-cyber-gray/50 text-gray-400 hover:bg-cyber-gray/20"
                }
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Map Container */}
        <div className="relative h-96 bg-cyber-gray/30 rounded-xl overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-dark to-cyber-gray/50 opacity-70"></div>
          
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg className="w-full h-full" viewBox="0 0 400 300">
              <defs>
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#00ffff" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Energy Nodes */}
          <div className="absolute inset-0">
            {energyNodes.map((node) => (
              <div key={node.id} className="absolute">
                <div
                  className={`w-4 h-4 bg-${node.color} rounded-full shadow-lg animate-pulse`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
                <div
                  className={`w-8 h-8 bg-${node.color}/20 rounded-full`}
                  style={{
                    left: `${node.x}%`,
                    top: `${node.y}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                ></div>
              </div>
            ))}
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-cyber-dark/80 p-3 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Legend</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-cyan rounded-full"></div>
                <span>High Output (&gt;10kW)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-orange rounded-full"></div>
                <span>Medium Output (5-10kW)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-cyber-purple rounded-full"></div>
                <span>Low Output (&lt;5kW)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
