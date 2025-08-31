import React, { useState, useEffect, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { Coins, Zap, Timer, TrendingUp } from 'lucide-react';

const GameScreen = () => {
  const [gameState, setGameState] = useState({
    money: 0,
    clickPower: 1,
    autoIncomeRate: 0,
    multiplier: 1,
    upgrades: {
      sharperKnife: { level: 0, cost: 10, power: 1 },
      donerMachine: { level: 0, cost: 50, income: 1 },
      garlicSauce: { level: 0, cost: 100, multiplier: 0.1 }
    }
  });

  const [donerRotation, setDonerRotation] = useState(0);
  const [isSlicing, setIsSlicing] = useState(false);
  const [particles, setParticles] = useState([]);

  // Auto-income effect
  useEffect(() => {
    if (gameState.autoIncomeRate > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          money: prev.money + (prev.autoIncomeRate * prev.multiplier)
        }));
        
        // Rotate döner automatically
        setDonerRotation(prev => (prev + 5) % 360);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [gameState.autoIncomeRate, gameState.multiplier]);

  // Slice döner function
  const sliceDoner = useCallback(() => {
    const earned = gameState.clickPower * gameState.multiplier;
    
    setGameState(prev => ({
      ...prev,
      money: prev.money + earned
    }));

    // Animation effects
    setIsSlicing(true);
    setDonerRotation(prev => (prev + 15) % 360);
    
    // Create slice particles
    const newParticles = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 100,
      y: Math.random() * 100
    }));
    setParticles(prev => [...prev, ...newParticles]);

    // Clear slice animation
    setTimeout(() => setIsSlicing(false), 200);
    
    // Clear particles
    setTimeout(() => {
      setParticles(prev => prev.filter(p => !newParticles.includes(p)));
    }, 1000);
  }, [gameState.clickPower, gameState.multiplier]);

  // Purchase upgrade function
  const purchaseUpgrade = (upgradeType) => {
    const upgrade = gameState.upgrades[upgradeType];
    
    if (gameState.money >= upgrade.cost) {
      setGameState(prev => {
        const newState = { ...prev };
        newState.money -= upgrade.cost;
        
        // Update upgrade
        const newUpgrade = { ...upgrade };
        newUpgrade.level += 1;
        newUpgrade.cost = Math.floor(upgrade.cost * 1.5);
        
        // Apply upgrade effects
        if (upgradeType === 'sharperKnife') {
          newUpgrade.power += 1;
          newState.clickPower = prev.clickPower + 1;
        } else if (upgradeType === 'donerMachine') {
          newUpgrade.income += 1;
          newState.autoIncomeRate = prev.autoIncomeRate + 1;
        } else if (upgradeType === 'garlicSauce') {
          newUpgrade.multiplier += 0.1;
          newState.multiplier = prev.multiplier + 0.1;
        }
        
        newState.upgrades[upgradeType] = newUpgrade;
        return newState;
      });
    }
  };

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('donerMasterSave', JSON.stringify(gameState));
  }, [gameState]);

  // Load game state from localStorage
  useEffect(() => {
    const savedGame = localStorage.getItem('donerMasterSave');
    if (savedGame) {
      try {
        const parsedGame = JSON.parse(savedGame);
        setGameState(parsedGame);
      } catch (error) {
        console.error('Failed to load save game:', error);
      }
    }
  }, []);

  const formatNumber = (num) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return Math.floor(num).toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-400 to-yellow-500 p-4">
      <div className="container mx-auto max-w-6xl">
        
        {/* Header - Money Display */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg">
            <Coins className="w-8 h-8 text-yellow-600" />
            <span className="text-3xl font-bold text-gray-800">
              {formatNumber(gameState.money)} Lira
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardContent className="p-8">
                
                {/* Döner Display */}
                <div className="relative flex flex-col items-center mb-8">
                  <div 
                    className="relative w-64 h-64 mb-6 cursor-pointer transform transition-transform hover:scale-105"
                    onClick={sliceDoner}
                    style={{
                      transform: `rotate(${donerRotation}deg)`,
                      transition: 'transform 0.5s ease-out'
                    }}
                  >
                    {/* Döner Skewer */}
                    <div className="absolute inset-0 bg-gradient-to-b from-amber-600 via-amber-500 to-amber-700 rounded-full shadow-2xl">
                      {/* Meat layers */}
                      <div className="absolute inset-2 bg-gradient-to-r from-red-500 via-orange-500 to-red-600 rounded-full opacity-90"></div>
                      <div className="absolute inset-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-500 rounded-full opacity-80"></div>
                      <div className="absolute inset-6 bg-gradient-to-r from-red-400 via-pink-400 to-red-500 rounded-full opacity-70"></div>
                      
                      {/* Center core */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-4 h-32 bg-gray-600 rounded-full shadow-inner"></div>
                      </div>
                    </div>
                    
                    {/* Slice effect */}
                    {isSlicing && (
                      <div className="absolute inset-0 border-4 border-yellow-300 rounded-full animate-ping"></div>
                    )}
                  </div>
                  
                  {/* Particles */}
                  {particles.map(particle => (
                    <div
                      key={particle.id}
                      className="absolute w-2 h-2 bg-yellow-400 rounded-full pointer-events-none animate-bounce"
                      style={{
                        left: `${particle.x}%`,
                        top: `${particle.y}%`,
                        animationDuration: '1s'
                      }}
                    />
                  ))}
                  
                  {/* Slice Button */}
                  <Button
                    onClick={sliceDoner}
                    size="lg"
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-4 px-8 rounded-full shadow-lg transform transition-all hover:scale-105 active:scale-95"
                  >
                    🔪 SLICE DÖNER! 🥙
                  </Button>
                  
                  <p className="mt-4 text-gray-600 text-center">
                    Click power: {gameState.clickPower} × {gameState.multiplier.toFixed(1)} = {(gameState.clickPower * gameState.multiplier).toFixed(1)} Lira per slice
                  </p>
                </div>
                
              </CardContent>
            </Card>
          </div>

          {/* Upgrades Panel */}
          <div className="space-y-4">
            <Card className="bg-white/95 backdrop-blur-sm shadow-xl border-0">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center text-gray-800">
                  🛠️ Upgrades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {/* Sharper Knife */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-800">Sharper Knife</span>
                    </div>
                    <Badge variant="secondary">Lv.{gameState.upgrades.sharperKnife.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">+1 Lira per slice</p>
                  <Button
                    onClick={() => purchaseUpgrade('sharperKnife')}
                    disabled={gameState.money < gameState.upgrades.sharperKnife.cost}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    size="sm"
                  >
                    Buy for {formatNumber(gameState.upgrades.sharperKnife.cost)} Lira
                  </Button>
                </div>

                {/* Döner Machine */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Timer className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-800">Döner Machine</span>
                    </div>
                    <Badge variant="secondary">Lv.{gameState.upgrades.donerMachine.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">+1 Lira per second</p>
                  <Button
                    onClick={() => purchaseUpgrade('donerMachine')}
                    disabled={gameState.money < gameState.upgrades.donerMachine.cost}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    Buy for {formatNumber(gameState.upgrades.donerMachine.cost)} Lira
                  </Button>
                </div>

                {/* Extra Garlic Sauce */}
                <div className="p-4 border border-gray-200 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-800">Extra Garlic Sauce</span>
                    </div>
                    <Badge variant="secondary">Lv.{gameState.upgrades.garlicSauce.level}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">+10% income multiplier</p>
                  <Button
                    onClick={() => purchaseUpgrade('garlicSauce')}
                    disabled={gameState.money < gameState.upgrades.garlicSauce.cost}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    Buy for {formatNumber(gameState.upgrades.garlicSauce.cost)} Lira
                  </Button>
                </div>

                <Separator />
                
                {/* Stats */}
                <div className="text-center space-y-2 text-sm text-gray-600">
                  <p>Auto Income: {formatNumber(gameState.autoIncomeRate * gameState.multiplier)} Lira/sec</p>
                  <p>Total Multiplier: {gameState.multiplier.toFixed(1)}x</p>
                </div>
                
              </CardContent>
            </Card>
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/80 text-sm">
            🥙 Döner Master - The Ultimate Idle Clicker! 🥙
          </p>
          <p className="text-white/60 text-xs mt-1">
            Game auto-saves every action
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default GameScreen;