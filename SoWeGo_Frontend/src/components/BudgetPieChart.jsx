import { motion } from 'framer-motion'
import { Pie } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { IndianRupee } from 'lucide-react'

ChartJS.register(ArcElement, Tooltip, Legend);

const BudgetPieChart = ({ data }) => {
  // Updated: Use data directly since we pass content.budget from ChatMessage
  const plan = data;

  // Added: Fallback to prevent crashes if the AI misses the breakdown array
  if (!plan || !plan.breakdown) return null;

  const chartData = {
    labels: plan.breakdown.map(item => (item.category || '').split(' (')[0].trim()),
    datasets: [
      {
        data: plan.breakdown.map(item => item.amount),
        // 🛡️ CYBER-GLASS COLOR PALETTE
        backgroundColor: [
          'rgba(20, 255, 236, 0.8)', // Cyber Teal
          'rgba(168, 85, 247, 0.8)',  // Electric Purple
          'rgba(37, 99, 235, 0.8)',   // Deep Blue
          'rgba(20, 255, 236, 0.4)',  // Muted Teal
          'rgba(139, 92, 246, 0.4)',  // Muted Purple
          'rgba(30, 41, 59, 0.8)',    // Slate
        ],
        borderColor: 'rgba(0, 0, 0, 0.5)',
        borderWidth: 2,
        hoverOffset: 15,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: 'rgba(255, 255, 255, 0.5)',
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(5, 5, 5, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 12,
        displayColors: true,
      }
    },
  };

  return (
    <motion.div
      className="w-full bg-white/5 backdrop-blur-xl rounded-[24px] overflow-hidden shadow-2xl border border-white/10"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="p-8 bg-gradient-to-br from-[#14FFEC]/10 to-purple-600/10 border-b border-white/5">
        <h2 className="text-xl font-bold text-white mb-2 tracking-tight">{plan.title}</h2>
        <div className="flex items-center gap-2 text-[#14FFEC]">
          <IndianRupee className="w-5 h-5" />
          <span className="text-2xl font-black">{plan.total_budget}</span>
        </div>
      </div>

      <div className="p-8 h-80 md:h-96">
        <Pie data={chartData} options={chartOptions} />
      </div>
    </motion.div>
  );
};

export default BudgetPieChart;