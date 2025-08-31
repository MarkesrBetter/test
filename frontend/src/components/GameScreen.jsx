import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Coins, Zap, Timer, TrendingUp, Users, Target, Clock, Trophy, Star, Award } from 'lucide-react';

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    money: 0,
    clickPower: 1,
    autoIncomeRate: 0,
    multiplier: 1,
    totalDonersCut: 0,
    totalCustomersServed: 0,
    totalPlayTime: 0,
    upgrades: {
      sharperKnife: { level: 0, cost: 15, power: 1 },
      donerMachine: { level: 0, cost: 75, income: 1 },
      garlicSauce: { level: 0, cost: 150, multiplier: 0.2 },
      marketingBoost: { level: 0, cost: 300, customerBonus: 0.1 },
      premiumMeat: { level: 0, cost: 500, clickMultiplier: 0.5 }
    }
  });

  const [donerRotation, setDonerRotation] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [particles, setParticles] = useState([]);

  // Customer system
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProgress, setCustomerProgress] = useState(0);

  // Mission system with much more content
  const [missions, setMissions] = useState([
    // Başlangıç görevleri (0-10 dakika)
    { id: 1, title: "İlk Adım", description: "5 döner kes", target: 5, current: 0, reward: 25, difficulty: "easy", completed: false },
    { id: 2, title: "Dönerci Çırağı", description: "20 döner kes", target: 20, current: 0, reward: 75, difficulty: "easy", completed: false },
    { id: 3, title: "İlk Müşteri", description: "1 müşteri siparişini tamamla", target: 1, current: 0, reward: 50, difficulty: "easy", completed: false },
    
    // Orta seviye görevler (10-30 dakika)
    { id: 4, title: "Döner Ustası", description: "100 döner kes", target: 100, current: 0, reward: 200, difficulty: "medium", completed: false },
    { id: 5, title: "Hızlı Servis", description: "60 saniyede 30 döner kes", target: 30, current: 0, reward: 300, difficulty: "medium", timeLimit: 60, completed: false },
    { id: 6, title: "Müşteri Memnuniyeti", description: "10 müşteri siparişini tamamla", target: 10, current: 0, reward: 250, difficulty: "medium", completed: false },
    { id: 7, title: "Para Biriktirici", description: "500₺ biriktir", target: 500, current: 0, reward: 150, difficulty: "medium", completed: false },
    
    // İleri seviye görevler (30-60 dakika)
    { id: 8, title: "Döner Efsanesi", description: "500 döner kes", target: 500, current: 0, reward: 1000, difficulty: "hard", completed: false },
    { id: 9, title: "Süper Hızlı", description: "30 saniyede 25 döner kes", target: 25, current: 0, reward: 800, difficulty: "hard", timeLimit: 30, completed: false },
    { id: 10, title: "Müşteri Kralı", description: "50 müşteri siparişini tamamla", target: 50, current: 0, reward: 1200, difficulty: "hard", completed: false },
    { id: 11, title: "Zengin Dönerci", description: "5000₺ biriktir", target: 5000, current: 0, reward: 2000, difficulty: "hard", completed: false },
    { id: 12, title: "Döner İmparatoru", description: "1000 döner kes", target: 1000, current: 0, reward: 3000, difficulty: "expert", completed: false },
    { id: 13, title: "Ultra Hız", description: "15 saniyede 20 döner kes", target: 20, current: 0, reward: 2500, difficulty: "expert", timeLimit: 15, completed: false },
    { id: 14, title: "Döner Devi", description: "100 müşteri siparişini tamamla", target: 100, current: 0, reward: 5000, difficulty: "expert", completed: false },
    { id: 15, title: "Milyoner Dönerci", description: "25000₺ biriktir", target: 25000, current: 0, reward: 10000, difficulty: "expert", completed: false }
  ]);

  // Achievement system
  const [achievements, setAchievements] = useState([
    { id: 'speed_demon', title: 'Hız Şeytanı', description: '1 saniyede 5 döner kes', unlocked: false, reward: 500 },
    { id: 'marathon_cutter', title: 'Maraton Kesicisi', description: '30 dakika oyun oyna', unlocked: false, reward: 1000 },
    { id: 'customer_favorite', title: 'Müşteri Favorisi', description: 'Hiç müşteri kaçırma (20 müşteri)', unlocked: false, reward: 2000 },
    { id: 'upgrade_master', title: 'Yükseltme Ustası', description: 'Tüm yükseltmeleri 5. seviyeye çıkar', unlocked: false, reward: 5000 }
  ]);

  const customerTypes = [
    { name: "Ahmet Abi", avatar: "👨", order: "Normal döner", slicesNeeded: 8, timeLimit: 8, reward: 30 },
    { name: "Fatma Teyze", avatar: "👵", order: "Az yağlı döner", slicesNeeded: 6, timeLimit: 10, reward: 25 },
    { name: "Öğrenci Mehmet", avatar: "🧑‍🎓", order: "Büyük döner", slicesNeeded: 12, timeLimit: 12, reward: 45 },
    { name: "İş Kadını", avatar: "👩‍💼", order: "Hızlı döner", slicesNeeded: 5, timeLimit: 6, reward: 35 },
    { name: "Turist John", avatar: "🧑‍🦱", order: "Özel döner", slicesNeeded: 15, timeLimit: 15, reward: 60 },
    { name: "Spor Antrenörü", avatar: "🧑‍⚕️", order: "Protein döner", slicesNeeded: 20, timeLimit: 18, reward: 80 },
    { name: "Çocuk Arda", avatar: "🧒", order: "Küçük döner", slicesNeeded: 4, timeLimit: 5, reward: 20 },
    { name: "İnşaat İşçisi", avatar: "👷‍♂️", order: "Doyurucu döner", slicesNeeded: 25, timeLimit: 20, reward: 100 }
  ];

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
        
        setDonerRotation(prev => (prev + 2) % 360);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoIncomeRate, gameState.multiplier]);

  // Customer spawning - more frequent
  useEffect(() => {
    if (!currentCustomer) {
      const spawnInterval = setInterval(() => {
        const baseChance = 0.4; // 40% base chance
        const marketingBonus = gameState.upgrades.marketingBoost.level * 0.1;
        const totalChance = Math.min(baseChance + marketingBonus, 0.8); // Max 80%
        
        if (Math.random() < totalChance) {
          const randomCustomer = customerTypes[Math.floor(Math.random() * customerTypes.length)];
          setCurrentCustomer({
            ...randomCustomer,
            id: Date.now(),
            timeRemaining: randomCustomer.timeLimit
          });
          setCustomerProgress(0);
        }
      }, 2000); // Her 2 saniyede kontrol

      return () => clearInterval(spawnInterval);
    }
  }, [currentCustomer, gameState.upgrades.marketingBoost.level]);

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

  // Slice döner function
  const sliceDoner = useCallback(() => {
    const baseEarned = gameState.clickPower * gameState.multiplier;
    const premiumBonus = 1 + (gameState.upgrades.premiumMeat.level * gameState.upgrades.premiumMeat.clickMultiplier);
    const earned = baseEarned * premiumBonus;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + earned,
      totalDonersCut: prev.totalDonersCut + 1
    }));

    // Update missions
    setMissions(prev => prev.map(mission => {
      if (!mission.completed) {
        // Döner kesme görevleri
        if ([1, 2, 4, 8, 12].includes(mission.id)) {
          const newCurrent = mission.current + 1;
          return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
        }
        // Hızlı kesme görevleri (timer-based)
        if ([5, 9, 13].includes(mission.id)) {
          return { ...mission, current: mission.current + 1 };
        }
        // Para biriktirme görevleri
        if ([7, 11, 15].includes(mission.id)) {
          return { ...mission, current: Math.max(mission.current, gameState.money + earned), completed: (gameState.money + earned) >= mission.target };
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
        
        // Update customer missions
        setMissions(prev => prev.map(mission => {
          if ([3, 6, 10, 14].includes(mission.id) && !mission.completed) {
            const newCurrent = mission.current + 1;
            return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
          }
          return mission;
        }));
        
        setCurrentCustomer(null);
        setCustomerProgress(0);
      }
    }

    // Animation effects
    setIsSlicing(true);
    setDonerRotation(prev => (prev + 25) % 360);
    
    // Create more particles
    const newParticles = Array.from({ length: 6 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 40 + Math.random() * 20,
      color: ['#fbbf24', '#f59e0b', '#d97706', '#92400e'][Math.floor(Math.random() * 4)]
    }));
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => setIsSlicing(false), 300);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1500);
  }, [gameState.clickPower, gameState.multiplier, gameState.upgrades, currentCustomer, customerProgress, gameState.money]);

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
        }
        
        newState.upgrades[upgradeType] = newUpgrade;
        return newState;
      });
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
    }
  };

  // Save/Load game state
  useEffect(() => {
    localStorage.setItem('donerMasterSave', JSON.stringify({gameState, missions, achievements}));
  }, [gameState, missions, achievements]);

  useEffect(() => {
    const savedGame = localStorage.getItem('donerMasterSave');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed.gameState) setGameState(parsed.gameState);
        if (parsed.missions) setMissions(parsed.missions);
        if (parsed.achievements) setAchievements(parsed.achievements);
      } catch (error) {
        console.error('Save yüklenemedi:', error);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 p-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-xl border-4 border-yellow-300 mb-4">
            <Coins className="w-10 h-10 text-yellow-600" />
            <span className="text-4xl font-bold text-gray-800">
              {formatNumber(gameState.money)} ₺
            </span>
          </div>
          <div className="flex justify-center gap-4 text-sm">
            <Badge variant="outline" className="px-3 py-1">
              <Clock className="w-4 h-4 mr-1" />
              Oyun Süresi: {formatTime(gameState.totalPlayTime)}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Target className="w-4 h-4 mr-1" />
              Döner: {gameState.totalDonersCut}
            </Badge>
            <Badge variant="outline" className="px-3 py-1">
              <Users className="w-4 h-4 mr-1" />
              Müşteri: {gameState.totalCustomersServed}
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
                  Müşteriler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentCustomer ? (
                  <div className="text-center space-y-4">
                    <div className="text-6xl mb-2">{currentCustomer.avatar}</div>
                    <div className="bg-pink-50 rounded-2xl p-4 border-2 border-pink-200">
                      <h3 className="font-bold text-gray-800">{currentCustomer.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{currentCustomer.order}</p>
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>İlerleme: {customerProgress}/{currentCustomer.slicesNeeded}</span>
                          <span>Süre: {currentCustomer.timeRemaining}s</span>
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
                        Ödül: {Math.floor(currentCustomer.reward * (1 + gameState.upgrades.marketingBoost.level * 0.1))} ₺
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Müşteri bekleniyor...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-orange-300 rounded-3xl">
              <CardContent className="p-8">
                
                {/* GERÇEK DÖNER TASARIMI */}
                <div className="relative flex flex-col items-center mb-8">
                  <div 
                    className="relative w-80 h-96 mb-6 cursor-pointer transform transition-all hover:scale-105 active:scale-95"
                    onClick={sliceDoner}
                    style={{
                      transform: `rotate(${donerRotation}deg) scale(1)`,
                      transition: 'transform 0.6s ease-out'
                    }}
                  >
                    {/* Döner Şişi (Metal rod in the middle) */}
                    <div className="absolute left-1/2 top-0 w-3 h-full bg-gradient-to-b from-gray-300 via-gray-500 to-gray-700 rounded-full shadow-lg transform -translate-x-1/2 z-10"></div>
                    
                    {/* Döner Et Katmanları - GERÇEK DÖNER GİBİ */}
                    {/* En üst katman */}
                    <div className="absolute left-1/2 top-8 w-72 h-20 bg-gradient-to-r from-amber-600 via-orange-500 to-red-600 rounded-full transform -translate-x-1/2 shadow-2xl border-4 border-amber-700" 
                         style={{clipPath: 'ellipse(140px 40px at 50% 50%)'}}>
                      {/* Et tekstürü */}
                      <div className="absolute inset-2 bg-gradient-to-br from-red-400 via-orange-400 to-amber-500 rounded-full opacity-90"></div>
                      <div className="absolute inset-4 bg-gradient-to-tl from-yellow-600 via-red-500 to-orange-600 rounded-full opacity-70"></div>
                    </div>
                    
                    {/* Orta üst katman */}
                    <div className="absolute left-1/2 top-16 w-68 h-24 bg-gradient-to-r from-red-500 via-orange-600 to-amber-600 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-red-700"
                         style={{clipPath: 'ellipse(135px 48px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-500 via-red-400 to-orange-500 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Orta katman */}
                    <div className="absolute left-1/2 top-24 w-64 h-28 bg-gradient-to-r from-orange-600 via-red-500 to-amber-700 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-orange-800"
                         style={{clipPath: 'ellipse(130px 56px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-600 via-amber-500 to-orange-600 rounded-full opacity-90"></div>
                    </div>
                    
                    {/* Orta alt katman */}
                    <div className="absolute left-1/2 top-32 w-60 h-32 bg-gradient-to-r from-amber-700 via-red-600 to-orange-700 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-amber-800"
                         style={{clipPath: 'ellipse(125px 64px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-orange-600 via-red-500 to-amber-600 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Alt katman */}
                    <div className="absolute left-1/2 top-40 w-56 h-36 bg-gradient-to-r from-red-700 via-amber-600 to-orange-800 rounded-full transform -translate-x-1/2 shadow-xl border-3 border-red-900"
                         style={{clipPath: 'ellipse(120px 72px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-amber-700 via-orange-600 to-red-600 rounded-full opacity-90"></div>
                    </div>
                    
                    {/* En alt katman */}
                    <div className="absolute left-1/2 top-48 w-52 h-32 bg-gradient-to-r from-orange-800 via-red-700 to-amber-800 rounded-full transform -translate-x-1/2 shadow-2xl border-4 border-orange-900"
                         style={{clipPath: 'ellipse(115px 64px at 50% 50%)'}}>
                      <div className="absolute inset-2 bg-gradient-to-br from-red-700 via-amber-600 to-orange-700 rounded-full opacity-85"></div>
                    </div>
                    
                    {/* Sevimli yüz ortada */}
                    <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-4xl select-none pointer-events-none z-20">
                      {isSlicing ? "😵‍💫" : "😋"}
                    </div>
                    
                    {/* Slice effect */}
                    {isSlicing && (
                      <div className="absolute inset-0 border-8 border-yellow-400 rounded-full animate-ping opacity-75 z-30"></div>
                    )}
                  </div>
                  
                  {/* Particles - daha renkli */}
                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute w-3 h-3 rounded-full pointer-events-none animate-bounce shadow-lg z-40"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        backgroundColor: particle.color,
                        animationDuration: '1.5s'
                      }}
                    />
                  ))}
                  
                  {/* Slice Button */}
                  <Button
                    onClick={sliceDoner}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-full shadow-xl transform transition-all hover:scale-110 active:scale-95 border-4 border-green-400 text-xl"
                  >
                    🔪 DÖNER KES! 🥙
                  </Button>
                  
                  <p className="mt-4 text-gray-700 text-center font-medium">
                    Kesme gücü: {gameState.clickPower} × {gameState.multiplier.toFixed(1)} × {(1 + gameState.upgrades.premiumMeat.level * 0.5).toFixed(1)} = {(gameState.clickPower * gameState.multiplier * (1 + gameState.upgrades.premiumMeat.level * 0.5)).toFixed(1)} ₺/kesim
                  </p>
                </div>
                
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Upgrades & Missions */}
          <div className="lg:col-span-1 space-y-4">
            
            {/* Upgrades - Genişletilmiş */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-blue-200 rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800">
                  🛠️ Yükseltmeler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                
                {/* Keskin Bıçak */}
                <div className="p-3 border-2 border-blue-200 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-gray-800 text-sm">Keskin Bıçak</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.sharperKnife.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+1 ₺ per kesim</p>
                  <Button
                    onClick={() => purchaseUpgrade('sharperKnife')}
                    disabled={gameState.money < gameState.upgrades.sharperKnife.cost}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.sharperKnife.cost)} ₺
                  </Button>
                </div>

                {/* Döner Makinesi */}
                <div className="p-3 border-2 border-green-200 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-800 text-sm">Döner Makinesi</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.donerMachine.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+2 ₺/saniye</p>
                  <Button
                    onClick={() => purchaseUpgrade('donerMachine')}
                    disabled={gameState.money < gameState.upgrades.donerMachine.cost}
                    className="w-full bg-green-500 hover:bg-green-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.donerMachine.cost)} ₺
                  </Button>
                </div>

                {/* Sarımsaklı Sos */}
                <div className="p-3 border-2 border-purple-200 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-purple-600" />
                      <span className="font-semibold text-gray-800 text-sm">Sarımsaklı Sos</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.garlicSauce.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+20% çarpan</p>
                  <Button
                    onClick={() => purchaseUpgrade('garlicSauce')}
                    disabled={gameState.money < gameState.upgrades.garlicSauce.cost}
                    className="w-full bg-purple-500 hover:bg-purple-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.garlicSauce.cost)} ₺
                  </Button>
                </div>

                {/* Pazarlama Desteği */}
                <div className="p-3 border-2 border-pink-200 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      <span className="font-semibold text-gray-800 text-sm">Pazarlama</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.marketingBoost.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">Daha fazla müşteri</p>
                  <Button
                    onClick={() => purchaseUpgrade('marketingBoost')}
                    disabled={gameState.money < gameState.upgrades.marketingBoost.cost}
                    className="w-full bg-pink-500 hover:bg-pink-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.marketingBoost.cost)} ₺
                  </Button>
                </div>

                {/* Premium Et */}
                <div className="p-3 border-2 border-orange-200 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-orange-600" />
                      <span className="font-semibold text-gray-800 text-sm">Premium Et</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.premiumMeat.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+50% kesim bonusu</p>
                  <Button
                    onClick={() => purchaseUpgrade('premiumMeat')}
                    disabled={gameState.money < gameState.upgrades.premiumMeat.cost}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.premiumMeat.cost)} ₺
                  </Button>
                </div>

                <Separator />
                <div className="text-center space-y-1 text-xs text-gray-600">
                  <p>Otomatik gelir: {formatNumber(gameState.autoIncomeRate * gameState.multiplier)} ₺/sn</p>
                  <p>Toplam çarpan: {gameState.multiplier.toFixed(1)}x</p>
                </div>
                
              </CardContent>
            </Card>

            {/* Missions - Çok daha fazla görev */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-indigo-200 rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Görevler ({missions.filter(m => !m.completed).length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-80 overflow-y-auto">
                {missions.slice(0, 8).map(mission => (
                  <div key={mission.id} className="p-3 border-2 border-indigo-200 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{mission.title}</span>
                      <Badge className={`text-xs ${getDifficultyColor(mission.difficulty)}`}>
                        {mission.difficulty === 'easy' ? 'Kolay' : 
                         mission.difficulty === 'medium' ? 'Orta' : 
                         mission.difficulty === 'hard' ? 'Zor' : 'Uzman'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{mission.description}</p>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{Math.min(mission.current, mission.target)}/{mission.target}</span>
                      <span>Ödül: {formatNumber(mission.reward)} ₺</span>
                    </div>
                    <Progress value={Math.min((mission.current / mission.target) * 100, 100)} className="h-2 mb-2" />
                    {mission.completed && (
                      <Button
                        onClick={() => claimMissionReward(mission.id)}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-xs py-2"
                        size="sm"
                      >
                        Ödülü Al! 🎁
                      </Button>
                    )}
                  </div>
                ))}
                {missions.length > 8 && (
                  <p className="text-center text-xs text-gray-500">
                    Ve {missions.length - 8} görev daha...
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-600 font-medium">
            🥙 Döner Master - En İyi Idle Clicker! 🥙
          </p>
          <p className="text-gray-500 text-sm mt-1">
            Oyun otomatik kaydediliyor • {missions.filter(m => m.completed).length}/{missions.length} görev tamamlandı
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;