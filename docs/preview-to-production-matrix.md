# 上线记录：2026-09 正式发布（Launch record — September 2026）

> 本文件原为「预览 → 生产数据来源矩阵」，网站上线后改写为**上线记录**：写明这一轮到底发布了什么、由哪几份迁移写入、之后每类内容在哪里维护、图片放在哪里，以及商会仍欠的编辑事项。路径保持不变，旧链接依然有效。
>
> - 分支：`obai-redesign-review` · 品牌 **OBCI／大洋洲工商业委员会／Oceania Business Council**（法定名 Oceania Business Association Incorporated 仅用于法务内容）
> - Supabase 项目：`gmglssmdrsackqgkqdbu`
> - 部署：**Vercel**（项目 `obci-website`，2026-09-10 迁入），以完整 Next.js 应用运行——后台 CMS、登录、Server Actions 与 Stripe webhook 均可用，公开页每 5 分钟 ISR revalidate，后台改动无需重新部署即可上线。推送 `main` 自动构建并发布。
> - GitHub Pages 静态导出（`https://shangkuanlyu.github.io/OBCI`）降级为**备用**：`.github/workflows/deploy-pages.yml` 只保留手动触发，不再随推送或定时发布（两份自动发布的副本会各自漂移）。该构建剥离了后台与鉴权。
> - **审查脚手架已全部移除**：预览部署、审查横幅、「待商会确认」标记、`ReviewNote`、设计 fixtures、法律草稿提示、`public/preview-media` 均不再存在。上线后**数据库是唯一事实来源**。

## 1 · 本轮发布了什么

| 内容 | 数量 / 口径 | 存放位置 |
|---|---|---|
| 品牌 | OBCI · 大洋洲工商业委员会 · Oceania Business Council（导航、页脚、标题模板、JSON-LD、OG 图、Logo） | `site_settings.identity` + `public/brand/`、`public/og/` |
| 专业分会 | 9 个（教育、建筑、地产、高端人才与博士创新、商业服务、堪培拉、文化交流与艺术发展、科技创新创业、大健康产业）；`study-migration` 归档 | `industry_chapters` |
| 领导团队 | 15 行：执委会 5、荣誉主席 4、秘书处 6 | `leadership` |
| 执委会议员 | 19 人名录 | `site_settings.council` |
| 关于页区块 | 愿景、使命、四大核心价值观、宗旨 5 条、会员权益 6 条、2025 回顾与 2026 展望、四大实践支柱、盈利模式说明、组织架构 5 单元、秘书处说明 | `site_settings.vision / mission / core_values / objectives / member_benefits / outlook / pillars / revenue_note / org_structure / secretariat` |
| 首页 Banner | 3 条（愿景、九大专业分会、五级会员），全部启用 | `site_settings.banners` |
| 会员等级 | 5 档：Corporate Member／Large／Medium／Small Company Member／Individual Member（企业顶级／大型／中型／小型企业会员／个人会员） | `membership_types` |
| 联系方式 | 已发布：总部地址、电话、邮箱、会员咨询人（Meggie Liu）——均取自商会 2026 英文手册 | `site_settings.contact`（`confirmed_fields` 全选） |
| 缴费信息 | 电汇户名／银行／BSB／账号、支票抬头、信用卡联系秘书处 | `site_settings.bank` |
| 合作机构墙 | 13 行，已发布 | `partners` + `site_settings.review.confirmed_modules` |
| 法律文本 | 使用条款、隐私政策（两份**政策**）+ 无障碍声明，版本号统一 `2026-09` | `site_settings.legal` + 各页面正文 |
| 章程 | **不在线发布**：协会治理文件，由秘书处按申请提供（与纸质入会表一致）。`/constitution` 页面说明取得方式，无版本号，因此保持 noindex | `src/app/[locale]/(site)/constitution` |
| 新闻 | 8 篇（7 篇新增 + 年会官方全文替换旧译稿），全部已发布 | `news`（源稿 `content/news/*.md`） |
| 文章照片 | 3 篇带图，共 43 个 JPEG（含 3 张 2:1 封面裁切），随仓库发布 | `public/news-media/<slug>/` |
| 领导头像 | 6 张，随仓库发布 | `public/portraits/<slug>.jpg` |

**入会门控**：在线申请要求 `legal.terms_version` 与 `legal.privacy_version` 齐备（两者均为 `2026-09`，故表单开放）；申请人另需勾选「愿遵守协会章程」的承诺项——章程本身不在线发布。

## 2 · 已应用的四份迁移（顺序不可颠倒）

| 顺序 | 迁移 | 作用 |
|---|---|---|
| 1 | `20260902120000_application_form_v2.sql` | 结构：入会申请表 v2 字段与 RPC `submit_membership_application_v2`、`industry_chapters.deputy_secretary_general` 等模板列、`leadership.group_key` CHECK 扩展（executive／honorary）、`events.tags` |
| 2 | `20260902121000_obai_rebrand_content_seed.sql` | 数据：品牌、联系方式、关于页区块、Banner、组织架构、议员名录、9 个分会、15 位领导与头像路径、5 档会员、ABS 服务项、既有新闻／活动标签、`legal` 与 `review` 门控键 |
| 3 | `20260902122000_news_categories_docx.sql` | 资讯五个一级分类 + `trade-cooperation` 转为历史分类 |
| 4 | `20260910120000_v2_news_content.sql` | 8 篇文章（由 `scripts/content/build-news-seed.mjs` 从 `content/news/*.md` 生成，勿手改 SQL） |

