# 预览数据 → 正式数据来源矩阵（Preview → Production data matrix）

- 分支：`obai-redesign-review` · 基线 HEAD `4f084e8`（公开预览 `OBCI-preview@93b6b17`）+ 本轮（2026-09-02 第四轮）工作区修改（未提交）
- 远程项目：`gmglssmdrsackqgkqdbu`（本轮**只读**核对，未执行任何迁移、数据更新或 Storage 上传）
- 结论先行：**当前预览不能直接合并到生产。** 正式 workflow（`.github/workflows/deploy-pages.yml`）不设置 `NEXT_PUBLIC_DESIGN_FIXTURES` / `NEXT_PUBLIC_PREVIEW_DEPLOYMENT`；两份 2026-09-02 迁移尚未应用；远程还存在 6 份本地没有镜像的迁移。若现在合并，§4 列出的页面会退回旧数据或缺失内容。

## 1. 三种构建的取数方式

| 构建 | 环境变量 | 数据来源 | 表单 |
|---|---|---|---|
| 正式站（Pages CI，`main`） | `STATIC_EXPORT=1`、`NEXT_PUBLIC_BASE_PATH=/OBCI`、`NEXT_PUBLIC_SITE_URL` | 仅远程 Supabase 现有行；fixtures 完全惰性 | 启用（HTML 层） |
| 公开审查预览（OBCI-preview 仓库 workflow） | 上述 + `NEXT_PUBLIC_PREVIEW_DEPLOYMENT=1` + `NEXT_PUBLIC_DESIGN_FIXTURES=1` | 远程现有行 + `src/lib/fixtures/design-review.ts` 补缺 | 全部禁用（`fieldset disabled` + `method=post` + `preventDefault`），全站 noindex + 横幅；法律草稿带「内部审查草稿 · 尚未生效」标识；未确认联系方式**不显示** |
| 本地内部审查（`PREVIEW=1 scripts/build-static-preview.sh`） | 上述 + `NEXT_PUBLIC_INTERNAL_REVIEW=1` | 同上 | 同上，另外未确认的联系方式以「待商会确认」标识显示，供本地核对；该标志不在任何部署 workflow 中设置 |
| 本地 Node 开发（`npm run dev`） | `.env.local` | 远程现有行（迁移前状态），含后台 | 正式逻辑；无 preview 标志时按生产处理（法律草稿不显示，未确认联系方式不显示） |

**静态输出检查**：`node scripts/check-static-output.mjs out [--preview]`（`npm run check:static`）。`scripts/build-static-preview.sh` 与正式 Pages workflow 在 `next build` 后自动执行；发现未解析模板变量（`{count}`、`{{x}}`、`${x}`——扫描 `<title>`、meta description、Open Graph/Twitter、JSON-LD 字符串与可见标记含属性）、标题层级/元数据缺陷、禁用占位文案或（预览）未禁用的表单即**构建失败**。纯函数在 `scripts/lib/html-checks.mjs`，回归测试 `tests/html-checks.test.mjs`（2026-09-02 公开预览曾在 12 个行业详情页 meta description 泄漏 `{count}`，旧检查只扫描固定占位词而漏检）。`OBCI-preview` 仓库的 workflow 尚未加入该步骤，下次更新预览快照时须同步。

数据驱动的**确认门控**（`src/lib/review.ts`）在所有构建中一致生效：`site_settings.contact.confirmed_fields`（联系方式逐项确认，**不再从任何旧标志推断**）、`site_settings.review.confirmed_modules`（如 `partners`）、`site_settings.legal.<doc>_version`（章程/条款/隐私/无障碍逐份批准；三份同意文件齐全后在线申请才开放，`_v2` RPC 服务端同样校验）。远程目前均不存在这些键 → 未确认内容在任何构建中都不作为已确认展示。

## 2. 逐项矩阵

