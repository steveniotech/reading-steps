# 测试与质量检查

## Python Steps Lab — implementation and verification

Python Lab is a separate static page. Only a local navigation link was added to Reading Steps for this feature; its lessons, state, privacy, scoring, sound, and celebration behavior are retained. No dependencies were installed and no backend was added.

### Automated checks actually passed

```sh
node --check python-lessons.js
node --check python-core.js
node --check python-runner.js
node --check python-steps.js
node --check test-python.js
node test-python.js
node test-state.js
node validate.js
git diff --check
```

`test-python.js` runs the exact Python host shipped to the browser under local CPython. All **29 reference programs** run and meet their task rules. It covers decision boundaries (including heights 119, 120, 200, 201), changing Robot Interview replies, Guess the Number with a fixed check secret, functions/lists/f-strings, numeric vs text values, loop stopping, seven friendly error categories, denied modules/calls/introspection, bounded operations, one-time stars, 210-star cap, seven badges, lock order, and normalized draft/input/hint restoration. Negative examples cannot pass by printing a matching number while leaving the requested variable unused.

Worker substitutes cover loading, unavailable execution, ready messages, termination, stale responses, the 6-second run timeout, 45-second load failure, retries, and timer cleanup. A DOM substitute drives the **real app handlers** through all 29 tasks: project build checkpoints, navigation, challenge/project completion pages, saved stars/badges/outputs, hint ladder, repeated Check, concurrent edits during a run, shortcut saving, Teacher View, and double-confirmed reset. These adapter tests are **not real-browser, Pyodide, audio, or assistive-technology tests**.

The existing Reading Steps state tests and data/privacy checks also passed. Python Lab alone has a separate localStorage key and downloads the Python runtime; Reading Steps continues to load only its own local files and keep student answers in memory.

### Real browser checks actually performed

Tested in **Google Chrome by opening `python-steps.html` directly as a file URL**, without a server or build:

| Path | Observed result |
| --- | --- |
| Unit 1 Step 1 | Pyodide loaded; Run printed `Hello, world!`; Check awarded 5 stars and enabled Next Step. |
| Unit 1 Step 2 | Typed a new message; Check ran it and awarded the next 5 stars. |
| Unit 1 Step 3 | Broken starter produced the quotation-mark explanation with raw details collapsed. Fixed code ran and passed. |
| Unit 1 Step 4 / Challenge | Three real print lines passed; the poster challenge showed its finished output, +10 stars, and Message Maker. Map showed 5/5, 30 stars, and Unit 2 unlocked. |
| Refresh | Current step, edited code, stars, completion, badge, and a used hint were restored. Teacher View retained the previous SyntaxError. |
| Unit 2 variables / Text vs Number | In Teacher preview, numeric score code printed 15 and passed. A final smoke check of the latest scripts printed a stored name and passed its variable-use check. |
| Robot Interview | In Teacher preview, sequential build checkpoints unlocked; Test Inputs supplied Sky/otter; Output showed questions, replies, and personalized responses. Final Check passed, including an alternate-name/animal test. |
| Unit 4 even/odd | In Teacher preview, int/input/if/else program ran and passed its 4/5 test cases. |
| Unit 5 for / while | In Teacher preview, range(5) printed exactly five messages; a while counter printed 1, 2, 3 and stopped. |
| Runaway while repair | Unchanged starter was stopped and showed “Your loop may not have a way to stop…”. Adding the counter update printed 1–5 and passed. |
| Guess the Number Check | In Teacher preview, Test Inputs 5, 17, 12 produced Too low!, Too high!, Correct!, You won!, then terminated and passed. |
| Guess the Number Run | Random mode differed from the fixed Check secret. Exhausted replies produced a friendly request for another Test Input. Appending replies 1–20 completed a real random game (observed secret 8). |
| Keyboard | Tab inserted four spaces and kept editor focus; Escape moved to Check; Cmd+Enter ran; Cmd+S displayed “Your work is saved automatically.” |
| Layout | At the tested window’s 75% zoom the lab used readable side-by-side cards; at 100% it stacked them. Screenshots inspected map, guide, input rows, editor, output, and completion layout. Physical phone testing was not performed. |
| Reading Steps regression | Original HTML opened, Sound was Off, Continue opened the original question, and a first correct Check still added 10 Practice Points with the original feedback. |

