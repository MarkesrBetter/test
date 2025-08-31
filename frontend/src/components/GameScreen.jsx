import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Coins, Zap, Timer, TrendingUp, Users, Target, Clock } from 'lucide-react';

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    money: 0,
    clickPower: 1,
    autoIncomeRate: 0,
    multiplier: 1,
    totalDonersCut: 0,
    upgrades: {
      sharperKnife: { level: 0, cost: 15, power: 1 },
      donerMachine: { level: 0, cost: 75, income: 1 },
      garlicSauce: { level: 0, cost: 150, multiplier: 0.2 }
    }
  });

  const [donerRotation, setDonerRotation] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [particles, setParticles] = useState([]);

  // Customer system
  const [currentCustomer, setCurrentCustomer] = useState(null);
  const [customerProgress, setCustomerProgress] = useState(0);

  // Mission system
  const [missions, setMissions] = useState([
    { id: 1, title: "İlk Dönerci", description: "10 döner kes", target: 10, current: 0, reward: 50, difficulty: "easy", completed: false },
    { id: 2, title: "Hızlı Eller", description: "30 saniyede 20 döner kes", target: 20, current: 0, reward: 100, difficulty: "medium", timeLimit: 30, completed: false },
    { id: 3, title: "Döner Ustası", description: "5 müşteri siparişini başarıyla tamamla", target: 5, current: 0, reward: 200, difficulty: "hard", completed: false }
  ]);

  const customerTypes = [
    { name: "Ahmet Abi", avatar: "👨", order: "Normal döner", slicesNeeded: 8, timeLimit: 6, reward: 25 },
    { name: "Fatma Teyze", avatar: "👵", order: "Az yağlı döner", slicesNeeded: 6, timeLimit: 8, reward: 20 },
    { name: "Öğrenci Mehmet", avatar: "🧑‍🎓", order: "Büyük döner", slicesNeeded: 12, timeLimit: 10, reward: 35 },
    { name: "İş Kadını", avatar: "👩‍💼", order: "Hızlı döner", slicesNeeded: 5, timeLimit: 4, reward: 30 },
    { name: "Turist John", avatar: "🧑‍🦱", order: "Özel döner", slicesNeeded: 15, timeLimit: 12, reward: 50 }
  ];

  // Auto-income effect
  useEffect(() => {
    if (gameState.autoIncomeRate > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          money: prev.money + (prev.autoIncomeRate * prev.multiplier)
        }));
        
        setDonerRotation(prev => (prev + 3) % 360);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoIncomeRate, gameState.multiplier]);

  // Customer spawning
  useEffect(() => {
    if (!currentCustomer) {
      const spawnInterval = setInterval(() => {
        if (Math.random() < 0.3) { // 30% chance every 3 seconds
          const randomCustomer = customerTypes[Math.floor(Math.random() * customerTypes.length)];
          setCurrentCustomer({
            ...randomCustomer,
            id: Date.now(),
            timeRemaining: randomCustomer.timeLimit
          });
          setCustomerProgress(0);
        }
      }, 3000);

      return () => clearInterval(spawnInterval);
    }
  }, [currentCustomer]);

  // Customer timer
  useEffect(() => {
    if (currentCustomer && currentCustomer.timeRemaining > 0) {
      const timer = setInterval(() => {
        setCurrentCustomer(prev => {
          if (prev.timeRemaining <= 1) {
            // Customer leaves disappointed
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
    const earned = gameState.clickPower * gameState.multiplier;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + earned,
      totalDonersCut: prev.totalDonersCut + 1
    }));

    // Update missions
    setMissions(prev => prev.map(mission => {
      if (!mission.completed) {
        if (mission.id === 1) { // İlk Dönerci
          const newCurrent = mission.current + 1;
          return { ...mission, current: newCurrent, completed: newCurrent >= mission.target };
        }
        if (mission.id === 2) { // Hızlı Eller - needs timer logic
          return { ...mission, current: mission.current + 1 };
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
        setGameState(prev => ({
          ...prev,
          money: prev.money + currentCustomer.reward
        }));
        
        // Update mission 3
        setMissions(prev => prev.map(mission => {
          if (mission.id === 3 && !mission.completed) {
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
    setDonerRotation(prev => (prev + 20) % 360);
    
    // Create slice particles
    const newParticles = Array.from({ length: 4 }, (_, i) => ({
      id: Date.now() + i,
      x: 45 + Math.random() * 10,
      y: 45 + Math.random() * 10
    }));
    setParticles(prev => [...prev, ...newParticles]);

    setTimeout(() => setIsSlicing(false), 300);
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1200);
  }, [gameState.clickPower, gameState.multiplier, currentCustomer, customerProgress]);

  // Purchase upgrade function
  const purchaseUpgrade = (upgradeType) => {
    const upgrade = gameState.upgrades[upgradeType];
    
    if (gameState.money >= upgrade.cost) {
      setGameState(prev => {
        const newState = { ...prev };
        newState.money -= upgrade.cost;
        
        const newUpgrade = { ...upgrade };
        newUpgrade.level += 1;
        newUpgrade.cost = Math.floor(upgrade.cost * 1.6);
        
        if (upgradeType === 'sharperKnife') {
          newUpgrade.power += 1;
          newState.clickPower = prev.clickPower + 1;
        } else if (upgradeType === 'donerMachine') {
          newUpgrade.income += 1;
          newState.autoIncomeRate = prev.autoIncomeRate + 1;
        } else if (upgradeType === 'garlicSauce') {
          newUpgrade.multiplier += 0.2;
          newState.multiplier = prev.multiplier + 0.2;
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
    localStorage.setItem('donerMasterSave', JSON.stringify({gameState, missions}));
  }, [gameState, missions]);

  useEffect(() => {
    const savedGame = localStorage.getItem('donerMasterSave');
    if (savedGame) {
      try {
        const parsed = JSON.parse(savedGame);
        if (parsed.gameState) setGameState(parsed.gameState);
        if (parsed.missions) setMissions(parsed.missions);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-200 via-orange-200 to-red-200 p-4">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-3 bg-white/95 backdrop-blur-sm rounded-3xl px-8 py-4 shadow-xl border-4 border-yellow-300">
            <Coins className="w-10 h-10 text-yellow-600" />
            <span className="text-4xl font-bold text-gray-800">
              {formatNumber(gameState.money)} ₺
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Customer Panel */}
          <div className="lg:col-span-1">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-pink-200 rounded-3xl">
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
                        Ödül: {currentCustomer.reward} ₺
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
                
                {/* Döner Display - More Cartoon Style */}
                <div className="relative flex flex-col items-center mb-8">
                  <div 
                    className="relative w-80 h-80 mb-6 cursor-pointer transform transition-all hover:scale-105 active:scale-95"
                    onClick={sliceDoner}
                    style={{
                      transform: `rotate(${donerRotation}deg) scale(1)`,
                      transition: 'transform 0.6s ease-out'
                    }}
                  >
                    {/* Soft Cartoon Döner */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-400 via-orange-400 to-amber-500 rounded-full shadow-2xl border-4 border-yellow-400">
                      {/* Soft meat layers */}
                      <div className="absolute inset-4 bg-gradient-to-r from-red-300 via-pink-300 to-red-400 rounded-full opacity-90 border-2 border-red-200"></div>
                      <div className="absolute inset-8 bg-gradient-to-r from-yellow-300 via-orange-300 to-yellow-400 rounded-full opacity-85 border-2 border-yellow-200"></div>
                      <div className="absolute inset-12 bg-gradient-to-r from-red-200 via-pink-200 to-red-300 rounded-full opacity-80"></div>
                      
                      {/* Cute center skewer */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-6 h-40 bg-gradient-to-b from-gray-400 to-gray-600 rounded-full shadow-lg border-2 border-gray-300"></div>
                      </div>
                      
                      {/* Cute face on döner */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-4xl select-none pointer-events-none">
                          {isSlicing ? "😵" : "😊"}
                        </div>
                      </div>
                    </div>
                    
                    {/* Slice effect */}
                    {isSlicing && (
                      <div className="absolute inset-0 border-8 border-yellow-400 rounded-full animate-ping opacity-75"></div>
                    )}
                  </div>
                  
                  {/* Particles */}
                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute w-4 h-4 bg-yellow-400 rounded-full pointer-events-none animate-bounce shadow-lg"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animationDuration: '1.2s'
                      }}
                    />
                  ))}
                  
                  {/* Slice Button */}
                  <Button
                    onClick={sliceDoner}
                    size="lg"
                    className="bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-6 px-12 rounded-full shadow-xl transform transition-all hover:scale-110 active:scale-95 border-4 border-green-300 text-xl"
                  >
                    🔪 DÖNER KES! 🥙
                  </Button>
                  
                  <p className="mt-4 text-gray-700 text-center font-medium">
                    Kesme gücü: {gameState.clickPower} × {gameState.multiplier.toFixed(1)} = {(gameState.clickPower * gameState.multiplier).toFixed(1)} ₺/kesim
                  </p>
                  <p className="text-sm text-gray-600">
                    Toplam kesilen döner: {gameState.totalDonersCut}
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
                  🛠️ Yükseltmeler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                
                {/* Sharper Knife */}
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

                {/* Döner Machine */}
                <div className="p-3 border-2 border-green-200 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-green-600" />
                      <span className="font-semibold text-gray-800 text-sm">Döner Makinesi</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">Lv.{gameState.upgrades.donerMachine.level}</Badge>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">+1 ₺/saniye</p>
                  <Button
                    onClick={() => purchaseUpgrade('donerMachine')}
                    disabled={gameState.money < gameState.upgrades.donerMachine.cost}
                    className="w-full bg-green-500 hover:bg-green-600 text-xs py-2"
                    size="sm"
                  >
                    {formatNumber(gameState.upgrades.donerMachine.cost)} ₺
                  </Button>
                </div>

                {/* Extra Garlic Sauce */}
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

                <Separator />
                <div className="text-center space-y-1 text-xs text-gray-600">
                  <p>Otomatik gelir: {formatNumber(gameState.autoIncomeRate * gameState.multiplier)} ₺/sn</p>
                  <p>Toplam çarpan: {gameState.multiplier.toFixed(1)}x</p>
                </div>
                
              </CardContent>
            </Card>

            {/* Missions */}
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-4 border-indigo-200 rounded-3xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
                  <Target className="w-6 h-6 text-indigo-600" />
                  Görevler
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {missions.map(mission => (
                  <div key={mission.id} className="p-3 border-2 border-indigo-200 rounded-2xl bg-gradient-to-r from-indigo-50 to-purple-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-800 text-sm">{mission.title}</span>
                      <Badge 
                        variant={mission.difficulty === 'easy' ? 'default' : mission.difficulty === 'medium' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {mission.difficulty === 'easy' ? 'Kolay' : mission.difficulty === 'medium' ? 'Orta' : 'Zor'}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">{mission.description}</p>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{mission.current}/{mission.target}</span>
                      <span>Ödül: {mission.reward} ₺</span>
                    </div>
                    <Progress value={(mission.current / mission.target) * 100} className="h-2 mb-2" />
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
            Oyun otomatik kaydediliyor
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;