| # | 预览内容（fixture 导出） | 对应 Supabase 表 / `site_settings` key | 对应迁移 | 是否需上传 Storage | 正式部署前动作 | 商会资料状态 |
|---|---|---|---|---|---|---|
| 1 | `FIXTURE_VISION` 愿景 | `site_settings.vision` | `20260902121000` §3 | 否 | 应用 §3 | **已确认**（DOCX 原文）；英文为译稿 |
| 2 | `FIXTURE_PILLARS` 四大实践支柱 | `site_settings.pillars` | `121000` §3 | 否 | 应用 §3 | **已确认**（DOCX）；英文译稿 |
| 3 | `FIXTURE_MEMBER_BENEFITS` 六项基础权益 | `site_settings.member_benefits` | `121000` §3 | 否 | 应用 §3 | **已确认**（DOCX） |
| 4 | `FIXTURE_REVENUE_NOTE` 盈利模式小字 | `site_settings.revenue_note` | `121000` §3 | 否 | 应用 §3 | **已确认**（DOCX）；是否公开由商会决定 |
| 5 | `FIXTURE_BANNERS`（仅 Banner 1） | `site_settings.banners` | `121000` §3 | Banner 2/3 需图片素材 | 应用 §3；Banner 2/3 待素材 | Banner 1 = DOCX 愿景；**Banner 2/3 未确认** |
| 6 | `FIXTURE_ORG_STRUCTURE` 组织架构单元 | `site_settings.org_structure` | `121000` §3 | 否 | 应用 §3 | 单元名称来自 DOCX；**无人员**；委员会/秘书处说明文字**待提供** |
| 7 | `FIXTURE_GALLERY` 图集（6 张） | `site_settings.gallery` → `media` 桶已有对象（`events/*.jpg`、`news/*.jpg`） | `121000` §3 | 否（图片已在桶内，且已在现网公开） | 应用 §3；商会确认可继续使用 | 图片=协会已公开的新闻/活动封面；图注/链接由已发布行解析，无自撰文案。**授权状态待商会确认** |
| 8 | `FIXTURE_CHAPTERS` 六大行业（仅名称） | `industry_chapters`（新增 6 行）+ 10 行旧分会 `is_active=false` | `121000` §6、§7 | 封面图（可选）待提供 | 应用 §6/§7 | 中文名 **已确认**（DOCX）；英文名为译稿**待确认**；行业介绍、代理商/渠道、专家顾问、认证信息、行业专项服务**全部待商会提供**（本轮已删除自撰简介与大健康介绍） |
| 9 | `FIXTURE_CHAPTER_NEWS_SLUGS` / `FIXTURE_CHAPTER_EVENT_SLUGS` 大健康↔3 篇报道 + 1 场论坛（**演示关联**，预览中带「演示关联／待确认」说明） | `news.tags`、`events.tags`（结构与 CMS 编辑器保留） | `20260902120000` 仅新增 `events.tags` 列；**不再有任何迁移写入归属** | 否 | 商会确认后在后台勾选行业标签 | 内容为真实已发布行；**归属待商会决定，正式模式不依赖此推断** |
| 10 | `FIXTURE_ABS_ITEMS` ABS 四大板块明细与一句话概述 | `service_offerings.items_zh/en`、`summary_zh/en` | `121000` §5 | 否 | 应用 §5 | **已确认**（DOCX 明细；概述=DOCX 明细拼接，替换了远程原有的自撰概述）；手册多出的项目（澳洲公司注册/投资架构、渠道建设、商务考察、政府采购、仓储物流、客户服务体系、政府补贴申请辅导、国际资本对接）已裁去，待商会决定是否恢复 |
| 11 | `FIXTURE_PORTRAITS` 六位领导头像（`public/portraits/*.jpg`，自手册 PDF 第 3 页提取） | `leadership.portrait_path` | `121000` §8 | **是**：上传 6 张到 `media/leadership/<slug>.jpg`，须在 §8 之前 | 上传 → 应用 §8 → 只读验证 6 个对象 | 人物/头衔=手册第 3 页；**头像网络使用授权待确认**。现网 `/images/leadership/*.jpg` 本就是坏链 |
| 12 | `FIXTURE_MEMBERSHIP_NAME_OVERRIDES` 五级会员确认口径 | `membership_types.name_zh`（`corporate-group`→企业顶级会员、`small`→**小型企业会员**）、`name_en`（`small`→**Small Enterprise Member**）、`turnover_zh`（`individual`→自然人创业者） | `121000` §4 | 否 | 应用 §4 | 中文 **已确认**：顶级会员与自然人创业者出自 DOCX 会费表；第四档按所有者 2026-09-02 确认口径为「小型企业会员」（DOCX 会费表原文印作「小微企业会员」，以确认口径为准，代码/迁移/文档已统一；远程 `small` 行中文现值本就是「小型企业会员」）。第四档英文名按所有者 2026-09-03 确认为 **Small Enterprise Member**（远程现值 `Small Company Member`，预览构建经 fixture 覆盖，正式构建在 §4 应用前仍显示远程现值；不得出现任何含 Micro 的版本）；其余四档英文名**待确认**。会费显示格式已确认：中文 `A$480／年 … A$4,980／年`，英文 `A$480/year … A$4,980/year`（`src/lib/utils/fee.ts` + `membership.perYear`；结构化数据仍用 `AUD`） |
| 13 | 品牌口径 OBAI | `site_settings.identity` | `121000` §1 | 否 | 应用 §1 | **已确认**（DOCX） |
| 14 | 联系方式（无 fixture；远程行已有 Docklands + Queen St + `info@obai.com.au` + Maggie Liu 等） | `site_settings.contact`（`confirmed_fields`，后台可逐项确认并编辑全部值） | `121000` §2 仅初始化 `confirmed_fields: []`，**不写入任何联系方式值** | 否 | 商会确认统一口径后在后台填写并勾选 | **邮箱、电话、传真、地址、微信、会员咨询人（Maggie Liu / Joanne Chen）全部未确认**；手册出现不等于商会确认。公开预览与正式站不显示；仅本地内部审查带「待商会确认」标识显示 |
| 15 | 合作机构文字墙（远程 `partners` 13 行，手册第 5 页名单） | `partners` + `site_settings.review.confirmed_modules` | `121000` §3（`confirmed_modules: []`） | 否 | 商会确认后加入 `partners` | **未确认**（用户明确列为未确认关系陈述） |
| 16 | 使命 / 核心价值观 / 战略委员会说明 / 秘书处说明 | `site_settings.mission`、`core_values`、`strategy_committee`、`secretariat` | 未 seed（有意留空） | 否 | 商会提供后在后台填写 | **待提供**（DOCX：核心使命、核心价值观"补充"；手册第 2 页有 OBC 旧版可供参考） |
| 17 | 法律文本（章程 / 条款 / 隐私 / 无障碍声明） | `site_settings.legal.{constitution,terms,privacy,accessibility}_version`（+ 可选 `constitution_url`）+ 四个页面正文 | 未 seed | 否 | 商会/法务提供正式文本 → 替换页面 → 后台填版本号 → 页面公开、进入 sitemap、在线申请自动开放（页面门控 + RPC `_v2` 服务端同样校验版本号） | **待提供**。草拟稿**仅在审查预览环境**显示并标注「内部审查草稿 · 尚未生效」；正式模式显示「该文件尚未发布」且 noindex；`/constitution` 页面无草稿，任何环境均为「尚未发布」 |
| 18 | 入会申请表单 v2 | `membership_applications` 新列 + RPC `submit_membership_application_v2` | `120000` | 否 | 应用 `120000` → `generate_typescript_types` → 去掉 `as any` | 表单结构已确认（DOCX/手册） |
| 19 | 行业详情模板扩展列 | `industry_chapters.experts_*`、`certifications_*` | `120000` | 否 | 应用 `120000` | 数据待提供 |
| 20 | 资讯中心五个一级分类（DOCX §资讯中心；`DOCX_NEWS_CATEGORIES` in `src/lib/news/categories.ts`）：商会动态 / 中澳经贸政策 / 行业市场资讯 / 出海实操指南 / 活动预告回顾 = Association News / China–Australia Trade Policy / Industry & Market Insights / Market Entry Guides / Event Previews & Recaps | `news_categories`：新列 `is_active`；按 slug upsert 五类名称与排序（`association-news`、`policy-insights`、`market-insights`、`going-global`、`events-coverage`，slug 不变故文章链接不变）；`trade-cooperation`（中澳经贸合作 / Trade & Cooperation）**不删除**，标 `is_active=false` 为历史分类 | `20260902122000` | 否 | 应用 `122000` → 商会确认两篇「中澳经贸合作」文章的归属后在后台重新归类 | 五类中文名 **已确认**（DOCX）；英文名为所有者 2026-09-02 给定口径。预览与正式都始终显示五个页签（无文章显示 0 与空状态，不虚构文章）；历史分类的 2 篇文章保留在「全部文章」并标「历史分类待整理」。**`122000` 应用前** CMS 无法表达"历史分类"（无 `is_active` 列），因此任何构建都套用 DOCX 结构（五类、DOCX 名称、其余为历史分类）；**应用后**以 CMS 的 `is_active` 与名称为准，仅预览构建继续强制 DOCX 结构 |

