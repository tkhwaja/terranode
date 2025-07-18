import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function EnergyChart() {
  const { data: readings, isLoading } = useQuery({
    queryKey: ['/api/energy/readings'],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <Card className="bg-cyber-dark border-cyber-cyan/20">
        <CardHeader>
          <CardTitle className="text-2xl font-bold glow-text text-cyber-cyan">
            Historical Energy Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-cyber-gray/20 rounded animate-pulse flex items-center justify-center">
            <div className="text-cyber-cyan">Loading chart data...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartReadings = readings || [];
  const reversedReadings = [...chartReadings].reverse();

  const chartData = {
    labels: reversedReadings.map((reading: any) => 
      new Date(reading.timestamp).toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    ),
    datasets: [{
      label: 'Solar Generated',
      data: reversedReadings.map((reading: any) => reading.solarGenerated),
      borderColor: '#ff6b35',
      backgroundColor: 'rgba(255, 107, 53, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#ff6b35',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    }, {
      label: 'Energy Consumed',
      data: reversedReadings.map((reading: any) => reading.energyConsumed),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#8b5cf6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    }, {
      label: 'Surplus Exported',
      data: reversedReadings.map((reading: any) => reading.surplusExported),
      borderColor: '#00ffff',
      backgroundColor: 'rgba(0, 255, 255, 0.1)',
      tension: 0.4,
      fill: true,
      pointRadius: 3,
      pointHoverRadius: 6,
      pointBackgroundColor: '#00ffff',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
    }]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        labels: {
          color: '#ffffff',
          font: {
            size: 12,
            family: 'Inter',
          },
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        backgroundColor: 'rgba(10, 10, 10, 0.9)',
        titleColor: '#00ffff',
        bodyColor: '#ffffff',
        borderColor: '#00ffff',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          family: 'Inter',
        },
        bodyFont: {
          size: 12,
          family: 'Inter',
        },
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)} kW`;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#94a3b8',
          maxTicksLimit: 8,
          font: {
            size: 11,
            family: 'Inter',
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        border: {
          color: 'rgba(148, 163, 184, 0.2)',
        }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          font: {
            size: 11,
            family: 'Inter',
          },
          callback: function(value) {
            return `${value} kW`;
          }
        },
        grid: {
          color: 'rgba(148, 163, 184, 0.1)',
          lineWidth: 1,
        },
        border: {
          color: 'rgba(148, 163, 184, 0.2)',
        }
      }
    },
    elements: {
      line: {
        borderWidth: 2,
      }
    }
  };

  return (
    <Card className="bg-cyber-dark border-cyber-cyan/20 shadow-cyber">
      <CardHeader>
        <CardTitle className="text-2xl font-bold glow-text text-cyber-cyan">
          Historical Energy Trends
        </CardTitle>
        <p className="text-gray-400 text-sm">
          24-hour energy production and consumption data
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-96 relative">
          {chartReadings.length > 0 ? (
            <Line data={chartData} options={options} />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p className="text-lg">No energy data available</p>
                <p className="text-sm">Data will appear as your solar system generates energy</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
