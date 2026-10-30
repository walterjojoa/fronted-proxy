import { BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartColumn } from 'lucide-react';
import { formatCompact, formatNumber, parseLocalDate } from '../utils/format.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip);

function barGradient(context, isToday) {
  const { chart } = context;
  const { ctx, chartArea } = chart;
  if (!chartArea) {
    return isToday ? '#ec4899' : '#818cf8';
  }
  const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
  if (isToday) {
    gradient.addColorStop(0, '#f472b6');
    gradient.addColorStop(1, '#db2777');
  } else {
    gradient.addColorStop(0, '#a5b4fc');
    gradient.addColorStop(1, '#6366f1');
  }
  return gradient;
}

export default function UsageChart({ history, loading }) {
  if (loading && history.length === 0) {
    return <div className="card skeleton-card skeleton-card--tall" />;
  }

  const lastIndex = history.length - 1;
  const totalTokens = history.reduce((sum, day) => sum + day.tokens, 0);
  const totalRequests = history.reduce((sum, day) => sum + day.requests, 0);

  const data = {
    labels: history.map((day, index) =>
      index === lastIndex ? 'Today' : parseLocalDate(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    ),
    datasets: [
      {
        label: 'Tokens',
        data: history.map((day) => day.tokens),
        backgroundColor: (context) => barGradient(context, context.dataIndex === lastIndex),
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 34,
        minBarLength: 3,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 600 },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e1b4b',
        padding: 10,
        cornerRadius: 10,
        displayColors: false,
        callbacks: {
          title: (items) => parseLocalDate(history[items[0].dataIndex].date).toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
          }),
          label: (item) => {
            const day = history[item.dataIndex];
            return [`${formatNumber(day.tokens)} tokens`, `${day.requests} requests`];
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: { color: '#64748b', font: { family: 'Inter', size: 11, weight: 600 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(148, 163, 184, 0.18)' },
        border: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { family: 'Inter', size: 11 },
          maxTicksLimit: 5,
          precision: 0,
          callback: (value) => formatCompact(value),
        },
      },
    },
  };

  return (
    <div className="card stat-card">
      <div className="card-header">
        <span className="card-icon card-icon--cyan">
          <ChartColumn size={18} />
        </span>
        <div>
          <h3>Usage · last 7 days</h3>
          <p className="muted small">
            {formatNumber(totalTokens)} tokens · {totalRequests} requests
          </p>
        </div>
      </div>
      <div className="chart-container">
        <Bar data={data} options={options} aria-label="Daily token usage for the last 7 days" role="img" />
      </div>
    </div>
  );
}