迁移应用后需重新生成 `src/types/database.types.ts`（另一轨负责）。第 4 份**不需要**任何 Storage 上传：照片随仓库发布。

## 3 · 上线后在哪里改内容

| 内容 | 维护位置 |
|---|---|
| 新闻、活动、分会、领导、合作机构、图集 | 后台 CMS（正式站 `/zh/admin`，用商会管理员账号登录）。改动最多 5 分钟内自动生效（ISR revalidate），无需重新部署 |
| 品牌、联系方式、关于页各区块、Banner、议员名录、秘书处、缴费信息、法律版本号 | 后台 CMS「站点设置」模块（写入 `site_settings`，合并保存） |
| 会员等级名称、门槛、权益 | 后台 CMS 会员模块（`membership_types`） |
| 法律正文（条款／隐私／无障碍／章程页说明） | 仓库内页面源码；改动后在后台更新对应版本号 |
| 已发布文章的正文 | 后台 CMS。`content/news/*.md` 与 `20260910120000` 仅是**上线种子**，不再回写；如需重放种子，先确认不会覆盖 CMS 之后的编辑 |

## 4 · 图片约定

- **随仓库发布的素材**：文章照片 `public/news-media/<slug>/NN.jpg`（封面 `cover.jpg`，2:1 居中裁切）、领导头像 `public/portraits/<slug>.jpg`。数据库中以**前导斜杠**路径引用（`/news-media/<slug>/01.jpg`、`/portraits/bruce-atkinson.jpg`），`imageUrl()`（`src/lib/utils/l10n.ts`）据此当作站点资源解析并补上 base path。
- **CMS 上传的素材**：仍走 Supabase `media` 桶，数据库存储**无前导斜杠**的对象路径（`news/<slug>/x.jpg`），`imageUrl()` 解析为公共 Storage URL。两种写法可以共存，靠前导斜杠区分。
- 静态构建的 strip 步骤**不得**删除 `public/news-media` 与 `public/portraits`（它们是站点资源，不是审查素材）。

## 5 · 构建与检查

| 场景 | 命令 |
|---|---|
| 本地开发（含后台） | `npm run dev` |
| 本地生产形态静态构建 | `bash scripts/build-static.sh` → 产物 staged 到 `$TMPDIR/obai-preview-site`，用 `node scripts/pages-preview-server.mjs` 在 `http://localhost:4173/OBCI/` 浏览 |
| 静态输出检查 | `npm run check:static`（`scripts/check-static-output.mjs out`）：未解析模板变量、标题层级、canonical/hreflang/OG/Twitter/JSON-LD、noindex 策略（仅未发布的法律文件与错误页可 noindex）、过期活动的 JSON-LD 状态、文章 `og:type`、禁用占位文案 |
| 正式部署 | 推送 `main` → Vercel 自动构建并发布（项目 `obci-website`）。环境变量只需 `NEXT_PUBLIC_SUPABASE_URL`、`NEXT_PUBLIC_SUPABASE_ANON_KEY`，绑定自定义域名后再加 `NEXT_PUBLIC_SITE_URL`；**不要**设置 `STATIC_EXPORT` 或 `NEXT_PUBLIC_BASE_PATH` |
| 备用静态站 | 在 Actions 页手动运行 `Deploy to GitHub Pages`（无后台、无鉴权） |

## 6 · 未了事项（商会仍欠的编辑工作）

1. **英文译文待商会审定**：中文来源区块的英文（愿景、使命、核心价值观、四大支柱等）与 8 篇文章的英文全文，目前均为编辑译稿，已随站点发布，待理事会自行复核。
2. **宁夏中澳商务对接交流会**：原稿只写「近日」，未给日期，文章因此使用站点发布日期（2026-09-10）作为 `published_at`；商会提供准确日期后请在后台更正。
3. **上海长宁行的年份**：稿件未注明年份，现取 2025，依据是照片文件名（2025-12-14）与紧邻的 12-11 北京行程；待商会确认。
4. **四篇文章没有照片**：农业大学 WaFi、保利艺术、丽水医药大会、中医药大健康年中酒会（宁夏对接会同样缺照片，见第 2 条）。保利与丽水两篇为短讯，正文亦待补全。
5. **Bruce Atkinson 的职衔**：发布为「会长 / President」（依 2026 英文手册与年会稿）；名录中另有 Hon. chairman 的写法，如需改口径在后台修改即可。
6. **旧文中的机构旧译名**：远程既有文章（Wix 英文稿的中文译文）中仍有 6 处旧译，如「大洋洲商业理事会」（辽宁贸促会访问、台州代表团访问）、「大洋洲工商业理事会」（澳中健康产品博览会）等；本轮**未做替换**，等商会决定统一口径后在后台修改。
7. Banner 素材：三条 Banner 中两条尚无配图（`image_path` 为空），商会提供图片后在后台补上。