Later-unit browser checks used Teacher preview to avoid fabricating learner completion or bypassing the map locks. Their stars, badges, and project completion rewards were verified through actual app handlers with DOM/CPython adapters, not through a full real-browser 29-step learner route. The 30 test stars and preview drafts were cleared on 2026-10-13 as recorded below; they are not student learning records.

### Test-data cleanup — real Chrome verification, 2026-10-13

At the user's explicit request, used the existing Python Lab Teacher View → Reset Progress and accepted both confirmations. Only the test data under `python-steps-lab:v1` was replaced with a fresh Python Lab state. The reset implementation writes this single key; it does not call `localStorage.clear()`, touch other keys, or reset Reading Steps. No course content, app code, or reward rules changed during cleanup.

Observed immediately after reset **and again after a real Chrome page refresh**:

- **0 stars**, **0 / 29 steps complete**, and no earned badges.
- Unit 1 / Make Python Talk: **Unlocked**, 0 / 5 complete, enabled start button.
- Unit 2, Unit 3, Project 1, Unit 4, Unit 5, Project 2: **Locked**, zero completion, disabled start buttons in the existing learning order.

The page was left on this fresh learning map. No Run or Check was performed after cleanup, so no new test rewards were created.

### Coverage boundaries — automated / browser-tested / not yet browser-tested

| Category | Evidence and scope |
| --- | --- |
| Automated coverage | Prior `test-python.js` CPython/core, DOM-handler, and Worker-substitute checks cover all 29 tasks, reward/lock rules, persistence, error handling, and reset logic. These are not full browser runs. Prior Reading Steps tests also passed. They were not rerun for this documentation-only cleanup. |
| Real browser coverage | Chrome file-URL checks listed above; additionally, the two-confirmation reset, fresh-state map, and persistence of that initial state after refresh were verified on 2026-10-13. |
| Not yet tested in a real browser | Full 29-task learner route and all later-unit reward paths; forced offline/load failure and network inspection; storage-denied/quota conditions; physical mobile devices; comprehensive screen-reader and reduced-motion checks; Live Server/static-server mode and browsers other than Chrome. Some of these have automated substitute coverage, not real-browser verification. |

### Remaining manual checks / exact retest instructions

1. Open the HTML or `/python-steps.html` through Live Server. For a clean learner route, export any existing work, then use Teacher View → Reset Progress and accept both confirmations. Verify 0 stars, only Unit 1 unlocked, and no badges.
2. Run and Check the first print; change a message; run the broken quotes starter, then fix it; finish the remaining tasks. Next Step stays disabled until Check passes. Challenges display a completion page and new badge. Repeat a completed Check and verify stars do not increase.
3. For quick teacher testing, open `#teacher` and preview the requested task. Hint 1 and Hint 2 precede Show Example; reference code is labeled “Use this to learn, then try typing it yourself.” Type it in the editor. For projects, press Check Build Step after each part, then Run / Check Project. Preview never awards stars or completion.
4. Robot Interview: use Name `Sky` and Animal `otter`; run, inspect the questions/replies, and Check. Change them to another nickname and animal and rerun. Guess the Number: use `5, 17, 12` for Check. For random Run, add replies 1–20. Test empty/non-numeric input and an incomplete loop; errors never deduct stars.
5. Park checker: try height inputs 119, 120, 200, 201. Put `> 200` before `>= 120`. Its Check also runs these boundaries. Test both branches of even/odd, the three score branches, for ranges, and a repaired while counter.
6. Refresh after editing and using hints; verify current learner step, draft, Test Inputs, completed tasks, stars, badges, hint usage, and saved output in Teacher View / Export JSON. Try Reset Code and cancel first; accepting replaces only that draft. Reset Progress must require two confirmations and affect only Python Lab.
7. **Offline / runtime failure remains a manual browser check**: use DevTools Network Offline, disable cache, and reload. After the loading limit, verify the exact runner failure message, editable drafts and hints, and provisional Check feedback with no invented output or awarded stars. Restore network and Try Loading Python. Network should show only runtime distribution loads, not student-code uploads or package installs.
8. **Storage-denied/quota, true mobile, and full screen-reader behavior remain manual**: block storage and confirm a save warning plus usable editing/export; test approximately 375px width and 200% text; Tab through controls, use Escape from the editor, and check output announcements with VoiceOver/NVDA. Try reduced motion: the finished card remains, but the brief star animation stops/does not start. These behaviors were implemented; they were not all verified on real devices.

