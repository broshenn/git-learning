# Git 企业实战课网页版

这是 `docs/beginner` 五课教程的交互式网页版本，内容仍以 Markdown 文档为唯一来源。

## 本地启动

需要 Node.js 22.13 或更高版本。在本目录执行：

```powershell
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。

## 修改课程内容

先修改仓库根目录的 `docs/beginner/*.md`，再运行：

```powershell
npm run sync-content
```

该命令会重新生成 `content/courses.generated.ts`。不要直接编辑生成文件。

## 检查网站

```powershell
npm run lint
npm test
```

`npm test` 会完成生产构建，并检查五门课程、命令词典和报错急救文档是否都被正确渲染。

## 主要功能

- 五课主线与前后篇导航
- 全文搜索
- 本地保存学习进度
- 代码块一键复制
- Mermaid 流程图
- 深色模式
- 桌面端、平板和手机端响应式布局
