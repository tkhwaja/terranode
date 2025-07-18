import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sun, Zap, Users, MapPin } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cyber-black text-white">
      {/* Header */}
      <header className="bg-cyber-dark border-b border-cyber-cyan/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-lg flex items-center justify-center shadow-cyber">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold glow-text text-cyber-cyan">TerraNode</h1>
            </div>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-cyber-cyan hover:bg-cyber-cyan/80 text-cyber-black font-semibold"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-5xl font-bold mb-6 glow-text text-cyber-cyan">
            The Future of Solar Energy
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Track, visualize, and monetize your clean energy production with TerraNode. 
            Join the solar revolution and earn WATT tokens while building a sustainable future.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-cyber-orange hover:bg-cyber-orange/80 text-white font-semibold px-8 py-3 text-lg"
          >
            Start Your Solar Journey
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center mb-12 glow-text text-cyber-cyan">
            Powerful Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <Sun className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-cyber-orange">Live Energy Monitoring</CardTitle>
                <CardDescription className="text-gray-400">
                  Real-time tracking of solar generation, consumption, and surplus export
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyber-cyan to-cyber-purple rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-cyber-cyan">WATT Token Rewards</CardTitle>
                <CardDescription className="text-gray-400">
                  Earn tokens for every kW of surplus energy you contribute to the grid
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-cyber-purple to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-cyber-purple">Solar Alliances</CardTitle>
                <CardDescription className="text-gray-400">
                  Join communities of solar producers and compete in group challenges
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-cyber-dark border-cyber-cyan/20 holographic">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-green-400">Energy Map</CardTitle>
                <CardDescription className="text-gray-400">
                  Visualize the solar energy network and discover nearby producers
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-cyber-gray/10">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6 glow-text text-cyber-cyan">
            Ready to Transform Your Solar Experience?
          </h3>
          <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of solar producers who are already earning WATT tokens 
            and building the future of clean energy.
          </p>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            className="bg-cyber-cyan hover:bg-cyber-cyan/80 text-cyber-black font-semibold px-8 py-3 text-lg"
          >
            Get Started Now
          </Button>
        </div>
      </section>
    </div>
  );
}
