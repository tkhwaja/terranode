import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn, Zap } from "lucide-react";

interface AuthPromptProps {
  title?: string;
  message?: string;
  icon?: React.ReactNode;
}

export default function AuthPrompt({ 
  title = "Authentication Required", 
  message = "Please log in to access this feature",
  icon = <LogIn className="w-6 h-6" />
}: AuthPromptProps) {
  return (
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          {icon}
        </div>
        <h3 className="text-lg font-medium text-cyan-400 mb-2">{title}</h3>
        <p className="text-sm text-gray-400 mb-4 max-w-sm mx-auto">{message}</p>
        <Button 
          onClick={() => window.location.href = '/api/login'}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <LogIn className="w-4 h-4 mr-2" />
          Log In with Replit
        </Button>
        <p className="text-xs text-gray-500 mt-3">
          Secure authentication powered by Replit
        </p>
      </CardContent>
    </Card>
  );
}