# 基金持仓体检

上传基金持仓截图，识别成表格，算出组合的总市值、总收益、总收益率，按收益贡献排序看每只基金是拉高还是拖累，再给一个组合体检评分，附带清仓测算和持仓问答。

## 跑起来

```bash
npm install
npm run dev
```

构建产物在 `dist/`：

```bash
npm run build
npm run preview
```

## 目录

```
api/                  服务端接口（可选，用于截图识别和问答）
src/
  App.tsx             路由与全局容器
  main.tsx            入口
  routes.tsx          路由表
  index.css           样式
  assets/fonts/       字体
  components/         业务组件
    ui/               Button / Input / Dialog
  hooks/              持仓状态与本地存储
  layout/             页面骨架
  lib/                计算、格式化、提示词、OCR 解析
  pages/              页面
  services/           接口调用
```

## 计算口径

单只基金的收益率用「收益 ÷ 成本」，成本是市值减收益，所以收益率 `profit / (marketValue - profit)`；收益贡献是这只基金的收益占全部成本的比例，把所有持仓的贡献加起来正好等于组合总收益率。

组合体检分满分 100，扣三个维度：

| 维度 | 扣分规则 | 上限 |
| --- | --- | --- |
| 集中度 | 最大单一持仓占比超过 30% 后，每超出 1 个百分点扣 1.5 分 | 30 |
| 亏损面 | 亏损只数占比 × 25 | 25 |
| 拖累项 | 最大拖累的收益贡献绝对值 × 500 | 20 |

清仓测算是把某只基金去掉之后重新算剩余组合的收益率，用来判断剔除该品种对整体的影响。

## 截图识别和问答

这两块需要服务端，`api/` 下有两个函数：

- `/api/ocr` 把截图交给视觉模型，逐行返回文字，前端再解析成「名称 + 市值 + 收益」
- `/api/chat` 是通用的对话代理，持仓问答和客户沟通卡都走这里

没有配置的话前端不会崩：截图识别会退化成新增一行空记录，问答走本地规则回答，沟通卡走离线话术模板。

配置方式，复制 `.env.example` 为 `.env`：

```
AI_BASE_URL=https://api.openai.com/v1
AI_API_KEY=你的密钥
AI_MODEL=gpt-4o-mini
AI_VISION_MODEL=gpt-4o-mini
```

`AI_BASE_URL` 填任何 OpenAI 兼容的服务都行。如果 `api/` 部署在别的域名，前端通过 `VITE_API_BASE` 指定前缀。

## 部署

带 `api/` 的话直接推到 Vercel，环境变量在项目设置里配上就能用。只要静态页面就把 `dist/` 丢到任意静态托管，AI 相关的功能会走降级逻辑。

## 数据

持仓只存在浏览器 localStorage 里，键名 `fund-health-holdings-v1`，刷新不丢，换浏览器就没了。没做账号体系，也没有后端数据库。
