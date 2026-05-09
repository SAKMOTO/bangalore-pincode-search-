import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Building, Zap, Stars, ArrowRight, Sparkles, X } from 'lucide-react';
import axios from 'axios';
import './App.css';

function App() {
  const [searchType, setSearchType] = useState('pincode');
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Create floating particles
  useEffect(() => {
    const createParticles = () => {
      const particlesContainer = document.createElement('div');
      particlesContainer.className = 'particles';
      
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.width = particle.style.height = Math.random() * 6 + 2 + 'px';
        particlesContainer.appendChild(particle);
      }
      
      document.body.appendChild(particlesContainer);
      
      return () => {
        document.body.removeChild(particlesContainer);
      };
    };

    const cleanup = createParticles();
    return cleanup;
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      let response;
      if (searchType === 'pincode') {
        if (!/^\d{6}$/.test(searchQuery)) {
          throw new Error('Please enter a valid 6-digit pincode');
        }
        response = await axios.get(`/api/search/pincode/${searchQuery}`);
      } else {
        response = await axios.get(`/api/search/area/${encodeURIComponent(searchQuery)}`);
      }

      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (query) => {
    if (query.length < 2 || searchType !== 'area') {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const response = await axios.get(`/api/search/areas/${encodeURIComponent(query)}`);
      setSuggestions(response.data.matches.slice(0, 5));
      setShowSuggestions(true);
    } catch (err) {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery && searchType === 'area') {
        fetchSuggestions(searchQuery);
      } else {
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType]);

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion.area);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen relative">
      <div className="main-container min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="premium-card m-6 p-8 text-center"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <Stars className="w-10 h-10 text-purple-400 mr-3 animate-pulse" />
              <div className="absolute inset-0 w-10 h-10 bg-purple-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
            </div>
            <h1 className="text-5xl font-black gradient-text-purple">
              BLR PINCODE
            </h1>
            <div className="relative">
              <Zap className="w-10 h-10 text-pink-400 ml-3 animate-bounce" />
              <div className="absolute inset-0 w-10 h-10 bg-pink-400 rounded-full blur-xl opacity-50 animate-bounce"></div>
            </div>
          </div>
          <p className="text-gray-300 text-xl font-light">
            Discover Bangalore • One Pincode at a Time
          </p>
          <div className="flex justify-center mt-4 space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse delay-75"></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
          </div>
        </motion.header>

        {/* Main Content */}
        <motion.main
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 container mx-auto px-6 py-8 max-w-5xl"
        >
          {/* Search Type Selector */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="premium-card p-3 flex rounded-2xl">
              <button
                onClick={() => setSearchType('pincode')}
                className={`tab-btn flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  searchType === 'pincode' ? 'active' : ''
                }`}
              >
                <MapPin className="w-6 h-6 mr-3" />
                <span>By Pincode</span>
              </button>
              <button
                onClick={() => setSearchType('area')}
                className={`tab-btn flex-1 py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center ${
                  searchType === 'area' ? 'active' : ''
                }`}
              >
                <Building className="w-6 h-6 mr-3" />
                <span>By Area</span>
              </button>
            </div>
          </motion.div>

          {/* Search Input */}
          <motion.div variants={itemVariants} className="mb-10">
            <div className="premium-card p-8">
              <div className="space-y-4">
                {/* Input with icon */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
                    {searchType === 'pincode' ? (
                      <MapPin className="w-6 h-6 text-purple-400" />
                    ) : (
                      <Building className="w-6 h-6 text-pink-400" />
                    )}
                  </div>
                  
                  <input
                    type="text"
                    placeholder={
                      searchType === 'pincode'
                        ? 'Enter 6-digit pincode • 560001'
                        : 'Enter area name • Koramangala'
                    }
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    maxLength={searchType === 'pincode' ? 6 : 100}
                    className={`modern-input w-full pl-16 pr-6 ${
                      searchType === 'pincode' ? 'text-center text-2xl tracking-widest' : 'text-lg'
                    }`}
                  />
                </div>

                {/* Suggestions Dropdown */}
                <AnimatePresence>
                  {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="suggestion-dropdown z-50"
                    >
                      {suggestions.map((suggestion, index) => (
                        <div
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="suggestion-item"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <Building className="w-4 h-4 text-purple-400 mr-3" />
                              <span className="font-medium text-white">{suggestion.area}</span>
                            </div>
                            <span className="text-sm text-gray-400 font-mono">{suggestion.pincode}</span>
                          </div>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Search Button - Separate from input */}
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="premium-btn w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="loading-dots">
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                      <div className="loading-dot"></div>
                    </div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      <span>Search</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.9 }}
                className="mb-8"
              >
                <div className="premium-card p-6 border-red-500/30 bg-red-500/10 error-shake">
                  <div className="flex items-center">
                    <X className="w-6 h-6 text-red-400 mr-3" />
                    <p className="font-medium text-red-300">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <AnimatePresence>
            {results && (
              <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -30, scale: 0.95 }}
                className="success-bounce"
              >
                <div className="premium-card p-8">
                  <div className="flex items-center mb-8">
                    <div className="relative">
                      {searchType === 'pincode' ? (
                        <MapPin className="w-8 h-8 text-purple-400 mr-4" />
                      ) : (
                        <Building className="w-8 h-8 text-pink-400 mr-4" />
                      )}
                      <div className={`absolute inset-0 w-8 h-8 rounded-full blur-lg opacity-50 ${
                        searchType === 'pincode' ? 'bg-purple-400' : 'bg-pink-400'
                      }`}></div>
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold gradient-text-purple">
                        {searchType === 'pincode' ? `Pincode ${results.pincode}` : results.area}
                      </h2>
                      <p className="text-gray-400 mt-1">
                        {searchType === 'pincode' ? 'Areas covered' : 'Available pincodes'}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 max-h-96 overflow-y-auto pr-2">
                    {searchType === 'pincode' ? (
                      results.areas.map((area, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="result-item group"
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <Building className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <span className="font-semibold text-white text-lg">{area}</span>
                                <p className="text-gray-400 text-sm">Area in Bangalore</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      results.pincodes.map((pincode, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="result-item group"
                        >
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center">
                              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-blue-500 flex items-center justify-center mr-4 group-hover:scale-110 transition-transform">
                                <MapPin className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <span className="font-semibold text-white text-lg font-mono">{pincode}</span>
                                <p className="text-gray-400 text-sm">Bangalore Pincode</p>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 transition-colors" />
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  <div className="mt-8 text-center p-6 rounded-xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                    <div className="flex items-center justify-center mb-2">
                      <Sparkles className="w-5 h-5 text-purple-400 mr-2" />
                      <p className="text-gray-300 font-medium">
                        Found <span className="gradient-text-purple font-bold text-xl">{results.count}</span> {searchType === 'pincode' ? 'areas' : 'pincodes'}
                      </p>
                      <Sparkles className="w-5 h-5 text-pink-400 ml-2" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.5 }}
          className="premium-card m-6 p-6 text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
            <span className="text-gray-300 font-medium">Crafted with</span>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse"></div>
            <span className="text-gray-300 font-medium">for Bangalore</span>
            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
          </div>
          <p className="text-gray-400 text-sm">
            Fast • Accurate • Beautiful Pincode Search
          </p>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
