# Git 企业开发速查表

## 每日工作流

```bash
git switch main
git pull --ff-only
git switch -c feature/ticket-search

git status
git diff
git add src/teamflow/service.py tests/test_service.py
git diff --staged
git commit -m "feat: add ticket search"

git fetch origin
git rebase origin/main
git push -u origin HEAD
```

## 看清当前状态

| 目的 | 命令 |
|---|---|
| 查看工作区和暂存区 | `git status` |
| 查看未暂存改动 | `git diff` |
| 查看已暂存改动 | `git diff --staged` |
| 查看分支图 | `git log --oneline --graph --decorate --all` |
| 查看某次提交 | `git show <commit>` |
| 查看某行是谁改的 | `git blame <file>` |
| 查看远端分支 | `git branch -r` |

## 安全撤销

| 场景 | 命令 | 是否改历史 |
|---|---|---|
| 文件改乱，尚未暂存 | `git restore <file>` | 否 |
| 暂存错文件 | `git restore --staged <file>` | 否 |
| 上次提交漏文件，尚未推送 | `git commit --amend` | 是 |
| 已推送的坏提交 | `git revert <commit>` | 否，新增反向提交 |
| 本地提交要拆掉但保留改动 | `git reset --mixed HEAD~1` | 是 |
| 临时收起未完成改动 | `git stash push -u -m "说明"` | 否 |

> 已共享的提交优先 `revert`，不要对团队公共分支执行 `reset --hard` 后强推。

## 冲突处理

```bash
git status
# 打开冲突文件，删除 <<<<<<<、=======、>>>>>>> 并保留正确内容
git add <已解决文件>
git commit              # merge 流程
# 或 git rebase --continue
```

放弃本次操作：

```bash
git merge --abort
git rebase --abort
```

## 常用类型

```text
feat: 新功能
fix: 缺陷修复
docs: 文档
test: 测试
refactor: 不改变行为的重构
perf: 性能优化
build: 构建系统或依赖
ci: CI 配置
chore: 其他维护
revert: 回退提交
```

