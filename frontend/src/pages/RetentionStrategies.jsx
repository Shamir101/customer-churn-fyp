import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb } from 'lucide-react';

export default function RetentionStrategies() {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="max-w-7xl mx-auto py-12 px-4"
    >
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-orange-500 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-3">Retention Strategies</h1>
        <p className="text-gray-400 max-w-2xl mx-auto mb-8">
          Generate and track personalized retention strategies for at-risk customers.
        </p>

        <div className="bg-[#162032] rounded-2xl border border-gray-800 p-12">
          <div className="flex flex-col items-center gap-4">
            <Lightbulb className="h-16 w-16 text-gray-600" />
            <h2 className="text-2xl font-bold">Coming Soon</h2>
            <p className="text-gray-400">This page is being built...</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
