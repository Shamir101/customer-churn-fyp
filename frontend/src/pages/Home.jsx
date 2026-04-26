import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Zap, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { staggerChildren: 0.15 } 
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1, 
      transition: { type: 'spring', stiffness: 50 } 
    }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={containerVariants} 
      className="py-12 md:py-24"
    >
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen mix-blend-lighten" />
        </div>

        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-sm font-medium text-blue-400 mb-8">
          <Zap className="h-4 w-4" />
          <span>Powered by LightGBM & XGBoost Intelligence</span>
        </motion.div>

        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-6">
          Predict Customer Churn with <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">Precision.</span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="mt-4 max-w-2xl mx-auto text-xl text-gray-400 mb-10">
          Proactively identify high-risk accounts, deploy targeted retention strategies, and secure your recurring revenue using next-generation AI pipelines.
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/predict">
            <button className="group flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all duration-300 ease-out transform hover:-translate-y-1">
              Start Predicting
              <ArrowRight className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
          <Link to="/dashboard">
            <button className="w-full sm:w-auto px-8 py-4 text-base font-medium rounded-lg text-gray-300 bg-[#162032] border border-gray-700 hover:text-white hover:bg-gray-800 transition-colors duration-200">
              View Analytics
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Features Section */}
      <motion.div variants={containerVariants} className="mt-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              icon: <BarChart3 className="h-8 w-8 text-blue-400" />,
              title: 'Deep Analytics',
              desc: 'Visualize risk distributions and dataset features inside our comprehensive intelligence dashboards.'
            },
            {
              icon: <Users className="h-8 w-8 text-cyan-400" />,
              title: 'Actionable Insights',
              desc: 'Translate complex probability scores into simple, strategic, targeted retention advice mapping your data.'
            },
            {
              icon: <ShieldCheck className="h-8 w-8 text-indigo-400" />,
              title: 'Secure Models',
              desc: 'Deploy safely behind modern REST endpoints powered by enterprise-grade Flask & JWT workflows.'
            }
          ].map((feature, i) => (
            <motion.div key={i} variants={itemVariants} className="relative group p-8 bg-[#162032] rounded-2xl border border-gray-800 hover:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="bg-[#0A1628] w-14 h-14 rounded-xl flex items-center justify-center border border-gray-800 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
