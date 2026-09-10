# 2026-09 新闻稿件来源与处理记录（News sources — September 2026 launch pack）

- 来源目录：`docs/support docs/V2/`（商会 2026-09-05 / 09-07 提供；**未跟踪、已在 `.gitignore` 中忽略**，其中含个人联系方式与银行资料，不得提交到公开仓库）。
- 稿件源文件：`content/news/<slug>.md`（上线种子的编辑源，扁平 front matter + `<!-- body:zh -->` / `<!-- body:en -->`）。
- 生成物（勿手改）：`supabase/migrations/20260910120000_v2_news_content.sql`。重新生成：`node scripts/content/build-news-seed.mjs`（`--check` 仅校验）。
- 图片：`scripts/content/prepare-news-media.py`（Pillow + olefile）从 DOCX/DOC 抽出，按文档顺序编号，长边 ≤ 1600 px、JPEG q82、去 EXIF；封面 `cover.jpg` 为 2:1 居中裁切。输出 `public/news-media/<slug>/`，**随仓库发布**：数据库中以前导斜杠路径引用（`/news-media/<slug>/NN.jpg`），`imageUrl()` 当作站点资源解析。**无需上传 Storage**；之后通过后台 CMS 上传的图片仍走 `media` 桶（无前导斜杠的对象路径）。
- 上线状态：8 篇全部已发布，`20260910120000` 已随其余三份迁移应用。此后文章正文在后台 CMS 维护，`content/news/*.md` 只是上线种子，不再回写。
- 英文全文均为译稿（依据商会中文原文），**待商会审定**；机构名在中文正文照录原文（大洋洲工商业委员会／OBC／大洋洲商会），英文统一为 Oceania Business Council。
- 微信公众号 5 条链接在开发环境被拦截无法读取，按文件名与内容与下列稿件对应；澳洲新报链接可读。

| # | slug | 中文标题（来源原文／拟题） | 事件日期 | 分类 | 行业标签 | 来源 | 图片 | 状态 / 待商会补充 |
|---|---|---|---|---|---|---|---|---|
| 1 | `oceania-business-council-2026-agm-melbourne`（已有行，更新） | 聚势谋远 共谱新篇 —— 大洋洲工商业委员会（OBC）2026年度会员大会盛大召开 | 2026-05-01（`published_at` 保留远程原值 2026-05-27） | 商会动态 | — | 大洋洲商会新闻(1).docx（官方全文） | 33 张，按原文顺序；封面取第 1 张 | 已发布（置顶）。替换原英文 Wix 稿译文；英文正文为官方中文稿译文。原文中「李扬／李杨」两种写法照录。 |
| 2 | `ningxia-ccpit-melbourne-business-matching` | 双向奔赴，共拓蓝海｜中澳商务对接交流会圆满落幕 | 原稿只写「近日」，未注明日期 | 活动预告回顾 | business-services | 双向奔赴…(1).docx（商会视角） | 无 | 已发布。**`published_at` 用站点发布日期 2026-09-10**（来源无日期，不虚构）；商会给出准确日期后在后台更正。待补现场照片。澳谧之泉版（公众号文章三）仅作核对。 |
| 3 | `shanghai-changning-visit-ai-manufacturing` | 大洋洲商会代表团长宁行：咖啡机器人、智慧港口与战略合作共绘合作新蓝图 | 2025-12-13（**年份为推断**：提炼稿写 2024-12-13，照片文件名 2025-12-14，紧接 12-11 北京行程） | 商会动态 | tech-innovation | 长宁行(1).docx | 3 张；封面取签约照（第 3 张） | 已发布。年份待商会确认；图注为编辑拟写。 |
| 4 | `shanghai-nanhongqiao-chamber-visit` | 大洋洲工商业委员会代表团访问上海南虹桥商会 共拓国际合作新空间 | 2025-12-05 | 商会动态 | — | 南虹桥…(1).doc（旧版 .doc，图片自 OLE Data 流抽出） | 4 张；.doc 无图片锚点，位置与图注为编辑安排 | 已发布。图片位置／图注待商会确认。 |
| 5 | `china-agricultural-university-wafi-cooperation` | 深化农食合作 共促健康未来：大洋洲工商业委员会与中国农业大学共商WaFi平台合作新篇章 | 2025-12-11 | 商会动态 | health | 农业大学(1).docx | 无 | 已发布。待商会补充现场照片。 |
| 6 | `beijing-poly-art-cultural-cooperation` | （拟题）大洋洲工商业委员会与保利艺术教育共商中澳人文艺术合作 拟共同策划2026年悉尼春节联欢晚会 | 2025-12-11 | 商会动态 | culture-arts | 新闻提炼(1).docx（约 180 字） | 无 | 已发布（短讯）。待商会补充全文与照片。 |
| 7 | `lishui-pharma-conference-ccpit-agreement` | （拟题）大洋洲工商业委员会率团参加第十九届成长型医药企业发展大会 与丽水市贸促会签署战略合作协议 | 2025-11-23 | 商会动态 | health | 新闻提炼(1).docx（约 200 字） | 无 | 已发布（短讯）。待商会补充全文与照片。 |
| 8 | `tcm-health-industry-promotion-mid-year-reception-2025` | （拟题）中医药大健康产业推荐会暨工商会年中酒会在墨尔本世贸中心举行 | 2025-08-08 | 活动预告回顾 | health | 澳洲新报 2025-08-12 报道（第三方，仅作事实依据，正文为自撰摘要，`source_url` 指向原文） | 无（报纸照片有版权，不使用） | 已发布。待商会提供自有稿件与照片。同日活动另作一条已结束活动记录（`events` 行 `tcm-health-industry-reception-2025`）。 |