## 3. 远程现状（2026-09-02 只读核对）

- 已应用迁移 12 份，最新 `20260827151831`；本地 `supabase/migrations/` 仅有 6 份 + 2 份未应用的 `20260902*`。**缺失本地镜像**：`20260827133617`、`134009`、`134121`、`134217`、`143422`、`151831`（它们创建了 `company_address/fax/mobile/company_intro/directory_consent/agreed_terms/agreed_marketing`、`membership_types.turnover_*`、`partners.kind/region` 等）。合并前应 `supabase db pull` 补齐镜像。
- `site_settings` 现有键：`bank`、`contact`、`home_hero`、`identity`（OBC 口径）、`membership`、`partner_routes`、`stats`。无本轮任何新键。`stats`/`home_hero` 为 OBC 时代残留、无消费者。
- `industry_chapters`：10 行旧分会全部 `is_active=true`；六大行业 0 行。
- `leadership`：7 行（手册 6 人 + Diana Lin，后者来源为协会已发布新闻）；`portrait_path` 均指向不存在的 `/images/leadership/*.jpg`。
- `news_categories`：6 个分类（商会动态、中澳经贸合作、中澳经贸政策、行业市场资讯、出海实操指南、活动预告回顾），无 `is_active` 列；`中澳经贸合作` 不在 DOCX 五类之内，其 2 篇文章（辽宁贸促会访问、台州代表团访问）待商会决定归属——见矩阵第 20 行与迁移 `20260902122000`。
- `news`：7 篇已发布，`tags` 全空；`events`：2 场，无 `tags` 列。
- `media` 桶：9 个对象（7 篇新闻封面 + 2 场活动封面）；无 `leadership/`。
- RPC：仅 v1 `submit_membership_application`；`_v2` 不存在。

