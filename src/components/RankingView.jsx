import { Award, Activity, UserRound, Dot } from 'lucide-react';

export default function RankingView({ ranking }) {
  return (
    <section>
      <div className="text-center">
        <h2 className="font-display text-6xl font-bold text-slate-900">贡献排行榜</h2>
        <p className="mt-2 text-[30px] text-slate-500">致敬每一位构建情报网络的贡献者。</p>
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-[40px] bg-brand-600 p-8 text-white shadow-soft">
          <div className="inline-flex rounded-2xl bg-white/20 p-3">
            <Award size={24} />
          </div>
          <p className="mt-5 text-[20px] text-indigo-100">本月之星</p>
          <h3 className="mt-1 text-5xl font-bold">{ranking.monthlyStar?.name || '暂无'}</h3>
          <div className="mt-5 inline-flex rounded-2xl bg-white/15 px-4 py-2">
            <p className="text-[18px]">贡献次数 {ranking.monthlyStar?.monthly || 0}</p>
          </div>
          <div className="absolute -bottom-7 -right-2 text-[200px] leading-none text-white/10">🏆</div>
        </div>

        <StatCard icon={Activity} title="总情报数" value={ranking.totalIntelligence} extra="持续增长中" extraColor="text-emerald-500" iconWrap="bg-emerald-100 text-emerald-600" />
        <StatCard icon={UserRound} title="活跃成员" value={ranking.activeMembers} extra="跨部门协作" extraColor="text-brand-600" iconWrap="bg-indigo-100 text-brand-600" />
      </div>

      <div className="glass mt-8 rounded-[40px] p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-4xl font-bold text-slate-900">贡献者排行榜</h3>
          <span className="rounded-full bg-slate-100 px-4 py-1 text-[16px] text-slate-400">● 实时同步</span>
        </div>

        {ranking.leaderboard.length === 0 ? (
          <p className="py-24 text-center text-[30px] text-slate-300">暂无贡献数据</p>
        ) : (
          <div className="mt-6 space-y-3">
            {ranking.leaderboard.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-4">
                <p className="text-[22px] font-semibold text-slate-700">#{index + 1} {item.name}</p>
                <div className="flex items-center gap-4">
                  <p className="text-[18px] text-slate-400">{item.submissions} 次提交</p>
                  <p className="text-[22px] font-bold text-brand-600">{item.points} 分</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function StatCard({ icon: Icon, title, value, extra, extraColor, iconWrap }) {
  return (
    <div className="glass rounded-[40px] p-8">
      <div className={`inline-flex rounded-2xl p-3 ${iconWrap}`}>
        <Icon size={24} />
      </div>
      <p className="mt-5 text-[20px] text-slate-400">{title}</p>
      <p className="mt-2 text-6xl font-bold text-slate-900">{value}</p>
      <p className={`mt-3 text-[22px] font-semibold ${extraColor}`}><Dot className="inline" />{extra}</p>
    </div>
  );
}
