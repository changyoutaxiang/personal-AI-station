import { CreateProjectRequest } from '@/types/project';

interface DecompositionPrompt {
  projectName: string;
  description: string;
  type?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

interface ProjectTemplate {
  name: string;
  description: string;
  children?: ProjectTemplate[];
  tasks?: string[];
  estimatedHours?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export class ProjectAIDecomposer {
  private static templates: Record<string, ProjectTemplate[]> = {
    'web-app': [
      {
        name: '前端开发',
        description: '用户界面和用户体验',
        children: [
          {
            name: 'UI设计',
            description: '界面设计和原型',
            tasks: ['设计主页', '设计用户认证页面', '设计数据展示页面'],
            estimatedHours: 20,
            priority: 'high',
          },
          {
            name: '前端实现',
            description: 'React/Vue/Next.js实现',
            tasks: ['搭建项目结构', '实现路由', '实现组件', '集成API', '测试和优化'],
            estimatedHours: 40,
            priority: 'high',
          },
        ],
        estimatedHours: 60,
        priority: 'high',
      },
      {
        name: '后端开发',
        description: '服务器端逻辑和API',
        children: [
          {
            name: '数据库设计',
            description: '数据模型和架构',
            tasks: ['设计表结构', '创建迁移脚本', '设置索引'],
            estimatedHours: 10,
            priority: 'high',
          },
          {
            name: 'API开发',
            description: 'RESTful API实现',
            tasks: ['用户认证API', '数据CRUD API', '文件上传API', '错误处理'],
            estimatedHours: 30,
            priority: 'high',
          },
        ],
        estimatedHours: 40,
        priority: 'high',
      },
      {
        name: '部署配置',
        description: '服务器部署和配置',
        children: [
          {
            name: '开发环境',
            description: '本地开发环境设置',
            tasks: ['Docker配置', '数据库设置', '环境变量配置'],
            estimatedHours: 8,
            priority: 'medium',
          },
          {
            name: '生产部署',
            description: '生产环境部署',
            tasks: ['服务器配置', '域名设置', 'SSL证书', 'CI/CD配置'],
            estimatedHours: 16,
            priority: 'medium',
          },
        ],
        estimatedHours: 24,
        priority: 'medium',
      },
    ],
    'mobile-app': [
      {
        name: 'UI/UX设计',
        description: '移动应用界面设计',
        tasks: ['用户流程设计', '界面原型', '设计系统', '交互设计'],
        estimatedHours: 30,
        priority: 'high',
      },
      {
        name: '前端开发',
        description: 'React Native或Flutter开发',
        tasks: ['项目初始化', '导航实现', '状态管理', 'API集成', '离线功能'],
        estimatedHours: 60,
        priority: 'high',
      },
      {
        name: '后端服务',
        description: 'API和后端服务',
        tasks: ['用户管理', '数据存储', '推送通知', '分析集成'],
        estimatedHours: 40,
        priority: 'high',
      },
      {
        name: '测试发布',
        description: '测试和应用商店发布',
        tasks: ['单元测试', '集成测试', '性能测试', '应用商店提交'],
        estimatedHours: 20,
        priority: 'medium',
      },
    ],
    'data-analysis': [
      {
        name: '数据收集',
        description: '数据源和数据获取',
        tasks: ['数据爬取', 'API集成', '数据清洗', '数据验证'],
        estimatedHours: 20,
        priority: 'high',
      },
      {
        name: '数据处理',
        description: '数据预处理和特征工程',
        tasks: ['数据清洗', '特征提取', '数据标准化', '异常值处理'],
        estimatedHours: 30,
        priority: 'high',
      },
      {
        name: '模型开发',
        description: '机器学习和统计分析',
        tasks: ['模型选择', '模型训练', '模型评估', '模型优化'],
        estimatedHours: 40,
        priority: 'high',
      },
      {
        name: '结果可视化',
        description: '数据可视化和报告',
        tasks: ['图表设计', '仪表板开发', '报告生成', '结果解释'],
        estimatedHours: 20,
        priority: 'medium',
      },
    ],
  };

  /**
   * 使用AI分解项目
   */
  static async decomposeProject(prompt: DecompositionPrompt): Promise<CreateProjectRequest[]> {
    const { projectName, description, type = 'web-app', complexity = 'medium' } = prompt;
    
    // 根据项目类型选择模板
    const template = this.templates[type] || this.templates['web-app'];
    
    // 根据复杂度调整时间估算
    const complexityMultiplier = complexity === 'simple' ? 0.7 : complexity === 'complex' ? 1.5 : 1;
    
    return template.map(subProject => ({
      name: subProject.name,
      description: subProject.description,
      estimatedHours: Math.round((subProject.estimatedHours || 0) * complexityMultiplier),
      priority: subProject.priority || 'medium',
      parentId: undefined, // 将在创建主项目后设置
    }));
  }

  /**
   * 智能项目命名建议
   */
  static suggestProjectName(description: string): string[] {
    const keywords = description.toLowerCase();
    
    const suggestions = [];
    
    if (keywords.includes('blog') || keywords.includes('博客')) {
      suggestions.push('个人博客系统', '技术博客平台', '内容管理系统');
    }
    
    if (keywords.includes('app') || keywords.includes('应用')) {
      suggestions.push('移动应用开发', 'Web应用系统', '企业级应用');
    }
    
    if (keywords.includes('api') || keywords.includes('接口')) {
      suggestions.push('RESTful API服务', '微服务架构', 'API网关系统');
    }
    
    if (keywords.includes('data') || keywords.includes('数据')) {
      suggestions.push('数据分析平台', '数据可视化系统', '智能决策支持');
    }
    
    if (keywords.includes('ai') || keywords.includes('智能')) {
      suggestions.push('AI驱动应用', '智能推荐系统', '机器学习平台');
    }
    
    return suggestions.slice(0, 3);
  }

  /**
   * 检测项目类型
   */
  static detectProjectType(description: string): string {
    const keywords = description.toLowerCase();
    
    if (keywords.includes('mobile') || keywords.includes('app') || keywords.includes('ios') || keywords.includes('android')) {
      return 'mobile-app';
    }
    
    if (keywords.includes('web') || keywords.includes('网站') || keywords.includes('前端') || keywords.includes('react')) {
      return 'web-app';
    }
    
    if (keywords.includes('api') || keywords.includes('后端') || keywords.includes('server')) {
      return 'web-app';
    }
    
    if (keywords.includes('data') || keywords.includes('分析') || keywords.includes('机器学习') || keywords.includes('ai')) {
      return 'data-analysis';
    }
    
    return 'web-app';
  }

  /**
   * 计算项目复杂度
   */
  static calculateComplexity(description: string): 'simple' | 'medium' | 'complex' {
    const keywords = description.toLowerCase();
    
    let complexityScore = 0;
    
    // 复杂特征
    if (keywords.includes('多用户') || keywords.includes('权限')) complexityScore += 2;
    if (keywords.includes('实时') || keywords.includes('websocket')) complexityScore += 2;
    if (keywords.includes('支付') || keywords.includes('电商')) complexityScore += 2;
    if (keywords.includes('ai') || keywords.includes('机器学习')) complexityScore += 3;
    if (keywords.includes('微服务') || keywords.includes('分布式')) complexityScore += 3;
    
    // 简单特征
    if (keywords.includes('简单') || keywords.includes('基础')) complexityScore -= 1;
    if (keywords.includes('demo') || keywords.includes('示例')) complexityScore -= 1;
    
    if (complexityScore >= 4) return 'complex';
    if (complexityScore <= 0) return 'simple';
    return 'medium';
  }

  /**
   * 智能项目分解
   */
  static async smartDecompose(projectName: string, description: string): Promise<{
    mainProject: CreateProjectRequest;
    subProjects: CreateProjectRequest[];
  }> {
    const type = this.detectProjectType(description);
    const complexity = this.calculateComplexity(description);
    
    const subProjects = await this.decomposeProject({
      projectName,
      description,
      type,
      complexity,
    });
    
    return {
      mainProject: {
        name: projectName,
        description,
        priority: 'high',
        estimatedHours: subProjects.reduce((sum, sp) => sum + (sp.estimatedHours || 0), 0),
      },
      subProjects,
    };
  }
}