import { useMemo, useState } from 'react';
import { History, Search } from 'lucide-react';

export default function HistoryView({ records, onSwitch }) {
  const [term, setTerm] = useState('');

  const filtered = useMemo(() => {
    const value = term.trim().toLowerCase();
    if (!value) return records;
    return records.filter((record) => {
      const structured = record.structured || {};
      const haystack = [
        record.content,
        structured.record_timestamp,
        structured.information_source,
        structured.information_category,
        structured.related_product,
        structured.information_provider,
        structured.information_region,
        structured.information_details,
        structured.information_org
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(value);
    });
  }, [records, term]);

  return (
    <section>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-display text-6xl font-bold text-slate-900">情报网络</h2>
          <p className="mt-2 text-[30px] text-slate-500">结构化浏览 timestamp / source / region / org 等字段。</p>
        </div>

        <label className="glass flex h-16 w-full max-w-[430px] items-center gap-2 rounded-3xl px-4">
          <Search className="text-slate-300" size={20} />
          <input
            value={term}
            onChange={(event) => setTerm(event.target.value)}
            placeholder="搜索来源、类别、组织、产品..."
            className="w-full bg-transparent text-[22px] text-slate-500 outline-none"
          />
        </label>
      </div>

      {filtered.length === 0 ? (
        <div className="glass mt-8 rounded-[40px] border border-dashed border-slate-200 p-20 text-center">
          <History className="mx-auto text-slate-300" size={72} />
          <h3 className="mt-5 text-5xl font-bold text-slate-800">暂无数据</h3>
          <p className="mt-2 text-[28px] text-slate-400">目前还没有采集到任何公开情报。</p>
          <button onClick={onSwitch} className="mt-8 rounded-2xl bg-brand-600 px-8 py-3 text-[24px] font-semibold text-white">
            立即采集
          </button>
        </div>
      ) : (
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {filtered.map((record) => {
            const s = record.structured || {};
            const heading = (s.information_details || record.information_details || '未命名情报').slice(0, 40);
            return (
              <article key={record.id} className="glass rounded-[36px] p-5">
                {record.image_data && <img src={record.image_data} alt={heading} className="mb-4 h-48 w-full rounded-3xl object-cover" />}
                <h3 className="font-display text-[32px] font-bold text-slate-900">{heading}</h3>
                <p className="mt-2 text-[20px] text-slate-500">{s.information_details || record.information_details || '无详情'}</p>

                <div className="mt-4 grid grid-cols-2 gap-2 text-[16px] text-slate-500">
                  <Meta label="记录时间" value={s.record_timestamp} />
                  <Meta label="情报日期" value={s.information_date || '-'} />
                  <Meta label="来源" value={s.information_source} />
                  <Meta label="类别" value={s.information_category || record.information_category} />
                  <Meta label="相关产品" value={s.related_product || record.related_product} />
                  <Meta label="提供方" value={s.information_provider} />
                  <Meta label="地区" value={s.information_region} />
                  <Meta label="组织" value={s.information_org} />
                </div>

                <div className="mt-3 flex justify-between text-[18px] text-slate-400">
                  <span>{record.contributor_name || '匿名'}</span>
                  <span>{record.create_at}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

function Meta({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="truncate text-sm text-slate-600">{value || '未提供'}</p>
    </div>
  );
}
