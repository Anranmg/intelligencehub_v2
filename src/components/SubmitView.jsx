import { useState } from 'react';
import { Database, SendHorizonal, ShieldCheck, Sparkles, User, Image as ImageIcon } from 'lucide-react';

export default function SubmitView({ onSubmitted }) {
  const [content, setContent] = useState('');
  const [contributorName, setContributorName] = useState('');
  const [image, setImage] = useState(null);
  const [isPublic, setIsPublic] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!content.trim() && !image) {
      setMessage('请填写文本或上传图片。');
      return;
    }

    setBusy(true);
    setMessage('智能体正在解析结构化情报...');

    try {
      const body = new FormData();
      body.append('content', content);
      body.append('contributorName', contributorName);
      body.append('isPublic', String(isPublic));
      if (image) body.append('image', image);

      const res = await fetch('/api/intelligence', { method: 'POST', body });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');

      setContent('');
      setContributorName('');
      setImage(null);
      setIsPublic(true);
      setMessage('提交成功，情报已入库。');
      onSubmitted();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section>
      <div className="text-center">
        <h2 className="font-display text-6xl font-bold tracking-tight text-slate-900">开始采集情报</h2>
        <p className="mt-3 text-[28px] text-slate-500">上传截图、粘贴文本或描述线索。智能体将为您完成结构化处理。</p>
      </div>

      <form onSubmit={onSubmit} className="glass mx-auto mt-8 max-w-[880px] rounded-[40px] p-7">
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="在此输入或粘贴情报..."
          className="h-[330px] w-full resize-none rounded-3xl border border-slate-100 bg-white/65 p-7 text-[24px] text-slate-700 outline-none ring-brand-600/20 transition focus:ring"
        />

        <label className="mt-4 flex items-center gap-3 rounded-2xl bg-slate-100/90 px-4 py-3 text-[18px] text-slate-600">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(event) => setIsPublic(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-brand-600"
          />
          我愿意将此条线索公开到「情报网络」
        </label>

        <div className="mt-5 grid gap-3 md:grid-cols-[1fr_1.2fr_1fr]">
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-4 text-[22px] font-semibold text-slate-600">
            <ImageIcon size={18} />
            {image ? image.name : '图片'}
            <input type="file" accept="image/*" className="hidden" onChange={(event) => setImage(event.target.files?.[0] ?? null)} />
          </label>

          <label className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-4">
            <User size={18} className="text-slate-400" />
            <input
              type="text"
              value={contributorName}
              onChange={(event) => setContributorName(event.target.value)}
              placeholder="您的姓名"
              className="w-full bg-transparent text-[20px] text-slate-600 outline-none"
            />
          </label>

          <button disabled={busy} className="rounded-2xl bg-brand-600 px-4 py-4 text-[22px] font-semibold text-white disabled:opacity-70">
            <span className="inline-flex items-center gap-2">
              <SendHorizonal size={16} />
              {busy ? '处理中...' : '提交情报'}
            </span>
          </button>
        </div>

        {message && <p className="mt-3 text-[18px] text-slate-500">{message}</p>}
      </form>

      <div className="mx-auto mt-7 grid max-w-[880px] gap-4 md:grid-cols-3">
        <FeatureCard icon={Sparkles} title="智能提取" text="智能体自动提取来源、类别、组织等字段" iconBg="bg-indigo-100 text-brand-600" />
        <FeatureCard icon={Database} title="结构化" text="凌乱情报转为结构化数据" iconBg="bg-emerald-100 text-emerald-600" />
        <FeatureCard icon={ShieldCheck} title="安全" text="端到端加密存储" iconBg="bg-violet-100 text-violet-600" />
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, text, iconBg }) {
  return (
    <div className="glass rounded-[34px] p-6">
      <div className={`mb-5 inline-flex rounded-2xl p-3 ${iconBg}`}>
        <Icon size={20} />
      </div>
      <h3 className="text-[32px] font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-[20px] text-slate-400">{text}</p>
    </div>
  );
}
