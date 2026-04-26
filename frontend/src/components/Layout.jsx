import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white flex flex-col font-sans">
      <Navbar />
      {/* Offsets fixed navbar */}
      <main className="flex-grow pt-16 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Outlet />
      </main>
      
      <footer className="w-full border-t border-gray-800 py-6 mt-12 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} ChurnSense Intelligence. All rights reserved.</p>
        <p className="mt-1">Designed for FYP Demonstrations</p>
      </footer>
    </div>
  );
}
