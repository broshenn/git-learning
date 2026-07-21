# 🛟 Git 常见报错急救手册

报错不是让你继续猜命令的信号，而是让你暂停并收集状态的信号。任何问题先执行“急救四连”：

```powershell
git status
git branch --show-current
git log --oneline --decorate -5
git remote -v
```

保存原命令和完整输出，再从下面查对应场景。

## 📁 1. not a git repository

错误类似：

```text
fatal: not a git repository (or any of the parent directories): .git
```

含义：当前目录不是 Git 项目。

检查与修复：

```powershell
Get-Location
cd D:\pycode\git\git-learning
git status
```

不要在错误目录执行 `git init`，否则可能创建一个不需要的新仓库。

## 🌿 2. pathspec did not match

错误类似：

```text
error: pathspec 'feature/name' did not match any file(s) known to git
```

常见原因：分支名拼错、远端信息没获取、本地分支尚不存在。

```powershell
git branch -a
git fetch origin
git branch -a
```

如果要创建新分支，应使用：

```powershell
git switch -c feature/name
```

如果远端已有分支：

```powershell
git switch --track origin/feature/name
```

## 🔒 3. local changes would be overwritten

含义：切换或合并会覆盖当前未提交修改，Git 为保护内容而拒绝。

先看：

```powershell
git status
git diff
```

根据内容选择一种：

- 修改已完整：add、测试、commit。
- 修改未完成但要切任务：stash。
- 修改明确不要：确认 diff 后 restore。

不要为了切换成功直接执行 reset --hard。

## 🏷️ 4. branch already exists

错误类似：

```text
fatal: a branch named 'feature/x' already exists
```

说明分支已创建，不需要再次 `switch -c`：

```powershell
git switch feature/x
```

先用 `git branch` 核对名称。

## ☁️ 5. current branch has no upstream branch

这是新本地分支第一次 push 时的正常提示。执行：

```powershell
git push -u origin HEAD
```

后续在同一分支可以直接 `git push`。

## ⛔ 6. push rejected / non-fast-forward

错误通常表示远端分支已有当前本地没有的新提交。不要立刻强推。

```powershell
git fetch origin
git status
git log --oneline --graph --decorate --all -12
```

个人功能分支可以在确认无人共同使用后：

```powershell
git rebase origin/<当前分支名>
```

公共分支应按团队策略 pull 或 merge。无法判断时保留输出并询问维护者。

## 🔑 7. Authentication failed / Permission denied

常见原因：未登录 GitHub、凭证过期、没有仓库写权限、远端地址不对。

先确认地址：

```powershell
git remote -v
```

本项目应指向：

```text
https://github.com/broshenn/git-learning.git
```

使用 Git Credential Manager 的浏览器登录流程。不要把密码、Personal Access Token 或验证码写进源代码、README、终端截图和聊天记录。

## 💥 8. CONFLICT / Automatic merge failed

Git 已暂停合并，等待人工处理。

```powershell
git status
git diff
```

打开所有 `both modified` 文件，理解双方意图，删除冲突标记并保留最终正确代码。然后：

```powershell
git add <已解决文件>
git status
git commit
```

想放弃未完成 merge：

```powershell
git merge --abort
```

不要直接删除整个冲突文件，也不要在不理解业务时机械选择一侧。

## 🔄 9. rebase in progress

`git status` 会提示正在 rebase。解决当前冲突后：

```powershell
git add <已解决文件>
git rebase --continue
```

完全放弃：

```powershell
git rebase --abort
```

不要在 rebase 进行中随意切分支或重新启动另一次 rebase。

## 🧷 10. detached HEAD

含义：HEAD 直接指向某个提交或标签，没有位于普通分支。查看旧版本时很常见。

如果只是查看完毕：

```powershell
git switch main
```

如果在 detached HEAD 中做了需要保留的提交：

```powershell
git switch -c rescue/detached-work
```

先创建分支固定提交，再决定如何合并。

## 📭 11. nothing to commit, working tree clean

这通常不是错误。它表示没有被 Git 跟踪的变化。

如果你明明改了文件：

```powershell
git status --ignored
git check-ignore -v <文件路径>
```

文件可能被 `.gitignore` 排除，或者改动保存在另一个目录中的同名项目。

## 🧾 12. LF will be replaced by CRLF

这是 Windows 换行符提示，不一定是失败。本仓库使用 `.gitattributes` 统一不同类型文件的换行符。

检查：

```powershell
git diff --check
git status
```

不要为了消除警告批量改写所有文件。大范围换行变化会污染 PR。

## 🧪 13. 自动化测试失败

先找第一个 `FAIL` 或 `ERROR`，后面的错误可能只是连锁结果。

```powershell
./scripts/check.ps1
```

常见分类：

| 输出 | 含义 | 方向 |
|---|---|---|
| `AssertionError` | 实际结果不符合预期 | 对比测试期望与业务逻辑 |
| `TypeError` | 参数数量或类型错误 | 检查函数签名与调用 |
| `AttributeError` | 对象没有该属性 | 检查参数是否已在 parser 中定义 |
| `IndentationError` | Python 缩进错误 | 使用 4 空格，检查代码层级 |
| `ModuleNotFoundError` | 安装或 PYTHONPATH 问题 | 重新可编辑安装 |

先在本地修复并通过，再 push；不要反复依靠远端 CI 代替本地检查。

## 🕵️ 14. 提交看似消失

执行：

```powershell
git reflog -20
```

找到可能哈希，检查：

```powershell
git show <哈希>
```

确认是目标提交后：

```powershell
git switch -c rescue/lost-work <哈希>
```

不要急着 reset main，先用救援分支保存目标。

## 🆘 15. 求助时应该提供什么

复制下面结构，并填入真实信息；敏感令牌必须删除：

```text
执行的命令：git push
完整错误：粘贴从 fatal 或 error 开始的完整输出
期望结果：把 feature/x 推到 GitHub
当前分支：git branch --show-current 的输出
当前状态：git status 的输出
最近历史：git log --oneline -5 的输出
已经尝试：说明执行过的操作
```

不要只说“Git 坏了”或只发最后一行。完整状态能显著减少误操作。

