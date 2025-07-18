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
    { id: 1, x: 33, y: 25, type: 'high', power: 12.5 },
    { id: 2, x: 75, y: 50, type: 'medium', power: 7.8 },
    { id: 3, x: 25, y: 67, type: 'low', power: 3.2 },
    { id: 4, x: 67, y: 33, type: 'high', power: 11.0 },
    { id: 5, x: 50, y: 75, type: 'medium', power: 6.5 },
    { id: 6, x: 15, y: 30, type: 'high', power: 10.2 },
    { id: 7, x: 85, y: 20, type: 'low', power: 2.8 },
    { id: 8, x: 45, y: 45, type: 'medium', power: 8.1 },
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
            {energyNodes.map((node) => {
              const nodeColor = node.type === 'high' ? 'bg-cyan-400' : 
                               node.type === 'medium' ? 'bg-cyan-600' : 
                               'bg-cyan-800';
              const glowColor = node.type === 'high' ? 'shadow-cyan-400/50' : 
                               node.type === 'medium' ? 'shadow-cyan-600/50' : 
                               'shadow-cyan-800/50';
              
              return (
                <div key={node.id} className="absolute group cursor-pointer">
                  {/* Outer glow */}
                  <div
                    className={`absolute w-12 h-12 ${nodeColor} opacity-20 rounded-full blur-xl animate-pulse`}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  {/* Inner node */}
                  <div
                    className={`absolute w-3 h-3 ${nodeColor} rounded-full shadow-lg ${glowColor} animate-pulse transition-all hover:scale-150`}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  />
                  {/* Tooltip on hover */}
                  <div
                    className="absolute opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded pointer-events-none transition-opacity"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -150%)',
                    }}
                  >
                    {node.power} kW
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-gray-900/90 border border-cyan-900/30 p-3 rounded-lg backdrop-blur">
            <h4 className="text-xs text-cyan-400 uppercase tracking-wider mb-2">NODE OUTPUT</h4>
            <div className="space-y-1 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                <span className="text-gray-300">High Output (&gt;10kW)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-600 rounded-full shadow-lg shadow-cyan-600/50"></div>
                <span className="text-gray-300">Medium Output (5-10kW)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-cyan-800 rounded-full shadow-lg shadow-cyan-800/50"></div>
                <span className="text-gray-300">Low Output (&lt;5kW)</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
