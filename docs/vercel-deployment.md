# Vercel 部署指南

这份文档用于把原型发布到 Vercel，让团队成员通过链接访问。访问保护是出于隐私考虑：原型评审阶段通常包含未公开流程、字段和业务规则，建议用访问码限制访问范围。

## 推荐流程

推荐先把项目放到 GitHub，再用 Vercel 连接仓库。这样每次推送代码，Vercel 都可以自动重新部署。

整体顺序：

1. 本地执行 `npm run build`，确认原型可以构建。
2. 把代码提交并推送到 GitHub。
3. 在 Vercel 导入 GitHub 仓库并完成项目设置。
4. 如需内部评审访问保护，在 Vercel 环境变量中配置访问码。
5. 重新部署，让环境变量在新部署中生效。
6. 可选：如评审对象在中国大陆境内访问，按“评估是否需要 -> 购买或申请域名 -> 确定子域名 -> Vercel 添加域名 -> 域名服务商配置 DNS -> 等待校验 -> 访问 `/access` 验证”的动作完成自有域名接入。

## Vercel 项目设置

在 Vercel 新建 Project 时保持以下设置：

| 项目 | 设置 |
| --- | --- |
| Framework Preset | Vite |
| Install Command | `npm install` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

项目根目录保持默认即可。部署完成后，Vercel 会生成一个默认预览地址，通常形如：

```text
https://your-project.vercel.app
```

## 访问码保护

访问码在 Vercel 项目的环境变量中配置，不写入代码仓库。

如果原型只给内部评审，建议开启访问码，避免未公开页面被外部查看。进入 Vercel Project 的 Settings -> Environment Variables，增加：

```text
ACCESS_CODES=demo-code-1,demo-code-2
ACCESS_SESSION_SECRET=replace-with-a-long-random-secret
```

说明：

- `ACCESS_CODES` 是允许访问原型的访问码，可以用逗号、分号或换行分隔。
- `ACCESS_SESSION_SECRET` 用于生成登录 Cookie，建议填写一段较长的随机字符串。
- 建议把两个变量至少配置到 Production 环境；如果需要评审 Preview Deployment，也同步配置到 Preview 环境。
- 修改环境变量后，需要在 Vercel 里重新部署一次；环境变量变更不会自动作用到已经生成的旧部署。

配置完成并重新部署后，访问：

```text
https://你的域名/access
```

输入访问码即可进入原型。

## 可选项：中国大陆访问与自有域名

Vercel 默认分配的 `*.vercel.app` 地址在中国大陆境内可能无法直接访问或访问不稳定。面向大陆评审对象时，可以购买或准备一个自有域名，再把域名解析到 Vercel 项目。

推荐使用子域名承载原型，避免影响主站：

```text
prototype.example.com
```

### 什么时候需要做

| 场景 | 是否建议配置自有域名 |
| --- | --- |
| 评审对象主要在海外或能稳定访问 Vercel 默认地址 | 可不配置 |
| 评审对象在中国大陆境内，`*.vercel.app` 打不开或不稳定 | 建议配置 |
| 需要对外展示一个更正式、可记忆的评审链接 | 建议配置 |

### 购买或准备域名

1. 在域名服务商购买域名，或使用公司已有域名。
2. 如果购买新域名，建议优先选择容易识别项目归属的域名。
3. 如果使用公司已有域名，建议申请一个独立子域名，例如 `prototype.example.com`、`demo.example.com` 或 `review.example.com`。
4. 中国大陆境内域名通常需要完成域名实名信息；是否需要备案、备案归属和开通范围，按公司政策、域名服务商要求和实际发布场景确认。

### 在 Vercel 添加域名

1. 打开 Vercel 项目。
2. 进入 Settings -> Domains。
3. 点击 Add Domain。
4. 输入准备好的域名或子域名，例如 `prototype.example.com`。
5. Vercel 会显示需要配置的 DNS 记录。

### 在域名服务商配置 DNS 解析

回到域名服务商的 DNS 解析控制台，按 Vercel 页面提示添加记录。常见情况如下：

| 域名类型 | DNS 记录 | 主机记录示例 | 记录值 |
| --- | --- | --- | --- |
| 子域名，如 `prototype.example.com` | CNAME | `prototype` | 使用 Vercel 页面给出的 CNAME 目标 |
| 根域名，如 `example.com` | A | `@` | 使用 Vercel 页面给出的 A 记录地址 |
| 域名归属校验 | TXT | 按 Vercel 提示填写 | 按 Vercel 提示填写 |

建议优先使用子域名，因为它对主站影响更小，也更适合临时或阶段性的原型评审。

### 等待并验证

1. 保存 DNS 记录后，回到 Vercel 的 Domains 页面。
2. 等待 Vercel 校验通过。DNS 生效可能需要几分钟到数小时。
3. 校验通过后，用自有域名访问原型：

```text
https://prototype.example.com/access
```

4. 如果开启了访问码，确认访问自有域名时会先进入 `/access`，输入访问码后再进入原型。
5. 刷新业务页面或深层路由，确认不会出现 404。

### 常见注意点

- DNS 记录值以 Vercel 当前页面提示为准，不要照抄其他项目的记录值。
- 子域名通常配置 CNAME；根域名通常配置 A 记录；域名归属校验可能需要 TXT 记录。
- 如果使用根域名，Vercel 可能建议同时添加 `www` 子域名并配置跳转；原型评审更推荐单独使用子域名。
- 如果 DNS 长时间未生效，检查主机记录是否填错，例如子域名 `prototype.example.com` 在多数 DNS 控制台中主机记录应填 `prototype`。
- 如果公司网络仍无法访问，需继续确认企业网络策略、DNS 服务商解析质量或是否需要其他发布方案。

## 不需要访问码时

如果只是公开演示，可以不配置 `ACCESS_CODES` 和 `ACCESS_SESSION_SECRET`。但当前项目内置了访问保护流程，公开部署前建议确认是否真的可以让所有人访问。

## 发布前检查

本地先执行：

```bash
npm run build
```

再检查：

- 首页能打开。
- 左侧菜单能切换。
- 顶部「文档」能打开当前页面文档。
- 如果开启访问码，Vercel 环境变量已配置并完成重新部署。
- 如面向中国大陆境内评审，自有域名已通过 Vercel 校验，并能访问 `/access`。
- 刷新深层页面不会 404。
- 如果开启访问码，退出登录后会回到 `/access`。

## 常见问题

| 问题 | 处理方式 |
| --- | --- |
| 页面刷新后 404 | 确认 `vercel.json` 还在项目根目录，里面有 SPA rewrites 配置 |
| 输入访问码失败 | 检查 Vercel 环境变量是否配置到当前部署环境，并重新部署 |
| 大陆境内打不开 `*.vercel.app` | 可选配置自有域名：在 Vercel 绑定域名，并按 Vercel 提示配置 DNS 解析 |
| 自有域名未生效 | 检查 DNS 记录类型、主机记录和值是否与 Vercel 提示一致，等待 DNS 传播后再验证 |
| 部署失败 | 先在本地执行 `npm run build`，按报错修正后再推送 |
| 页面名称还是模板名 | 修改 `src/app/appConfig.ts` 后重新部署 |
