# intelligencehub_v2
with codex 

中文情报采集平台（React + Vite + Tailwind + Express + SQLite + Gemini）。

## 功能

- 情报提交区：文本+图片上传+可选贡献者姓名。
- AI 结构化提取：标题、类别、优先级、关键实体、摘要。
- 情报流转：历史卡片展示 + 实时关键词检索。
- 贡献排行榜：本月之星、全局统计、贡献积分榜。
- SQLite 自动迁移 + 全部 API JSON 错误返回。
- Framer Motion 过渡动画。

## 运行

```bash
npm install
npm run dev
```

- 前端：`http://localhost:5173`
- 后端：`http://localhost:3001`

## Gemini Key（可选）

```bash
export GEMINI_API_KEY=your_key_here
```

未配置时将使用后端规则引擎作为兜底提取。