Version 1 intentionally has no extra bonus stars, Turtle canvas, runtime package installation, live pause-and-resume input dialogue, JSON import, cloud sync, or general Python support. Checks combine AST/runtime metadata, output, and a small set of examples; they cannot understand every creative message or prove arbitrary program correctness. Text describing personal details or positive messages still benefits from a teacher’s review. Supported expression formats are documented in README.

## Reading Steps — prior check records

以下保留既有 Reading Steps 的检查记录；Python Steps Lab 的新增检查与限制见上节。

功能修改前已核对当前项目目录正确，阅读了现有HTML、CSS、JavaScript、文章数据、状态测试和中文文档。项目内没有AGENTS.md。未安装依赖、启动后台服务、访问外部网站或部署。四篇文章、问题、答案、解释和内部句子ID保留，`lessons.js` 没有修改。

已执行并通过：

```sh
node --check lessons.js
node --check rewards.js
node --check app.js
node --check validate.js
node --check test-state.js
node validate.js
node test-state.js
```

数据检查维持原规则：四篇文章、两篇故事和两篇说明文，文章ID、篇内句子ID和题内选项ID唯一；正确选项存在；证据ID存在且不是整篇全选；关键句、字段、教师示范和自查齐全；What正确位置覆盖三个位置。

| 文章 | 类型 | 词数 |
| --- | --- | --- |
| A Sign for the Garden | Fiction | 91 |
| The Wobbly Book Cart | Fiction | 96 |
| A Tray for Reused Paper | Informational Text | 97 |
| Keeping Rain Away from the Door | Informational Text | 101 |

静态隐私检查确认学生资源中无中文字、外部HTTP URL、fetch、XMLHttpRequest、回答持久存储和麦克风调用。HTML仅引用本地CSS和JavaScript。此检查不等同浏览器Network实测。本次静态隐私检查也包含新增的 `rewards.js`，并验证四个徽章名称和图形配置存在、名称唯一。

## 状态测试覆盖

`test-state.js` 使用最小DOM替身执行真实 `app.js` 事件处理。已经实际验证：

- 作答 → 答案反馈 → 证据 → 证据反馈 → 下一阶段；正确反馈不自动推进，错误后重试保留选择。
- 空答案和空证据提示停留原任务；错误解释不公开正确答案。
- 返回保留本篇选择、证据、自由解释、复述和自查，以及已获得奖励。
- 分层帮助只在主动打开后显示；未尝试不能查看答案示例；查看示例保留获得帮助记录，不能标独立完成。
- 证据只在证据任务启用；进入反馈或帮助后无选择控件；右侧无复制原文的证据列表。
- 数字句号与内部ID映射，例如显示4，对应内部 `g4`；逐句状态跨句保留，全文恢复后选中状态一致；已选句号摘要准确。
- 多句证据、无关句与遗漏支持句分别及同时反馈；改选撤销成功检查结果。
- 教师跳过不会将正确答案或证据写为成功；逐项跳过仍可到完成画面。
- 三种模式与四篇文章的全部十六个画面均渲染，始终只有一个主要按钮；右侧不同时显示选择题与自由文本框。
- Teacher Model分画面展示；内部句子ID转换为数字供界面使用；退出示范清除选择及证据，但保留自己的话。
- 练习模式切换隐藏帮助和教师参考；查看教师参考记录已获得帮助。
- 文章切换与清空确认的取消和接受分支；切换后回到Read，不保留上一篇状态。
- 四篇分别完整走通正常流程，九个实际任务、反馈不另计任务；复述 → 自查 → 完成，不自动评分。
- 句型与口述帮助单独呈现；全文/逐句、句子位置、字号、查看原文和返回任务的事件处理。

这些测试使用替身，不具有真实浏览器的布局、焦点、原生表单、details事件或ARIA实现。替身对焦点方法的调用检查不代表真实焦点或屏幕阅读器测试通过。

