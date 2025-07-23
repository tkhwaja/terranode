import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Coins, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BalanceUpdate {
  type: 'balance_update';
  balance: number;
  earned?: number;
  timestamp: string;
}

export default function WattTicker() {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [previousBalance, setPreviousBalance] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [earnedAmount, setEarnedAmount] = useState(0);
  const [showEarnedBadge, setShowEarnedBadge] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const earnedTimeoutRef = useRef<NodeJS.Timeout>();

  // Animate number changes
  const animateValue = (start: number, end: number, duration: number = 1000) => {
    if (start === end) return;
    
    setIsAnimating(true);
    const startTime = Date.now();
    const difference = end - start;

    const step = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Use easing function for smooth animation
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentValue = start + (difference * easeOutCubic);
      
      setBalance(Math.round(currentValue * 10) / 10);
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setBalance(end);
        setIsAnimating(false);
      }
    };
    
    requestAnimationFrame(step);
  };

  // Show earned badge
  const showEarnedNotification = (amount: number) => {
    setEarnedAmount(amount);
    setShowEarnedBadge(true);
    
    if (earnedTimeoutRef.current) {
      clearTimeout(earnedTimeoutRef.current);
    }
    
    earnedTimeoutRef.current = setTimeout(() => {
      setShowEarnedBadge(false);
    }, 3000);
  };

  // Connect to WebSocket
  const connectWebSocket = () => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('WATT Ticker WebSocket connected');
        // Subscribe to balance updates for this user
        ws.send(JSON.stringify({
          type: 'subscribe',
          userId: user.id
        }));
      };

      ws.onmessage = (event) => {
        try {
          const data: BalanceUpdate = JSON.parse(event.data);
          console.log('Received balance update:', data);
          
          if (data.type === 'balance_update') {
            setPreviousBalance(balance);
            
            // Show earned notification if balance increased
            if (data.earned && data.earned > 0) {
              showEarnedNotification(data.earned);
            }
            
            // Animate to new balance
            animateValue(balance, data.balance);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        console.log('WATT Ticker WebSocket disconnected');
        wsRef.current = null;
        
        // Attempt to reconnect after 3 seconds
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect WATT Ticker WebSocket...');
          connectWebSocket();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('WATT Ticker WebSocket error:', error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  // Polling fallback
  const startPolling = () => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/wallet');
        if (response.ok) {
          const data = await response.json();
          if (data.wattBalance !== balance) {
            const earned = data.wattBalance - balance;
            if (earned > 0) {
              showEarnedNotification(earned);
            }
            animateValue(balance, data.wattBalance);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, 10000); // Poll every 10 seconds as fallback

    return () => clearInterval(pollInterval);
  };

  useEffect(() => {
    if (!user) return;

    // Try WebSocket first, fallback to polling
    connectWebSocket();
    const stopPolling = startPolling();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (earnedTimeoutRef.current) {
        clearTimeout(earnedTimeoutRef.current);
      }
      stopPolling();
    };
  }, [user]);

  if (!user) return null;

  return (
    <div className="fixed top-20 right-4 z-40 hidden sm:block">
      <div className="bg-gray-900 border border-cyan-500/50 rounded-lg px-4 py-3 shadow-xl min-w-[140px]">
        <div className="flex items-center justify-center space-x-2">
          <Coins className={`w-5 h-5 text-cyan-400 ${isAnimating ? 'animate-spin' : ''}`} />
          <div className="flex items-center space-x-1">
            <span className="text-cyan-400 font-mono text-lg font-bold">
              {balance.toFixed(0)}
            </span>
            <span className="text-cyan-400/80 text-sm uppercase tracking-wider font-medium">
              WATT
            </span>
          </div>
          {isAnimating && (
            <TrendingUp className="w-4 h-4 text-green-400 animate-pulse" />
          )}
        </div>
        
        {/* Earned notification badge */}
        {showEarnedBadge && (
          <div className="absolute -top-3 -right-3 animate-bounce">
            <Badge className="bg-green-500 text-white border-green-400 text-xs px-2 py-1 font-semibold">
              +{earnedAmount.toFixed(1)} WATT
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}