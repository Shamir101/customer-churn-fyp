import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, AlertCircle, BarChart3 } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, avgChurn: 0, highRisk: 0 });

  useEffect(() => {
    // Simulate fetching stats
    setStats({ total: 1247, avgChurn: 34.2, highRisk: 312 });
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const StatCard = ({ icon: Icon, label, value, trend }) => (
    <motion.div variants={itemVariants} className="bg-[#162032] p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all">
      <div className="flex items-center justify-between mb-4">
        <div className="bg-blue-600/20 p-3 rounded-lg"><Icon className="text-blue-400 h-6 w-6" /></div>
        {trend && <span className="text-sm text-green-400">{trend}</span>}
      </div>
      <p className="text-gray-400 text-sm">{label}</p>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </motion.div>
  );

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-7xl mx-auto py-12">
      <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
      <p className="text-gray-400 mb-8">Real-time insights into customer churn patterns and model performance.</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard icon={Users} label="Total Predictions" value={stats.total.toLocaleString()} trend="+12.5%" />
        <StatCard icon={TrendingUp} label="Avg Churn Rate" value={`${stats.avgChurn.toFixed(1)}%`} trend="-2.3%" />
        <StatCard icon={AlertCircle} label="High-Risk Accounts" value={stats.highRisk.toLocaleString()} trend="+18%" />
        <StatCard icon={BarChart3} label="Model Accuracy" value="85.7%" trend="+3.2%" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        <motion.div variants={itemVariants} className="bg-[#162032] p-8 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold mb-6">Churn Distribution (30 Days)</h3>
          <Bar
            data={{
              labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
              datasets: [{
                label: 'Churn Cases',
                data: [45, 62, 38, 51],
                backgroundColor: '#2563EB',
                borderRadius: 8,
                borderSkipped: false
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }, x: { ticks: { color: '#9CA3AF' }, grid: { display: false } } }
            }}
          />
        </motion.div>

        <motion.div variants={itemVariants} className="bg-[#162032] p-8 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold mb-6">Model Performance (30 Days)</h3>
          <Line
            data={{
              labels: ['Day 1', 'Day 7', 'Day 14', 'Day 21', 'Day 30'],
              datasets: [{
                label: 'Accuracy %',
                data: [83, 84.2, 85.1, 85.5, 85.7],
                borderColor: '#06B6D4',
                backgroundColor: 'rgba(6, 182, 212, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#06B6D4',
                pointBorderColor: '#fff',
                pointRadius: 6
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true, min: 80, max: 90, ticks: { color: '#9CA3AF' }, grid: { color: '#374151' } }, x: { ticks: { color: '#9CA3AF' }, grid: { display: false } } }
            }}
          />
        </motion.div>
      </div>

      {/* Recent Predictions Table */}
      <motion.div variants={itemVariants} className="bg-[#162032] p-8 rounded-xl border border-gray-800">
        <h3 className="text-lg font-bold mb-6">Recent Predictions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-700">
              <tr className="text-left text-gray-400">
                <th className="pb-3 font-semibold">Customer ID</th>
                <th className="pb-3 font-semibold">Tenure</th>
                <th className="pb-3 font-semibold">Churn Prob</th>
                <th className="pb-3 font-semibold">Risk Level</th>
                <th className="pb-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {[
                { id: 'CUST001', tenure: '24 mo', prob: 0.78, risk: 'High' },
                { id: 'CUST002', tenure: '12 mo', prob: 0.45, risk: 'Medium' },
                { id: 'CUST003', tenure: '36 mo', prob: 0.12, risk: 'Low' },
                { id: 'CUST004', tenure: '6 mo', prob: 0.82, risk: 'High' },
                { id: 'CUST005', tenure: '48 mo', prob: 0.35, risk: 'Medium' }
              ].map((row, i) => (
                <tr key={i} className="border-b border-gray-800 hover:bg-[#0A1628]/50 transition-colors">
                  <td className="py-4">{row.id}</td>
                  <td className="py-4 text-gray-400">{row.tenure}</td>
                  <td className="py-4"><span className="font-mono">{(row.prob * 100).toFixed(1)}%</span></td>
                  <td className="py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${row.risk === 'High' ? 'bg-red-500/20 text-red-400' : row.risk === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                      {row.risk}
                    </span>
                  </td>
                  <td className="py-4 text-gray-500">Today</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}