import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { config } from '../config';
import { analytics } from '../utils/analytics';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
} from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './Analytics.css';

ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement
);

const Analytics = ({ user }) => {
  const [stats, setStats] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    analytics.analyticsOpened(); // Track analytics page view
  }, []);

  const loadAnalytics = async () => {
    try {
      const [statsRes, recRes] = await Promise.all([
        axios.get(`${config.API_BASE}/stats`),
        axios.get(`${config.API_BASE}/stats/recommendations`)
      ]);

      setStats(statsRes.data.stats);
      setRecommendations(recRes.data.recommendations);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="analytics-loading">
        <div className="spinner"></div>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!stats || stats.totalOutfits === 0) {
    return (
      <div className="analytics">
        <div className="empty-state">
          <h2>No Analytics Available</h2>
          <p>Analyze some outfits first to see your style insights!</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const styleData = {
    labels: Object.keys(stats.styleCounts || {}),
    datasets: [{
      label: 'Outfits',
      data: Object.values(stats.styleCounts || {}),
      backgroundColor: [
        '#667eea',
        '#764ba2',
        '#f093fb',
        '#4facfe',
        '#00f2fe',
        '#43e97b',
        '#fa709a',
        '#fee140',
        '#30cfd0',
        '#a8edea'
      ]
    }]
  };

  const topColors = Object.entries(stats.colorCounts || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const colorData = {
    labels: topColors.map(([color]) => color),
    datasets: [{
      label: 'Frequency',
      data: topColors.map(([, count]) => count),
      backgroundColor: '#667eea'
    }]
  };

  return (
    <div className="analytics">
      <div className="analytics-header">
        <h1>Style Analytics</h1>
        <button onClick={loadAnalytics} className="refresh-btn">Refresh</button>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h2>Style Categories</h2>
          <Pie data={styleData} options={{ responsive: true, maintainAspectRatio: true }} />
        </div>

        <div className="chart-card">
          <h2>Top Colors</h2>
          <Bar
            data={colorData}
            options={{
              responsive: true,
              maintainAspectRatio: true,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
      </div>

      {recommendations && (
        <div className="recommendations-section">
          <h2>AI Recommendations</h2>
          <div className="recommendations-grid">
            {recommendations.recommendedStyles && (
              <div className="recommendation-card">
                <h3>Recommended Styles</h3>
                <ul>
                  {recommendations.recommendedStyles.map((style, idx) => (
                    <li key={idx}>{style}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.colorSuggestions && (
              <div className="recommendation-card">
                <h3>Color Suggestions</h3>
                <ul>
                  {recommendations.colorSuggestions.map((color, idx) => (
                    <li key={idx}>{color}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.tips && (
              <div className="recommendation-card">
                <h3>Styling Tips</h3>
                <ul>
                  {recommendations.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {recommendations.nextOutfitIdeas && (
              <div className="recommendation-card">
                <h3>Next Outfit Ideas</h3>
                <ul>
                  {recommendations.nextOutfitIdeas.map((idea, idx) => (
                    <li key={idx}>{idea}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;