## 本次奖励状态测试（已执行并通过）

继续使用现有DOM替身，新增可控定时器和两个独立的媒体偏好替身。这不是浏览器、CSS动画或真实辅助技术测试。实际执行的断言包括：

- 首次正确回答+10、首次正确证据+10；选中不检查无分；错误不扣分；普通提示、重试可以得分。
- 重复检查、返回、重选、已得分后再查看示例均不重复加分或再次创建彩带；六任务上限60，四篇均验证。
- 回答示例只标回答、证据示例只标证据；两者同时泄露的关键句解释同时标记；纸张篇只给Why回答、不提供完整证据组合，范围分别验证。雨水篇的普通提示不再直接指出句号，不影响证据分。
- 查看答案后检查正确显示友善鼓励，无对应正确分；查看示例后仍能完成整篇并获得徽章。
- Teacher Model不产生分数、提交状态或徽章；教师跳过不写入正确结果、不加分；跳过后的写作或口述加自查确认均能拿完成徽章。
- 空白及全空格不能提交；非空文字不分析质量或长度（一个字母也可提交）；输入不等于提交、打开口述说明不等于确认。自查必须点击明确确认，不要求任何自查项目勾选。
- 直接打开完成页没有徽章，单独提交复述加自查也不能绕过未走过的理解任务。四篇徽章名称正确，首次庆祝一次、返回或再次确认不重复庆祝、徽章不加分。
- Guided/Independent切换保留奖励；退出Teacher Model的取消分支保留分数与模式，接受分支同步清零对应奖励、选择、徽章和完成状态，保留自由文字。
- 文章切换与清空重置分数、奖励、答案示例标记、徽章、提交和确认状态；取消换篇保留数据。动画结束清理备用定时器；快速真实奖励共用一个活动动画区域与一个定时器。
- 模拟减少动态效果时仍得分、显示反馈和徽章，但无动画元素或定时器；实时切换偏好停止活动动画；恢复动态后后续奖励可以播放。
- 保存旧定时器及动画结束回调，在重置后新奖励产生时再调用旧回调，不影响新分数、新动画或新定时器。

所有奖励更改通过真实事件处理路径执行；可控定时器只模拟生命周期，不能证明彩带实际看起来合适。完整原有分屏、数字编号、逐句证据、文章和模式回归测试仍通过。

## 尚未执行

本次实际调用浏览器工具检查可用浏览器，返回清单 `[]`。因此未执行真实浏览器交互、截图、电脑/平板/小屏视觉验收、原生键盘行为、焦点与屏幕阅读器验收、Network请求或浏览器刷新测试。未安装浏览器或其他工具。服务仍由使用者按README命令手动启动。

## 手动验收步骤与预期

先运行：

```sh
cd /path/to/reading-steps
python3 -m http.server 8000 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8000`。以下是真实浏览器待执行项目，不应视为已通过。