## 4. 如果现在合并到 `main`（不应用迁移、不设 fixtures）会怎样

| 页面 | 结果 |
|---|---|
| 首页 | 轮播退化为静态 i18n 首屏（正常）；**愿景+四支柱区块消失**（无 `vision/pillars` 键）；**行业卡片显示 10 个旧 OBC 分会**；ABS 明细显示手册全量项目（非 DOCX 裁剪版）；**会员权益区块消失**；荣誉顾问头像为坏链；合作机构墙因确认门控隐藏 |
| 关于 OBAI | 愿景、支柱、组织架构图、图集全部隐藏（键不存在）；使命/价值观本就隐藏；领导团队文字正常 |
| 行业分会 | 显示 10 个旧分会（含旧简介/资源/服务文案）；`/chapters/<六大行业 slug>` 全部 404 |
| 会员服务 | ABS 手册全量明细；五级会员正常，但顶级会员显示"集团公司会员" |
| 加入我们 | 因 `legal` 未批准，表单被"在线申请暂未开放"卡片替代（本轮新增门控，避免调用不存在的 v2 RPC） |
| 资讯中心 | 正常；无行业标签（`tags` 全空）；`122000` 应用前代码套用 DOCX 结构：五个页签（含 0 篇的空状态）、DOCX 中英文名，「中澳经贸合作」为历史分类并在文章上标「历史分类待整理」 |
| 活动展会 | 正常；分会关联活动隐藏（无 `events.tags`） |
| 联系我们 / 页脚 | 仅显示"澳大利亚 · 墨尔本"（DOCX：墨尔本创立）；邮箱、地址、电话、微信、会员咨询人均待确认，不显示 |
| 条款 / 隐私 / 无障碍 / 章程 | 均显示"该文件尚未发布"且 noindex；不进入 sitemap |
| 领导团队 | 头像坏链（现网既有缺陷） |

## 5. 正式部署前必须执行的顺序

