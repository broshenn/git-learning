# 贡献指南

这个仓库采用轻量级 GitHub Flow。所有改动都从 `main` 拉出短生命周期分支，通过 Pull Request 合并。

## 开发流程

1. 同步主分支：

   ```bash
   git switch main
   git pull --ff-only
   ```

2. 创建分支：

   ```bash
   git switch -c feature/简短功能名
   ```

3. 小步提交，提交信息使用 Conventional Commits：

   ```text
   feat: add ticket search
   fix: reject assignment for closed tickets
   test: cover ticket search edge cases
   docs: explain release workflow
   refactor: extract ticket formatter
   chore: update repository configuration
   ```

4. 本地检查：

   ```powershell
   ./scripts/check.ps1
   ```

5. 推送并创建 Pull Request：

   ```bash
   git push -u origin HEAD
   ```

## Pull Request 合并条件

- 改动范围单一，标题能说明业务价值
- 自动化测试通过
- 新行为有测试或明确说明不需要测试的原因
- 至少一名维护者完成 Review
- 所有 Review 意见已处理
- 分支已同步最新 `main`，不存在冲突

## 分支命名

| 类型 | 用途 | 示例 |
|---|---|---|
| `feature/*` | 新能力 | `feature/ticket-search` |
| `fix/*` | 普通缺陷 | `fix/empty-owner` |
| `hotfix/*` | 线上紧急修复 | `hotfix/json-corruption` |
| `docs/*` | 纯文档改动 | `docs/git-cheatsheet` |
| `refactor/*` | 不改变行为的重构 | `refactor/repository-interface` |

不要把个人长期分支当作集成分支，也不要直接向 `main` 推送业务代码。

