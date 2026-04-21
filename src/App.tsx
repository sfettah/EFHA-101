/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  User, 
  RotateCcw, 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  History,
  TrendingUp,
  BarChart2,
  Activity,
  Target,
  Zap,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie,
  ReferenceDot
} from 'recharts';

type GameMode = 'single' | 'partnership';
type View = 'home' | 'setup' | 'game' | 'analysis' | 'history';

interface ScoreEntry {
  gameScore: number;
  penaltyScore: number;
  okeyCount: number;
}

interface Player {
  id: string;
  name: string;
  color: string;
  scores: ScoreEntry[];
}

interface SavedGame {
  id: string;
  date: string;
  mode: GameMode;
  players: Player[];
  winnerName: string;
}

const MAX_ROUNDS = 17;
const TIE_COLOR = '#FFC107'; // Yellow

const PLAYER_COLORS = {
  single: ['#DC3545', '#007BFF', '#28A745', '#6F42C1'], // Red, Blue, Green, Purple
  partnership: ['#DC3545', '#007BFF'] // Red, Blue
};

// --- Sub-components moved outside to prevent remounting on state change ---

const HomeView = ({ onStartSetup, onViewHistory, historyCount }: { 
  onStartSetup: (mode: GameMode) => void, 
  onViewHistory: () => void, 
  historyCount: number,
  key?: string
}) => (
  <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans p-6 flex flex-col items-center justify-center">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md w-full text-center space-y-8"
    >
      <div className="space-y-0.5">
        <h1 className="text-4xl font-black tracking-tighter text-[#1A1A1A]">EFHA 101</h1>
        <p className="text-[9px] text-[#6C757D] font-bold tracking-[0.2em] uppercase">PROFESYONEL SKOR ANALİZİ</p>
      </div>
      
      <div className="grid grid-cols-1 gap-2.5">
        <button
          onClick={() => onStartSetup('single')}
          className="flex items-center justify-between h-[60px] px-5 bg-white border-2 border-[#E9ECEF] rounded-[2.35px] hover:border-[#1A1A1A] transition-all group shadow-sm active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F1F3F5] rounded group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <User size={18} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold">Tekli Oyun</span>
              <span className="text-[10px] text-[#6C757D]">4 Kişi</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#ADB5BD]" />
        </button>

        <button
          onClick={() => onStartSetup('partnership')}
          className="flex items-center justify-between h-[60px] px-5 bg-white border-2 border-[#E9ECEF] rounded-[2.35px] hover:border-[#1A1A1A] transition-all group shadow-sm active:scale-95"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#F1F3F5] rounded group-hover:bg-[#1A1A1A] group-hover:text-white transition-colors">
              <Users size={18} />
            </div>
            <div className="text-left">
              <span className="block text-sm font-bold">Eşli Oyun</span>
              <span className="text-[10px] text-[#6C757D]">2 Takım</span>
            </div>
          </div>
          <ChevronRight size={16} className="text-[#ADB5BD]" />
        </button>

        {historyCount > 0 && (
          <button
            onClick={onViewHistory}
            className="flex items-center justify-between h-[60px] px-5 bg-[#1A1A1A] text-white border-2 border-[#1A1A1A] rounded-[2.35px] hover:bg-black transition-all group shadow-lg active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/10 rounded">
                <History size={18} />
              </div>
              <div className="text-left">
                <span className="block text-sm font-bold">Geçmiş Oyunlar</span>
                <span className="text-[10px] opacity-70">{historyCount} Kayıt</span>
              </div>
            </div>
            <ChevronRight size={16} className="opacity-50" />
          </button>
        )}
      </div>
    </motion.div>
  </div>
);

const SetupView = ({ gameMode, players, onBack, onNameChange, onStart }: {
  gameMode: GameMode | null,
  players: Player[],
  onBack: () => void,
  onNameChange: (id: string, name: string) => void,
  onStart: () => void,
  key?: string
}) => (
  <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans p-6">
    <div className="max-w-md mx-auto space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-[#6C757D] hover:text-[#1A1A1A] transition-colors font-bold text-[10px] tracking-wider">
        <ChevronLeft size={14} /> ANA SAYFA
      </button>
      
      <div className="space-y-0.5">
        <h2 className="text-xl font-bold tracking-tight">
          {gameMode === 'single' ? 'Oyuncu İsimleri' : 'Takım İsimleri'}
        </h2>
        <p className="text-[10px] text-[#6C757D]">İsim yazmazsanız otomatik isimlendirilir.</p>
      </div>

      <div className="space-y-2.5">
        {players.map((player, idx) => (
          <div key={player.id} className="space-y-1">
            <label className="text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5" style={{ color: player.color }}>
              <div className="w-1 h-1 rounded-full" style={{ backgroundColor: player.color }} />
              {gameMode === 'single' ? `${idx + 1}. Oyuncu` : `${idx + 1}. Takım`}
            </label>
            <input
              type="text"
              value={player.name}
              onChange={(e) => onNameChange(player.id, e.target.value)}
              placeholder={gameMode === 'single' ? `Oyuncu ${idx + 1}` : `Takım ${idx + 1}`}
              className="w-full h-11 px-3.5 bg-white border-2 border-[#E9ECEF] rounded-[2.35px] focus:border-[#1A1A1A] outline-none transition-all font-medium text-xs"
            />
          </div>
        ))}
      </div>

      <button
        onClick={onStart}
        className="w-full h-11 bg-[#1A1A1A] text-white rounded-[2.35px] font-bold text-sm hover:bg-black transition-all shadow-lg shadow-black/5 active:scale-95"
      >
        Oyunu Başlat
      </button>
    </div>
  </div>
);

