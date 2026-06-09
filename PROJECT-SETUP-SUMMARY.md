# ShotAI Chrome Extension - 项目搭建总结

**创建日期**: 2025-10-29  
**状态**: ✅ 完成初始化

---

## 📦 项目结构

```
/mnt/j/workspace/
├── ShotAI/                          # 主站（Next.js）
│   ├── app/
│   ├── components/
│   ├── config/
│   └── docs/
│       └── 20251029-01-chrome-extension-design.md  # 设计文档
│
├── shotai-shared/                   # 共享包 (@shotai/shared)
│   ├── src/
│   │   ├── types/
│   │   │   └── models.ts           # 类型定义
│   │   ├── constants/
│   │   │   ├── models.ts           # 模型配置
│   │   │   └── config.ts           # API 配置
│   │   └── index.ts                # 导出入口
│   ├── dist/                        # 编译输出
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
└── shotai-chrome-extension/         # Chrome 插件
    ├── src/
    │   ├── background/              # Service Worker
    │   │   └── index.ts
    │   ├── content/                 # Content Script
    │   │   └── index.tsx
    │   ├── popup/                   # 弹出窗口
    │   │   ├── index.html
    │   │   └── index.tsx
    │   ├── sidebar/                 # 侧边栏
    │   │   ├── index.html
    │   │   └── index.tsx
    │   ├── shared/                  # 共享代码
    │   │   ├── api/
    │   │   │   └── client.ts       # API 客户端
    │   │   ├── components/
    │   │   ├── hooks/
    │   │   ├── stores/
    │   │   ├── utils/
    │   │   ├── constants/
    │   │   └── types/
    │   └── styles/
    │       └── global.css
    ├── public/
    │   └── icons/                   # 扩展图标
    ├── manifest.json                # Chrome Extension 配置
    ├── package.json
    ├── vite.config.ts               # Vite + CRXJS 配置
    ├── tailwind.config.js
    ├── README.md
    ├── DEVELOPMENT.md               # 开发指南
    └── QUICKSTART.md                # 快速开始
```

---

## ✅ 已完成的工作

### 1. 共享包 `@shotai/shared`

**功能**:
- ✅ 提取主站的模型配置（12 个 AI 模型）
- ✅ 定义 TypeScript 类型（`ImageModel`, `GenerationRequest`, `GenerationResponse` 等）
- ✅ 导出 API 配置常量
- ✅ 提供工具函数（`filterModelsByCapability`, `getModelById` 等）

**文件**:
```
shotai-shared/
├── src/
│   ├── types/models.ts              # 类型定义
│   ├── constants/models.ts          # 12 个模型配置
│   ├── constants/config.ts          # API 端点、限制等
│   └── index.ts                     # 统一导出
├── package.json                      # @shotai/shared
└── tsconfig.json
```

**使用方式**:
```typescript
import { 
  IMAGE_MODELS, 
  filterModelsByCapability,
  API_CONFIG 
} from '@shotai/shared';
```

### 2. Chrome 插件项目脚手架

**技术栈**:
- ✅ Vite 5 + CRXJS (Chrome Extension 专用插件)
- ✅ React 18 + TypeScript
- ✅ Tailwind CSS
- ✅ Zustand (状态管理)
- ✅ TanStack Query (数据获取)
- ✅ Lucide React (图标)

**核心功能框架**:
- ✅ **Background Script**: 右键菜单、快捷键监听
- ✅ **Content Script**: 页面注入（占位）
- ✅ **Popup**: 扩展图标弹出窗口（基础 UI）
- ✅ **Sidebar**: 生成界面（基础 UI）
- ✅ **API Client**: 与主站通信的封装

**Manifest V3 配置**:
```json
{
  "manifest_version": 3,
  "permissions": ["contextMenus", "storage", "activeTab", "scripting", "notifications"],
  "host_permissions": ["https://shotai.app/*", "https://*/*"],
  "background": { "service_worker": "src/background/index.ts" },
  "content_scripts": [{ "matches": ["<all_urls>"], "js": ["src/content/index.tsx"] }],
  "commands": {
    "open-sidebar": {
      "suggested_key": { "default": "Ctrl+Shift+G", "mac": "Command+Shift+G" }
    }
  }
}
```

### 3. 开发环境配置

**已配置**:
- ✅ TypeScript 严格模式
- ✅ Tailwind CSS + PostCSS + Autoprefixer
- ✅ Path alias (`@/` 指向 `src/`, `@shotai/shared` 指向共享包)
- ✅ Chrome Types (`@types/chrome`)
- ✅ Vite HMR (热模块替换)

