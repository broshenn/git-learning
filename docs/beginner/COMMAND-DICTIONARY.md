# 📖 Git 命令中文词典

这不是第 6 课，而是五课学习过程中随时查询的参考表。命令按“观察、修改文件状态、提交、分支、远端、协作、恢复、发布”分类。

## 🧭 先看懂命令写法

教程中的尖括号表示需要替换的内容，不要输入尖括号本身。

| 教程写法 | 实际输入示例 |
|---|---|
| `git add <文件>` | `git add src/teamflow/cli.py` |
| `git switch <分支>` | `git switch main` |
| `git revert <哈希>` | `git revert a1b2c3d` |

方括号通常表示可选内容。例如 `git status [--short]` 表示既可以执行 `git status`，也可以执行 `git status --short`。

## 👁️ 1. 只读观察命令

| 命令 | 中文作用 | 是否修改仓库 |
|---|---|---|
| `git status` | 查看当前分支和文件状态 | ✗ |
| `git status --short` | 用两列符号显示简短状态 | ✗ |
| `git diff` | 查看未暂存变化 | ✗ |
| `git diff --staged` | 查看已暂存变化 | ✗ |
| `git diff --stat` | 只看哪些文件改了多少行 | ✗ |
| `git log --oneline -10` | 查看最近 10 个提交 | ✗ |
| `git log --graph --all` | 查看分支提交图 | ✗ |
| `git show HEAD` | 查看当前提交 | ✗ |
| `git show --stat HEAD` | 查看当前提交文件统计 | ✗ |
| `git branch` | 查看本地分支 | ✗ |
| `git branch -a` | 查看本地和远端跟踪分支 | ✗ |
| `git remote -v` | 查看远端名称与地址 | ✗ |
| `git tag --list` | 查看标签 | ✗ |
| `git reflog -10` | 查看最近 HEAD 移动记录 | ✗ |

遇到问题时，优先使用这些只读命令收集证据。

## 📥 2. 工作区与暂存区

| 命令 | 中文作用 | 风险 |
|---|---|---|
| `git add <文件>` | 把指定文件变化放入暂存区 | 低，提交前仍可取消 |
| `git add -p` | 分块选择同一文件中的变化 | 低，但要逐块阅读 |
| `git restore --staged <文件>` | 取消暂存，保留文件修改 | 低 |
| `git restore <文件>` | 丢弃未暂存修改 | 中，未提交内容会丢失 |
| `git rm <文件>` | 删除文件并暂存删除 | 中 |
| `git mv <旧名> <新名>` | 移动或重命名并暂存 | 低 |

推荐提交前流程：

```powershell
git status
git diff
git add <明确的文件列表>
git diff --staged
```

入门阶段不要习惯性使用 `git add .`，因为它可能把无关文件一起暂存。

## 💾 3. 提交命令

| 命令 | 中文作用 | 使用条件 |
|---|---|---|
| `git commit -m "信息"` | 创建本地提交 | 暂存区已有内容 |
| `git commit --amend` | 修正最近一次提交 | 提交尚未共享 |
| `git revert <哈希>` | 新建反向提交撤销旧提交 | 已共享历史优先使用 |
| `git reset --mixed HEAD~1` | 拆掉最近提交并保留文件修改 | 只整理未共享历史 |

常用提交类型：

```text
feat: 新功能
fix: 缺陷修复
docs: 文档
test: 测试
refactor: 不改变行为的重构
ci: CI 配置
chore: 其他维护
```

## 🌿 4. 分支命令

| 命令 | 中文作用 | 说明 |
|---|---|---|
| `git switch main` | 切换到 main | 工作区有冲突变化时可能拒绝 |
| `git switch -c feature/name` | 创建并切换分支 | 从当前提交创建 |
| `git branch --show-current` | 只显示当前分支名 | 只读 |
| `git branch -d <分支>` | 安全删除已合并本地分支 | 未合并会拒绝 |
| `git branch -D <分支>` | 强制删除本地分支 | 只用于明确可丢弃分支 |
| `git merge <分支>` | 把指定分支合入当前分支 | 可能产生冲突 |
| `git merge --abort` | 放弃尚未完成的 merge | 仅 merge 进行中 |

方向要读清：当前在 `main` 执行 `git merge feature/x`，表示把 feature/x 合入 main。

## ☁️ 5. 远端命令

| 命令 | 中文作用 | 是否改变工作区 |
|---|---|---|
| `git fetch origin` | 获取远端最新信息 | ✗ |
| `git pull --ff-only` | 仅允许快进方式同步当前分支 | 可能更新文件 |
| `git push -u origin HEAD` | 第一次推送当前分支并设置跟踪 | 更新远端 |
| `git push` | 推送到已跟踪远端分支 | 更新远端 |
| `git fetch --prune` | 获取远端并清理失效跟踪名 | 不改工作区 |
| `git push origin --delete <分支>` | 删除远端分支 | 中高风险 |

`fetch` 只更新“远端上有什么”的本地记录；`pull` 会进一步把变化集成到当前分支。

## 🔄 6. rebase、stash、cherry-pick

| 命令 | 中文作用 | 主要边界 |
|---|---|---|
| `git stash push -u -m "说明"` | 临时收起修改 | 不是长期备份 |
| `git stash list` | 查看 stash | 只读 |
| `git stash pop` | 恢复并删除最新 stash | 可能冲突 |
| `git rebase origin/main` | 把个人提交重放到最新 main | 改变提交哈希 |
| `git rebase --continue` | 解决冲突后继续 | 先 add 冲突文件 |
| `git rebase --abort` | 放弃本次 rebase | 回到 rebase 前 |
| `git cherry-pick <哈希>` | 复制一个指定提交 | 创建新哈希 |
| `git cherry-pick --abort` | 放弃当前 cherry-pick | 仅操作进行中 |

## 🏷️ 7. 标签命令

| 命令 | 中文作用 |
|---|---|
| `git tag --list` | 查看全部标签 |
| `git tag -a v1.2.0 -m "release: ..."` | 创建带说明标签 |
| `git show v1.2.0` | 查看标签指向的提交 |
| `git push origin v1.2.0` | 推送单个标签 |
| `git tag -d <标签>` | 删除本地标签 |

已公开发布的标签不应移动或覆盖。

## ⚠️ 8. 高风险命令区

| 命令 | 风险 | 入门建议 |
|---|---|---|
| `git reset --hard` | 丢弃工作区和暂存内容 | 不使用，除非明确理解 |
| `git clean -fd` | 删除未跟踪文件和目录 | 不使用 |
| `git push --force` | 覆盖远端历史 | 不使用 |
| `git branch -D` | 强制删除未合并分支 | 仅删除可丢弃实验分支 |
| `git tag -f` | 移动已有标签 | 不用于已发布标签 |

## 📊 9. 最常用的 12 条

```powershell
git status
git diff
git diff --staged
git log --oneline --graph --decorate --all -12
git switch main
git pull --ff-only
git switch -c feature/name
git add <文件>
git commit -m "feat: describe change"
git push -u origin HEAD
git restore --staged <文件>
git fetch --prune
```

这 12 条足以覆盖大部分日常企业开发，其他命令按问题查询即可。

