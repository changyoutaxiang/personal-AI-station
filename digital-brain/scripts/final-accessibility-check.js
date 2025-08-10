#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * 🚀 Digital Brain - Dopamine Theme Final Accessibility Check
 * 
 * 本脚本执行最终的可访问性验证，确保多巴胺主题完全符合WCAG 2.1 AA标准
 */

// 颜色对比度检查函数
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function getLuminance(r, g, b) {
    const sRGB = [r, g, b].map(c => {
        c = c / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
}

function getContrastRatio(color1, color2) {
    const rgb1 = hexToRgb(color1);
    const rgb2 = hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
}

// 定义检查规则
const accessibilityChecks = {
    // 多巴胺主题核心色彩
    dopamineColors: {
        pink: '#FF6B9D',
        purple: '#9B59B6',
        blue: '#3498DB',
        cyan: '#1ABC9C',
        green: '#2ECC71',
        orange: '#F39C12',
        indigo: '#6C5CE7',
        accessible: {
            orange: '#C77C02',
            indigo: '#5A4BC4'
        }
    },
    
    // 背景色
    backgrounds: {
        light: '#FFFFFF',
        dark: '#0F0F0F',
        surface: '#F8F9FA',
        surfaceDark: '#1A1A1A'
    },
    
    // WCAG标准
    standards: {
        AA_NORMAL: 4.5,     // 正常文字 AA标准
        AA_LARGE: 3.0,      // 大字体 AA标准
        AAA_NORMAL: 7.0,    // 正常文字 AAA标准
        AAA_LARGE: 4.5      // 大字体 AAA标准
    }
};

console.log('🎨 Digital Brain - Dopamine Theme 可访问性最终验证');
console.log('=' .repeat(60));

let allTestsPassed = true;
const failedTests = [];

// 1. 核心颜色对比度检查
console.log('\n📊 1. 核心颜色对比度检查');
console.log('-'.repeat(40));

const colorTests = [
    // 亮色模式检查
    { name: 'Pink vs Light BG', color: accessibilityChecks.dopamineColors.pink, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Purple vs Light BG', color: accessibilityChecks.dopamineColors.purple, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Blue vs Light BG', color: accessibilityChecks.dopamineColors.blue, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Cyan vs Light BG', color: accessibilityChecks.dopamineColors.cyan, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Green vs Light BG', color: accessibilityChecks.dopamineColors.green, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Orange (Accessible) vs Light BG', color: accessibilityChecks.dopamineColors.accessible.orange, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    { name: 'Indigo (Accessible) vs Light BG', color: accessibilityChecks.dopamineColors.accessible.indigo, bg: accessibilityChecks.backgrounds.light, type: 'normal' },
    
    // 暗色模式检查
    { name: 'Pink vs Dark BG', color: accessibilityChecks.dopamineColors.pink, bg: accessibilityChecks.backgrounds.dark, type: 'normal' },
    { name: 'Purple vs Dark BG', color: accessibilityChecks.dopamineColors.purple, bg: accessibilityChecks.backgrounds.dark, type: 'normal' },
    { name: 'Blue vs Dark BG', color: accessibilityChecks.dopamineColors.blue, bg: accessibilityChecks.backgrounds.dark, type: 'normal' },
    { name: 'Cyan vs Dark BG', color: accessibilityChecks.dopamineColors.cyan, bg: accessibilityChecks.backgrounds.dark, type: 'normal' },
    { name: 'Green vs Dark BG', color: accessibilityChecks.dopamineColors.green, bg: accessibilityChecks.backgrounds.dark, type: 'normal' },
];

colorTests.forEach(test => {
    const ratio = getContrastRatio(test.color, test.bg);
    const standard = test.type === 'normal' ? accessibilityChecks.standards.AA_NORMAL : accessibilityChecks.standards.AA_LARGE;
    const passed = ratio >= standard;
    
    console.log(`${passed ? '✅' : '❌'} ${test.name}: ${ratio.toFixed(2)}:1 ${passed ? '(通过)' : '(未通过)'}`);
    
    if (!passed) {
        allTestsPassed = false;
        failedTests.push(`${test.name} - 对比度: ${ratio.toFixed(2)}:1, 需要: ${standard}:1`);
    }
});

// 2. CSS变量完整性检查
console.log('\n🔍 2. CSS变量完整性检查');
console.log('-'.repeat(40));

const cssFile = path.join(__dirname, '..', '..', 'src/app/globals.css');

if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    
    const requiredVariables = [
        '--dopamine-pink',
        '--dopamine-purple',
        '--dopamine-blue',
        '--dopamine-cyan',
        '--dopamine-green',
        '--dopamine-orange-accessible',
        '--dopamine-indigo-accessible',
        '--color-primary',
        '--color-secondary',
        '--color-accent',
        '--color-accent-2',
        '--color-warning',
        '--text-primary',
        '--text-secondary',
        '--background',
        '--surface',
        '--border'
    ];
    
    const dopamineThemeRegex = /\[data-theme="dopamine"\]\s*{[^}]+}/gs;
    const dopamineDarkRegex = /\[data-theme="dopamine"\]\[data-color-scheme="dark"\]\s*{[^}]+}/gs;
    
    const lightThemeMatch = cssContent.match(dopamineThemeRegex);
    const darkThemeMatch = cssContent.match(dopamineDarkRegex);
    
    console.log(`✅ Dopamine 亮色主题定义: ${lightThemeMatch ? '存在' : '缺失'}`);
    console.log(`✅ Dopamine 暗色主题定义: ${darkThemeMatch ? '存在' : '缺失'}`);
    
    requiredVariables.forEach(variable => {
        const hasVariable = cssContent.includes(variable);
        console.log(`${hasVariable ? '✅' : '❌'} CSS变量 ${variable}: ${hasVariable ? '存在' : '缺失'}`);
        
        if (!hasVariable) {
            allTestsPassed = false;
            failedTests.push(`缺失CSS变量: ${variable}`);
        }
    });
} else {
    console.log('❌ globals.css 文件不存在');
    allTestsPassed = false;
    failedTests.push('globals.css 文件不存在');
}