**Scripts**:
```bash
npm run dev          # 开发模式（HMR）
npm run build        # 生产构建
npm run type-check   # TypeScript 类型检查
```

### 4. 文档

**已创建**:
- ✅ `README.md` - 项目概述、功能列表
- ✅ `DEVELOPMENT.md` - 完整开发指南（调试、API、Chrome API 使用）
- ✅ `QUICKSTART.md` - 5 分钟快速开始
- ✅ `shotai-shared/README.md` - 共享包使用说明
- ✅ `ShotAI/docs/20251029-01-chrome-extension-design.md` - 10,000+ 字设计文档

---

## 🚀 快速开始

### 首次运行

```bash
# 1. 安装插件依赖
cd /mnt/j/workspace/shotai-chrome-extension
npm install

# 2. 构建共享包
cd ../shotai-shared
npm install
npm run build

# 3. 回到插件目录
cd ../shotai-chrome-extension

# 4. 启动开发
npm run dev

# 5. 加载到 Chrome
# - 打开 chrome://extensions/
# - 启用"开发者模式"
# - 点击"加载已解压的扩展程序"
# - 选择 shotai-chrome-extension/dist 目录
```

### 验证安装

```bash
# 类型检查通过 ✅
cd /mnt/j/workspace/shotai-chrome-extension
npm run type-check
# (应该无错误输出)
```

---

## 📋 下一步开发任务

### 高优先级 (MVP)

1. **用户认证**
   - [ ] 实现 OAuth 授权流程
   - [ ] Token 存储与刷新
   - [ ] 登录状态管理

2. **侧边栏注入**
   - [ ] Content Script 注入 React 组件
   - [ ] Shadow DOM 隔离样式
   - [ ] 侧边栏开关动画

3. **生成界面**
   - [ ] Prompt 输入
   - [ ] 模型多选（基于上传图片数量禁用）
   - [ ] 图片上传（压缩、预览）
   - [ ] 生成按钮与加载状态

4. **API 对接**
   - [ ] 主站新增 `/api/extension/auth` 端点
   - [ ] 主站新增 `/api/extension/generate` 端点
   - [ ] 主站新增 `/api/extension/history` 端点
   - [ ] 主站新增 `/api/extension/credits` 端点

5. **生成结果展示**
   - [ ] 缩略图展示
   - [ ] 外链复制（多种格式）
   - [ ] 下载功能

### 中优先级

6. **历史记录**
   - [ ] 本地缓存（最近 50 条）
   - [ ] 与服务器同步
   - [ ] 搜索与筛选

7. **智能功能**
   - [ ] 提取选中文字作为 Prompt
   - [ ] 提取页面图片作为参考图
   - [ ] 页面类型检测与 Prompt 推荐

8. **UI 完善**
   - [ ] 浮动按钮
   - [ ] Credits 余额显示
   - [ ] 设置面板

### 低优先级（未来扩展）

9. **高级功能**
   - [ ] Batch 生成队列
   - [ ] Prompt 模板库
   - [ ] 协作分享功能

10. **优化**
    - [ ] 性能优化
    - [ ] 错误处理完善
    - [ ] 国际化（i18n）

---

## 🔗 代码共享机制

### 共享包更新流程

当主站的模型配置发生变化时：

```bash
# 1. 更新主站配置
# 编辑 ShotAI/config/image-models.ts

# 2. 同步到共享包
# 复制到 shotai-shared/src/constants/models.ts

# 3. 重新构建共享包
cd /mnt/j/workspace/shotai-shared
npm run build

# 4. 插件自动获取更新
# (开发模式下 Vite 会自动重新加载)
```

### Path Alias 配置

插件项目已配置 Path Alias：

```typescript
// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@shotai/shared": ["../shotai-shared/src"]
    }
  }
}

// 使用方式
import { IMAGE_MODELS } from '@shotai/shared';
import { apiClient } from '@/shared/api/client';
```

---

## 🛠️ 技术亮点

### 1. CRXJS Vite Plugin

- ✅ **HMR 支持**: 代码修改后自动重新编译
- ✅ **Manifest V3**: 自动处理 Service Worker、Content Scripts
- ✅ **TypeScript**: 原生支持，无需额外配置
- ✅ **多入口**: Popup、Sidebar 独立打包

### 2. Zustand 状态管理

```typescript
// 示例：Auth Store
import { create } from 'zustand';

interface AuthState {
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  login: (token) => set({ token }),
  logout: () => set({ token: null })
}));
```

### 3. TanStack Query 数据获取