1. **初始界面**：教师设置折叠；原文与右侧Read卡片清楚分开。右侧仅短进度、一个指令、Continue及低强调帮助；无答案、教师参考、长提示、状态清单。学生界面全英文。
2. **教师设置**：展开后可以选文章、模式、清空、跳过、主要阶段和教师参考。面板说明它不是权限控制。参考默认隐藏；所有教师功能不出现在默认任务卡中。
3. **数字句号**：四篇原文显示1–7，不显示g1/b1/p1/r1。Teacher Model思考文字中的引用、证据示例和已选摘要也用数字。内部value及题目仍使用原ID。
4. **九任务进度**：Read为Task 1 of 9；What作答与其反馈均为2，证据及其反馈均为3；Why为4/5、How为6/7；复述为8、自查与最终画面为9。进度表示任务位置，不表示完成数量或得分。
5. **选择题**：每题只显示原问题与三个原选项、Check和Need a hint?。没有证据题、短答框或示例全文。未选时Check显示短提示，保持原画面。
6. **错误反馈**：先在What选小细节并Check。右侧切到一至两句针对本选项的解释，没有立刻公开正确答案；主要按钮Try Again。点击才返回选项，原选择保留，可回原文或打开帮助。
7. **正确反馈**：选对并Check后停留反馈页，主要按钮Find Evidence；点击才进入证据。不得自动前进。
8. **证据任务**：右侧显示短指令、刚确认的答案以及需要选择的句数；左侧原文启用复选框。点击或键盘Space可以选，Selected文字与复选框一起表达状态。其他画面不显示这些选择控件。
9. **逐句证据**：What中选第1、4、6句。逐句来回后各选择保留，摘要始终显示Selected sentences: 1, 4, 6；切全文仍选中三句。逐句按钮边界禁用、位置更新，内部检查成功。调字号不改变回答或选择。
10. **证据反馈**：选无关句并少选支持句，Check Evidence应分别指出无关与遗漏；首次不直接标出正确句。Try Again后原选择保留。选齐正确句检查后停留反馈页，主要按钮Continue，点击才到下一阶段。
11. **帮助逐层出现**：Guided和Independent默认均无展开提示。Need a hint?切到只显示当前一条提示的卡片；More Help才显示下一条。帮助页没有选择项与证据控件；Back to Task保留原回答。尝试后允许Show an Example；示例卡标明With help，不自动选答案。教师设置内该题不能显示独立完成。
12. **可选自由解释**：在答案帮助中打开Explain in Your Own Words，只有文字框和返回按钮，不与选择题同屏。输入后返回、切阶段及切模式，文字保留且不评分。
13. **正常继续路径**：从Read按Continue，依次完成What、Why、How的答案与证据，最后复述、自查、完成。每个转换都需手动点击，主要按钮视觉上唯一突出。Back按小画面返回而非直接跳主阶段。
14. **跳过**：Teacher Settings中Skip Current Task跳过作答到证据，跳过证据到下一阶段；不写入正确结果。可以连续跳过到终点，教师状态显示Skipped或Not checked，不能显示独立完成。直接选择主要阶段同样不授予完成状态。
15. **模式切换**：Guided短指令更具体，Independent仍可主动帮助。Teacher Model分开显示答案、短思考、证据及解释，标记示范，不显示整页长内容。退出示范后回到当前主要阶段开始，先确认是否重置已有进度、分数和徽章；取消保留原模式和状态，确认后选择、证据、例子、反馈、奖励及完成状态清空，自己的话、复述和关键句文字保留。教师面板提示开始新尝试。
16. **教师参考**：从Teacher Settings主动展开，显示文章专属参考及“Your words can be different”。练习中查看后各题记录得到帮助。切换模式、文章或清空后参考关闭，任务卡不带出参考文字。
17. **复述分屏**：首先只显示短指令与自由文本框；Need a hint?后可单独打开Optional Sentence Frames或Tell It Aloud。输入非空文字后点击Submit Retelling，或在口述页点击I told it aloud，才进入自查；Back能回输入并保留文字。点击I checked my retelling后进入Practice Complete；只有六个理解任务均完成或教师跳过、复述已提交、自查已确认，才发徽章。无勾选项目也能确认，徽章不是能力评价。口述不申请麦克风，文本无评分。
18. **换篇与清空**：有回答时换篇须确认；取消保持原篇和回答，接受重置到新篇Read。Clear This Practice总是先确认；取消不改变数据，接受清空文字、选择、自查、帮助、反馈和参考，保留当前文章、模式和字号。
19. **小屏原文入口**：在约375和768 CSS像素，任务在上、原文区域在下可折叠。Read Passage打开并定位原文；Back to Task回到任务且回答不变。证据逐句选择后回任务状态保留。电脑宽屏约1280像素左右布局，原文保持可见。
20. **键盘及焦点**：Tab/Shift+Tab遍历，Enter/Space操作按钮和details，方向键操作select/radio。切换每个小画面、帮助或例子时焦点落任务标题；单纯选择证据不抢走复选框焦点。空输入提示和反馈用aria-live；屏幕阅读器验证数字句号、选中状态和动态反馈。焦点清晰，不依赖颜色或拖拽。
21. **视觉**：最大字号、200%缩放和小屏下没有横向溢出或文字截断。只有右侧主要按钮使用突出填色；教师设置、帮助和Back没有同等强调。检查文本对比与长选项换行。
22. **隐私与网络**：刷新清空所有回答，恢复初始篇与模式。Network只请求127.0.0.1本地资源；作答、提示、证据、例子或模式切换均无外部请求。没有回答写入localStorage、sessionStorage或cookies，也没有登录、广告、追踪和录音权限。

