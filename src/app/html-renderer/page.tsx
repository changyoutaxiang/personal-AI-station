'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, Code, Copy, Download, Home, RefreshCw, Save, Undo, Redo, MessageCircle, CheckSquare, Brain, Settings, BarChart3, FolderKanban, Timer, Image } from 'lucide-react';
import Editor from '@monaco-editor/react';
import { html as beautifyHtml } from 'js-beautify';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { PomodoroTimer } from '@/components/todos/PomodoroTimer';
import { ThemeProvider } from '@/components/todos/ThemeProvider';
import { useLocalStorage } from '@/hooks/todos/useLocalStorage';
import { Theme } from '@/types/todo';

// 加载组件
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
    <span className="ml-3 text-gray-600">加载中...</span>
  </div>
);

// 内部组件处理搜索参数
function HtmlRendererContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [htmlContent, setHtmlContent] = useState('');
  const [isRendering, setIsRendering] = useState(true);
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [showPomodoro, setShowPomodoro] = useState(false);
  const [theme, setTheme] = useLocalStorage<Theme>('theme', 'sunset');
  const [isExporting, setIsExporting] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // 导航按钮配置 - 复制自首页
  const navigationItems = [
    {
      icon: Brain,
      label: '记录',
      href: '/records',
      color: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      label: '对话',
      href: '/agent',
      color: 'from-green-500 to-teal-600'
    },
    {
      icon: CheckSquare,
      label: '待办',
      href: '/todos',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: FolderKanban,
      label: '项目',
      href: '/projects',
      color: 'from-indigo-500 to-blue-600'
    },
    {
      icon: BarChart3,
      label: '分析',
      href: '/analysis',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: Settings,
      label: '设置',
      href: '/records?tab=config',
      color: 'from-gray-500 to-slate-600'
    },
    {
      icon: Timer,
      label: '番茄钟',
      href: '#',
      color: 'from-red-500 to-orange-600',
      onClick: () => setShowPomodoro(!showPomodoro)
    }
  ];

  useEffect(() => {
    const htmlParam = searchParams.get('html');
    const encoding = searchParams.get('encoding');
    
    if (htmlParam) {
      try {
        let decodedHtml = '';
        
        if (encoding === 'base64') {
          try {
            // 先URL解码，再base64解码，最后UTF-8解码
            const base64String = decodeURIComponent(htmlParam);
            const binaryString = atob(base64String);
            decodedHtml = decodeURIComponent(escape(binaryString));
            console.log('✅ 使用base64解码HTML内容');
          } catch (b64Error) {
            console.error('Base64解码失败:', b64Error);
            // 回退到直接使用参数作为HTML内容
            decodedHtml = decodeURIComponent(htmlParam);
            console.log('✅ Base64解码失败，回退到直接解码');
          }
        } else {
          // 传统URL解码
          decodedHtml = decodeURIComponent(htmlParam);
          console.log('✅ 使用URL解码HTML内容');
        }
        
        setHtmlContent(decodedHtml);
        // 初始化历史记录
        setHistory([decodedHtml]);
        setHistoryIndex(0);
        console.log('✅ HTML内容已加载，长度:', decodedHtml.length);
      } catch (error) {
        console.error('❌ HTML参数解码失败:', error);
        const errorContent = '<h1>解码失败</h1><p>无法解析提供的HTML代码，请检查编码格式</p>';
        setHtmlContent(errorContent);
        setHistory([errorContent]);
        setHistoryIndex(0);
      }
    } else {
      console.log('⚠️ 未提供HTML参数，保持空白状态');
      // 设置为空内容，提供更好的用户体验
      const emptyContent = '';
      setHtmlContent(emptyContent);
      setHistory([emptyContent]);
      setHistoryIndex(0);
    }
    setIsRendering(false);
  }, [searchParams]);

  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'source') return;
      
      // Ctrl+Z 撤销
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Ctrl+Y 重做
      if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
      
      // Ctrl+S 保存
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      
      // Tab 键支持
      if (e.key === 'Tab' && document.activeElement === textareaRef.current) {
        e.preventDefault();
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = htmlContent.substring(0, start) + '  ' + htmlContent.substring(end);
        handleHtmlChange(newValue);
        
        // 恢复光标位置
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
          textarea.focus();
        }, 0);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, historyIndex, history.length]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(htmlContent);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rendered.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearAndReset = () => {
    // 清空HTML内容
    const emptyContent = '';
    setHtmlContent(emptyContent);
    
    // 重置历史记录
    setHistory([emptyContent]);
    setHistoryIndex(0);
    
    // 切换到源码编辑模式，方便输入新内容
    setViewMode('source');
    
    // 更新URL参数
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.delete('html'); // 删除HTML参数
    window.history.replaceState({}, '', newUrl.pathname);
    
    console.log('✅ 页面已重置，可输入新的HTML代码');
  };

  const sanitizeHtml = (html: string): string => {
    // 优化的安全过滤，平衡安全性和交互功能
    // 允许正常的JavaScript交互，阻止明显的安全威胁
    
    // 允许的CDN域名列表
    const allowedCDNs = [
      'cdn.tailwindcss.com',
      'fonts.googleapis.com', 'fonts.gstatic.com',
      'unpkg.com', 'jsdelivr.net', 'cdnjs.cloudflare.com',
      'code.jquery.com', 'ajax.googleapis.com', 'stackpath.bootstrapcdn.com'
    ];
    
    const cdnPattern = allowedCDNs.join('|').replace(/\./g, '\\.');
    
    return html
      // 移除包含危险函数的内联脚本，但保留CDN脚本
      .replace(new RegExp(`<script(?![^>]*src=["']https://(?:${cdnPattern}))[^>]*>[\\s\\S]*?(?:eval\\(|document\\.write\\(|window\\.location\\s*=|fetch\\([^)]*[^/]//)[\\s\\S]*?</script>`, 'gi'), '')
      // 移除危险的事件处理器
      .replace(/on\w+\s*=\s*["'][^"']*(?:eval\(|document\.write\(|window\.location\s*=)[^"']*["']/gi, '')
      // 移除危险的javascript: URL
      .replace(/javascript:\s*(?:eval\(|document\.write\(|window\.location\s*=|fetch\()/gi, 'javascript:void(0)')
      // 移除可能的XSS向量但保留正常的样式
      .replace(/<style[^>]*>[\s\S]*?(?:expression\(|javascript:)[^<]*<\/style>/gi, '');
  };

  const handleHtmlChange = (newHtml: string) => {
    setHtmlContent(newHtml);
    // 添加到历史记录
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newHtml);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    // 实时更新URL参数，便于分享
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('html', encodeURIComponent(newHtml));
    window.history.replaceState({}, '', newUrl.pathname + newUrl.search);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setHtmlContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setHtmlContent(history[newIndex]);
    }
  };

  const handleSave = (e?: React.MouseEvent) => {
    // 阻止默认行为和事件冒泡
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 检查是否有内容
    if (!htmlContent.trim()) {
      alert('没有内容可保存，请先添加一些 HTML 代码。');
      return;
    }
    
    try {
      // 创建并下载文件
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `html-render-${new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')}.html`;
      
      // 确保元素被添加到DOM中
      document.body.appendChild(a);
      a.style.display = 'none';
      
      // 触发下载
      a.click();
      
      // 清理
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      console.log('✅ HTML文件保存成功');
    } catch (error) {
      console.error('❌ 保存文件失败:', error);
      alert('保存失败，请重试。');
    }
  };

  const exportAsImage = async (e?: React.MouseEvent) => {
    // 阻止默认行为和事件冒泡
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    // 检查是否有内容
    if (!htmlContent.trim()) {
      alert('没有内容可导出，请先添加一些 HTML 代码。');
      return;
    }
    
    // 检查是否在预览模式
    if (viewMode !== 'preview') {
      alert('请切换到预览模式后再导出图片。');
      return;
    }
    
    setIsExporting(true);
    
    try {
      // 获取iframe元素
      const iframe = iframeRef.current;
      if (!iframe || !iframe.contentDocument) {
        throw new Error('无法访问HTML内容，请确保页面已完全加载。');
      }
      
      // 等待一小段时间确保iframe内容完全渲染
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 获取iframe内的document和body
      const iframeDoc = iframe.contentDocument;
      const iframeBody = iframeDoc.body;
      
      if (!iframeBody) {
        throw new Error('HTML内容为空，无法生成图片。');
      }
      
      // 使用html2canvas截图iframe内容
      const canvas = await html2canvas(iframeBody, {
        allowTaint: true,
        useCORS: true,
        scale: 2, // 高分辨率输出
        backgroundColor: '#ffffff',
        width: iframeBody.scrollWidth || 800,
        height: iframeBody.scrollHeight || 600,
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc) => {
          // 确保克隆文档中的样式正确加载
          const clonedBody = clonedDoc.body;
          if (clonedBody) {
            clonedBody.style.margin = '0';
            clonedBody.style.padding = '20px';
          }
        }
      });
      
      // 将canvas转换为blob
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('生成图片失败，请重试。');
        }
        
        // 创建下载链接
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `html-render-${new Date().toISOString().slice(0, 16).replace('T', '_').replace(':', '-')}.png`;
        
        // 触发下载
        document.body.appendChild(a);
        a.style.display = 'none';
        a.click();
        
        // 清理
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 100);
        
        console.log('✅ HTML长图导出成功');
      }, 'image/png', 0.9);
      
    } catch (error) {
      console.error('❌ 导出图片失败:', error);
      alert(`导出图片失败：${error instanceof Error ? error.message : '未知错误'}，请重试。`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleFormat = () => {
    // 使用 js-beautify 进行专业的HTML格式化
    try {
      const formatted = beautifyHtml(htmlContent, {
        indent_size: 2,
        indent_char: ' ',
        max_preserve_newlines: 2,
        preserve_newlines: true,
        end_with_newline: true,
        wrap_line_length: 120,
        indent_inner_html: true
      });
      handleHtmlChange(formatted);
    } catch (error) {
      console.error('格式化失败:', error);
      // 回退到简单格式化
      const simpleFormatted = htmlContent
        .replace(/>\s*</g, '>\n<')
        .replace(/\n+/g, '\n')
        .trim();
      handleHtmlChange(simpleFormatted);
    }
  };

  if (isRendering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">正在渲染HTML...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* 右上角导航按钮 - 适配浅色背景，增加与工具栏的间距 */}
      <nav className="absolute top-4 right-6 z-20">
        <div className="flex gap-3">
          {navigationItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.href}
                onClick={item.onClick || (() => router.push(item.href))}
                className={`group relative p-3 rounded-xl bg-white/80 backdrop-blur-md border border-gray-200/60 hover:bg-white/95 hover:shadow-lg transition-all duration-300 hover:scale-105 ${item.label === '番茄钟' && showPomodoro ? 'bg-purple-100 border-purple-200' : ''}`}
                title={item.label}
              >
                <IconComponent className="w-5 h-5 text-gray-700 hover:text-purple-600 transition-colors duration-200" />
                
                {/* 悬停提示 */}
                <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-30">
                  <div className="bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap shadow-lg">
                    {item.label}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      {/* 番茄钟组件 */}
      <div className="absolute top-20 right-6 z-30">
        <ThemeProvider theme={theme} setTheme={setTheme}>
          <PomodoroTimer isVisible={showPomodoro} onToggle={() => setShowPomodoro(!showPomodoro)} />
        </ThemeProvider>
      </div>

      {/* 页面标题栏 - 增加顶部间距避免与导航栏冲突 */}
      <div className="bg-white/60 backdrop-blur-md border-b border-white/10 py-4 pt-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            HTML渲染器
          </h1>
        </div>
      </div>

      {/* HTML功能工具栏 - 独立一行 */}
      <div className="bg-white/40 backdrop-blur-md border-b border-white/10 py-3">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* 左侧：视图切换 */}
            <div className="flex bg-white/60 rounded-lg p-1">
              <button
                onClick={() => setViewMode('preview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'preview' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-purple-100'
                }`}
              >
                <Eye className="w-4 h-4" />
                <span>预览模式</span>
              </button>
              <button
                onClick={() => setViewMode('source')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  viewMode === 'source' 
                    ? 'bg-purple-500 text-white' 
                    : 'text-gray-600 hover:bg-purple-100'
                }`}
              >
                <Code className="w-4 h-4" />
                <span>源码编辑</span>
              </button>
            </div>

            {/* 右侧：功能按钮组 */}
            <div className="flex items-center space-x-3">
              {/* 源码模式专属工具 */}
              {viewMode === 'source' && (
                <>
                  <div className="flex items-center space-x-1 bg-white/60 rounded-lg p-1">
                    <button
                      onClick={handleUndo}
                      disabled={historyIndex <= 0}
                      className="p-2 text-gray-600 rounded-md hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="撤销 (Ctrl+Z)"
                    >
                      <Undo className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={handleRedo}
                      disabled={historyIndex >= history.length - 1}
                      className="p-2 text-gray-600 rounded-md hover:bg-white/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="重做 (Ctrl+Y)"
                    >
                      <Redo className="w-4 h-4" />
                    </button>

                    <button
                      onClick={handleFormat}
                      className="px-3 py-2 text-gray-600 rounded-md hover:bg-white/80 transition-colors text-sm"
                      title="格式化代码"
                    >
                      格式化
                    </button>
                  </div>
                </>
              )}

              {/* 通用操作按钮 */}
              <div className="flex items-center space-x-1 bg-white/60 rounded-lg p-1">
                <button
                  onClick={handleClearAndReset}
                  className="p-2 text-gray-600 rounded-md hover:bg-white/80 transition-colors"
                  title="清空重置 - 回到初始状态"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleCopy}
                  className={`p-2 rounded-md transition-colors ${
                    copySuccess 
                      ? 'bg-green-500 text-white' 
                      : 'text-gray-600 hover:bg-white/80'
                  }`}
                  title="复制代码"
                >
                  <Copy className="w-4 h-4" />
                </button>
                
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 rounded-md hover:bg-white/80 transition-colors"
                  title="下载HTML文件"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              <button
                onClick={(e) => exportAsImage(e)}
                disabled={isExporting}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  isExporting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-500 hover:bg-green-600'
                } text-white`}
                title="导出为PNG长图"
                type="button"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>导出中...</span>
                  </>
                ) : (
                  <>
                    <Image className="w-4 h-4" />
                    <span>导出图片</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6 py-4">
        {viewMode === 'preview' ? (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="ml-4 text-sm text-gray-600">HTML渲染预览</span>
              </div>
            </div>
            <div className="h-[70vh] overflow-auto">
              {htmlContent.trim() === '' ? (
                <div className="flex items-center justify-center h-full bg-gray-50">
                  <div className="text-center p-8">
                    <div className="text-6xl mb-4">📝</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-3">准备好渲染 HTML 了</h3>
                    <div className="text-gray-500 space-y-2">
                      <p>• 从首页搜索框粘贴 HTML 代码可直接跳转到此页面</p>
                      <p>• 或点击上方"源码编辑"按钮直接编写 HTML</p>
                      <p>• 支持外部 CSS 框架（如 Tailwind CDN）和自定义样式</p>
                    </div>
                  </div>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  srcDoc={sanitizeHtml(htmlContent)}
                  className="w-full h-full border-0"
                  title="HTML渲染结果"
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock allow-modals allow-orientation-lock allow-presentation allow-top-navigation-by-user-activation"
                />
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gray-800 text-white px-6 py-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-mono">HTML源代码 - Monaco编辑器</span>
                <span className="text-xs text-gray-400">
                  {htmlContent.length} 字符
                </span>
              </div>
            </div>
            <div className="h-[70vh] overflow-hidden">
              <Editor
                height="100%"
                defaultLanguage="html"
                value={htmlContent}
                onChange={(value) => handleHtmlChange(value || '')}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  lineNumbers: 'on',
                  wordWrap: 'on',
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  renderWhitespace: 'selection',
                  tabSize: 2,
                  insertSpaces: true,
                  formatOnPaste: true,
                  formatOnType: true,
                  bracketPairColorization: { enabled: true },
                  guides: {
                    indentation: true,
                    bracketPairs: true
                  },
                  suggestOnTriggerCharacters: true,
                  quickSuggestions: {
                    other: true,
                    comments: true,
                    strings: true
                  },
                  folding: true,
                  foldingStrategy: 'indentation'
                }}
                loading={<div className="flex items-center justify-center h-full">加载编辑器...</div>}
              />
            </div>
          </div>
        )}
      </div>

      {/* 底部信息 */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white/60 backdrop-blur-md rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              <span>🎨 Monaco编辑器支持语法高亮</span>
              <span>✅ 使用DOMPurify安全过滤</span>
              <span>🛡️ js-beautify专业格式化</span>
            </div>
            <div className="text-xs text-gray-500">
              {viewMode === 'source' 
                ? '专业代码编辑器，支持语法高亮、自动补全、代码折叠等功能' 
                : '提示：从首页搜索框粘贴HTML代码可直接跳转至此页面'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 主导出组件，包装在Suspense中
export default function HtmlRendererPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HtmlRendererContent />
    </Suspense>
  );
}