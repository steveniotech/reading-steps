# Reading Steps

面向纽约州三年级孩子的英文阅读训练教学辅助原型。学生页面全部使用美式英文；开发说明为中文。使用 WHAT → WHY → HOW 组织理解，再进行简短复述。Who、Where、When 只是 What 的可选辅助提示，这是一种教学组织方式，不是对词义的等同解释。

## Python Steps Lab

An independent Python playground for first-time coders aged 10–12. Open **`python-steps.html`** directly, follow **Try Python Steps Lab** from Reading Steps, or use Live Server / the static-server command below and open `/python-steps.html`. No build, installation, account, or API key is needed.

- Follow **Learn → Type → Run → Fix → Build** through 29 tasks across five units and two projects. The map unlocks each stop in order. Type real Python, use **Run Code**, then **Check**. A three-level hint ladder never deducts stars.
- **Python’s first load requires internet**: a pinned Pyodide runtime loads from its official documented distribution at jsDelivr. Code then runs locally in a terminable worker; student code, replies, and progress are not sent to a server. No external UI libraries, audio, fonts, packages, or analytics load. See [Pyodide’s loading documentation](https://pyodide.org/en/0.28.0/usage/index.html).
- If loading fails, lessons, drafts, hints, and JavaScript structure checks remain available. Offline checks are explicitly provisional: they do not invent output or award completion stars. Use **Try Loading Python**, then Check after a successful real run.
- **Test Inputs** gives `input()` its next reply and shows both questions and answers in Output. Robot Interview uses a name and animal. Guess the Number’s **Run Code** uses a random secret; **Check Project** uses secret 12 with the default replies `5, 17, 12`. Add or remove replies to test other paths. **Add Replies 1–20** appends a full set of guesses for a random-run test.
- Drafts, current step, completion counts, stars, badges, test replies, hint usage, latest error type, and finished output are saved in this browser’s **localStorage**, key `python-steps-lab:v1`. Refresh restores them. File URLs and different localhost ports may have separate storage. Browser privacy settings may block saving; the page then explains how to export your work. Reading Steps keeps its existing in-memory policy.
- Use **Teacher View** (also `python-steps.html#teacher`) to inspect progress, preview any task without rewards, or **Export JSON**. **Reset Progress** requires two confirmations and clears only Python Lab progress. **Reset Code** confirms replacement of the current draft and keeps earned stars. Use nicknames; shared devices retain drafts until reset.
- Ordinary steps award 5 stars, challenges 10, Robot Interview 20, Guess the Number 30, once per task: **210 stars and 7 badges** in this edition. Bonus ideas are optional, with no extra stars in version 1. Hints, mistakes, and retries never subtract stars. Successful repeated checks are counted but never scored twice.
- Keyboard: Tab in the editor inserts four spaces; Escape leaves it. Ctrl/Cmd+Enter runs; Ctrl/Cmd+S confirms automatic saving. All controls have visible focus. Reduced motion keeps the completion card and disables its brief star animation.

The runner permits print, basic values, input simulation, arithmetic, decisions, loops, functions, lists, and a constrained random module. It rejects file/network/system/package tools, introspection, unsupported syntax, and oversized operations. Line/output limits and a worker timeout stop runaway loops. This is a restricted educational subset, **not a general Python IDE or a hardened hostile-code service**. Some task output words are part of explicit checklists; creative open-ended meanings still need a teacher’s review. Turtle is Coming Soon.

Files: `python-steps.html`, `python-steps.css`, `python-steps.js`, `python-lessons.js`, `python-core.js`, `python-runner.js`, and `test-python.js`. Run `node test-python.js` with local `python3` for curriculum, checker, safety, persistence, and worker-lifecycle tests. See **TESTING.md** for actual browser results and remaining manual checks.

## 本地运行

当前环境已确认存在 `python3`。在终端运行：

```sh
cd /path/to/reading-steps
python3 -m http.server 8000 --bind 127.0.0.1
```

浏览器打开：http://127.0.0.1:8000 。结束使用时在终端按 Control+C。交付过程中没有启动后台服务，也没有部署网站。无需安装依赖。

## 文件

- `.gitignore`：排除秘密配置、虚拟环境、缓存、日志、临时文件、系统文件和私人资料。
- `index.html`：英文页面结构和原生控件。
- `styles.css`：系统字体、响应式布局、阅读字号和键盘焦点样式。
- `lessons.js`：四篇原创文章、题目、反馈、证据目标、句子练习和教师示范。
- `app.js`：五步流程、模式切换、阅读显示及内存状态、任务分数和徽章条件。
- `rewards.js`：文章专属徽章的本地SVG、提示与答案泄露范围配置、短彩带及清理控制器。
- `validate.js`：文章数据、词数和静态隐私检查。
- `test-state.js`：使用最小 DOM 替身验证事件处理与状态；不是浏览器测试。
- `TESTING.md`：检查记录、限制和手动测试步骤。

## 已实现

学生主流程保留 Read → What → Why → How → Put It Together。右侧为单任务卡；每个画面一个主要按钮，返回、帮助及查看原文入口降低视觉强调。直接选择主要步骤、文章、模式、清空、跳过和教师参考收进默认折叠的 Teacher Settings。此面板只整理界面，不是身份认证或访问权限控制。

What、Why、How 各自分为作答、答案反馈、找证据、证据反馈四个画面。作答只显示问题及三个选项；错误反馈用现有解释，通常一至两句，点击 Try Again 重试；正确反馈点击 Find Evidence 后才进入证据任务。未完成证据可重试，完成后须手动 Continue。不会自动推进。

进度显示当前任务位置，不是完成成绩：读文章一个任务、三阶段各含作答和证据两个任务、复述和自查各一个任务，共九个实际任务。反馈不增加任务数。内部 FLOW 定义十六个画面，帮助、示例及可选自己的话解释不增加任务数。

证据选择只在证据任务画面启用，位于左侧原文中；右侧不复制原文。句子对学生显示数字1–7，内部ID、题目和证据引用完全保留。全文与逐句模式都能选择，已选句号始终在证据区域列出，跨句保留。选中状态同时使用复选框、Selected文字及边框表达。其他画面无证据选择控件。

提示在 Guided Practice 和 Independent Practice 中都默认折叠。Guided Practice 用更具体的短指令引导；Need a hint? 先进入只显示一条提示的帮助卡，再主动打开 More Help 才显示下一条。尝试后可以查看示例；示例只显示当前答案或证据句号，明确标记获得帮助，不自动填答。What 的人物或主题提示仅在后续帮助中按故事/说明文区分提供，不引入必填人物、地点或时间分类。

证据目标仍由预写题目指定；更具体的证据查找要求放在第二层帮助中。反馈区分无关选择与遗漏支持句。仅选择题和指定证据均检查成功、未查看示例且未跳过该题，才显示独立完成。状态摘要只在教师设置内显示。此判断不是通用开放式阅读理解自动评分；其他有意义的引文可以与教师讨论。

Teacher Model 使用同样的短画面，分开展示示例答案、思考和证据，清楚标记教师示范。退出示范到练习时，若有会被清除的学生进度，先确认；接受后清除选择题、证据、示例、反馈、跳过、分数和徽章记录，并回到当前主要阶段的开始；全部自由文字及自查勾选保留，不清除学生文字，但复述提交及自查完成确认需重新进行。练习模式之间切换隐藏帮助、示例和教师参考，保留回答及获得示例帮助的历史。

复述先显示自由文本框及短指令。按需从帮助中打开文章专属句型，或选择 Tell It Aloud。写作必须输入非空内容并点击 Submit Retelling；口述必须明确点击 I told it aloud。之后单独显示自查，点击 I checked my retelling 明确确认（不要求勾选每项），才进入 Practice Complete。教师导航或跳过仍能到流程终点，但不满足条件时没有徽章。完成不代表掌握技能或全部独立答对，跳过不会写入正确结果。教师参考默认隐藏在教师设置内；在练习中查看参考会记录三题已获得示例帮助，防止参考内容影响后的答案被标为独立完成。

原有的选择题可选自由解释保留，但改为从帮助入口进入独立的 Explain in Your Own Words 卡，不与选项同屏。所有自由回答、复述和口述不评分，不检查关键词、拼写、语法或长度，也不录音。

电脑宽屏保留左右布局。小屏任务卡在上、原文折叠区在下，Read Passage 打开并定位原文，Back to Task 返回任务且保留回答。保留全文、逐句、字号及可选关键句练习。每次切换任务卡画面会将焦点移到任务标题。

## 练习奖励

奖励鼓励练习和认真尝试，不是阅读能力评估。顶部仅显示小型 Practice Points，不增加右侧分数面板。没有百分比成绩、速度奖励、排行榜、扣分、能力等级或签到。自由解释、复述、自查和徽章不加正确分，也不自动评分。

每篇六个客观任务：What、Why、How各有回答和证据两个任务，每个10分，最多60分。只有点击Check或Check Evidence且现有检查逻辑确认正确才可奖励。每个任务的 `rewards` 分别保存 `awarded`、`revealed`、`done`、`skipped`；分数只在本次文章练习中累积。选中但未检查、重复检查、返回和重选都不会重复加分。错误不扣分；普通提示和未看答案的重试仍可获得10分。

答案示例只影响它实际揭示的任务。回答示例标记回答，证据示例标记证据；已获得分数不会因后来查看示例而减少。教师参考复述透露三题回答，所以只标记三题回答任务。关键句解释会透露Why回答；花园、书车和雨水篇还给出该题完整的单句证据，因此同时标记Why回答和证据；纸张篇解释没有给出完整的两句证据组合，只标记回答。这些范围由 `CLOSE_DISCLOSURES` 显式配置。普通提示不标记答案泄露；雨水What原有提示直接指定开头和结尾句，学生帮助卡使用 `SAFE_EVIDENCE_HINTS` 中不指定句号的新短提示，原始文章与题目数据仍保留。扩展文章或解释时需同时审查这些范围。

得分时，在原教学反馈内增加 Nice work! +10 points，保留题目解释；顶部更新总分但不另设aria-live。反馈区域同时通知新分数，彩带为aria-hidden，避免三处重复朗读。看过答案后完成任务时仍显示友善的 Keep going 文案。

彩带用本地CSS和JavaScript，在顶部预留的小区域中播放约1秒，只有九个小片、短距离运动，无声音、闪烁或焦点变化，不覆盖内容。每次真正的新奖励最多创建一个动画和一个备用清理定时器；快速发生不同奖励时替换同一小区域的动画，重复检查不创建新动画。动画结束或备用定时器触发即清理；换篇、清空和模式切换会终止动画。清理回调用代次令牌隔离，旧回调不能改动新动画，更不参与计分。

实时尊重 prefers-reduced-motion：减少动态时保留静态奖励反馈、分数及徽章，不创建彩带或定时器；期间设置改变也会影响后续奖励，并停止正在播放的动画。

| 文章 | 完成徽章 |
| --- | --- |
| A Sign for the Garden | Garden Care |
| The Wobbly Book Cart | Book Journey |
| A Tray for Reused Paper | Paper Second Chance |
| Keeping Rain Away from the Door | Rainwater Trail |

六个理解任务每个都由实际正确检查完成，或由教师明确跳过，才计入流程完成。徽章还要求学生明确提交写作或口述复述，并确认完成自查。无需满分，使用提示和答案示例不妨碍徽章；教师跳过本身不加分，之后回头实际作答并检查正确时仍按同一奖励规则判断。仅打开Teacher Model、直接导航完成页、输入但未提交、打开口述提示但未确认或只勾自查项目，均不发徽章。徽章发放只在实际自查确认动作中判断，不在页面渲染时发放。

每次练习只发一枚文章徽章，也只处理一次完成庆祝。徽章和完成文字始终是静态可见的，减少动态时不播放彩带。返回完成页不重新发放或庆祝，徽章不加分。它表示完成练习，不表示全部独立答对或掌握阅读技能。

分数、泄露范围、任务完成、复述提交、自查确认、徽章和庆祝记录全部在当前页面内存。返回保留奖励；确认换篇、清空或刷新后全部清零，不是永久徽章收藏。Guided/Independent之间切换保留分数；进入Teacher Model不产生奖励，退出时按原规则重新尝试，同步清除相关奖励及总分。若会清除已有进度与分数，确认框明确说明，取消则保留原模式和全部状态。文字保留，但提交确认需重新进行。

## 隐私与边界

没有学生登录、个人信息字段、外部资源、网络 API、AI API、分析追踪、广告、数据库或后端。学生回答只存在当前页面内存中；刷新后清空。不用 localStorage、sessionStorage 或 cookies。换文章前如有回答会确认是否放弃；取消时恢复原文章选择。“Clear This Practice”始终先确认。不要在自由输入中填写个人信息。

## 手动增加文章

1. 在 `lessons.js` 的 `LESSONS` 数组中加入一个对象，参考现有文章结构。`id` 全局唯一；句子 `id` 在本篇唯一，建议采用文章专属前缀。不要改变原文顺序。
2. 编写约70–110词的原创英文文章。这仅是本原型设计范围，不是经验证的年级难度或 Lexile 等级。使用短而自然的句子，确保只凭原文可作答。
3. 添加 `keySentence`：已有句子 ID，以及 `about`、`tells` 两段预写解释。
4. 添加 `whatQuestion`、`whyQuestion`、`howQuestion`。可使用 `question(prompt, options, answerId, evidenceIds, hint, evidenceHint, example)` 和 `option(id, text, feedback)` 辅助函数。每题三个唯一选项 ID；正确选项必须存在，每项须有具体反馈。主旨干扰项分别为小细节和不支持的信息，正确位置应变化。
5. 在 `EVIDENCE_TASKS` 中以文章 ID 增加三题的 `evidenceTask`。明确每组直接支持句的查找要求，核对 `evidenceIds`。避免存在多个明显同样合理的证据组合却只接受一组；必要时重写题目、证据任务或文章，不要把整篇设为必选。
6. 添加 `teacherModel` 的 `what`、`why`、`how`，以及 `retellPrompt`、`frames`、`teacherReference`、`selfCheck`。每个解释、示范及句型必须与原文一致。
7. 正式使用前请教师审核文章准确性、词汇、句子难度、主旨、因果、行动过程、所有选项和证据目标，尤其确认不存在有歧义的干扰项。当前内容为待教师审核的原创草稿，尚无外部教师审核记录。
8. 在 `rewards.js` 的 `PRACTICE_BADGES` 加入本篇英文徽章名和本地SVG路径。审查关键句解释的实际泄露范围，必要时配置 `CLOSE_DISCLOSURES`；不要把普通提示标为答案示例。
9. 运行检查并按 `TESTING.md` 验证。`validate.js` 当前断言初始版本有四篇、两种类型各两篇；扩展时相应修改数量断言。

## 公开仓库准备

启动命令中的 `/path/to/reading-steps` 请替换为自己的项目目录。HTML使用 `styles.css`、`lessons.js`、`rewards.js`、`app.js` 相对资源路径，可解析到 `/reading-steps/` 子路径内的同名文件。当前未配置或发布GitHub Pages，路径静态检查不等同实际部署验收。

四篇文章为本项目原创草稿，正式教学前仍需教师审核。许可证尚未选定，本项目当前未附开源许可证。

## 限制

本项目是教学辅助原型，不是诊断或治疗工具，不保证提升阅读能力。未验证纽约州课程标准符合性，未进行 Lexile 或年级难度认证，未验证教学效果。没有任意粘贴文章自动出题、AI生成、自由回答自动评分或长期存档。浏览器视觉、键盘和实际交互测试尚未执行，详见测试文档。