## 奖励手动验收（尚未执行）

在上述本地地址验收，均需真实浏览器，不把以下预期当作通过记录。

1. **小型积分**：顶部初始Practice Points: 0。只选对不检查无变化；Check/Check Evidence首次正确各+10，原解释仍在，反馈出现Nice work! +10 points。无大面板、百分比或能力标签。
2. **不重复**：快速连续点击Check、反复Back再Check、改选再答对，不重复加分和彩带；错答不减分。六任务最多60。奖励提示离开反馈后不会在返回时重新声称+10。
3. **示例范围**：先错再打开回答示例，回头答对无回答分但可得证据分；证据示例同理。得分后看示例不扣分。关键句解释的Why影响范围与README一致；普通提示不影响分数。
4. **彩带位置与点击**：每个新奖励短暂显示顶部小彩带，约1秒结束；不遮挡原文、选项或主要按钮，鼠标、触摸及滚动不被拦截；没有声音、闪烁、强烈位移或自动推进。快速发生不同任务奖励时只有一个活动区域。
5. **清理**：彩带未结束时立即清空、换篇或切换模式。彩带消失，没有之后突然出现的旧奖励；确认取消时原进度保留。观察开发者工具活动定时器/DOM，不遗留装饰片。
6. **减少动态**：浏览器或系统打开prefers-reduced-motion后，新的分数及静态反馈仍出现，无彩带；完成徽章静态可见。页面打开期间改变设置，正在播放的彩带停止，后续奖励采用新设置。恢复动态后后续新奖励可以播放。
7. **写作完成**：六理解任务完成/跳过后，空白Submit Retelling停留；输入非空文字但未提交不算完成。提交后自查，所有项目均不勾也可点击I checked my retelling发徽章。文字质量、长度、拼写不产生评价。
8. **口头完成**：Tell It Aloud仅打开说明；点击I told it aloud才明确提交并进入自查。不申请麦克风。返回复述页无需重复录入文字，口头提交保留；确认自查后发同一文章徽章。
9. **真正徽章**：四篇分别显示Garden Care、Book Journey、Paper Second Chance、Rainwater Trail。使用例子或教师跳过后仍可获得。完成页显示You earned a badge!、主题名、You finished this practice!及当前Practice Points。没有满分要求，徽章不加分。
10. **绕过与重复**：教师直接导航或跳过到完成页无徽章；Teacher Model走到完成页也无。只提交复述和自查但漏掉理解任务也无。真正得到后Back/Review/再次进入不发第二枚或第二次彩带。
11. **模式与重置**：已有分数时Guided/Independent互换不减少。进入Teacher Model不加分；退出明确提示清除进度、points、badge，取消保留，确认同步清零。换篇、清空和刷新也重置；没有永久收藏或跨篇累计。
12. **焦点与朗读**：用键盘获得奖励，焦点只按原流程移到任务标题，不被彩带抢走。屏幕阅读器从同一反馈区域听到题目解释、+10及新总分；顶部积分不是第二个live区域，aria-hidden装饰不被朗读。完成页只进行一次当前状态播报；检查是否有浏览器实际产生的重复朗读，必要时调整。

## 首次GitHub上传准备检查

本次仅准备文件，不初始化、暂存、提交或上传Git历史，也不配置GitHub Pages。项目原先不是Git仓库，Git检查没有发现上层仓库；Git可用，GitHub CLI未检测到。没有修改全局Git配置，没有读取项目外文件或凭据文件。

再次执行本文列出的JavaScript语法、数据、静态隐私和状态测试，全部通过。仅在本项目目录内检查秘密格式、配置与生成文件、私人资料及路径：未发现疑似秘密、学生资料、虚拟环境、日志、临时文件或系统文件；文档个人绝对路径已替换为通用启动路径。新增 `.gitignore`，必要网页、文章和测试脚本保留，没有自动添加许可证。

使用HTML解析器及URL相对解析规则检查 `/reading-steps/` 子路径下四项资源路径，均指向本项目同名文件。没有站点根目录资源引用，没有运行或发布实际Pages网站。

