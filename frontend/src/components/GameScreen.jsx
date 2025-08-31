import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Coins, Zap, Timer, TrendingUp, Users, Target, Clock, Trophy, Star, Award, Volume2, VolumeX, Heart, AlertTriangle } from 'lucide-react';

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    money: 0,
    clickPower: 1,
    autoIncomeRate: 0,
    multiplier: 1,
    totalDonersCut: 0,
    totalCustomersServed: 0,
    totalCustomersLost: 0,
    totalPlayTime: 0,
    soundEnabled: true,
    customerSatisfaction: 100, // 0-100 customer satisfaction
    shopClosed: false,
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
  const [knifePosition, setKnifePosition] = useState(-50); // Knife animation position
  const [particles, setParticles] = useState([]);
  const [moneyPopup, setMoneyPopup] = useState([]);
  const [satisfactionPopup, setSatisfactionPopup] = useState([]);

  // Customer system
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProgress, setCustomerProgress] = useState(0);

  // Shorter time limits - much more challenging!
  const customerTypes = [
    { name: "Ahmed", avatar: "👨", order: "Regular doner", slicesNeeded: 8, timeLimit: 5, reward: 30, nationality: "🇹🇷" },
    { name: "Fatma", avatar: "👵", order: "Less oil doner", slicesNeeded: 6, timeLimit: 4, reward: 25, nationality: "🇹🇷" },
    { name: "Student Mike", avatar: "🧑‍🎓", order: "Large doner", slicesNeeded: 12, timeLimit: 6, reward: 45, nationality: "🇺🇸" },
    { name: "Business Lady", avatar: "👩‍💼", order: "Quick doner", slicesNeeded: 5, timeLimit: 3, reward: 35, nationality: "🇬🇧" },
    { name: "Tourist John", avatar: "🧑‍🦱", order: "Special doner", slicesNeeded: 15, timeLimit: 8, reward: 60, nationality: "🇩🇪" },
    { name: "Coach Ali", avatar: "🧑‍⚕️", order: "Protein doner", slicesNeeded: 20, timeLimit: 10, reward: 80, nationality: "🇹🇷" },
    { name: "Little Emma", avatar: "🧒", order: "Small doner", slicesNeeded: 4, timeLimit: 3, reward: 20, nationality: "🇫🇷" },
    { name: "Builder Joe", avatar: "👷‍♂️", order: "Hearty doner", slicesNeeded: 25, timeLimit: 12, reward: 100, nationality: "🇮🇪" },
    { name: "Chef Marco", avatar: "👨‍🍳", order: "Gourmet doner", slicesNeeded: 18, timeLimit: 9, reward: 75, nationality: "🇮🇹" },
    { name: "Doctor Sarah", avatar: "👩‍⚕️", order: "Healthy doner", slicesNeeded: 10, timeLimit: 5, reward: 55, nationality: "🇨🇦" },
    { name: "Programmer Alex", avatar: "👨‍💻", order: "Energy doner", slicesNeeded: 14, timeLimit: 7, reward: 65, nationality: "🇺🇸" },
    { name: "Artist Luna", avatar: "👩‍🎨", order: "Creative doner", slicesNeeded: 12, timeLimit: 6, reward: 50, nationality: "🇯🇵" },
    { name: "Police Officer", avatar: "👮‍♂️", order: "Power doner", slicesNeeded: 22, timeLimit: 11, reward: 90, nationality: "🇬🇧" },
    { name: "Fire Fighter", avatar: "🧑‍🚒", order: "Hero doner", slicesNeeded: 30, timeLimit: 15, reward: 120, nationality: "🇺🇸" },
    { name: "VIP Customer", avatar: "🤵", order: "Royal doner", slicesNeeded: 35, timeLimit: 20, reward: 200, nationality: "🇸🇦" }
  ];

  // Expanded mission system
  const [missions, setMissions] = useState([
    // Beginner missions
    { id: 1, title: "First Steps", description: "Cut 5 doners", target: 5, current: 0, reward: 25, difficulty: "easy", completed: false },
    { id: 2, title: "Doner Apprentice", description: "Cut 20 doners", target: 20, current: 0, reward: 75, difficulty: "easy", completed: false },
    { id: 3, title: "First Customer", description: "Serve 1 customer", target: 1, current: 0, reward: 50, difficulty: "easy", completed: false },
    { id: 4, title: "Satisfaction Keeper", description: "Keep satisfaction above 80", target: 80, current: 100, reward: 100, difficulty: "easy", completed: false },
    
    // Intermediate missions
    { id: 5, title: "Doner Master", description: "Cut 100 doners", target: 100, current: 0, reward: 200, difficulty: "medium", completed: false },
    { id: 6, title: "Speed Service", description: "Cut 30 doners in 60s", target: 30, current: 0, reward: 300, difficulty: "medium", timeLimit: 60, completed: false },
    { id: 7, title: "Customer Satisfaction", description: "Serve 10 customers", target: 10, current: 0, reward: 250, difficulty: "medium", completed: false },
    { id: 8, title: "Money Collector", description: "Earn 1000$", target: 1000, current: 0, reward: 150, difficulty: "medium", completed: false },
    { id: 9, title: "No Losses", description: "Don't lose any customers (serve 15)", target: 15, current: 0, reward: 500, difficulty: "medium", completed: false },
    
    // Advanced missions
    { id: 10, title: "Perfect Service", description: "Keep satisfaction at 100 for 5 minutes", target: 300, current: 0, reward: 1000, difficulty: "hard", completed: false },
    { id: 11, title: "Crisis Manager", description: "Recover from satisfaction below 20", target: 1, current: 0, reward: 800, difficulty: "hard", completed: false },
    { id: 12, title: "VIP Treatment", description: "Serve the VIP Customer", target: 1, current: 0, reward: 1500, difficulty: "hard", completed: false },
    
    // Expert missions
    { id: 13, title: "Doner Empire", description: "Serve 100 customers without shop closure", target: 100, current: 0, reward: 5000, difficulty: "expert", completed: false },
    { id: 14, title: "Millionaire", description: "Earn 50000$", target: 50000, current: 0, reward: 10000, difficulty: "expert", completed: false }
  ]);

  // Sound effects
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
      case 'lost_customer':
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
        break;
      case 'shop_close':
        oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 0.5);
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
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

  // Satisfaction popup effect
  const showSatisfactionPopup = (change, x, y) => {
    const popup = {
      id: Date.now(),
      change,
      x: x || 30,
      y: y || 30
    };
    setSatisfactionPopup(prev => [...prev, popup]);
    
    setTimeout(() => {
      setSatisfactionPopup(prev => prev.filter(p => p.id !== popup.id));
    }, 2000);
  };

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
    if (gameState.autoIncomeRate > 0 && !gameState.shopClosed) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          money: prev.money + (prev.autoIncomeRate * prev.multiplier)
        }));
        
        setDonerRotation(prev => (prev + 1) % 360);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoIncomeRate, gameState.multiplier, gameState.shopClosed]);

  // Customer spawning - only if shop is open
  useEffect(() => {
    if (!currentCustomer && !gameState.shopClosed) {
      const spawnInterval = setInterval(() => {
        const baseChance = 0.4;
        const marketingBonus = gameState.upgrades.marketingBoost.level * 0.1;
        const satisfactionPenalty = (100 - gameState.customerSatisfaction) * 0.005; // Lower satisfaction = fewer customers
        const totalChance = Math.max(baseChance + marketingBonus - satisfactionPenalty, 0.1);
        
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
      }, 2000);

      return () => clearInterval(spawnInterval);
    }
  }, [currentCustomer, gameState.upgrades.marketingBoost.level, gameState.customerSatisfaction, gameState.shopClosed, playSound]);

  // Customer timer
  useEffect(() => {
    if (currentCustomer && currentCustomer.timeRemaining > 0 && !gameState.shopClosed) {
      const timer = setInterval(() => {
        setCurrentCustomer(prev => {
          if (prev.timeRemaining <= 1) {
            // Customer left disappointed - decrease satisfaction
            setGameState(prevState => {
              const newSatisfaction = Math.max(prevState.customerSatisfaction - 15, 0);
              return {
                ...prevState,
                customerSatisfaction: newSatisfaction,
                totalCustomersLost: prevState.totalCustomersLost + 1
              };
            });
            
            playSound('lost_customer');
            showSatisfactionPopup(-15, 25, 25);
            
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
  }, [currentCustomer, gameState.shopClosed, playSound]);

  // Check for shop closure
  useEffect(() => {
    if (gameState.customerSatisfaction <= 0 && !gameState.shopClosed) {
      setGameState(prev => ({ ...prev, shopClosed: true }));
      setCurrentCustomer(null);
      playSound('shop_close');
    }
  }, [gameState.customerSatisfaction, gameState.shopClosed, playSound]);

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

  // REALISTIC SLICE ANIMATION with knife falling down
  const sliceDoner = useCallback(() => {
    if (gameState.shopClosed) return;
    
    const baseEarned = gameState.clickPower * gameState.multiplier;
    const premiumBonus = 1 + (gameState.upgrades.premiumMeat.level * gameState.upgrades.premiumMeat.clickMultiplier);
    const speedBonus = 1 + (gameState.upgrades.speedBoost.level * gameState.upgrades.speedBoost.speedMultiplier);
    const earned = baseEarned * premiumBonus * speedBonus;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + earned,
      totalDonersCut: prev.totalDonersCut + 1
    }));

    playSound('slice');
    showMoneyPopup(earned, 45 + Math.random() * 10, 40 + Math.random() * 10);

    // Update missions
    setMissions(prev => prev.map(mission => {
      if (!mission.completed) {
        if ([1, 2, 5].includes(mission.id)) {
          const newCurrent = mission.current + 1;
          return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
        }
        if ([6].includes(mission.id)) {
          return { ...mission, current: mission.current + 1 };
        }
        if ([8, 14].includes(mission.id)) {
          return { ...mission, current: Math.max(mission.current, gameState.money + earned), completed: (gameState.money + earned) >= mission.target };
        }
        if ([4].includes(mission.id)) {
          return { ...mission, current: gameState.customerSatisfaction, completed: gameState.customerSatisfaction >= mission.target };
        }
      }
      return mission;
    }));

    // Handle customer order
    if (currentCustomer) {
      const newProgress = customerProgress + 1;
      setCustomerProgress(newProgress);
      
      if (newProgress >= currentCustomer.slicesNeeded) {
        // Order completed successfully!
        const customerReward = currentCustomer.reward * (1 + gameState.upgrades.marketingBoost.level * 0.1);
        
        // Increase satisfaction for completed order
        const satisfactionIncrease = Math.min(5, 100 - gameState.customerSatisfaction);
        
        setGameState(prev => ({
          ...prev,
          money: prev.money + customerReward,
          totalCustomersServed: prev.totalCustomersServed + 1,
          customerSatisfaction: Math.min(prev.customerSatisfaction + satisfactionIncrease, 100)
        }));
        
        playSound('complete');
        showMoneyPopup(customerReward, 20, 30);
        if (satisfactionIncrease > 0) {
          showSatisfactionPopup(satisfactionIncrease, 35, 25);
        }
        
        // Update customer missions
        setMissions(prev => prev.map(mission => {
          if ([3, 7, 9, 13].includes(mission.id) && !mission.completed) {
            const newCurrent = mission.current + 1;
            return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
          }
          if (mission.id === 12 && currentCustomer.name === "VIP Customer") {
            return { ...mission, current: 1, completed: true };
          }
          return mission;
        }));
        
        setCurrentCustomer(null);
        setCustomerProgress(0);
      }
    }

    // KNIFE FALLING ANIMATION - Top to bottom
    setIsSlicing(true);
    setKnifePosition(-50); // Start position (above doner)
    
    // Animate knife falling down
    const animateKnife = () => {
      let position = -50;
      const fallInterval = setInterval(() => {
        position += 8; // Speed of falling
        setKnifePosition(position);
        
        if (position >= 100) { // End position (below doner)
          clearInterval(fallInterval);
          setTimeout(() => {
            setIsSlicing(false);
            setKnifePosition(-50); // Reset position
          }, 200);
        }
      }, 20);
    };
    
    animateKnife();
    
    // Create meat particles at bottom
    const newParticles = Array.from({ length: 10 }, (_, i) => ({
      id: Date.now() + i,
      x: 25 + Math.random() * 50, // Spread across bottom
      y: 75 + Math.random() * 15, // At bottom of doner
      color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e', '#dc2626', '#ef4444'][Math.floor(Math.random() * 6)]
    }));
    setParticles(prev => [...prev, ...newParticles]);
    
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 2000);
  }, [gameState, currentCustomer, customerProgress, playSound]);

  // Reopen shop function
  const reopenShop = () => {
    const cost = 1000; // Cost to reopen shop
    if (gameState.money >= cost) {
      setGameState(prev => ({
        ...prev,
        money: prev.money - cost,
        shopClosed: false,
        customerSatisfaction: 50 // Start with medium satisfaction
      }));
      playSound('complete');
    }
  };

  // Purchase upgrade function
  const purchaseUpgrade = (upgradeType) => {
    const upgrade = gameState.upgrades[upgradeType];
    
    if (gameState.money >= upgrade.cost && !gameState.shopClosed) {
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

  const getSatisfactionColor = (satisfaction) => {
    if (satisfaction >= 80) return 'text-green-600';
    if (satisfaction >= 50) return 'text-yellow-600';
    if (satisfaction >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  if (gameState.shopClosed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-400 via-gray-500 to-gray-600 p-4 flex items-center justify-center">
        <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-red-400 rounded-3xl max-w-lg">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">😰</div>
            <h2 className="text-3xl font-bold text-red-600 mb-4">SHOP CLOSED!</h2>
            <p className="text-gray-700 mb-4">Customer satisfaction dropped to zero!</p>
            <p className="text-sm text-gray-600 mb-6">
              Lost customers: {gameState.totalCustomersLost} | Served: {gameState.totalCustomersServed}
            </p>
            
            <div className="space-y-4">
              <Button
                onClick={reopenShop}
                disabled={gameState.money < 1000}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-full"
                size="lg"
              >
                💰 Reopen Shop - $1000
              </Button>
              
              <Button
                onClick={() => {
                  localStorage.removeItem('donerMasterSave');
                  window.location.reload();
                }}
                variant="outline"
                className="w-full"
              >
                🔄 Start Over
              </Button>
            </div>
            
            <p className="text-xs text-gray-500 mt-4">
              Current money: ${formatNumber(gameState.money)}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      
      {/* Satisfaction popups */}
      {satisfactionPopup.map(popup => (
        <div
          key={popup.id}
          className={`absolute text-xl font-bold animate-bounce pointer-events-none z-50 ${popup.change > 0 ? 'text-green-600' : 'text-red-600'}`}
          style={{
            left: `${popup.x}%`,
            top: `${popup.y}%`,
            animation: 'floatUp 2s ease-out forwards'
          }}
        >
          {popup.change > 0 ? '+' : ''}{popup.change} 😊
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
          
          {/* Satisfaction bar */}
          <div className="inline-flex items-center gap-3 bg-white/90 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border-2 border-pink-300 mb-4">
            <Heart className={`w-6 h-6 ${getSatisfactionColor(gameState.customerSatisfaction)}`} />
            <span className="text-sm font-medium text-gray-700">Customer Satisfaction:</span>
            <Progress value={gameState.customerSatisfaction} className="w-32 h-3" />
            <span className={`text-lg font-bold ${getSatisfactionColor(gameState.customerSatisfaction)}`}>
              {gameState.customerSatisfaction}%
            </span>
            {gameState.customerSatisfaction <= 20 && (
              <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
            )}
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
              Served: {gameState.totalCustomersServed}
            </Badge>
            <Badge variant="outline" className="px-3 py-1 bg-red-50">
              Lost: {gameState.totalCustomersLost}
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
                          <span className={`font-bold ${currentCustomer.timeRemaining <= 2 ? 'text-red-600 animate-pulse' : 'text-gray-600'}`}>
                            Time: {currentCustomer.timeRemaining}s
                          </span>
                        </div>
                        <Progress 
                          value={(customerProgress / currentCustomer.slicesNeeded) * 100} 
                          className="h-3 mb-2" 
                        />
                        <Progress 
                          value={(currentCustomer.timeRemaining / currentCustomer.timeLimit) * 100} 
                          className={`h-2 ${currentCustomer.timeRemaining <= 2 ? 'animate-pulse' : ''}`}
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
                
                {/* CONE-SHAPED DONER - REALISTIC! */}
                <div className="relative flex flex-col items-center mb-8">
                  <div 
                    className="relative w-80 h-96 mb-6 cursor-pointer transform transition-all hover:scale-105 active:scale-95"
                    onClick={sliceDoner}
                    style={{
                      transform: `rotate(${donerRotation}deg) scale(1)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    {/* CONE-SHAPED DONER LAYERS - WIDE TOP, NARROW BOTTOM */}
                    
                    {/* Top layer - Widest (barely visible) */}
                    <div className="absolute left-1/2 top-4 w-72 h-16 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 transform -translate-x-1/2 shadow-2xl border-4 border-amber-700 overflow-hidden opacity-20" 
                         style={{
                           clipPath: 'ellipse(140px 32px at 50% 50%)',
                           borderRadius: '50%'
                         }}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-400 via-orange-400 to-amber-500 opacity-90" style={{borderRadius: '50%'}}></div>
                      {/* Skewer through center */}
                      <div className="absolute left-1/2 top-0 w-2 h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform -translate-x-1/2 opacity-60"></div>
                    </div>
                    
                    {/* Upper layer */}
                    <div className="absolute left-1/2 top-12 w-68 h-20 bg-gradient-to-r from-red-500 via-orange-600 to-amber-600 transform -translate-x-1/2 shadow-xl border-3 border-red-700 overflow-hidden opacity-40"
                         style={{
                           clipPath: 'ellipse(130px 40px at 50% 50%)',
                           borderRadius: '50%'
                         }}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-500 via-red-400 to-orange-500 opacity-85" style={{borderRadius: '50%'}}></div>
                      <div className="absolute left-1/2 top-0 w-2 h-full bg-gradient-to-b from-gray-400 to-gray-600 rounded-full transform -translate-x-1/2 opacity-70"></div>
                    </div>
                    
                    {/* Middle layer */}
                    <div className="absolute left-1/2 top-24 w-60 h-28 bg-gradient-to-r from-orange-600 via-red-500 to-amber-700 transform -translate-x-1/2 shadow-xl border-3 border-orange-800 overflow-hidden opacity-60"
                         style={{
                           clipPath: 'ellipse(115px 56px at 50% 50%)',
                           borderRadius: '50%'
                         }}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-600 via-amber-500 to-orange-600 opacity-90" style={{borderRadius: '50%'}}></div>
                      <div className="absolute left-1/2 top-0 w-2 h-full bg-gradient-to-b from-gray-500 to-gray-700 rounded-full transform -translate-x-1/2 opacity-80"></div>
                    </div>
                    
                    {/* Lower middle layer */}
                    <div className="absolute left-1/2 top-40 w-48 h-32 bg-gradient-to-r from-amber-700 via-red-600 to-orange-700 transform -translate-x-1/2 shadow-xl border-3 border-amber-800 overflow-hidden opacity-80"
                         style={{
                           clipPath: 'ellipse(92px 64px at 50% 50%)',
                           borderRadius: '50%'
                         }}>
                      <div className="absolute inset-2 bg-gradient-to-br from-orange-600 via-red-500 to-amber-600 opacity-85" style={{borderRadius: '50%'}}></div>
                      <div className="absolute left-1/2 top-0 w-2 h-full bg-gradient-to-b from-gray-500 to-gray-700 rounded-full transform -translate-x-1/2 opacity-90"></div>
                    </div>
                    
                    {/* Bottom layer - MAIN VISIBLE PART */}
                    <div className="absolute left-1/2 top-56 w-36 h-36 bg-gradient-to-r from-red-700 via-amber-600 to-orange-800 transform -translate-x-1/2 shadow-2xl border-4 border-red-900 overflow-hidden"
                         style={{
                           clipPath: 'ellipse(68px 72px at 50% 50%)',
                           borderRadius: '50%'
                         }}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-700 via-orange-600 to-red-600 opacity-90" style={{borderRadius: '50%'}}></div>
                      {/* Meat texture details */}
                      <div className="absolute inset-4 bg-gradient-to-tl from-yellow-600 via-red-500 to-orange-600 opacity-70" style={{borderRadius: '50%'}}></div>
                      <div className="absolute inset-6 bg-gradient-to-br from-red-400 via-orange-400 to-amber-500 opacity-60" style={{borderRadius: '50%'}}></div>
                      {/* Skewer through center - most visible */}
                      <div className="absolute left-1/2 top-0 w-3 h-full bg-gradient-to-b from-gray-600 to-gray-800 rounded-full transform -translate-x-1/2 shadow-lg"></div>
                    </div>
                    
                    {/* KNIFE FALLING ANIMATION */}
                    {isSlicing && (
                      <div 
                        className="absolute left-1/2 transform -translate-x-1/2 text-6xl z-50 transition-all duration-300"
                        style={{
                          top: `${knifePosition}%`,
                          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))'
                        }}
                      >
                        🔪
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced particles at bottom */}
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
                  
                  {/* Cut Button */}
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

                {/* Other upgrades... */}
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
                {missions.slice(0, 6).map(mission => (
                  <div key={mission.id} className="p-3 border-2 border-indigo-200 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{mission.title}</span>
                      <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty === 'easy' ? 'Easy' : 
                         mission.difficulty === 'medium' ? 'Medium' : 
                         mission.difficulty === 'hard' ? 'Hard' : 'Expert'}
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
                {missions.length > 6 && (
                  <p className="text-center text-xs text-gray-500">
                    And {missions.length - 6} more missions...
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
            Auto-save enabled • Satisfaction: {gameState.customerSatisfaction}% • {missions.filter(m => m.completed).length}/{missions.length} missions completed
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;