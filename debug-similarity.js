// 调试相似度算法
const text1 = "今天累死了，保持精力太重要，我应该中午回酒店休息一会儿";
const text2 = "今天早起太早了，为了保持精力，我应该中午回酒店休息一会儿";

console.log("=== 调试相似度算法 ===");
console.log("文本1:", text1);
console.log("文本2:", text2);
console.log("文本1长度:", text1.length);
console.log("文本2长度:", text2.length);

// 模拟特征提取
function extractTextFeatures(text) {
  const cleanText = text.toLowerCase();
  
  // 1. 按标点符号分割句子
  const sentences = cleanText
    .replace(/[，。！？；：、""''（）【】]/g, '|')
    .split('|')
    .filter(s => s.length > 0);
  
  console.log("sentences:", sentences);
  
  // 2. 中文单字符提取
  const chineseChars = cleanText.match(/[\u4e00-\u9fff]/g) || [];
  console.log("chineseChars:", chineseChars);
  
  // 3. 提取2-4字的中文词组
  const chineseWords = [];
  for (const sentence of sentences) {
    const chars = sentence.match(/[\u4e00-\u9fff]/g) || [];
    // 提取2字词
    for (let i = 0; i < chars.length - 1; i++) {
      chineseWords.push(chars[i] + chars[i + 1]);
    }
    // 提取3字词
    for (let i = 0; i < chars.length - 2; i++) {
      chineseWords.push(chars[i] + chars[i + 1] + chars[i + 2]);
    }
  }
  
  console.log("chineseWords:", chineseWords);
  
  // 4. 概念词检测
  const conceptGroups = {
    fatigue: ['累', '累死', '疲劳', '疲惫', '困', '乏', '疲乏', '痛苦', '辛苦'],
    time: ['早起', '太早', '中午', '早上', '上午', '下午', '晚上', '时间'],
    energy: ['精力', '体力', '能量', '状态', '精神'],
    rest: ['休息', '睡觉', '躺', '放松', '歇', '小憩'],
    place: ['酒店', '宾馆', '房间', '家', '办公室'],
    action: ['保持', '维持', '应该', '需要', '回', '去', '来']
  };
  
  const conceptWords = [];
  for (const [groupName, patterns] of Object.entries(conceptGroups)) {
    for (const pattern of patterns) {
      if (cleanText.includes(pattern)) {
        conceptWords.push(pattern);
        conceptWords.push(`group_${groupName}`);
      }
    }
  }
  
  console.log("conceptWords:", conceptWords);
  
  return {
    keywords: [...new Set(chineseWords)],
    concepts: [...new Set(conceptWords)],
    chars: [...new Set(chineseChars)],
    length: text.length
  };
}

console.log("\n=== 文本1特征 ===");
const features1 = extractTextFeatures(text1);
console.log(features1);

console.log("\n=== 文本2特征 ===");  
const features2 = extractTextFeatures(text2);
console.log(features2);

// 计算相似度
function calculateSimilarity(f1, f2) {
  const { keywords: kw1, concepts: cp1, chars: ch1, length: len1 } = f1;
  const { keywords: kw2, concepts: cp2, chars: ch2, length: len2 } = f2;
  
  // 概念相似度
  const commonConcepts = cp1.filter(c => cp2.includes(c)).length;
  const totalConcepts = Math.max(cp1.length, cp2.length);
  const conceptSimilarity = totalConcepts > 0 ? (commonConcepts / totalConcepts) : 0;
  
  // 组匹配
  const groupMatches = cp1.filter(c1 => 
    c1.startsWith('group_') && cp2.some(c2 => c2 === c1)
  ).length;
  const enhancedConceptSimilarity = Math.max(conceptSimilarity, groupMatches > 0 ? 0.6 : 0);
  
  // 关键词相似度
  const commonKeywords = kw1.filter(kw => kw2.includes(kw)).length;
  const totalKeywords = Math.max(kw1.length, kw2.length);
  const keywordSimilarity = totalKeywords > 0 ? (commonKeywords / totalKeywords) : 0;
  
  // 字符相似度
  const commonChars = ch1.filter(c => ch2.includes(c)).length;
  const totalChars = Math.max(ch1.length, ch2.length);
  const charSimilarity = totalChars > 0 ? (commonChars / totalChars) : 0;
  
  // 长度相似度
  const lengthRatio = Math.min(len1, len2) / Math.max(len1, len2);
  
  console.log("\n=== 相似度计算 ===");
  console.log("共同概念:", cp1.filter(c => cp2.includes(c)));
  console.log("概念相似度:", conceptSimilarity);
  console.log("组匹配数:", groupMatches);
  console.log("增强概念相似度:", enhancedConceptSimilarity);
  console.log("共同关键词:", kw1.filter(kw => kw2.includes(kw)));
  console.log("关键词相似度:", keywordSimilarity);
  console.log("字符相似度:", charSimilarity);
  console.log("长度相似度:", lengthRatio);
  
  const finalScore = (
    enhancedConceptSimilarity * 0.35 +
    keywordSimilarity * 0.25 +
    charSimilarity * 0.10 +
    lengthRatio * 0.05
  ) * 100;
  
  return Math.round(finalScore * 10) / 10;
}

const similarity = calculateSimilarity(features1, features2);
console.log("\n=== 最终结果 ===");
console.log("相似度评分:", similarity, "%");
console.log("是否通过5%阈值:", similarity >= 5 ? "是" : "否");