1. 商会提供：六大行业内容包、使命与核心价值观、委员会/秘书处说明、正式法律文本（章程/条款/隐私）、统一联系方式、合作机构确认、Banner 2/3 素材、英文行业名与顶级会员英文名确认。
2. `supabase db pull` 补齐 6 份远程迁移镜像并评审。
3. 上传 `public/portraits/*.jpg` → `media/leadership/`（6 个对象）。
4. 应用 `20260902120000` → `20260902121000` → `20260902122000`（顺序不可颠倒）→ `get_advisors` 巡检 → 只读验证 → `generate_typescript_types` → 删除 `as any` 与可选列兜底（含 `news_categories.is_active` 的手写类型）。
5. 在后台填写：`legal.*_version`（法务批准后；填写前 `_v2` RPC 与页面都会拒绝申请）、联系方式各值及 `contact.confirmed_fields`（后台已可编辑地址/第二地址/电话/传真/手机/邮箱/微信/会员咨询人）、`review.confirmed_modules`、使命/价值观等文本、新闻与活动的行业标签、两篇「中澳经贸合作」历史分类文章的重新归类（后台分类编辑器可将任一分类设为历史分类）。
6. 替换三个法律页面草拟稿为正式文本。
7. 正式 workflow 保持不设 `NEXT_PUBLIC_PREVIEW_DEPLOYMENT` / `NEXT_PUBLIC_DESIGN_FIXTURES`；fixtures 文件随之惰性，可在确认后删除。
8. v2 表单上线后，撤销旧 RPC `submit_membership_application`（v1）对 `anon` 的执行权限：它不记录任何同意项，现网旧表单停用后不应再可匿名调用。
9. 由商会决定：领导简介中的"OBC"旧称是否改写为"协会/OBAI"（简介为手册第 3 页原文，属历史口径）——并入下节。

## 6. 待商会确认：历史新闻与活动中的机构名称（2026-09-02 新增，本轮**未做任何全局替换**）

已发布的新闻、活动与领导简介（均为远程 CMS 现有内容）同时出现以下名称：

| 名称 | 出现位置（构建期快照） |
|---|---|
| OBAI／大洋洲工商协会 | 全站导航、页脚、JSON-LD 与新版页面文案 |
| OBC／Oceania Business Council | 英文新闻正文 5 篇、中文新闻正文 3 篇（`obc-delegation-visits-liaoning-ccpit`、`oceania-business-council-2026-agm-melbourne`、`taizhou-delegation-visits-melbourne-cooperation` 等；`acbca-chinese-new-year-networking-event` 与 `melbourne-australia-china-health-expo-tcm-forum-2025` 两篇中英文均不含 OBC）；领导简介（手册第 3 页原文） |
| 大洋洲商业理事会 | 中文新闻正文 2 篇（辽宁贸促会访问、台州代表团访问）；台州一篇的标题另通过「更多资讯」「置顶资讯」列表出现在其他页面 |
| 大洋洲商业总会 | 中文新闻标题「大洋洲商业总会2026年年度会员大会在墨尔本成功举行」（并因此出现在各页「更多资讯」列表与首页） |
| 大洋洲工商业理事会 | 中文新闻 `melbourne-australia-china-health-expo-tcm-forum-2025` 正文（英文对应 "Oceania Business & Industry Council"） |
| 大洋洲工商业委员会 | 中文新闻 `7th-world-traditional-medicine-forum-melbourne` 的摘要（"大洋洲工商业委员会为承办单位之一"）、承办单位名单与"大洋洲工商业委员会秘书处"联系行（含一个 gmail 邮箱），摘要随之出现在资讯列表；另见 `site_settings.contact.wechat_zh`（"微信公众号：搜索「大洋洲工商业委员会」"，属未确认联系方式，正式与公开预览均不显示） |
| ACBCA／澳中工商业协会（Australia-China Business and Commerce Association） | 新闻 `acbca-chinese-new-year-networking-event`（中英文正文），其标题另出现在资讯列表与「关于」页新闻列表；`world-traditional-medicine-forum-preparatory-meeting` 英文正文提及 "Australia-China Business Council" |

请商会逐项答复：

1. 上述哪些是协会的历史名称或旧译名（例如 OBC／大洋洲商业理事会／大洋洲商业总会／大洋洲工商业理事会／大洋洲工商业委员会是否均指本会）？
2. 哪些是不同的合作机构（例如 ACBCA／澳中工商业协会、Australia-China Business Council 是否为独立机构）？
3. 历史新闻是否保留发布当时使用的名称（不改写原文）？
4. 是否需要在历史新闻或领导简介中增加「现 OBAI」或「协会历史名称」的说明（若需要，以何种形式：文首注释、括注或页脚说明）？
5. 以 ACBCA 名义发布的新闻（新春商务联谊会）是否继续保留在 OBAI 网站？

在收到答复前，站点保持原文，不做替换、不加注释；微信公众号名称随联系方式一并待确认。
