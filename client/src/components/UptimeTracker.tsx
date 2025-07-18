import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Activity, Calendar, TrendingUp, Clock } from "lucide-react";
import { format, subDays, isToday, isYesterday } from "date-fns";

export default function UptimeTracker() {
  const { data: uptimeStats, isLoading } = useQuery({
    queryKey: ['/api/uptime/stats'],
    refetchInterval: 60000, // Update every minute
  });

  if (isLoading) {
    return (
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-800/50 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-800/50 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const stats = uptimeStats || [];
  const today = new Date();
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, i);
    const dateString = format(date, 'yyyy-MM-dd');
    const dayStats = stats.find((s: any) => s.date === dateString);
    return {
      date,
      dateString,
      uptimeMinutes: dayStats?.uptimeMinutes || 0,
      totalMinutes: dayStats?.totalMinutes || 1440,
      isActive: dayStats?.isActive || false,
    };
  }).reverse();

  const currentUptime = last7Days[last7Days.length - 1];
  const uptimePercentage = (currentUptime.uptimeMinutes / currentUptime.totalMinutes) * 100;
  
  const weeklyAverage = last7Days.reduce((sum, day) => 
    sum + (day.uptimeMinutes / day.totalMinutes), 0) / 7 * 100;

  const getUptimeColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (percentage >= 70) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-red-400 bg-red-500/20 border-red-500/30';
  };

  const getUptimeStatus = (percentage: number) => {
    if (percentage >= 90) return 'Excellent';
    if (percentage >= 70) return 'Good';
    return 'Poor';
  };

  const formatDayLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    return format(date, 'MMM d');
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <span>UPTIME TRACKER</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-cyan-400 mb-2">
                {uptimePercentage.toFixed(1)}%
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                Today's Uptime
              </p>
              <Badge variant="outline" className={`mt-2 ${getUptimeColor(uptimePercentage)}`}>
                {getUptimeStatus(uptimePercentage)}
              </Badge>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-purple-400 mb-2">
                {weeklyAverage.toFixed(1)}%
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                Weekly Average
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-light text-green-400 mb-2">
                {Math.floor(currentUptime.uptimeMinutes / 60)}h
              </div>
              <p className="text-xs sm:text-sm text-gray-400 uppercase tracking-wider">
                Hours Online Today
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            <span>WEEKLY OVERVIEW</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {last7Days.map((day, index) => {
              const percentage = (day.uptimeMinutes / day.totalMinutes) * 100;
              const hours = Math.floor(day.uptimeMinutes / 60);
              const minutes = day.uptimeMinutes % 60;

              return (
                <div
                  key={index}
                  className="text-center p-2 sm:p-3 bg-gray-800/30 rounded-lg border border-gray-700/50 hover:border-cyan-600/30 transition-colors"
                >
                  <div className="text-xs text-gray-400 mb-1 sm:mb-2 uppercase tracking-wider">
                    {format(day.date, 'EEE')}
                  </div>
                  <div className="text-sm sm:text-lg font-medium text-white mb-1 sm:mb-2">
                    {formatDayLabel(day.date) === 'Today' || formatDayLabel(day.date) === 'Yesterday' 
                      ? formatDayLabel(day.date).slice(0, 3) 
                      : format(day.date, 'd')}
                  </div>
                  <div className="mb-1 sm:mb-2">
                    <Progress value={percentage} className="h-1 sm:h-2" />
                  </div>
                  <div className="text-xs text-gray-400 hidden sm:block">
                    {hours}h {minutes}m
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {percentage.toFixed(0)}%
                  </div>
                  {day.isActive && (
                    <div className="mt-1 sm:mt-2">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full mx-auto"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Uptime Insights */}
      <Card className="bg-gray-900/80 border border-cyan-900/30 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-light text-white flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            <span>UPTIME INSIGHTS</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5 text-cyan-400" />
                <div>
                  <p className="text-white font-medium">Best Day This Week</p>
                  <p className="text-sm text-gray-400">
                    {format(last7Days.reduce((best, day) => 
                      (day.uptimeMinutes > best.uptimeMinutes) ? day : best
                    ).date, 'EEEE, MMM d')}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-green-400">
                  {(last7Days.reduce((best, day) => 
                    (day.uptimeMinutes > best.uptimeMinutes) ? day : best
                  ).uptimeMinutes / 1440 * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Activity className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-white font-medium">Streak Status</p>
                  <p className="text-sm text-gray-400">
                    Current uptime streak
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-purple-400">
                  {last7Days.filter(day => day.uptimeMinutes > 0).length} days
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-white font-medium">Reliability Score</p>
                  <p className="text-sm text-gray-400">
                    Based on consistency
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-medium text-yellow-400">
                  {weeklyAverage >= 90 ? 'A+' : weeklyAverage >= 80 ? 'A' : 
                   weeklyAverage >= 70 ? 'B' : weeklyAverage >= 60 ? 'C' : 'D'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}