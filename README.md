# TeamFlow Git 企业协作训练场

这是一个专门用来练习企业 Git 工作流的小型 Python 项目。你会维护一个可运行的“团队工单管理器”，并完整走过：

`Issue → 分支 → 编码 → 测试 → Commit → Push → Pull Request → Review → 合并 → Release`

## 你将学会

- 用 `feature/*`、`fix/*`、`hotfix/*` 分支隔离工作
- 写团队看得懂的 Conventional Commits
- 在提交前检查 diff、拆分提交、撤销错误操作
- 用 Pull Request 做代码评审，而不是直接改 `main`
- 处理合并冲突、rebase、cherry-pick 和紧急修复
- 用 Tag 和 GitHub Release 发布版本
- 理解 CI 为什么能挡住不合格的提交

## 环境要求

- Git 2.40+
- Python 3.11+
- 一个 GitHub 账号

项目只使用 Python 标准库，不需要安装第三方依赖。

## 从这里开始

如果你是第一次系统学习 Git，从零基础课程开始：

1. [第 1 课：环境、项目与 Git 原理](docs/beginner/01-FOUNDATIONS.md)
2. [第 2 课：第一次提交与分支开发](docs/beginner/02-COMMIT-AND-BRANCH.md)
3. [第 3 课：开发一个真实功能](docs/beginner/03-REAL-FEATURE.md)
4. [第 4 课：Push、PR、Review、CI 与冲突](docs/beginner/04-TEAM-COLLABORATION.md)
5. [第 5 课：撤销救援、进阶工具与发布](docs/beginner/05-RECOVERY-AND-RELEASE.md)

完整入口见 [5 课零基础学习地图](docs/beginner/README.md)。命令记不住时查阅 [命令中文词典](docs/beginner/COMMAND-DICTIONARY.md)，遇到错误时打开 [报错急救手册](docs/beginner/TROUBLESHOOTING.md)。

完成五课后，再阅读 [企业真实开发 Git 进阶总览](docs/GIT-ENTERPRISE-TUTORIAL.md)。

如果你只是想快速运行项目：

```bash
python -m pip install -e .
teamflow --help
```

创建并流转一个真实工单：

```bash
teamflow add "修复登录超时问题" --priority high
teamflow assign 1 "chen"
teamflow list --status open
teamflow close 1
```

也可以不安装，直接从源码运行：

```bash
$env:PYTHONPATH = "src"  # PowerShell
python -m teamflow --help
```

## 项目许可证

[MIT](LICENSE)