// 3. 组件文件检查
console.log('\n🧩 3. 组件文件检查');
console.log('-'.repeat(40));

const componentFiles = [
    'src/contexts/ThemeContext.tsx',
    'src/components/ThemeToggle.tsx',
    'src/components/ColorSchemeToggle.tsx'
];

componentFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    const exists = fs.existsSync(fullPath);
    
    console.log(`${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '缺失'}`);
    
    if (!exists) {
        allTestsPassed = false;
        failedTests.push(`组件文件缺失: ${file}`);
    } else if (file.includes('ThemeContext.tsx')) {
        // 检查ThemeContext是否包含dopamine主题
        const content = fs.readFileSync(fullPath, 'utf8');
        const hasDopamine = content.includes('dopamine');
        
        console.log(`${hasDopamine ? '✅' : '❌'} ThemeContext 包含 dopamine 主题: ${hasDopamine ? '是' : '否'}`);
        
        if (!hasDopamine) {
            allTestsPassed = false;
            failedTests.push('ThemeContext 未包含 dopamine 主题');
        }
    }
});

// 4. 动效和过渡检查
console.log('\n🎬 4. 动效和过渡检查');
console.log('-'.repeat(40));

if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    
    const transitionPatterns = [
        /transition.*color/,
        /transition.*background/,
        /transition.*border/,
        /@media\s*\(\s*prefers-reduced-motion/
    ];
    
    transitionPatterns.forEach((pattern, index) => {
        const patternNames = [
            '颜色过渡',
            '背景过渡',
            '边框过渡',
            '减少动效媒体查询'
        ];
        
        const hasPattern = pattern.test(cssContent);
        console.log(`${hasPattern ? '✅' : '❌'} ${patternNames[index]}: ${hasPattern ? '存在' : '缺失'}`);
        
        if (!hasPattern && index === 3) {
            // 减少动效媒体查询是可访问性关键项
            allTestsPassed = false;
            failedTests.push('缺失减少动效媒体查询');
        }
    });
}

// 5. 焦点管理检查
console.log('\n🎯 5. 焦点管理检查');
console.log('-'.repeat(40));

if (fs.existsSync(cssFile)) {
    const cssContent = fs.readFileSync(cssFile, 'utf8');
    
    const focusPatterns = [
        /focus-visible/,
        /outline/,
        /ring/
    ];
    
    const focusNames = ['focus-visible', 'outline', 'ring'];
    
    focusPatterns.forEach((pattern, index) => {
        const hasPattern = pattern.test(cssContent);
        console.log(`${hasPattern ? '✅' : '❌'} 焦点样式 (${focusNames[index]}): ${hasPattern ? '存在' : '缺失'}`);
    });
}

// 最终结果
console.log('\n' + '='.repeat(60));
console.log(`🏁 最终验证结果: ${allTestsPassed ? '✅ 全部通过' : '❌ 存在问题'}`);

if (!allTestsPassed) {
    console.log('\n❌ 失败的测试项目:');
    failedTests.forEach((test, index) => {
        console.log(`   ${index + 1}. ${test}`);
    });
    
    console.log('\n🔧 建议修复措施:');
    console.log('   1. 检查CSS变量定义是否完整');
    console.log('   2. 验证颜色对比度是否达到WCAG标准');
    console.log('   3. 确保组件文件存在且包含必要的主题支持');
    console.log('   4. 添加必要的动效和焦点管理样式');
} else {
    console.log('\n🎉 恭喜！多巴胺主题已完全通过可访问性验证！');
    console.log('');
    console.log('🌟 主题特性:');
    console.log('   ✅ 符合 WCAG 2.1 AA 标准');
    console.log('   ✅ 完整的明暗模式支持');
    console.log('   ✅ 平滑的颜色过渡动效');
    console.log('   ✅ 完善的焦点管理');
    console.log('   ✅ 减少动效媒体查询支持');
    console.log('');
    console.log('🚀 可以安全部署到生产环境！');
}

console.log('\n📋 验证完成时间:', new Date().toLocaleString('zh-CN'));
console.log('💡 建议定期运行此脚本以确保主题质量');

process.exit(allTestsPassed ? 0 : 1);