匿名只读检查目标远程时发生DNS解析错误 `Could not resolve host: github.com`，所以无法核实远程历史或写权限；这不意味着仓库不存在。GitHub CLI不可用，且本次未读取任何凭据来验证登录。上传前必须再次核对远程；若发现任何历史，应停止，不用强制推送覆盖。需要认证时由使用者在本机Git客户端或凭据管理器完成，不将token发到聊天。

浏览器工具返回空清单，真实浏览器、视觉、焦点、辅助技术及部署验收均未执行。

## 质量边界

自动检查只验证数据及预先编写的代码规则；不验证阅读能力、教学效果、课程标准或Lexile。四篇文章仍需教师审核；新的分屏界面仍需真实浏览器验收。


## 彩带可见性修复（2026-10-12）

静态检查发现原容器在非固定的 header 中；反馈会聚焦任务标题，滚动后彩带可能留在屏幕外。原粒子仅 5×8px、下落 18px，进一步降低可见性。首次 +10 的调用链本身正常。现容器是 body 的唯一 `#celebration`，固定在视口右上方，160×64px、z-index:100，无背景；粒子 7×11px、下落 44px，CSS 动画 1 秒，1100ms 兜底清理。容器及粒子不接收指针，不占布局、不接收焦点；父元素无 overflow:hidden 或 transform 裁切，容器自身裁切边界容纳粒子轨迹。

本次实际通过 `node test-state.js`、`node validate.js` 和全部 JavaScript 的 `node --check`，以及 `git diff --check`。状态测试直接包装真实 `celebrations.play()`：首次奖励调用一次并创建九个粒子，重复检查不再调用；Teacher Model 和教师跳过不调用。既有测试继续覆盖答案披露、积分上限、徽章、减少动态及旧回调清理。

本次没有运行真实浏览器视觉测试。DOM/定时器替身不能确认真实绘制、滚动、遮挡或设备的动态偏好；视觉动画仍需人工验证。浏览器内执行以下步骤：

1. 打开项目的 `index.html`，刷新。开发者工具 Console 执行 `document.querySelectorAll('#celebration').length`，应为 1；执行 `matchMedia('(prefers-reduced-motion: reduce)').matches` 查看实际偏好。
2. 正常动态测试：在浏览器开发者工具 Rendering 中将 prefers-reduced-motion 模拟为 `no-preference`（或关闭系统减少动态），选择 A Sign for the Garden / Guided Practice，Clear This Practice 并确认。
3. 点击开始阅读后的主按钮，进入 What 题。选择 “Maya used a sign to help protect a new garden.”，先把页面滚到头部离开视口，再点击 Check。应获得 10 分，反馈显示 “Nice work! +10 points”，视口右上方九个彩带短暂下落，约 1 秒消失。也用约 375px 宽的手机视口重复测试。
4. 点击 Back，再次 Check 同一正确答案：仍为 10 分，无新彩带。首次检查时用键盘操作，确认焦点仍在任务标题，随后 Tab 能正常移动；动画期间按钮仍可点击，内容无跳动。
5. Clear This Practice 后，先选错误答案并 Check，经提示中的 More Help / 示例入口查看对应答案，再回题选正确答案检查：对应任务不加分、无彩带。另行测试 Teacher Model，以及 Teacher Settings → Skip Current Task，均不因该操作加分或播放彩带。完成徽章的既有独立庆祝规则保留。
6. 模拟 `reduce`，清空后重复步骤 3：仍加 10 分，静态 “Nice work! +10 points” 清楚出现，无彩带。这是预期行为，不应强制播放动画。恢复 `no-preference` 后检查另一项尚未奖励的任务，应可播放；同一已奖励任务不会补播。


## 奖励呈现升级（2026-10-12，取代上节的尺寸和时长）

当前彩带为 24 个 10×16px 粒子、四种柔和颜色，固定在视口右上方 224×72px 范围，CSS 动画 2 秒、2100ms 兜底清理。彩带不占布局、不接收指针、不接收焦点、不推进步骤。根据当前问题、答案、按钮和文章的屏幕矩形裁切彩带，滚动和调整窗口时重新计算，避免粒子覆盖阅读内容；空间不足时可见粒子会减少。动画结束、清空、切换文章或模式时清理粒子、动画监听、临时滚动/resize 监听与定时器。

