import React from 'react';
import { motion } from 'framer-motion';
import { Code2, Database, Zap, ExternalLink } from 'lucide-react';

export default function About() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const TechStack = [
    { icon: Code2, name: 'React + Vite', desc: 'Lightning-fast frontend with HMR' },
    { icon: Database, name: 'Flask + SQLAlchemy', desc: 'RESTful API with ORM data layer' },
    { icon: Zap, name: 'LightGBM & XGBoost', desc: 'Enterprise-grade ML prediction models' }
  ];

  return (
    <motion.div initial="hidden" animate="visible" variants={containerVariants} className="max-w-4xl mx-auto py-12">
      <motion.div variants={itemVariants} className="text-center mb-16">
        <h1 className="text-5xl font-bold mb-4">About ChurnSense</h1>
        <p className="text-xl text-gray-400">Intelligent customer churn prediction system built with modern AI and full-stack engineering.</p>
      </motion.div>

      {/* Project Overview */}
      <motion.div variants={itemVariants} className="bg-[#162032] p-8 rounded-2xl border border-gray-800 mb-12">
        <h2 className="text-2xl font-bold mb-4">The Vision</h2>
        <p className="text-gray-300 leading-relaxed mb-4">
          ChurnSense combines cutting-edge machine learning algorithms with an elegant user interface to predict which customers are at risk of leaving your service. By analyzing historical behavior patterns, our ensemble models (LightGBM + XGBoost) generate probability scores with 85.7% accuracy.
        </p>
        <p className="text-gray-300 leading-relaxed">
          The platform enables business teams to proactively deploy retention strategies, saving significant revenue and improving customer lifetime value across your entire customer base.
        </p>
      </motion.div>

      {/* Tech Stack */}
      <motion.div variants={itemVariants} className="mb-12">
        <h2 className="text-2xl font-bold mb-8">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TechStack.map((tech, i) => (
            <motion.div key={i} variants={itemVariants} className="bg-[#162032] p-6 rounded-xl border border-gray-800 hover:border-blue-500/30 transition-all">
              <div className="bg-blue-600/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <tech.icon className="text-blue-400 h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{tech.name}</h3>
              <p className="text-gray-400 text-sm">{tech.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Developer Info */}
      <motion.div variants={itemVariants} className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 p-8 rounded-2xl border border-gray-800">
        <h2 className="text-2xl font-bold mb-6">About the Developer</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-32 h-32 rounded-full bg-blue-500/20 border-2 border-blue-500 flex items-center justify-center">
            <Code2 className="h-16 w-16 text-blue-400" />
          </div>
          <div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Built with passion for the Final Year Project (FYP) program, ChurnSense demonstrates full-stack capabilities including data science, backend engineering, and modern frontend development.
            </p>
            <div className="flex gap-4">
              <a href="#" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink className="h-5 w-5" /> GitHub
              </a>
              <a href="#" className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink className="h-5 w-5" /> LinkedIn
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}