## 未采用的稿件

| 文件 | 原因 |
|---|---|
| 公众号文章一(1).docx（台州代表团，澳谧之泉视角） | 远程已有 `taizhou-delegation-visits-melbourne-cooperation`；本稿含大量该公司宣传语，仅作细节参考，不发布（裁决 D3）。 |
| 公众号文章二(1).docx（年会，澳谧之泉视角） | 同一事件已用商会官方全文；照片重复，不发布。 |
| 公众号文章三(1).docx（宁夏对接会，澳谧之泉视角） | 同一事件已用商会视角稿；不发布。 |

## 已有文章的调整（随 `20260902121000` §9 一并应用）

- `7th-world-traditional-medicine-forum-melbourne`、`world-traditional-medicine-forum-preparatory-meeting`、`melbourne-australia-china-health-expo-tcm-forum-2025` → 行业标签 `health`。
- `taizhou-delegation-visits-melbourne-cooperation`、`obc-delegation-visits-liaoning-ccpit`：分类由「中澳经贸合作」（`122000` 起为历史分类）改为「商会动态」，以免上线后落在不作为页签的历史分类里；商会如有异议可在后台改回。
- `events.world-traditional-medicine-forum-2025` → 标签 `health`；新增已结束活动 `tcm-health-industry-reception-2025`（2025-08-08，墨尔本世贸中心）。

## 编辑规则摘要

- 中文正文照录来源（仅修正导出产生的空格／转义），历史机构名不改写、不加注；标题为来源原文；来源没有标题时由编辑拟题，在上表「中文标题」列以（拟题）标出。
- 摘要为编辑撰写（≤160 字／≤60 词），机构名用「大洋洲工商业委员会／Oceania Business Council」。
- 渲染器限制：段落、`##`／`###`、`- ` 列表、加粗、独占一行的 `![图注](路径)` 图片；无链接、有序列表、HTML。
- 静态检查器（`scripts/check-static-output.mjs`）禁止：`待补充`、`TODO`、`Lorem ipsum`、`X,XXX`、`$X,XXX`、`{字母…}`、`{{`、`${`；正文首个标题须为 `##`。
- 第三方报道只写事实摘要，不引用原句、不用其照片。
