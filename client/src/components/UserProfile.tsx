import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { User, Settings, MapPin, Zap } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function UserProfile() {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    location: user?.location || "",
    inverterBrand: user?.inverterBrand || "",
    profileVisibility: user?.profileVisibility || "public",
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      return await apiRequest('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData),
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-gray-800/50 rounded-lg animate-pulse"></div>
        <div className="h-64 bg-gray-800/50 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center mx-auto sm:mx-0">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="text-center sm:text-left">
              <h2 className="text-xl sm:text-2xl font-light text-white">
                {user?.firstName || user?.email || 'User'}
              </h2>
              <p className="text-cyan-400 text-xs sm:text-sm uppercase tracking-wider">
                TERRANODE OPERATOR
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Profile Settings */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Settings className="w-5 h-5 text-cyan-400" />
            <span>PROFILE SETTINGS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Label htmlFor="location" className="text-gray-300 text-xs sm:text-sm uppercase tracking-wider">
                Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter your location"
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 min-h-[44px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="inverterBrand" className="text-gray-300 text-sm uppercase tracking-wider">
                Inverter Brand
              </Label>
              <div className="relative">
                <Zap className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  id="inverterBrand"
                  type="text"
                  placeholder="e.g., Tesla, Enphase, SolarEdge"
                  value={formData.inverterBrand}
                  onChange={(e) => handleInputChange("inverterBrand", e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="profileVisibility" className="text-gray-300 text-sm uppercase tracking-wider">
                Profile Visibility
              </Label>
              <Select
                value={formData.profileVisibility}
                onValueChange={(value) => handleInputChange("profileVisibility", value)}
              >
                <SelectTrigger className="bg-gray-800/50 border-gray-700 text-white focus:border-cyan-400">
                  <SelectValue placeholder="Select visibility" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
            >
              {updateProfileMutation.isPending ? "Updating..." : "Update Profile"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Device Integration Placeholder */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Zap className="w-5 h-5 text-cyan-400" />
            <span>DEVICE INTEGRATION</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-light text-white">Connect Your Solar Inverter</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Link your solar inverter to TerraNode for real-time energy monitoring and automated data collection.
            </p>
            <Button
              variant="outline"
              className="border-cyan-600 text-cyan-400 hover:bg-cyan-600/10"
              disabled
            >
              Connect Device (Coming Soon)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}