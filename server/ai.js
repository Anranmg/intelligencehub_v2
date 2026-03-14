import { GoogleGenAI } from '@google/genai';

const prompt = `请将输入情报提取为严格 JSON，并且只包含以下字段：
- record_timestamp（记录时间戳，建议 ISO 8601）
- information_date（情报发生日期，YYYY-MM-DD 或空字符串）
- information_source（信息来源）
- information_category（信息类别）
- related_product（相关产品）
- information_provider（信息提供方）
- information_region（信息地区）
- information_details（信息详情）
- information_org（相关组织）

只返回 JSON，不要输出任何解释文本。`;

function toTimestampNow(value) {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return new Date().toISOString();
}

function normalize(parsed, fallbackContent = '') {
  return {
    record_timestamp: toTimestampNow(parsed?.record_timestamp),
    information_date: typeof parsed?.information_date === 'string' ? parsed.information_date : '',
    information_source: parsed?.information_source || '用户提交',
    information_category: parsed?.information_category || '未分类',
    related_product: parsed?.related_product || '未提及',
    information_provider: parsed?.information_provider || '未知提供方',
    information_region: parsed?.information_region || '未知地区',
    information_details: parsed?.information_details || fallbackContent.slice(0, 220) || '未提供详情',
    information_org: parsed?.information_org || '未知机构'
  };
}

function fallbackExtract(content = '') {
  const orgMatch = content.match(/(?:公司|集团|组织|机构)[:：]?\s*([^，。,\n]+)/);
  const productMatch = content.match(/(?:产品|系统|平台)[:：]?\s*([^，。,\n]+)/);
  const sourceMatch = content.match(/(?:来源|渠道)[:：]?\s*([^，。,\n]+)/);

  return normalize({
    record_timestamp: new Date().toISOString(),
    information_date: '',
    information_source: sourceMatch?.[1]?.trim() || '用户提交',
    information_category: /网络|攻击|漏洞|木马/i.test(content) ? '网络安全' : /市场|金融|经济/i.test(content) ? '市场情报' : '综合情报',
    related_product: productMatch?.[1]?.trim() || '未提及',
    information_provider: '匿名用户',
    information_region: '未知地区',
    information_details: content.slice(0, 220) || '图片型情报，暂无文字详情。',
    information_org: orgMatch?.[1]?.trim() || '未知机构'
  }, content);
}

export async function analyzeSubmission({ content, imageData }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return fallbackExtract(content);

  try {
    const client = new GoogleGenAI({ apiKey });
    const result = await client.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: [{ role: 'user', parts: [{ text: `${prompt}\n\n输入内容：\n${content || '(empty text)'}` }] }],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const raw = result?.text || '{}';
    return normalize(JSON.parse(raw), content || (imageData ? 'Image submission' : ''));
  } catch {
    return fallbackExtract(content);
  }
}
