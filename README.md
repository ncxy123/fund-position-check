# 基金持仓体检

上传基金持仓截图，识别出持仓列表，算出总市值、总收益、收益贡献度，给一个组合体检分，另外还能做清仓模拟和持仓问答。

线上版本：https://app-fdq5qb73uakh.miaoda.online/

## 目录

```
index.html          入口页面
assets/index.js     应用主逻辑（构建产物，已压缩）
assets/index.css    样式（构建产物）
favicon.png         图标
```

## 本地跑起来

不用装依赖，任意静态服务器都行：

```bash
npx serve -l 5173 .
# 或者
python -m http.server 5173
```

然后打开 http://localhost:5173

装过依赖的话也可以 `npm install && npm run dev`。

## 部署

仓库里全是静态文件，直接丢 GitHub Pages 就行：

1. Settings -> Pages
2. Source 选 Deploy from a branch
3. 分支选 main，目录选 `/ (root)`

`index.html` 里的资源引用是相对路径（`./assets/...`），放在子路径下也能正常加载。`.nojekyll` 已经放好了，不影响下划线开头的文件。

Vercel / Netlify 之类直接拖进去也行。

## 后端说明

前端本身不含数据存储，请求走的是秒哒平台的 Supabase 代理：

- 地址：`https://backend.miaoda.online/projects/supabase373473444681003008`
- anon key 打包在 `assets/index.js` 里（Supabase 的设计就是公开的，靠 RLS 控制权限）

实际用到的两个边缘函数：

| 函数 | 用途 |
| --- | --- |
| `accurate-ocr` | 识别上传的持仓截图，返回持仓行 |
| `minimax-chat` | 持仓问答 / 清仓测算的自然语言回复，模型 `MiniMax-M2.5` |

这两块依赖秒哒那边的项目存活。一旦项目被删或者额度用完，识别和问答会失效，其余计算都是纯前端，不受影响。

## 关于代码

`assets/index.js` 是线上构建产物，打包压缩过，没有 sourcemap，所以不是原始的 TSX 工程。直接改这个文件可以，但读起来会比较费劲。

要继续在这基础上开发，建议把业务逻辑重新拆成组件工程，而不是在压缩代码上打补丁。