新增真正的按钮 `Sound: Off` / `Sound: On`，同步 aria-pressed，沿用可见键盘焦点样式。默认关闭；仅明确点击打开后创建/解锁 AudioContext，开关本身无声音。用本地正弦波、低音量和渐入渐出合成音效：单题约 0.29 秒、徽章约 0.58 秒。无音频文件、网络、存储、录音或麦克风权限。播放结束释放节点和 ended 监听；关闭、清空、切换文章和模式时停止节点、关闭 context，恢复 Off；待完成的 resume 回调不能在重置后播放。

声音仅用于开启之后的首次独立奖励；答错、提示、示例、重试答对、跳过后回题和重复检查保持静音。重试仍按原规则获得积分和彩带。徽章声音仅在六项均独立获分且未披露/跳过时播放一次；其他路径仍按原规则获得徽章和原有视觉庆祝。Teacher Model 无奖励声音。减少动态仅禁止视觉动画，不影响已开启的声音、静态奖励文字、积分或徽章。

本次实际检查：`node test-state.js`、`node validate.js`、五个 JavaScript 文件的 `node --check`、`git diff --check`。新增状态检查包括首次/重复庆祝、24 粒子及清理时限、裁切几何、默认静音、明确开启、单题/徽章一次性音效、错误/重试/示例/跳过/Teacher Model 静音、减少动态、节点和监听清理、API 缺失、构造/节点/启动异常、resume Promise 拒绝及重置后的迟到回调。测试使用 DOM、定时器和 Web Audio 替身，**未进行真实浏览器动画或听音测试**。

### 手动验证

1. 打开 `index.html` 并刷新，确认 `Sound: Off`。设置花园文章 / Guided Practice，系统或 DevTools Rendering 的 prefers-reduced-motion 为 no-preference。开始 What 题，选 “Maya used a sign to help protect a new garden.”，点击 Check：加 10 分、静态成功文字可见、右上彩带约 2 秒，无声音；没有自动进入下一题。Back 后再次 Check 无新增庆祝或分数。
2. 分别在桌面、375px 手机视口和放大文字下测试。将头部滚出视口后答题，动画中继续滚动/调整窗口，确认粒子清楚且不覆盖问题、答案、主要按钮或左侧文章；按钮可点击、内容不跳动。空间不足时局部粒子应被裁切。
3. 清空后用 Tab 聚焦 Sound 按钮，确认明显焦点；用 Space 或 Enter 开启，确认文字 On 和 aria-pressed=true，开启动作不响。首次正确 Check 应有轻柔短提示音；选择答案、答错、提示、示例和重复检查无声音。答错后重试正确仍按原规则加分，但不响。关闭后后续奖励不响。
4. 清空、重新开启声音，独立完成六项答案/证据任务、提交自己的复述并确认自查：首次徽章有不超过 0.8 秒的短音效；返回自查再确认不重复播放。分别用 Teacher Model、跳过和答案示例路径完成，确认无对应成功音效，徽章资格保持原规则。
5. 将 prefers-reduced-motion 改为 reduce，清空后首次独立答对：无彩带，仍显示 “Nice work! +10 points” 并加 10 分；完成时徽章仍可见。声音若明确开启仍可播放。动画期间切为 reduce 应立即终止彩带。
6. 将浏览器标签页/站点静音，或阻止声音播放，再开启 Sound 并获得奖励：可无声音，不应出现错误或影响分数、状态、徽章。解除静音后检查另一项尚未奖励的任务；已奖励任务不会补播。开发者工具可观察浏览器是否让 AudioContext 保持 suspended。
7. 声音 On 且正在庆祝时，Clear This Practice 并确认，或切换文章并确认：立即停止残留效果，按钮恢复 Off。下一次奖励只显示视觉庆祝；刷新也恢复 Off。切换模式同样停止残留并关闭声音；取消清空/文章切换确认则保留当前练习。
8. Network 面板确认音效不加载任何音频资源；页面不请求麦克风权限。控制台检查无未处理的音频错误。听感、浏览器权限行为及真实视觉遮挡需人工确认，状态测试不代表这些项目已通过。
