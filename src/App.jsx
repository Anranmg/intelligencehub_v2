import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock3, Plus, Shield, Trophy } from 'lucide-react';
import SubmitView from './components/SubmitView';
import HistoryView from './components/HistoryView';
import RankingView from './components/RankingView';

const tabs = [
  { id: 'submit', label: '提交', icon: Plus },
  { id: 'history', label: '流转', icon: Clock3 },
  { id: 'ranking', label: '排行', icon: Trophy }
];

export default function App() {
  const [tab, setTab] = useState('submit');
  const [records, setRecords] = useState([]);
  const [ranking, setRanking] = useState({ monthlyStar: null, totalIntelligence: 0, activeMembers: 0, leaderboard: [] });

  const reload = async () => {
    const [recordsRes, rankingRes] = await Promise.all([fetch('/api/intelligence'), fetch('/api/ranking')]);
    const recordsData = await recordsRes.json();
    const rankingData = await rankingRes.json();
    setRecords(recordsData.data ?? []);
    setRanking(rankingData.data ?? { monthlyStar: null, totalIntelligence: 0, activeMembers: 0, leaderboard: [] });
  };

  useEffect(() => {
    reload();
  }, []);

  const currentView = useMemo(() => {
    if (tab === 'history') return <HistoryView records={records} onSwitch={() => setTab('submit')} />;
    if (tab === 'ranking') return <RankingView ranking={ranking} />;
    return <SubmitView onSubmitted={reload} />;
  }, [tab, records, ranking]);

  return (
    <div className="min-h-screen px-5 py-5 md:px-8">
      <header className="mx-auto flex max-w-[1120px] items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-soft">
            <Shield size={22} />
          </div>
          <div>
            <h1 className="font-display text-[38px] font-bold leading-none tracking-tight text-slate-900">情报收集</h1>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">INTELLIGENCE HUB</p>
          </div>
        </div>

        <nav className="glass rounded-[18px] p-1.5">
          <div className="relative flex gap-1">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`relative z-10 flex items-center gap-2 rounded-xl px-6 py-2.5 text-[23px] font-semibold ${
                  tab === id ? 'text-brand-600' : 'text-slate-500'
                }`}
              >
                <Icon size={16} />
                {label}
                {tab === id && <motion.div layoutId="tab-pill" className="absolute inset-0 -z-10 rounded-xl bg-white" />}
              </button>
            ))}
          </div>
        </nav>

      </header>

      <main className="mx-auto mt-8 max-w-[1120px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentView}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="mx-auto mt-10 flex max-w-[1120px] items-center justify-between pb-4 text-[20px] font-semibold text-slate-300">
        <p>🛡️ INTELLIGENCE PROTOCOL V2.4</p>
        <div className="flex gap-8">
          <span>隐私</span>
          <span>安全</span>
          <span>API</span>
          <span>文档</span>
        </div>
      </footer>
    </div>
  );
}
