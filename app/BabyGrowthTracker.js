'use client';

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Baby, TrendingUp, Calendar, Ruler, Weight, AlertCircle, Save, RefreshCw } from 'lucide-react';

const BabyGrowthTracker = () => {
  // Default historical data
  const defaultMeasurements = {
    weight: [
      { date: "2025-05-07", value: 3.215 },
      { date: "2025-05-10", value: 2.95 },
      { date: "2025-05-13", value: 3.17 },
      { date: "2025-05-16", value: 3.38 },
      { date: "2025-05-21", value: 3.47 },
      { date: "2025-05-25", value: 3.63 },
      { date: "2025-05-27", value: 3.73 },
      { date: "2025-05-31", value: 3.95 },
      { date: "2025-06-02", value: 4.05 },
      { date: "2025-06-08", value: 4.27 },
      { date: "2025-06-11", value: 4.47 },
      { date: "2025-06-15", value: 4.66 },
      { date: "2025-06-19", value: 4.79 },
      { date: "2025-07-01", value: 5.28 },
      { date: "2025-07-06", value: 5.44 }
    ],
    height: [
      { date: "2025-05-07", value: 54 },
      { date: "2025-05-28", value: 56 },
      { date: "2025-06-11", value: 59 },
      { date: "2025-07-01", value: 61 }
    ]
  };

  const [measurements, setMeasurements] = useState(defaultMeasurements);
  const [isLoading, setIsLoading] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Load data from localStorage on component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('babyGrowthData');
      if (saved) {
        const parsedData = JSON.parse(saved);
        setMeasurements(parsedData);
        setLastSaved(new Date().toLocaleString());
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever measurements change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem('babyGrowthData', JSON.stringify(measurements));
        setLastSaved(new Date().toLocaleString());
      } catch (error) {
        console.error('Error saving to localStorage:', error);
        alert('Failed to save data locally. Your browser may not support localStorage.');
      }
    }
  }, [measurements, isLoading]);

  const [newMeasurement, setNewMeasurement] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    height: ''
  });

  const [predictions, setPredictions] = useState([]);
  const [activeTab, setActiveTab] = useState('chart');

  const birthDate = new Date("2025-05-07");
  const babyInfo = {
    birthDate: "2025-05-07",
    gender: "male",
    dueDate: "2025-04-28"
  };

  // WHO percentile data
  const whoPercentiles = {
    weight: {
      0: [2.5, 2.9, 3.3, 3.9, 4.4],
      4: [3.4, 3.9, 4.5, 5.1, 5.8],
      8: [4.3, 4.9, 5.6, 6.3, 7.1],
      13: [5.0, 5.7, 6.6, 7.5, 8.5],
      17: [5.6, 6.3, 7.3, 8.3, 9.3],
      22: [6.0, 6.9, 7.9, 9.0, 10.1],
      26: [6.4, 7.3, 8.4, 9.6, 10.7],
      30: [6.7, 7.6, 8.8, 10.0, 11.2],
      35: [7.0, 7.9, 9.2, 10.5, 11.7],
      39: [7.2, 8.2, 9.5, 10.9, 12.2],
      43: [7.4, 8.4, 9.8, 11.2, 12.6],
      48: [7.7, 8.7, 10.1, 11.6, 13.0],
      52: [7.9, 8.9, 10.3, 11.9, 13.3]
    },
    height: {
      0: [46.1, 47.8, 49.9, 52.0, 53.7],
      4: [50.8, 52.8, 54.7, 56.7, 58.6],
      8: [54.4, 56.4, 58.4, 60.4, 62.4],
      13: [57.3, 59.4, 61.4, 63.5, 65.5],
      17: [59.7, 61.8, 63.9, 66.0, 68.0],
      22: [61.7, 63.8, 65.9, 68.0, 70.1],
      26: [63.3, 65.5, 67.6, 69.8, 71.9],
      30: [64.8, 67.0, 69.2, 71.3, 73.5],
      35: [66.2, 68.4, 70.6, 72.8, 75.0],
      39: [67.5, 69.7, 72.0, 74.2, 76.5],
      43: [68.7, 71.0, 73.3, 75.5, 77.8],
      48: [69.9, 72.2, 74.5, 76.9, 79.1],
      52: [71.0, 73.4, 75.7, 78.1, 80.5]
    }
  };

  // Car seat limits
  const carSeatLimits = {
    weight: 13.6,
    height: 81
  };

  // Helper functions
  const calculateAge = (date) => {
    const diff = new Date(date) - birthDate;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30.44);
    return { days, weeks, months };
  };

  const getGrowthRate = (weeks, type) => {
    if (type === 'weight') {
      if (weeks < 13) return 0.23;
      if (weeks < 17) return 0.21;
      if (weeks < 22) return 0.18;
      if (weeks < 26) return 0.16;
      if (weeks < 35) return 0.14;
      if (weeks < 43) return 0.12;
      if (weeks < 52) return 0.10;
      if (weeks < 65) return 0.08;
      if (weeks < 78) return 0.06;
      if (weeks < 91) return 0.05;
      return 0.04;
    } else {
      if (weeks < 13) return 0.80;
      if (weeks < 17) return 0.70;
      if (weeks < 22) return 0.60;
      if (weeks < 26) return 0.50;
      if (weeks < 35) return 0.45;
      if (weeks < 43) return 0.40;
      if (weeks < 52) return 0.35;
      if (weeks < 65) return 0.30;
      if (weeks < 78) return 0.25;
      if (weeks < 91) return 0.22;
      return 0.20;
    }
  };

  const interpolatePercentiles = (weeks, data) => {
    const weekKeys = Object.keys(data).map(Number).sort((a, b) => a - b);
    
    if (weeks <= weekKeys[0]) return data[weekKeys[0]];
    if (weeks >= weekKeys[weekKeys.length - 1]) return data[weekKeys[weekKeys.length - 1]];
    
    for (let i = 0; i < weekKeys.length - 1; i++) {
      if (weeks >= weekKeys[i] && weeks <= weekKeys[i + 1]) {
        const ratio = (weeks - weekKeys[i]) / (weekKeys[i + 1] - weekKeys[i]);
        const result = [];
        for (let j = 0; j < 5; j++) {
          result.push(data[weekKeys[i]][j] + ratio * (data[weekKeys[i + 1]][j] - data[weekKeys[i]][j]));
        }
        return result;
      }
    }
    return data[52];
  };

  const findPercentile = (value, percentileData) => {
    const percentiles = [3, 15, 50, 85, 97];
    
    if (value <= percentileData[0]) return "<3";
    if (value >= percentileData[4]) return ">97";
    
    for (let i = 0; i < percentileData.length - 1; i++) {
      if (value >= percentileData[i] && value <= percentileData[i + 1]) {
        const ratio = (value - percentileData[i]) / (percentileData[i + 1] - percentileData[i]);
        const percentile = percentiles[i] + ratio * (percentiles[i + 1] - percentiles[i]);
        return Math.round(percentile);
      }
    }
    return "N/A";
  };

  const generatePredictions = () => {
    const lastWeight = measurements.weight[measurements.weight.length - 1];
    const lastHeight = measurements.height[measurements.height.length - 1];
    
    const newPredictions = [];
    const endDate = new Date();
    endDate.setFullYear(endDate.getFullYear() + 2);
    
    let currentDate = new Date(Math.max(
      new Date(lastWeight.date),
      new Date(lastHeight.date)
    ));
    currentDate.setDate(currentDate.getDate() + 7);
    
    const lastWeightDate = new Date(lastWeight.date);
    const lastHeightDate = new Date(lastHeight.date);
    
    let carSeatLimitReached = false;
    let carSeatLimitDate = null;
    
    while (currentDate <= endDate && !carSeatLimitReached) {
      const age = calculateAge(currentDate);
      const daysSinceLastWeight = Math.floor((currentDate - lastWeightDate) / (1000 * 60 * 60 * 24));
      const daysSinceLastHeight = Math.floor((currentDate - lastHeightDate) / (1000 * 60 * 60 * 24));
      
      const weightGrowthRate = getGrowthRate(age.weeks, 'weight');
      const heightGrowthRate = getGrowthRate(age.weeks, 'height');
      
      const predictedWeight = lastWeight.value + (daysSinceLastWeight / 7 * weightGrowthRate);
      const predictedHeight = lastHeight.value + (daysSinceLastHeight / 7 * heightGrowthRate);
      
      const weightPercentileData = interpolatePercentiles(age.weeks, whoPercentiles.weight);
      const heightPercentileData = interpolatePercentiles(age.weeks, whoPercentiles.height);
      
      newPredictions.push({
        date: currentDate.toISOString().split('T')[0],
        weight: predictedWeight,
        height: predictedHeight,
        weightPercentile: findPercentile(predictedWeight, weightPercentileData),
        heightPercentile: findPercentile(predictedHeight, heightPercentileData),
        who50thWeight: weightPercentileData[2],
        who50thHeight: heightPercentileData[2],
        ageWeeks: age.weeks,
        ageMonths: age.months
      });
      
      if (!carSeatLimitReached && (predictedHeight >= carSeatLimits.height || predictedWeight >= carSeatLimits.weight)) {
        carSeatLimitReached = true;
        carSeatLimitDate = currentDate.toISOString().split('T')[0];
      }
      
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    setPredictions(newPredictions);
  };

  useEffect(() => {
    if (!isLoading) {
      generatePredictions();
    }
  }, [measurements, isLoading]);

  const handleAddMeasurement = () => {
    if (!newMeasurement.date) return;
    
    const updated = { ...measurements };
    
    if (newMeasurement.weight) {
      updated.weight = [...updated.weight, {
        date: newMeasurement.date,
        value: parseFloat(newMeasurement.weight)
      }].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    if (newMeasurement.height) {
      updated.height = [...updated.height, {
        date: newMeasurement.date,
        value: parseFloat(newMeasurement.height)
      }].sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    setMeasurements(updated);
    setNewMeasurement({ date: new Date().toISOString().split('T')[0], weight: '', height: '' });
  };

  const handleDeleteMeasurement = (type, index) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete this ${type} measurement?`);
    if (confirmDelete) {
      const updated = { ...measurements };
      updated[type] = updated[type].filter((_, i) => i !== index);
      setMeasurements(updated);
    }
  };

  const handleResetData = () => {
    const confirmReset = window.confirm(
      'Are you sure you want to reset to the default historical data? This will delete all your custom measurements.'
    );
    if (confirmReset) {
      setMeasurements(defaultMeasurements);
      localStorage.removeItem('babyGrowthData');
    }
  };

  const getChartData = () => {
    const actualData = [];
    const allDates = new Set();
    
    measurements.weight.forEach(m => allDates.add(m.date));
    measurements.height.forEach(m => allDates.add(m.date));
    
    Array.from(allDates).sort().forEach(date => {
      const weight = measurements.weight.find(m => m.date === date);
      const height = measurements.height.find(m => m.date === date);
      const age = calculateAge(date);
      
      actualData.push({
        date,
        weight: weight?.value,
        height: height?.value,
        type: 'actual',
        ageWeeks: age.weeks
      });
    });
    
    const predictedData = predictions.slice(0, 52).map(p => ({
      date: p.date,
      weight: p.weight,
      height: p.height,
      type: 'predicted',
      ageWeeks: p.ageWeeks
    }));
    
    return [...actualData, ...predictedData];
  };

  const getCurrentStats = () => {
    const lastWeight = measurements.weight[measurements.weight.length - 1];
    const lastHeight = measurements.height[measurements.height.length - 1];
    const age = calculateAge(new Date());
    
    const weightPercentileData = interpolatePercentiles(age.weeks, whoPercentiles.weight);
    const heightPercentileData = interpolatePercentiles(age.weeks, whoPercentiles.height);
    
    return {
      currentAge: age,
      lastWeight: lastWeight,
      lastHeight: lastHeight,
      weightPercentile: findPercentile(lastWeight.value, weightPercentileData),
      heightPercentile: findPercentile(lastHeight.value, heightPercentileData)
    };
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-4 flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const stats = getCurrentStats();
  const chartData = getChartData();
  
  const carSeatPrediction = predictions.find(p => 
    p.height >= carSeatLimits.height || p.weight >= carSeatLimits.weight
  );

  return (
    <div className="w-full max-w-6xl mx-auto p-4 space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Baby className="w-8 h-8" />
              <h1 className="text-2xl font-bold">Baby Growth Tracker</h1>
            </div>
            <p className="text-blue-100">Born: May 7, 2025 • Male • Current age: {stats.currentAge.months} months ({stats.currentAge.weeks} weeks)</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-100 flex items-center">
              <Save className="w-3 h-3 mr-1" />
              {lastSaved ? `Last saved: ${lastSaved}` : 'Not saved yet'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Weight className="w-5 h-5" />
            <span className="text-sm font-medium">Last Weight</span>
          </div>
          <p className="text-2xl font-bold">{stats.lastWeight.value} kg</p>
          <p className="text-sm text-gray-500">{stats.weightPercentile}th percentile</p>
          <p className="text-xs text-gray-400">{stats.lastWeight.date}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <Ruler className="w-5 h-5" />
            <span className="text-sm font-medium">Last Height</span>
          </div>
          <p className="text-2xl font-bold">{stats.lastHeight.value} cm</p>
          <p className="text-sm text-gray-500">{stats.heightPercentile}th percentile</p>
          <p className="text-xs text-gray-400">{stats.lastHeight.date}</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm font-medium">Growth Status</span>
          </div>
          <p className="text-sm">Weight: Normal</p>
          <p className="text-sm">Height: Above Average</p>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center space-x-2 text-gray-600 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">Car Seat Alert</span>
          </div>
          {carSeatPrediction ? (
            <>
              <p className="text-sm font-medium text-orange-600">
                Limit reached: {carSeatPrediction.date}
              </p>
              <p className="text-xs text-gray-500">
                At {carSeatPrediction.ageMonths} months
              </p>
            </>
          ) : (
            <p className="text-sm text-green-600">Within limits</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('chart')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'chart' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Growth Chart
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'add' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Add Measurement
            </button>
            <button
              onClick={() => setActiveTab('predictions')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'predictions' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Predictions
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`py-3 border-b-2 font-medium text-sm ${
                activeTab === 'data' 
                  ? 'border-blue-500 text-blue-600' 
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Data
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'chart' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Weight Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => value ? `${value.toFixed(2)} kg` : 'N/A'}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="weight" 
                      stroke="#3B82F6" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Weight"
                    />
                    <ReferenceLine y={carSeatLimits.weight} stroke="#EF4444" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-4">Height Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                    <YAxis label={{ value: 'Height (cm)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      labelFormatter={(date) => new Date(date).toLocaleDateString()}
                      formatter={(value) => value ? `${value.toFixed(1)} cm` : 'N/A'}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="height" 
                      stroke="#10B981" 
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Height"
                    />
                    <ReferenceLine y={carSeatLimits.height} stroke="#EF4444" strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === 'add' && (
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-4">Add New Measurement</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={newMeasurement.date}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newMeasurement.weight}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, weight: e.target.value })}
                    placeholder="e.g., 5.64"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm) - Optional
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMeasurement.height}
                    onChange={(e) => setNewMeasurement({ ...newMeasurement, height: e.target.value })}
                    placeholder="e.g., 62.3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleAddMeasurement}
                  disabled={!newMeasurement.date || (!newMeasurement.weight && !newMeasurement.height)}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Add Measurement
                </button>
              </div>

              <div className="mt-8">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Measurements</h4>
                <div className="space-y-2">
                  {measurements.weight.slice(-5).reverse().map((m, i) => (
                    <div key={i} className="text-sm text-gray-600">
                      {m.date}: {m.value} kg
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'predictions' && (
            <div>
              <h3 className="text-lg font-medium mb-4">Growth Predictions</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Weight (kg)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">W %ile</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Height (cm)</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">H %ile</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {predictions.slice(0, 20).map((p, i) => (
                      <tr key={i} className={p.height >= carSeatLimits.height || p.weight >= carSeatLimits.weight ? 'bg-red-50' : ''}>
                        <td className="px-4 py-2 text-sm">{p.date}</td>
                        <td className="px-4 py-2 text-sm">{p.ageMonths}m ({p.ageWeeks}w)</td>
                        <td className="px-4 py-2 text-sm">{p.weight.toFixed(2)}</td>
                        <td className="px-4 py-2 text-sm">{p.weightPercentile}th</td>
                        <td className="px-4 py-2 text-sm">{p.height.toFixed(1)}</td>
                        <td className="px-4 py-2 text-sm">{p.heightPercentile}th</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {carSeatPrediction && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                    <p className="text-sm text-orange-800">
                      <strong>Car Seat Transition Alert:</strong> Based on current growth trends, your baby will reach the car seat height limit of 81 cm around {carSeatPrediction.date} (age {carSeatPrediction.ageMonths} months). Plan to transition by {new Date(new Date(carSeatPrediction.date).setMonth(new Date(carSeatPrediction.date).getMonth() - 1)).toISOString().split('T')[0]}.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Manage Your Data</h3>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Data Storage:</strong> All your measurements are saved locally in your browser. 
                    They will persist between sessions on this device, but won't sync across devices.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Weight Measurements</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {measurements.weight.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <span className="text-sm">{m.date}: {m.value} kg</span>
                          <button
                            onClick={() => handleDeleteMeasurement('weight', i)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Height Measurements</h4>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                      {measurements.height.map((m, i) => (
                        <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-0">
                          <span className="text-sm">{m.date}: {m.value} cm</span>
                          <button
                            onClick={() => handleDeleteMeasurement('height', i)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={handleResetData}
                      className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600 transition-colors"
                    >
                      Reset to Default Data
                    </button>
                    <p className="text-xs text-gray-500 mt-2">
                      This will delete all your custom measurements and restore the original historical data.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BabyGrowthTracker;
