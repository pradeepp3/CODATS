import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Code, Users, Zap } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header/Navigation */}
      <header className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              CODATS
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center space-x-4">
            <Link
              to="/login"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
        <div className="text-center max-w-5xl w-full">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-full shadow-xl">
              <Shield className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            CODATS
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl lg:text-3xl text-slate-300 mb-6 font-light max-w-4xl mx-auto">
            Code Analysis & Threat Scanning System
          </p>
          
          <p className="text-base md:text-lg text-slate-400 mb-16 max-w-3xl mx-auto leading-relaxed">
            Detect vulnerabilities, analyze security threats, and protect your code with AI-powered scanning technology
          </p>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-16 max-w-4xl mx-auto">
            <div className="text-center p-6 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-blue-500/20 rounded-full">
                  <Code className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              <h3 className="font-semibold mb-3 text-lg text-white">Smart Analysis</h3>
              <p className="text-slate-400 text-sm leading-relaxed">AI-powered code analysis for multiple languages</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Shield className="h-8 w-8 text-green-400" />
                </div>
              </div>
              <h3 className="font-semibold mb-3 text-lg text-white">Security First</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Comprehensive vulnerability detection</p>
            </div>
            <div className="text-center p-6 rounded-xl bg-slate-800/30 backdrop-blur-sm border border-slate-700/50">
              <div className="flex justify-center mb-4">
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <Zap className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              <h3 className="font-semibold mb-3 text-lg text-white">Instant Results</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Real-time scanning and analysis</p>
            </div>
          </div>
        </div>

        {/* Animated background elements - better positioned */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-[10%] w-20 h-20 bg-blue-500/10 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-[15%] w-16 h-16 bg-purple-500/10 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-1/3 left-[15%] w-24 h-24 bg-green-500/10 rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 right-[10%] w-18 h-18 bg-yellow-500/10 rounded-full animate-pulse" style={{ animationDelay: '3s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default Home;