```typescript
// 示例：获取 Credits
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/shared/api/client';

function useCredits() {
  return useQuery({
    queryKey: ['credits'],
    queryFn: () => apiClient.get('/extension/credits')
  });
}
```

### 4. Shadow DOM 样式隔离

```typescript
// content/index.tsx (未来实现)
const container = document.createElement('div');
const shadowRoot = container.attachShadow({ mode: 'open' });

// 注入样式（不会被页面 CSS 影响）
const style = document.createElement('style');
style.textContent = tailwindCSS;
shadowRoot.appendChild(style);

// 渲染 React
const root = createRoot(shadowRoot);
root.render(<Sidebar />);
```

---

## 📚 参考资源

### 设计文档
- [完整设计方案](/mnt/j/workspace/ShotAI/docs/20251029-01-chrome-extension-design.md) (10,000+ 字)
  - 核心功能设计
  - 技术实现方案
  - API 对接方案
  - 用户体验设计
  - 商业化策略
  - 技术难点解决方案

### 开发文档
- [shotai-chrome-extension/README.md](shotai-chrome-extension/README.md) - 项目概述
- [shotai-chrome-extension/DEVELOPMENT.md](shotai-chrome-extension/DEVELOPMENT.md) - 开发指南
- [shotai-chrome-extension/QUICKSTART.md](shotai-chrome-extension/QUICKSTART.md) - 快速开始
- [shotai-shared/README.md](shotai-shared/README.md) - 共享包文档

### 外部资源
- [Chrome Extension Manifest V3](https://developer.chrome.com/docs/extensions/mv3/)
- [CRXJS Vite Plugin](https://crxjs.dev/vite-plugin/)
- [Zustand](https://docs.pmnd.rs/zustand/)
- [TanStack Query](https://tanstack.com/query/)

---

## 🎯 项目目标

### 短期目标 (2-3 周)

- [ ] MVP 版本完成
  - 基础生成功能
  - 右键菜单 + 快捷键
  - 外链分享
  - 历史记录

### 中期目标 (4-6 周)

- [ ] 完整版本
  - 智能 Prompt 推荐
  - 批量生成队列
  - 模板库
  - 设置面板

### 长期目标 (3-6 个月)

- [ ] 上架 Chrome Web Store
- [ ] 协作功能
- [ ] 企业版（团队管理）
- [ ] 浏览器扩展（Firefox、Edge）

---

## 📊 项目统计

### 代码量
- **共享包**: ~500 行 TypeScript
- **插件项目**: ~300 行（初始框架）
- **配置文件**: ~200 行
- **文档**: ~15,000 字

### 文件数量
- **TypeScript/TSX**: 10 个
- **配置文件**: 7 个
- **文档**: 5 个

### 依赖包
- **共享包**: 1 个 (TypeScript)
- **插件项目**: 268 个

---

## 🔧 维护建议

### 定期同步

每次主站更新模型配置时：

```bash
# 1. 更新 shotai-shared
cd /mnt/j/workspace/shotai-shared
# 手动同步 config/image-models.ts 的改动
npm run build

# 2. 验证插件
cd /mnt/j/workspace/shotai-chrome-extension
npm run type-check
npm run build
```

### Git 仓库管理

建议创建独立 Git 仓库：

```bash
# 共享包
cd /mnt/j/workspace/shotai-shared
git init
git add .
git commit -m "Initial commit: @shotai/shared package"

# Chrome 插件
cd /mnt/j/workspace/shotai-chrome-extension
git init
git add .
git commit -m "Initial commit: Chrome extension scaffold"
```

---

## ✅ 验证清单

在开始开发前，确认以下事项：

- [x] shotai-shared 包构建成功
- [x] shotai-chrome-extension 依赖安装完成
- [x] TypeScript 类型检查通过
- [x] 项目结构清晰合理
- [x] 文档完整齐全
- [ ] Chrome 扩展成功加载（需要运行 `npm run dev` 后测试）
- [ ] 主站 API 端点准备就绪（待实现）

---

## 🎉 总结

已成功搭建 ShotAI Chrome Extension 项目的完整基础设施：

1. ✅ **独立仓库结构** - 与主站分离，易于维护
2. ✅ **NPM 私有包** - 类型定义和常量共享
3. ✅ **现代技术栈** - Vite + React + TypeScript + CRXJS
4. ✅ **完整文档** - 设计、开发、快速开始
5. ✅ **清晰架构** - Background、Content、Popup、Sidebar 分离

**下一步**: 按照 QUICKSTART.md 开始开发核心功能！

---

**项目创建者**: Droid AI Agent  
**创建日期**: 2025-10-29  
**版本**: 1.0.0 (初始化)
