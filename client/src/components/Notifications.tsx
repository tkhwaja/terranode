import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, Trophy, Users, Coins, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Notifications() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['/api/notifications'],
    refetchInterval: 30000, // Check for new notifications every 30 seconds
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      return await apiRequest(`/api/notifications/${notificationId}/read`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive",
      });
    },
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'token_threshold':
        return <Coins className="w-5 h-5 text-green-400" />;
      case 'referral_bonus':
        return <Users className="w-5 h-5 text-blue-400" />;
      case 'group_invite':
        return <Users className="w-5 h-5 text-purple-400" />;
      case 'milestone_unlocked':
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      default:
        return <Bell className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    const opacity = isRead ? '20' : '30';
    switch (type) {
      case 'token_threshold':
        return `bg-green-500/${opacity} border-green-500/30`;
      case 'referral_bonus':
        return `bg-blue-500/${opacity} border-blue-500/30`;
      case 'group_invite':
        return `bg-purple-500/${opacity} border-purple-500/30`;
      case 'milestone_unlocked':
        return `bg-yellow-500/${opacity} border-yellow-500/30`;
      default:
        return `bg-cyan-500/${opacity} border-cyan-500/30`;
    }
  };

  const formatNotificationType = (type: string) => {
    switch (type) {
      case 'token_threshold':
        return 'Token Milestone';
      case 'referral_bonus':
        return 'Referral Bonus';
      case 'group_invite':
        return 'Group Invite';
      case 'milestone_unlocked':
        return 'Achievement';
      default:
        return 'Notification';
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800/50 rounded w-1/3"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const notificationList = notifications || [];
  const unreadCount = notificationList.filter((n: any) => !n.isRead).length;

  return (
    <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            <span>NOTIFICATIONS</span>
          </CardTitle>
          {unreadCount > 0 && (
            <Badge variant="outline" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
              {unreadCount} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {notificationList.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <BellOff className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No notifications yet</p>
              <p className="text-sm">We'll notify you about important updates!</p>
            </div>
          ) : (
            notificationList.map((notification: any) => (
              <div
                key={notification.id}
                className={`relative p-3 sm:p-4 rounded-lg border transition-all duration-200 ${
                  notification.isRead 
                    ? 'bg-gray-800/20 border-gray-700/30' 
                    : `${getNotificationColor(notification.type, notification.isRead)} hover:bg-opacity-40`
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 sm:space-x-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-700/50 flex items-center justify-center mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {formatNotificationType(notification.type)}
                        </Badge>
                        {!notification.isRead && (
                          <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                        )}
                      </div>
                      <h4 className="font-medium text-white mb-1 text-sm sm:text-base">
                        {notification.title}
                      </h4>
                      <p className="text-xs sm:text-sm text-gray-400 mb-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <span>
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                        <span>
                          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                        </span>
                      </div>
                    </div>
                  </div>
                  {!notification.isRead && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsReadMutation.mutate(notification.id)}
                      disabled={markAsReadMutation.isPending}
                      className="text-gray-400 hover:text-white"
                    >
                      <Check className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}