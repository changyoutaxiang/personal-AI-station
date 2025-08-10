// 极简增长知识库
// 基于《极简增长》读书笔记知识库

export const MINIMALIST_KNOWLEDGE_BASE = {
  // 核心理念
  coreIdeas: [
    {
      title: "人工智能时代的极简组织与敏捷增长",
      content: "极简增长不仅是'事'的聚焦，同时也是'人'的聚焦，意味着更小、更敏捷的极简组织。AI工具能够极大提升个体生产力，让少数高素质人才配合智能工具完成过去需要大团队才能完成的工作。"
    },
    {
      title: "对的事遇对的人迸发超预期能量",
      content: "'对的事'找到'对的人'，两者产生化学反应，将迸发出超预期的巨大能量。价值观共振、能力最大化、正向循环是关键要素。"
    },
    {
      title: "选人比育人更重要",
      content: "选人比育人更关键，这是人才管理中最容易被忽视但最为核心的环节。企业家和创业者应该将80%的精力放在寻找和甄别人才上。基础性作用、高昂的错误成本、潜力天花板都说明了选人的重要性。"
    }
  ],

  // 战略原则
  strategicPrinciples: [
    {
      title: "企业与人生简单之道需要洞察力与克制力",
      content: "保持企业和人生的'简单'，需要CEO和团队具有敏锐的洞察力和强大的克制力。这种简单是建立在深刻认知和成熟判断上的能力。"
    },
    {
      title: "停止昨天的战争",
      content: "大胆的结束'昨天的战争'。什么是昨天的战争？就是你没有意识到趋势已经发生转变，却还把资源浪费在一个逐渐消失的行业上，致力于在一个过时的行业中取得优势，就像在泰坦尼克上争头等舱。"
    },
    {
      title: "企业核心要素错配导致失败",
      content: "许多企业失败的原因都源自于核心客户核心需求、核心产品、核心销售系统之间的各种各样的错配。企业失去内在的一致性是企业衰败的常见原因。"
    }
  ],

  // 四大灵魂追问
  fourSoulQuestions: [
    "核心客户是谁？他们的核心需求是什么？",
    "我们的核心产品是什么？它如何满足核心客户的核心需求？",
    "我们的核心竞争力是什么？如何形成压强投入？",
    "我们应该坚决舍弃什么？如何避免资源分散？"
  ],

  // 关键方法论
  methodologies: [
    {
      name: "压强投入原则",
      description: "集中优势资源在最关键的环节，形成突破性优势，避免资源分散导致的平庸结果。"
    },
    {
      name: "坚决舍弃智慧",
      description: "识别并放弃那些看似重要但实际分散注意力的次要事项，专注于真正的核心价值创造。"
    },
    {
      name: "软能力建设",
      description: "软能力建设的核心是人才，对人才投资的价值远高于对固定资产投资的价值。"
    }
  ],

  // 常见陷阱
  commonTraps: [
    "什么都想要的贪婪思维",
    "在过时行业中的无谓竞争",
    "核心要素之间的错配",
    "重育人轻选人的误区",
    "缺乏洞察力和克制力的复杂化倾向"
  ],

  // 分析框架
  analysisFramework: {
    steps: [
      "识别核心客户和核心需求",
      "评估核心产品的匹配度",
      "分析核心竞争力的形成",
      "检视资源配置的合理性",
      "确定需要舍弃的非核心事项"
    ],
    questions: [
      "当前最大的资源浪费在哪里？",
      "团队中是否都是'对的人'？",
      "哪些业务属于'昨天的战争'？",
      "如何实现更有效的压强投入？",
      "什么是我们必须坚决舍弃的？"
    ]
  }
};

// 生成基于知识库的分析提示词
export function generateKnowledgeBasePrompt(userContent: string): string {
  return `
作为极简增长首席顾问，我将基于《极简增长》读书笔记知识库为您提供专业分析。

## 核心理念参考：
${MINIMALIST_KNOWLEDGE_BASE.coreIdeas.map(idea => `- **${idea.title}**：${idea.content}`).join('\n')}

## 战略原则：
${MINIMALIST_KNOWLEDGE_BASE.strategicPrinciples.map(principle => `- **${principle.title}**：${principle.content}`).join('\n')}

## 四大灵魂追问：
${MINIMALIST_KNOWLEDGE_BASE.fourSoulQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

## 关键方法论：
${MINIMALIST_KNOWLEDGE_BASE.methodologies.map(method => `- **${method.name}**：${method.description}`).join('\n')}

## 用户输入内容：
${userContent}

请基于以上知识库内容和极简增长方法论，对用户输入进行深度分析，并提供具体的行动建议。
  `;
}