const GameView = ({ 
  gameMode, 
  players, 
  currentRound, 
  totals, 
  roundWinners, 
  onBack, 
  onReset, 
  onUpdateScore, 
  onSetRound, 
  onFinish,
  initialDealerIndex
}: {
  gameMode: GameMode | null,
  players: Player[],
  currentRound: number,
  totals: { id: string, name: string, total: number, color: string }[],
  roundWinners: (string | null)[],
  onBack: () => void,
  onReset: () => void,
  onUpdateScore: (playerId: string, roundIndex: number, field: keyof ScoreEntry, value: string) => void,
  onSetRound: (round: number) => void,
  onFinish: () => void,
  initialDealerIndex: number,
  key?: string
}) => {
  const currentDealerIndex = (initialDealerIndex + currentRound) % players.length;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans pb-32">
    <header className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10 px-4 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 -ml-1.5 text-[#6C757D] hover:text-[#1A1A1A]">
            <ChevronLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black tracking-tighter">EFHA 101</h1>
            <p className="text-[9px] font-bold text-[#6C757D] uppercase tracking-widest">
              {gameMode === 'single' ? 'Tekli' : 'Eşli'} • 17 El
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onReset}
            className="p-1.5 text-[#6C757D] hover:text-[#DC3545] transition-colors"
            title="Sıfırla"
          >
            <RotateCcw size={18} />
          </button>
          {currentRound === MAX_ROUNDS - 1 && (
            <button 
              onClick={onFinish}
              className="px-3 py-1.5 bg-[#28A745] text-white rounded-md font-bold text-[10px] hover:bg-[#218838] transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 size={12} /> BİTİR
            </button>
          )}
        </div>
      </div>
    </header>

    <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      {/* Leaderboard Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {totals.map((t, idx) => (
          <div 
            key={t.id} 
            className="p-3 rounded-2xl border-2 bg-white transition-all shadow-sm"
            style={{ borderColor: idx === 0 ? t.color : '#E9ECEF' }}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.color }}>
                {idx === 0 ? 'Lider' : `${idx + 1}.`}
              </span>
              {idx === 0 && <Trophy size={14} style={{ color: t.color }} />}
            </div>
            <div className="font-bold truncate text-sm">{t.name}</div>
            <div className="flex items-baseline justify-between mt-0.5">
              <div className="text-xl font-black">{t.total}</div>
              {idx > 0 && (
                <div className="text-[9px] font-black text-[#DC3545]">
                  +{t.total - totals[0].total}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Round Selector */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
        {Array.from({ length: MAX_ROUNDS }).map((_, i) => {
          const winnerColor = roundWinners[i];
          const isActive = currentRound === i;
          
          return (
            <button
              key={i}
              onClick={() => onSetRound(i)}
              className={`flex-shrink-0 w-8 h-8 rounded-md font-bold transition-all border-2 flex items-center justify-center text-[10px]`}
              style={{ 
                backgroundColor: isActive ? '#1A1A1A' : (winnerColor || 'white'),
                color: isActive || winnerColor ? 'white' : '#6C757D',
                borderColor: isActive ? '#1A1A1A' : (winnerColor || '#E9ECEF')
              }}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      {/* Desktop Table View (Hidden on Mobile) */}
      <div className="hidden md:block bg-white border-2 border-[#E9ECEF] rounded-3xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F8F9FA] border-b-2 border-[#E9ECEF]">
              <th className="p-4 text-left text-xs font-black text-[#6C757D] uppercase tracking-widest border-r border-[#E9ECEF]">Oyuncu / Takım</th>
              <th className="p-4 text-center text-xs font-black text-[#6C757D] uppercase tracking-widest border-r border-[#E9ECEF]">Oyun Puanı</th>
              <th className="p-4 text-center text-xs font-black text-[#DC3545] uppercase tracking-widest border-r border-[#E9ECEF]">Ceza Puanı</th>
              <th className="p-4 text-center text-xs font-black text-[#007BFF] uppercase tracking-widest border-r border-[#E9ECEF]">Okey</th>
              <th className="p-4 text-center text-xs font-black text-[#1A1A1A] uppercase tracking-widest">Toplam</th>
            </tr>
          </thead>
          <tbody>
            {players.map((player) => (
              <tr key={player.id} className="border-b border-[#F1F3F5] hover:bg-[#F8F9FA] transition-colors">
                <td className="p-4 border-r border-[#E9ECEF]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.color }} />
                    <span className="font-bold">{player.name}</span>
                    {players.indexOf(player) === currentDealerIndex && (
                      <span className="ml-2 px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[8px] font-black rounded border border-amber-200">DAĞITICI</span>
                    )}
                  </div>
                </td>
                <td className="p-2 border-r border-[#E9ECEF]">
                  <input
                    type="number"
                    value={player.scores[currentRound].gameScore || ''}
                    onChange={(e) => onUpdateScore(player.id, currentRound, 'gameScore', e.target.value)}
                    placeholder="0"
                    className="w-full p-3 bg-transparent text-center font-bold outline-none focus:bg-white transition-all"
                  />
                </td>
                <td className="p-2 border-r border-[#E9ECEF]">
                  <input
                    type="number"
                    value={player.scores[currentRound].penaltyScore || ''}
                    onChange={(e) => onUpdateScore(player.id, currentRound, 'penaltyScore', e.target.value)}
                    placeholder="0"
                    className="w-full p-3 bg-transparent text-center font-bold text-[#DC3545] outline-none focus:bg-white transition-all"
                  />
                </td>
                <td className="p-2 border-r border-[#E9ECEF]">
                   <div className="flex justify-center gap-1">
                     {[0, 1, 2].map(count => (
                        <button
                          key={count}
                          onClick={() => onUpdateScore(player.id, currentRound, 'okeyCount', count.toString())}
                          className={`w-7 h-7 rounded text-[9px] font-black border transition-all ${
                            (player.scores[currentRound].okeyCount || 0) === count
                              ? 'bg-[#007BFF] border-[#007BFF] text-white shadow-sm'
                              : 'bg-white border-[#E9ECEF] text-[#6C757D] hover:border-[#ADB5BD]'
                          }`}
                        >
                          {count}
                        </button>
                     ))}
                   </div>
                </td>
                <td className="p-4 text-center font-black text-lg">
                  {player.scores[currentRound].gameScore + player.scores[currentRound].penaltyScore}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile-Friendly Score Entry Cards (Hidden on Desktop) */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold">El {currentRound + 1} Girişi</h3>
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <Zap size={12} className="text-amber-500" fill="currentColor" />
            <span className="text-[10px] font-bold text-amber-700">
              Okey Takibi: {players.reduce((acc, p) => acc + (p.scores[currentRound].okeyCount || 0), 0)} / 2
            </span>
          </div>
          {currentRound === MAX_ROUNDS - 1 && (
            <button 
              onClick={onFinish}
              className="px-4 py-2 bg-[#28A745] text-white rounded-lg font-bold text-xs hover:bg-[#218838] transition-all flex items-center gap-2 shadow-lg"
            >
              <CheckCircle2 size={14} /> BİTİR
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {players.map((player) => (
            <div key={player.id} className="bg-white border-2 border-[#E9ECEF] rounded-2xl p-4 shadow-sm space-y-4">
              <div className="flex items-center gap-3 border-b border-[#F1F3F5] pb-3">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: player.color }} />
                <div className="flex flex-col">
                  <span className="font-bold text-lg leading-tight">{player.name}</span>
                  {players.indexOf(player) === currentDealerIndex && (
                    <span className="text-[9px] font-black text-amber-600 uppercase tracking-tighter">Dağıtıcı</span>
                  )}
                </div>
                <div className="ml-auto text-xs font-black bg-[#F8F9FA] px-2 py-1 rounded-md border border-[#E9ECEF]">
                  TOPLAM: {player.scores[currentRound].gameScore + player.scores[currentRound].penaltyScore}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#6C757D] uppercase tracking-widest ml-1">Oyun Puanı</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={player.scores[currentRound].gameScore || ''}
                    onChange={(e) => onUpdateScore(player.id, currentRound, 'gameScore', e.target.value)}
                    placeholder="0"
                    className="w-full p-4 bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-xl focus:border-[#1A1A1A] outline-none transition-all text-center font-black text-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#DC3545] uppercase tracking-widest ml-1">Ceza Puanı</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={player.scores[currentRound].penaltyScore || ''}
                    onChange={(e) => onUpdateScore(player.id, currentRound, 'penaltyScore', e.target.value)}
                    placeholder="0"
                    className="w-full p-4 bg-[#F8F9FA] border-2 border-[#E9ECEF] rounded-xl focus:border-[#DC3545] outline-none transition-all text-center font-black text-xl text-[#DC3545]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[10px] font-bold text-[#6C757D] uppercase tracking-widest">Bu Eldeki Okeyler</span>
                <div className="flex gap-2">
                  {[0, 1, 2].map((count) => (
                    <button
                      key={count}
                      onClick={() => onUpdateScore(player.id, currentRound, 'okeyCount', count.toString())}
                      className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all border-2 ${
                        (player.scores[currentRound].okeyCount || 0) === count
                          ? 'bg-[#1A1A1A] border-[#1A1A1A] text-white'
                          : 'bg-white border-[#E9ECEF] text-[#6C757D]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center gap-4 pt-4">
        <button
          disabled={currentRound === 0}
          onClick={() => onSetRound(currentRound - 1)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-white border-2 border-[#E9ECEF] rounded-2xl font-bold hover:border-[#1A1A1A] disabled:opacity-30 transition-all active:scale-95"
        >
          <ChevronLeft size={20} /> Önceki
        </button>
        <button
          disabled={currentRound === MAX_ROUNDS - 1}
          onClick={() => onSetRound(currentRound + 1)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-4 bg-[#1A1A1A] text-white rounded-2xl font-bold hover:bg-black disabled:opacity-30 transition-all active:scale-95"
        >
          Sonraki <ChevronRight size={20} />
        </button>
      </div>
    </main>

    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-[#E9ECEF] px-6 py-3 rounded-full shadow-xl flex items-center gap-4 z-20">
      <div className="flex gap-1">
        {Array.from({ length: MAX_ROUNDS }).map((_, i) => (
          <div 
            key={i} 
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === currentRound ? 'bg-[#1A1A1A] w-4' : 
              roundWinners[i] ? 'opacity-100' : 'bg-[#E9ECEF]'
            }`}
            style={{ backgroundColor: i === currentRound ? '#1A1A1A' : (roundWinners[i] || '#E9ECEF') }}
          />
        ))}
      </div>
      <span className="text-[10px] font-black text-[#1A1A1A] uppercase tracking-widest">
        El {currentRound + 1} / {MAX_ROUNDS}
      </span>
    </div>
  </div>
);
};

const AnalysisView = ({ analysisData, totals, players, historyDate, onBack }: {
  analysisData: any,
  totals: any[],
  players: Player[],
  historyDate?: string,
  onBack: () => void,
  key?: string
}) => {
  if (!analysisData) return null;

  const getMomentumColor = (momentum: number) => {
    if (momentum >= 75) return '#28A745'; // Green
    if (momentum >= 40) return '#FFC107'; // Yellow
    if (momentum >= 0) return '#DC3545'; // Red
    return '#1A1A1A'; // Black (Negative)
  };

  const winnerDiff = totals.length > 1 ? totals[1].total - totals[0].total : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans pb-12">
      <header className="bg-white border-b border-[#E9ECEF] sticky top-0 z-10 px-4 py-2.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="p-1.5 -ml-1.5 text-[#6C757D] hover:text-[#1A1A1A]">
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-lg font-black tracking-tighter">OYUN ANALİZİ</h1>
              <p className="text-[9px] font-bold text-[#6C757D] uppercase tracking-widest">
                {historyDate || 'Yeni Oyun'}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <div className="px-2.5 py-1 bg-[#1A1A1A] text-white rounded-full text-[9px] font-bold">
              KAZANAN: {totals[0].name}
            </div>
            {winnerDiff > 0 && (
              <span className="text-[8px] font-black text-[#28A745] mt-0.5">
                +{winnerDiff} FARK İLE
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* A) Cumulative Score Chart */}
        <div className="bg-white p-3 rounded-lg border-2 border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-[#1A1A1A]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">A) Kümülatif Skor Grafiği</h3>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analysisData.cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 7, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 7, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px', fontSize: '8px', fontWeight: 'bold' }} />
                {players.map(p => (
                  <Line key={p.id} type="monotone" dataKey={p.name} stroke={p.color} strokeWidth={1.5} dot={{ r: 1.5 }} activeDot={{ r: 3 }} />
                ))}
                {analysisData.turningPoints.map((tp: any) => (
                  <ReferenceDot 
                    key={tp.round}
                    x={tp.name} 
                    y={tp[players[0].name]} // Just a reference point for the dot
                    r={4} 
                    fill="#1A1A1A" 
                    stroke="none"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {analysisData.turningPoints.map((tp: any) => (
              <div key={tp.round} className="text-[8px] bg-[#F1F3F5] px-2 py-1 rounded font-bold text-[#6C757D]">
                El {tp.round}: {tp.reason}
              </div>
            ))}
          </div>
        </div>

        {/* B) Delta Analysis Chart */}
        <div className="bg-white p-3 rounded-lg border-2 border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={16} className="text-[#1A1A1A]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">B) El Bazlı Performans</h3>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analysisData.deltaData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 7, fontWeight: 'bold' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 7, fontWeight: 'bold' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '4px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '5px', fontSize: '8px', fontWeight: 'bold' }} />
                {players.map(p => (
                  <Bar key={p.id} dataKey={p.name} fill={p.color} radius={[1, 1, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Score Share */}
        <div className="bg-white p-3 rounded-lg border-2 border-[#E9ECEF] shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={16} className="text-[#1A1A1A]" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest">Skor Dağılımı (Pasta)</h3>
          </div>
          <div className="h-[200px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analysisData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analysisData.pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* C, D, E, F) Advanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysisData.playerStats.map((stat: any) => (
            <div key={stat.name} className="bg-white p-4 rounded-lg border-2 border-[#E9ECEF] shadow-sm space-y-3">
              <div className="flex items-center gap-2 border-b border-[#F1F3F5] pb-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
                <h4 className="text-base font-black uppercase tracking-tighter">{stat.name}</h4>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#6C757D] mb-0.5">
                    <Activity size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Tutarlılık</span>
                  </div>
                  <div className="text-sm font-black leading-tight">{stat.consistencyLabel}</div>
                  <div className="text-[9px] opacity-50">±{stat.stdDev} std</div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#6C757D] mb-0.5">
                    <Zap size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Momentum</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getMomentumColor(parseFloat(stat.momentum)) }} />
                    <div className="text-base font-black">{stat.momentum}%</div>
                  </div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#6C757D] mb-0.5">
                    <Target size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">En İyi / En Kötü</span>
                  </div>
                  <div className="text-[10px] font-black">
                    <span className="text-green-600">{stat.best}</span> (El {stat.bestRound}) / <span className="text-red-600">{stat.worst}</span> (El {stat.worstRound})
                  </div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#6C757D] mb-0.5">
                    <TrendingUp size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Baskı / Geri Dönüş</span>
                  </div>
                  <div className="text-sm font-black leading-tight">{stat.pressureAvg} avg</div>
                  <div className="text-[9px] opacity-50">{stat.comebackRounds} Geri Dönüş</div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#6C757D] mb-0.5">
                    <CheckCircle2 size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Kazanma Sıklığı</span>
                  </div>
                  <div className="text-base font-black">%{stat.winFrequency}</div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#DC3545] mb-0.5">
                    <RotateCcw size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Toplam Ceza</span>
                  </div>
                  <div className="text-base font-black text-[#DC3545]">{stat.totalPenalty}</div>
                </div>

                <div className="p-2 bg-[#F8F9FA] rounded-md border border-[#E9ECEF]">
                  <div className="flex items-center gap-1.5 text-[#007BFF] mb-0.5">
                    <Zap size={10} />
                    <span className="text-[8px] font-bold uppercase tracking-widest">Okey Yüzdesi</span>
                  </div>
                  <div className="text-base font-black text-[#007BFF]">%{stat.okeyPercentage}</div>
                  <div className="text-[9px] opacity-50">{stat.totalOkeys} Okey</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

const HistoryView = ({ gameHistory, onBack, onSelectGame }: {
  gameHistory: SavedGame[],
  onBack: () => void,
  onSelectGame: (game: SavedGame) => void,
  key?: string
}) => {
  const globalStats = useMemo(() => {
    if (gameHistory.length === 0) return null;

    const playerStats: Record<string, any> = {};

    gameHistory.forEach(game => {
      game.players.forEach(p => {
        if (!playerStats[p.name]) {
          playerStats[p.name] = {
            name: p.name,
            games: 0,
            wins: 0,
            totalScore: 0,
            bestScore: Infinity,
            worstScore: -Infinity,
            streak: 0,
            maxStreak: 0
          };
        }
        const stats = playerStats[p.name];
        stats.games++;
        if (game.winnerName === p.name) {
          stats.wins++;
          stats.streak++;
          stats.maxStreak = Math.max(stats.maxStreak, stats.streak);
        } else {
          stats.streak = 0;
        }
        const gameTotal = p.scores.reduce((acc, curr) => acc + curr.gameScore + curr.penaltyScore, 0);
        stats.totalScore += gameTotal;
        stats.bestScore = Math.min(stats.bestScore, gameTotal);
        stats.worstScore = Math.max(stats.worstScore, gameTotal);
      });
    });

    return Object.values(playerStats).sort((a, b) => b.wins - a.wins);
  }, [gameHistory]);

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#212529] font-sans p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <button onClick={onBack} className="flex items-center gap-1.5 text-[#6C757D] hover:text-[#1A1A1A] transition-colors font-bold text-[10px] tracking-wider">
          <ChevronLeft size={14} /> ANA SAYFA
        </button>
        
        <div className="space-y-0.5">
          <h2 className="text-2xl font-black tracking-tighter">GEÇMİŞ & İSTATİSTİKLER</h2>
          <p className="text-[10px] text-[#6C757D]">Genel performans verileri ve oyun geçmişi.</p>
        </div>

        {globalStats && (
          <div className="space-y-3">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Genel Oyuncu Performansı</h3>
            <div className="grid grid-cols-1 gap-2">
              {globalStats.slice(0, 4).map((stat: any) => (
                <div key={stat.name} className="bg-white p-3 border-2 border-[#E9ECEF] rounded-lg shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#F1F3F5] rounded-full flex items-center justify-center font-black text-xs">
                      {stat.name[0]}
                    </div>
                    <div>
                      <div className="text-sm font-bold">{stat.name}</div>
                      <div className="text-[9px] text-[#6C757D] font-bold">
                        {stat.wins} Galibiyet • %{((stat.wins / stat.games) * 100).toFixed(0)} Kazanma
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-bold text-[#6C757D] uppercase">En İyi / Seri</div>
                    <div className="text-xs font-black">{stat.bestScore} / {stat.maxStreak}🔥</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-3">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#6C757D]">Oyun Geçmişi</h3>
          <div className="space-y-3">
            {gameHistory.map((game) => (
              <button
                key={game.id}
                onClick={() => onSelectGame(game)}
                className="w-full text-left p-4 bg-white border-2 border-[#E9ECEF] rounded-lg hover:border-[#1A1A1A] transition-all group shadow-sm flex items-center justify-between active:scale-[0.98]"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-[8px] font-bold text-[#ADB5BD] uppercase tracking-widest">
                    <Calendar size={10} />
                    {game.date}
                  </div>
                  <div className="text-base font-bold">{game.players.map(p => p.name).join(' vs ')}</div>
                  <div className="flex items-center gap-1.5">
                    <Trophy size={10} className="text-[#FFD700]" />
                    <span className="text-[10px] font-bold">Kazanan: {game.winnerName}</span>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#ADB5BD] group-hover:text-[#1A1A1A] transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<View>('home');
  const [gameMode, setGameMode] = useState<GameMode | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [gameHistory, setGameHistory] = useState<SavedGame[]>([]);
  const [selectedHistoryGame, setSelectedHistoryGame] = useState<SavedGame | null>(null);
  const [initialDealerIndex, setInitialDealerIndex] = useState(0);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('efha_101_history');
    if (saved) {
      try {
        setGameHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history helper
  const saveToHistory = (game: SavedGame) => {
    const newHistory = [game, ...gameHistory].slice(0, 50); // Keep last 50
    setGameHistory(newHistory);
    localStorage.setItem('efha_101_history', JSON.stringify(newHistory));
  };

  const handleStartSetup = (mode: GameMode) => {
    setGameMode(mode);
    setSelectedHistoryGame(null);
    setCurrentRound(0);
    const count = mode === 'single' ? 4 : 2;
    const initialPlayers = Array.from({ length: count }, (_, i) => ({
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      name: '',
      color: PLAYER_COLORS[mode][i],
      scores: Array.from({ length: MAX_ROUNDS }, () => ({ gameScore: 0, penaltyScore: 0, okeyCount: 0 }))
    }));
    setPlayers(initialPlayers);
    setInitialDealerIndex(Math.floor(Math.random() * count));
    setView('setup');
  };

  const handlePlayerNameChange = (id: string, name: string) => {
    setPlayers(prev => prev.map(p => p.id === id ? { ...p, name } : p));
  };

  const startGame = () => {
    setPlayers(prev => prev.map((p, idx) => ({
      ...p,
      name: p.name.trim() === '' 
        ? (gameMode === 'single' ? `Oyuncu ${idx + 1}` : `Takım ${idx + 1}`) 
        : p.name
    })));
    setView('game');
  };

  const finishGame = () => {
    const winner = totals[0];
    const newGame: SavedGame = {
      id: typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : Math.random().toString(36).substring(2),
      date: new Date().toLocaleString('tr-TR'),
      mode: gameMode!,
      players,
      winnerName: winner.name
    };
    saveToHistory(newGame);
    setSelectedHistoryGame(newGame);
    setView('analysis');
  };

  const resetGame = () => {
    if (window.confirm('Oyunu sıfırlamak istediğinize emin misiniz?')) {
      setView('home');
      setGameMode(null);
      setPlayers([]);
      setCurrentRound(0);
      setSelectedHistoryGame(null);
    }
  };

  const updateScore = (playerId: string, roundIndex: number, field: keyof ScoreEntry, value: string) => {
    // We handle the value as a string to allow multi-digit entry, then parse it
    const numValue = value === '' ? 0 : (parseInt(value) || 0);
    setPlayers(prev => prev.map(p => {
      if (p.id === playerId) {
        const newScores = [...p.scores];
        newScores[roundIndex] = { ...newScores[roundIndex], [field]: numValue };
        return { ...p, scores: newScores };
      }
      return p;
    }));
  };

  const totals = useMemo(() => {
    const targetPlayers = selectedHistoryGame ? selectedHistoryGame.players : players;
    return targetPlayers.map(p => {
      const total = p.scores.reduce((acc, curr) => acc + curr.gameScore + curr.penaltyScore, 0);
      return { id: p.id, name: p.name, total, color: p.color };
    }).sort((a, b) => a.total - b.total);
  }, [players, selectedHistoryGame]);

  const roundWinners = useMemo(() => {
    const targetPlayers = selectedHistoryGame ? selectedHistoryGame.players : players;
    return Array.from({ length: MAX_ROUNDS }).map((_, roundIdx) => {
      const roundScores = targetPlayers.map(p => ({
        id: p.id,
        color: p.color,
        score: p.scores[roundIdx].gameScore + p.scores[roundIdx].penaltyScore,
        hasScore: p.scores[roundIdx].gameScore !== 0 || p.scores[roundIdx].penaltyScore !== 0 || p.scores[roundIdx].okeyCount !== 0
      }));

      const isPlayed = roundScores.some(s => s.hasScore);
      if (!isPlayed) return null;

      const minScore = Math.min(...roundScores.map(s => s.score));
      const winners = roundScores.filter(s => s.score === minScore);

      if (winners.length > 1) return TIE_COLOR;
      return winners[0].color;
    });
  }, [players, selectedHistoryGame]);

  const analysisData = useMemo(() => {
    const targetPlayers = selectedHistoryGame ? selectedHistoryGame.players : players;
    if (targetPlayers.length === 0) return null;

    const cumulativeData = Array.from({ length: MAX_ROUNDS }).map((_, i) => {
      const entry: any = { name: `El ${i + 1}`, round: i + 1 };
      targetPlayers.forEach(p => {
        const sumUntil = p.scores.slice(0, i + 1).reduce((acc, curr) => acc + curr.gameScore + curr.penaltyScore, 0);
        entry[p.name] = sumUntil;
      });
      return entry;
    });

    const deltaData = Array.from({ length: MAX_ROUNDS }).map((_, i) => {
      const entry: any = { name: `El ${i + 1}`, round: i + 1 };
      targetPlayers.forEach(p => {
        entry[p.name] = p.scores[i].gameScore + p.scores[i].penaltyScore;
      });
      return entry;
    });

    const turningPoints: any[] = [];
    cumulativeData.forEach((roundData, idx) => {
      if (idx === 0) return;
      const prevRound = cumulativeData[idx - 1];
      const roundScores = targetPlayers.map(tp => ({ name: tp.name, score: roundData[tp.name] }));
      const prevScores = targetPlayers.map(tp => ({ name: tp.name, score: prevRound[tp.name] }));
      
      roundScores.sort((a, b) => a.score - b.score);
      prevScores.sort((a, b) => a.score - b.score);
      
      const currentGap = roundScores[1].score - roundScores[0].score;
      const prevGap = prevScores[1].score - prevScores[0].score;
      
      if (Math.abs(currentGap - prevGap) > 150 || roundScores[0].name !== prevScores[0].name) {
        turningPoints.push({
          round: idx + 1,
          name: `El ${idx + 1}`,
          reason: roundScores[0].name !== prevScores[0].name ? "Lider Değişti" : "Fark Açıldı",
          ...roundData
        });
      }
    });

    const playerStats = targetPlayers.map(p => {
      const roundTotals = p.scores.map(s => s.gameScore + s.penaltyScore);
      const playedRounds = roundTotals.filter((_, i) => roundWinners[i] !== null);
      
      const avg = playedRounds.length > 0 
        ? playedRounds.reduce((a, b) => a + b, 0) / playedRounds.length 
        : 0;
      
      const stdDev = playedRounds.length > 0
        ? Math.sqrt(playedRounds.map(x => Math.pow(x - avg, 2)).reduce((a, b) => a + b, 0) / playedRounds.length)
        : 0;

      const best = playedRounds.length > 0 ? Math.min(...playedRounds) : 0;
      const worst = playedRounds.length > 0 ? Math.max(...playedRounds) : 0;
      
      const bestRoundIdx = roundTotals.indexOf(best);
      const worstRoundIdx = roundTotals.indexOf(worst);

      const last3 = playedRounds.slice(-3);
      const last3Avg = last3.length > 0 ? last3.reduce((a, b) => a + b, 0) / last3.length : 0;
      
      // Momentum = 100 - (Son 3 elin ortalaması / 404 × 100)
      const momentum = 100 - (last3Avg / 404 * 100);

      let consistencyLabel = "Dengeli";
      if (stdDev > 100) consistencyLabel = "Uçuk / Riskli";
      else if (stdDev < 40) consistencyLabel = "Sabit / Tahmin Edilebilir";

      let pressureRounds = 0;
      let pressureScore = 0;
      cumulativeData.forEach((roundData, idx) => {
        if (idx === 0) return;
        const roundScores = targetPlayers.map(tp => roundData[tp.name]);
        const leaderScore = Math.min(...roundScores);
        if (roundData[p.name] > leaderScore + 100) {
           pressureRounds++;
           pressureScore += p.scores[idx].gameScore + p.scores[idx].penaltyScore;
        }
      });
      const pressureAvg = pressureRounds > 0 ? pressureScore / pressureRounds : 0;

      // Frequency: How many rounds won
      const wins = roundWinners.filter(w => w === p.color).length;
      const winFrequency = ((wins / MAX_ROUNDS) * 100).toFixed(0);

      // Comeback Ability: Rounds won when not in 1st place
      let comebackRounds = 0;
      cumulativeData.forEach((roundData, idx) => {
        if (idx === 0) return;
        if (roundWinners[idx] === p.color) {
          const prevRoundScores = targetPlayers.map(tp => cumulativeData[idx - 1][tp.name]);
          const minPrevScore = Math.min(...prevRoundScores);
          if (cumulativeData[idx - 1][p.name] > minPrevScore) {
            comebackRounds++;
          }
        }
      });

      const totalPenalty = p.scores.reduce((acc, curr) => acc + curr.penaltyScore, 0);
      const totalOkeys = p.scores.reduce((acc, curr) => acc + (curr.okeyCount || 0), 0);
      const totalOkeysInGame = playedRounds.length * 2;
      const okeyPercentage = totalOkeysInGame > 0 ? ((totalOkeys / totalOkeysInGame) * 100).toFixed(1) : '0';

      return {
        name: p.name,
        color: p.color,
        avg: avg.toFixed(1),
        stdDev: stdDev.toFixed(1),
        best,
        bestRound: bestRoundIdx + 1,
        worst,
        worstRound: worstRoundIdx + 1,
        momentum: momentum.toFixed(1),
        consistencyLabel,
        pressureAvg: pressureAvg.toFixed(1),
        winFrequency,
        comebackRounds,
        totalPenalty,
        totalOkeys,
        okeyPercentage
      };
    });

    const pieData = targetPlayers.map(p => {
      const total = p.scores.reduce((acc, curr) => acc + curr.gameScore + curr.penaltyScore, 0);
      return { name: p.name, value: total, color: p.color };
    });

    return { cumulativeData, deltaData, playerStats, turningPoints, pieData };
  }, [players, selectedHistoryGame, roundWinners]);

  return (
    <AnimatePresence mode="wait">
      {view === 'home' && (
        <HomeView 
          key="home" 
          onStartSetup={handleStartSetup} 
          onViewHistory={() => setView('history')} 
          historyCount={gameHistory.length} 
        />
      )}
      {view === 'setup' && (
        <SetupView 
          key="setup" 
          gameMode={gameMode} 
          players={players} 
          onBack={() => setView('home')} 
          onNameChange={handlePlayerNameChange} 
          onStart={startGame} 
        />
      )}
      {view === 'game' && (
        <GameView 
          key="game" 
          gameMode={gameMode} 
          players={players} 
          currentRound={currentRound} 
          totals={totals} 
          roundWinners={roundWinners} 
          onBack={() => setView('setup')} 
          onReset={resetGame} 
          onUpdateScore={updateScore} 
          onSetRound={setCurrentRound} 
          onFinish={finishGame} 
          initialDealerIndex={initialDealerIndex}
        />
      )}
      {view === 'analysis' && (
        <AnalysisView 
          key="analysis" 
          analysisData={analysisData} 
          totals={totals} 
          players={players} 
          historyDate={selectedHistoryGame?.date} 
          onBack={() => setView('home')} 
        />
      )}
      {view === 'history' && (
        <HistoryView 
          key="history" 
          gameHistory={gameHistory} 
          onBack={() => setView('home')} 
          onSelectGame={(game) => {
            setSelectedHistoryGame(game);
            setPlayers(game.players);
            setGameMode(game.mode);
            setView('analysis');
          }} 
        />
      )}
    </AnimatePresence>
  );
}
