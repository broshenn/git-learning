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

完整教程完成后会位于 `docs/GIT-ENTERPRISE-TUTORIAL.md`。如果你只是想快速运行项目：

```bash
python -m pip install -e .
teamflow --help
```

## 项目许可证

[MIT](LICENSE)

