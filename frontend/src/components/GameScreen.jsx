import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Coins, Zap, Timer, TrendingUp, Users, Target, Clock, Trophy, Star, Award, Volume2, VolumeX } from 'lucide-react';

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    money: 0,
    clickPower: 1,
    autoIncomeRate: 0,
    multiplier: 1,
    totalDonersCut: 0,
    totalCustomersServed: 0,
    totalPlayTime: 0,
    soundEnabled: true,
    upgrades: {
      sharperKnife: { level: 0, cost: 15, power: 1 },
      donerMachine: { level: 0, cost: 75, income: 1 },
      garlicSauce: { level: 0, cost: 150, multiplier: 0.2 },
      marketingBoost: { level: 0, cost: 300, customerBonus: 0.1 },
      premiumMeat: { level: 0, cost: 500, clickMultiplier: 0.5 },
      speedBoost: { level: 0, cost: 800, speedMultiplier: 0.3 }
    }
  });

  const [donerRotation, setDonerRotation] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [particles, setParticles] = useState([]);
  const [knifeAnimation, setKnifeAnimation] = useState(false);
  const [moneyPopup, setMoneyPopup] = useState([]);

  // Customer system
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProgress, setCustomerProgress] = useState(0);

  // Expanded customer types - 15 different customers!
  const customerTypes = [
    { name: "Ahmed", avatar: "👨", order: "Regular doner", slicesNeeded: 8, timeLimit: 8, reward: 30, nationality: "🇹🇷" },
    { name: "Fatma", avatar: "👵", order: "Less oil doner", slicesNeeded: 6, timeLimit: 10, reward: 25, nationality: "🇹🇷" },
    { name: "Student Mike", avatar: "🧑‍🎓", order: "Large doner", slicesNeeded: 12, timeLimit: 12, reward: 45, nationality: "🇺🇸" },
    { name: "Business Lady", avatar: "👩‍💼", order: "Quick doner", slicesNeeded: 5, timeLimit: 6, reward: 35, nationality: "🇬🇧" },
    { name: "Tourist John", avatar: "🧑‍🦱", order: "Special doner", slicesNeeded: 15, timeLimit: 15, reward: 60, nationality: "🇩🇪" },
    { name: "Coach Ali", avatar: "🧑‍⚕️", order: "Protein doner", slicesNeeded: 20, timeLimit: 18, reward: 80, nationality: "🇹🇷" },
    { name: "Little Emma", avatar: "🧒", order: "Small doner", slicesNeeded: 4, timeLimit: 5, reward: 20, nationality: "🇫🇷" },
    { name: "Builder Joe", avatar: "👷‍♂️", order: "Hearty doner", slicesNeeded: 25, timeLimit: 20, reward: 100, nationality: "🇮🇪" },
    { name: "Chef Marco", avatar: "👨‍🍳", order: "Gourmet doner", slicesNeeded: 18, timeLimit: 14, reward: 75, nationality: "🇮🇹" },
    { name: "Doctor Sarah", avatar: "👩‍⚕️", order: "Healthy doner", slicesNeeded: 10, timeLimit: 12, reward: 55, nationality: "🇨🇦" },
    { name: "Programmer Alex", avatar: "👨‍💻", order: "Energy doner", slicesNeeded: 14, timeLimit: 16, reward: 65, nationality: "🇺🇸" },
    { name: "Artist Luna", avatar: "👩‍🎨", order: "Creative doner", slicesNeeded: 12, timeLimit: 10, reward: 50, nationality: "🇯🇵" },
    { name: "Police Officer", avatar: "👮‍♂️", order: "Power doner", slicesNeeded: 22, timeLimit: 25, reward: 90, nationality: "🇬🇧" },
    { name: "Fire Fighter", avatar: "🧑‍🚒", order: "Hero doner", slicesNeeded: 30, timeLimit: 30, reward: 120, nationality: "🇺🇸" },
    { name: "VIP Customer", avatar: "🤵", order: "Royal doner", slicesNeeded: 35, timeLimit: 40, reward: 200, nationality: "🇸🇦" }
  ];

  // Massive mission system - 25+ missions for hours of gameplay!
  const [missions, setMissions] = useState([
    // Beginner missions (0-15 min)
    { id: 1, title: "First Steps", description: "Cut 5 doners", target: 5, current: 0, reward: 25, difficulty: "easy", completed: false },
    { id: 2, title: "Doner Apprentice", description: "Cut 20 doners", target: 20, current: 0, reward: 75, difficulty: "easy", completed: false },
    { id: 3, title: "First Customer", description: "Serve 1 customer", target: 1, current: 0, reward: 50, difficulty: "easy", completed: false },
    { id: 4, title: "Quick Learner", description: "Earn 100$", target: 100, current: 0, reward: 40, difficulty: "easy", completed: false },
    
    // Intermediate missions (15-45 min)
    { id: 5, title: "Doner Master", description: "Cut 100 doners", target: 100, current: 0, reward: 200, difficulty: "medium", completed: false },
    { id: 6, title: "Speed Service", description: "Cut 30 doners in 60s", target: 30, current: 0, reward: 300, difficulty: "medium", timeLimit: 60, completed: false },
    { id: 7, title: "Customer Satisfaction", description: "Serve 10 customers", target: 10, current: 0, reward: 250, difficulty: "medium", completed: false },
    { id: 8, title: "Money Collector", description: "Earn 1000$", target: 1000, current: 0, reward: 150, difficulty: "medium", completed: false },
    { id: 9, title: "International Service", description: "Serve customers from 5 countries", target: 5, current: 0, reward: 400, difficulty: "medium", completed: false },
    { id: 10, title: "Busy Day", description: "Serve 25 customers", target: 25, current: 0, reward: 500, difficulty: "medium", completed: false },
    
    // Advanced missions (30-75 min)
    { id: 11, title: "Doner Legend", description: "Cut 500 doners", target: 500, current: 0, reward: 1000, difficulty: "hard", completed: false },
    { id: 12, title: "Lightning Fast", description: "Cut 25 doners in 30s", target: 25, current: 0, reward: 800, difficulty: "hard", timeLimit: 30, completed: false },
    { id: 13, title: "Customer King", description: "Serve 50 customers", target: 50, current: 0, reward: 1200, difficulty: "hard", completed: false },
    { id: 14, title: "Rich Doner Seller", description: "Earn 10000$", target: 10000, current: 0, reward: 2000, difficulty: "hard", completed: false },
    { id: 15, title: "VIP Treatment", description: "Serve the VIP Customer", target: 1, current: 0, reward: 1500, difficulty: "hard", completed: false },
    { id: 16, title: "World Service", description: "Serve customers from 10+ countries", target: 10, current: 0, reward: 1800, difficulty: "hard", completed: false },
    
    // Expert missions (60+ min)
    { id: 17, title: "Doner Emperor", description: "Cut 1000 doners", target: 1000, current: 0, reward: 3000, difficulty: "expert", completed: false },
    { id: 18, title: "Ultra Speed", description: "Cut 20 doners in 15s", target: 20, current: 0, reward: 2500, difficulty: "expert", timeLimit: 15, completed: false },
    { id: 19, title: "Doner Giant", description: "Serve 100 customers", target: 100, current: 0, reward: 5000, difficulty: "expert", completed: false },
    { id: 20, title: "Millionaire", description: "Earn 50000$", target: 50000, current: 0, reward: 10000, difficulty: "expert", completed: false },
    { id: 21, title: "Marathon Player", description: "Play for 60 minutes", target: 3600, current: 0, reward: 8000, difficulty: "expert", completed: false },
    { id: 22, title: "Upgrade Master", description: "Reach level 10 on any upgrade", target: 10, current: 0, reward: 6000, difficulty: "expert", completed: false },
    
    // Legendary missions (90+ min)
    { id: 23, title: "Doner God", description: "Cut 2500 doners", target: 2500, current: 0, reward: 15000, difficulty: "legendary", completed: false },
    { id: 24, title: "Ultimate Speed", description: "Cut 30 doners in 10s", target: 30, current: 0, reward: 12000, difficulty: "legendary", timeLimit: 10, completed: false },
    { id: 25, title: "Doner Empire", description: "Serve 500 customers", target: 500, current: 0, reward: 25000, difficulty: "legendary", completed: false }
  ]);

  // Sound effects using Web Audio API
  const playSound = useCallback((type) => {
    if (!gameState.soundEnabled) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    switch(type) {
      case 'slice':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        break;
      case 'money':
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        break;
      case 'customer':
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.15);
        gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      case 'upgrade':
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1500, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        break;
      case 'complete':
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(1200, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
        break;
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, [gameState.soundEnabled]);

  // Play time tracker
  useEffect(() => {
    const playTimeInterval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        totalPlayTime: prev.totalPlayTime + 1
      }));
    }, 1000);

    return () => clearInterval(playTimeInterval);
  }, []);

  // Auto-income effect
  useEffect(() => {
    if (gameState.autoIncomeRate > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          money: prev.money + (prev.autoIncomeRate * prev.multiplier)
        }));
        
        setDonerRotation(prev => (prev + 1) % 360); // Slower rotation
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoIncomeRate, gameState.multiplier]);

  // Customer spawning - more frequent with variety
  useEffect(() => {
    if (!currentCustomer) {
      const spawnInterval = setInterval(() => {
        const baseChance = 0.5; // 50% base chance
        const marketingBonus = gameState.upgrades.marketingBoost.level * 0.1;
        const totalChance = Math.min(baseChance + marketingBonus, 0.9); // Max 90%
        
        if (Math.random() < totalChance) {
          const randomCustomer = customerTypes[Math.floor(Math.random() * customerTypes.length)];
          setCurrentCustomer({
            ...randomCustomer,
            id: Date.now(),
            timeRemaining: randomCustomer.timeLimit
          });
          setCustomerProgress(0);
          playSound('customer');
        }
      }, 1500); // Every 1.5 seconds

      return () => clearInterval(spawnInterval);
    }
  }, [currentCustomer, gameState.upgrades.marketingBoost.level, playSound]);

  // Customer timer
  useEffect(() => {
    if (currentCustomer && currentCustomer.timeRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentCustomer(prev => {
          if (prev.timeRemaining <= 1) {
            return null;
          }
          return { ...prev, timeRemaining: prev.timeRemaining - 1 };
        });
      }, 1000);

      return () => clearInterval(timer);
    } else if (currentCustomer && currentCustomer.timeRemaining <= 0) {
      setCurrentCustomer(null);
      setCustomerProgress(0);
    }
  }, [currentCustomer]);

  // Money popup effect
  const showMoneyPopup = (amount, x, y) => {
    const popup = {
      id: Date.now(),
      amount,
      x: x || 50,
      y: y || 50
    };
    setMoneyPopup(prev => [...prev, popup]);
    
    setTimeout(() => {
      setMoneyPopup(prev => prev.filter(p => p.id !== popup.id));
    }, 2000);
  };

  // REALISTIC SLICE ANIMATION - Knife from top to bottom!
  const sliceDoner = useCallback(() => {
    const baseEarned = gameState.clickPower * gameState.multiplier;
    const premiumBonus = 1 + (gameState.upgrades.premiumMeat.level * gameState.upgrades.premiumMeat.clickMultiplier);
    const speedBonus = 1 + (gameState.upgrades.speedBoost.level * gameState.upgrades.speedBoost.speedMultiplier);
    const earned = baseEarned * premiumBonus * speedBonus;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + earned,
      totalDonersCut: prev.totalDonersCut + 1
    }));

    // Play slice sound
    playSound('slice');
    
    // Show money popup
    showMoneyPopup(earned, 45 + Math.random() * 10, 40 + Math.random() * 10);

    // Update missions
    setMissions(prev => prev.map(mission => {
      if (!mission.completed) {
        // Doner cutting missions
        if ([1, 2, 5, 11, 17, 23].includes(mission.id)) {
          const newCurrent = mission.current + 1;
          return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
        }
        // Speed cutting missions
        if ([6, 12, 18, 24].includes(mission.id)) {
          return { ...mission, current: mission.current + 1 };
        }
        // Money earning missions
        if ([4, 8, 14, 20].includes(mission.id)) {
          return { ...mission, current: Math.max(mission.current, gameState.money + earned), completed: (gameState.money + earned) >= mission.target };
        }
        // Play time missions
        if ([21].includes(mission.id)) {
          return { ...mission, current: gameState.totalPlayTime, completed: gameState.totalPlayTime >= mission.target };
        }
        // Upgrade level missions
        if ([22].includes(mission.id)) {
          const maxLevel = Math.max(...Object.values(gameState.upgrades).map(u => u.level));
          return { ...mission, current: maxLevel, completed: maxLevel >= mission.target };
        }
      }
      return mission;
    }));

    // Handle customer order
    if (currentCustomer) {
      const newProgress = customerProgress + 1;
      setCustomerProgress(newProgress);
      
      if (newProgress >= currentCustomer.slicesNeeded) {
        // Order completed!
        const customerReward = currentCustomer.reward * (1 + gameState.upgrades.marketingBoost.level * 0.1);
        setGameState(prev => ({
          ...prev,
          money: prev.money + customerReward,
          totalCustomersServed: prev.totalCustomersServed + 1
        }));
        
        playSound('complete');
        showMoneyPopup(customerReward, 20, 30);
        
        // Update customer missions
        setMissions(prev => prev.map(mission => {
          if ([3, 7, 10, 13, 19, 25].includes(mission.id) && !mission.completed) {
            const newCurrent = mission.current + 1;
            return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
          }
          // VIP customer mission
          if (mission.id === 15 && currentCustomer.name === "VIP Customer") {
            return { ...mission, current: 1, completed: true };
          }
          return mission;
        }));
        
        setCurrentCustomer(null);
        setCustomerProgress(0);
      }
    }

    // KNIFE ANIMATION - Top to bottom slice!
    setKnifeAnimation(true);
    setIsSlicing(true);
    
    // Create more particles with different colors
    const newParticles = Array.from({ length: 8 }, (_, i) => ({
      id: Date.now() + i,
      x: 35 + Math.random() * 30,
      y: 35 + Math.random() * 30,
      color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#dc2626', '#ef4444'][Math.floor(Math.random() * 6)]
    }));
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => {
      setKnifeAnimation(false);
      setIsSlicing(false);
    }, 500);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
  }, [gameState, currentCustomer, customerProgress, playSound]);

  // Purchase upgrade function
  const purchaseUpgrade = (upgradeType) => {
    const upgrade = gameState.upgrades[upgradeType];
    
    if (gameState.money >= upgrade.cost) {
      setGameState(prev => {
        const newState = { ...prev };
        newState.money -= upgrade.cost;
        
        const newUpgrade = { ...upgrade };
        newUpgrade.level += 1;
        newUpgrade.cost = Math.floor(upgrade.cost * 1.8);
        
        if (upgradeType === 'sharperKnife') {
          newUpgrade.power += 1;
          newState.clickPower = prev.clickPower + 1;
        } else if (upgradeType === 'donerMachine') {
          newUpgrade.income += 2;
          newState.autoIncomeRate = prev.autoIncomeRate + 2;
        } else if (upgradeType === 'garlicSauce') {
          newUpgrade.multiplier += 0.2;
          newState.multiplier = prev.multiplier + 0.2;
        } else if (upgradeType === 'marketingBoost') {
          newUpgrade.customerBonus += 0.1;
        } else if (upgradeType === 'premiumMeat') {
          newUpgrade.clickMultiplier += 0.5;
        } else if (upgradeType === 'speedBoost') {
          newUpgrade.speedMultiplier += 0.3;
        }
        
        newState.upgrades[upgradeType] = newUpgrade;
        return newState;
      });
      
      playSound('upgrade');
    }
  };

  // Claim mission reward
  const claimMissionReward = (missionId) => {
    const mission = missions.find(m => m.id === missionId);
    if (mission && mission.completed) {
      setGameState(prev => ({
        ...prev,
        money: prev.money + mission.reward
      }));
      
      setMissions(prev => prev.filter(m => m.id !== missionId));
      playSound('money');
      showMoneyPopup(mission.reward, 70, 20);
    }
  };

  // Toggle sound
  const toggleSound = () => {
    setGameState(prev => ({
      ...prev,
      soundEnabled: !prev.soundEnabled
    }));
  };

  // Save/Load game state
  useEffect(() => {
    localStorage.setItem('donerMasterSave', JSON.stringify({ gameState, missions }));
  }, [gameState, missions]);

  useEffect(() => {
    const savedGame = localStorage.getItem('donerMasterSave');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed.gameState) setGameState(parsed.gameState);
        if (parsed.missions) setMissions(parsed.missions);
      } catch (error) {
        console.error('Failed to load save:', error);
      }
    }
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      case 'expert': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 p-4 relative overflow-hidden">
      
      {/* Money popups */}
      {moneyPopup.map(popup => (
        <div
          key={popup.id}
          className="absolute text-2xl font-bold text-green-600 animate-bounce pointer-events-none z-50"
          style={{
            left: `${popup.x}%`,
            top: `${popup.y}%`,
            animation: 'floatUp 2s ease-out forwards'
          }}
        >
          +${Math.floor(popup.amount)}
        </div>
      ))}
      
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-xl border-4 border-yellow-300 mb-4">
            <Coins className="w-10 h-10 text-yellow-600" />
            <span className="text-4xl font-bold text-gray-800">
              ${formatNumber(gameState.money)}
            </span>
            <Button
              onClick={toggleSound}
              variant="ghost"
              size="sm"
              className="ml-4"
            >
              {gameState.soundEnabled ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
            </Button>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              Play Time: {formatTime(gameState.totalPlayTime)}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Target className="w-4 h-4 mr-1" />
              Doners: {gameState.totalDonersCut}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Customers: {gameState.totalCustomersServed}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Customer Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-pink-200 rounded-3xl mb-4">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Users className="w-6 h-6 text-pink-600" />
                  Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentCustomer ? (
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2 text-4xl mb-2">
                      {currentCustomer.avatar}
                      <span className="text-2xl">{currentCustomer.nationality}</span>
                    </div>
                    <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                      <h3 className="font-bold text-gray-800">{currentCustomer.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentCustomer.order}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress: {customerProgress}/{currentCustomer.slicesNeeded}</span>
                          <span>Time: {currentCustomer.timeRemaining}s</span>
                        </div>
                        <Progress 
                          value={(customerProgress / currentCustomer.slicesNeeded) * 100} 
                          className="h-3 mb-2" 
                        />
                        <Progress 
                          value={(currentCustomer.timeRemaining / currentCustomer.timeLimit) * 100} 
                          className="h-2"
                        />
                      </div>
                      <p className="text-sm font-semibold text-green-600 mt-2">
                        Reward: ${Math.floor(currentCustomer.reward * (1 + gameState.upgrades.marketingBoost.level * 0.1))}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Waiting for customer...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-orange-300 rounded-3xl">
              <CardContent className="p-8 relative">
                
                {/* KNIFE ANIMATION - REALISTIC CUTTING */}
                {knifeAnimation && (
                  <div className="absolute left-1/2 top-4 transform -translate-x-1/2 text-6xl z-50 animate-bounce">
                    🔪
                  </div>
                )}
                
                {/* REALISTIC DONER DESIGN - STATIC WHILE CUTTING */}
                <div className="relative flex flex-col items-center mb-8">
                  <div 
                    className="relative w-80 h-96 mb-6 cursor-pointer transform transition-all hover:scale-105 active:scale-95"
                    onClick={sliceDoner}
                    style={{
                      transform: knifeAnimation ? `scale(0.95)` : `rotate(${donerRotation}deg) scale(1)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    {/* Metal skewer */}
                    <div className="absolute left-1/2 top-0 w-3 h-full bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700 rounded-full shadow-lg transform -translate-x-1/2 z-10"></div>
                    
                    {/* Doner meat layers - REALISTIC */}
                    {/* Top layer */}
                    <div className="absolute left-1/2 top-8 w-72 h-20 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 rounded-full transform -translate-x-1/2 shadow-2xl border-4 border-amber-700" 
                         style={{clipPath: 'ellipse(140px 40px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-400 via-orange-400 to-amber-500 rounded-full opacity-90"></div>
                      <div className="absolute inset-4 bg-gradient-to-tl from-yellow-600 via-red-500 to-orange-600 rounded-full opacity-70"></div>
                    </div>
                    
                    {/* Upper middle layer */}
                    <div className="absolute left-1/2 top-16 w-68 h-24 bg-gradient-to-r from-red-500 via-orange-600 to-amber-600 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-red-700"
                         style={{clipPath: 'ellipse(135px 48px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-500 via-red-400 to-orange-500 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Middle layer */}
                    <div className="absolute left-1/2 top-24 w-64 h-28 bg-gradient-to-r from-orange-600 via-red-500 to-amber-700 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-orange-800"
                         style={{clipPath: 'ellipse(130px 56px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-600 via-amber-500 to-orange-600 rounded-full opacity-90"></div>
                    </div>
                    
                    {/* Lower middle layer */}
                    <div className="absolute left-1/2 top-32 w-60 h-32 bg-gradient-to-r from-amber-700 via-red-600 to-orange-700 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-amber-800"
                         style={{clipPath: 'ellipse(125px 64px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-orange-600 via-red-500 to-amber-600 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Lower layer */}
                    <div className="absolute left-1/2 top-40 w-56 h-36 bg-gradient-to-r from-red-700 via-amber-600 to-orange-800 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-red-900"
                         style={{clipPath: 'ellipse(120px 72px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-700 via-orange-600 to-red-600 rounded-full opacity-90"></div>
                    </div>
                    
                    {/* Bottom layer */}
                    <div className="absolute left-1/2 top-48 w-52 h-32 bg-gradient-to-r from-orange-800 via-red-700 to-amber-800 rounded-full transform -translate-x-1/2 shadow-2xl border-4 border-orange-900"
                         style={{clipPath: 'ellipse(115px 64px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-700 via-amber-600 to-orange-700 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Cute face */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl select-none pointer-events-none z-20">
                      {isSlicing ? "😵‍💫" : "😋"}
                    </div>
                    
                    {/* Slice effect */}
                    {isSlicing && (
                      <div className="absolute inset-0 border-8 border-yellow-400 rounded-full animate-ping opacity-75 z-30"></div>
                    )}
                  </div>
                  
                  {/* Enhanced particles */}
                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute w-4 h-4 rounded-full pointer-events-none animate-bounce shadow-lg z-40"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: particle.color,
                        animationDuration: '2s'
                      }}
                    />
                  ))}
                  
                  {/* Slice Button */}
                  <Button
                    onClick={sliceDoner}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-full shadow-xl transform transition-all hover:scale-110 active:scale-95 border-4 border-green-400 text-xl"
                  >
                    🔪 CUT DONER! 🥙
                  </Button>
                  
                  <p className="mt-4 text-gray-700 text-center font-medium">
                    Cut power: {gameState.clickPower} × {gameState.multiplier.toFixed(1)} × {(1 + gameState.upgrades.premiumMeat.level * 0.5).toFixed(1)} × {(1 + gameState.upgrades.speedBoost.level * 0.3).toFixed(1)} = ${(gameState.clickPower * gameState.multiplier * (1 + gameState.upgrades.premiumMeat.level * 0.5) * (1 + gameState.upgrades.speedBoost.level * 0.3)).toFixed(1)}/cut
                  </p>
                </div>
                
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Upgrades & Missions */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Upgrades */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-blue-200 rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800">
                  🛠️ Upgrades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                
                {/* Sharp Knife */}
                <div className="p-3 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-800 text-sm">Sharp Knife</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.sharperKnife.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+$1 per cut</p>
                  <Button
                    onClick={() => purchaseUpgrade('sharperKnife')}
                    disabled={gameState.money < gameState.upgrades.sharperKnife.cost}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.sharperKnife.cost)}
                  </Button>
                </div>

                {/* Doner Machine */}
                <div className="p-3 border-2 border-green-200 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-800 text-sm">Doner Machine</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.donerMachine.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+$2/second</p>
                  <Button
                    onClick={() => purchaseUpgrade('donerMachine')}
                    disabled={gameState.money < gameState.upgrades.donerMachine.cost}
                    className="w-full bg-green-500 hover:bg-green-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.donerMachine.cost)}
                  </Button>
                </div>

                {/* Garlic Sauce */}
                <div className="p-3 border-2 border-purple-200 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-800 text-sm">Garlic Sauce</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.garlicSauce.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+20% multiplier</p>
                  <Button
                    onClick={() => purchaseUpgrade('garlicSauce')}
                    disabled={gameState.money < gameState.upgrades.garlicSauce.cost}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.garlicSauce.cost)}
                  </Button>
                </div>

                {/* Marketing */}
                <div className="p-3 border-2 border-pink-200 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span className="font-semibold text-gray-800 text-sm">Marketing</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.marketingBoost.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">More customers</p>
                  <Button
                    onClick={() => purchaseUpgrade('marketingBoost')}
                    disabled={gameState.money < gameState.upgrades.marketingBoost.cost}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.marketingBoost.cost)}
                  </Button>
                </div>

                {/* Premium Meat */}
                <div className="p-3 border-2 border-orange-200 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-800 text-sm">Premium Meat</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.premiumMeat.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+50% cut bonus</p>
                  <Button
                    onClick={() => purchaseUpgrade('premiumMeat')}
                    disabled={gameState.money < gameState.upgrades.premiumMeat.cost}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.premiumMeat.cost)}
                  </Button>
                </div>

                {/* Speed Boost */}
                <div className="p-3 border-2 border-cyan-200 rounded-2xl bg-gradient-to-r from-cyan-50 to-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-cyan-600" />
                      <span className="font-semibold text-gray-800 text-sm">Speed Boost</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.speedBoost.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+30% speed bonus</p>
                  <Button
                    onClick={() => purchaseUpgrade('speedBoost')}
                    disabled={gameState.money < gameState.upgrades.speedBoost.cost}
                    className="w-full bg-cyan-500 hover:bg-cyan-600 text-xs py-2"
                    size="sm"
                  >
                    ${formatNumber(gameState.upgrades.speedBoost.cost)}
                  </Button>
                </div>

                <Separator />
                <div className="text-center space-y-1 text-xs text-gray-600">
                  <p>Auto income: ${formatNumber(gameState.autoIncomeRate * gameState.multiplier)}/sec</p>
                  <p>Total multiplier: {gameState.multiplier.toFixed(1)}x</p>
                </div>
                
              </CardContent>
            </Card>

            {/* Missions */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-indigo-200 rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Missions ({missions.filter(m => !m.completed).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {missions.slice(0, 8).map(mission => (
                  <div key={mission.id} className="p-3 border-2 border-indigo-200 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{mission.title}</span>
                      <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty === 'easy' ? 'Easy' : 
                         mission.difficulty === 'medium' ? 'Medium' : 
                         mission.difficulty === 'hard' ? 'Hard' : 
                         mission.difficulty === 'expert' ? 'Expert' : 'Legend'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{mission.description}</p>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{Math.min(mission.current, mission.target)}/{mission.target}</span>
                      <span>Reward: ${formatNumber(mission.reward)}</span>
                    </div>
                    <Progress value={Math.min((mission.current / mission.target) * 100, 100)} className="h-2 mb-2" />
                    {mission.completed && (
                      <Button
                        onClick={() => claimMissionReward(mission.id)}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-xs py-2"
                        size="sm"
                      >
                        Claim Reward! 🎁
                      </Button>
                    )}
                  </div>
                ))}
                {missions.length > 8 && (
                  <p className="text-center text-xs text-gray-500">
                    And {missions.length - 8} more missions...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 font-medium">
            🥙 Doner Master - The Ultimate Idle Clicker! 🥙
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Auto-save enabled • {missions.filter(m => m.completed).length}/{missions.length} missions completed
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;