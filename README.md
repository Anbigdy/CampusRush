# Campus Rush

Campus Rush 是一款使用 Phaser 3 和 Arcade Physics 制作的 2D 横版校园无尽跑酷游戏。玩家扮演即将迟到的学生，跳过书包、路障和水坑，尽可能坚持更久并刷新本机最高分。

## 环境要求

- Node.js 22 或更高版本
- npm
- 普通桌面版 Chrome 或 Edge

## 本地运行

```bash
npm install
npm run dev
```

打开开发服务器输出的本地地址即可游玩。

## 操作

- 空格键：跳跃
- 方向上键：跳跃
- 点击或轻触游戏画面：跳跃
- 玩家只有落地后才能再次跳跃

## 构建与预览

```bash
npm run build
npm run preview
```

生产文件输出到 `dist`。项目使用相对资源路径，可部署到 GitHub Pages 或其他静态托管服务。

## GitHub Pages 部署

项目已经包含 `.github/workflows/deploy.yml`。将代码推送到 GitHub 仓库的 `main` 分支后：

1. 在仓库的 **Settings → Pages** 中将 Source 设为 **GitHub Actions**。
2. 推送代码，或在 Actions 页面手动运行部署工作流。
3. 等待 `Deploy Campus Rush to GitHub Pages` 完成，再打开工作流提供的网址。

工作流使用 `npm ci`、`npm run build` 和 `dist` 静态产物，不需要后端或环境变量。

## 技术栈

- JavaScript ES Modules
- Phaser 3
- Phaser Arcade Physics
- Vite
- HTML 和 CSS
- localStorage 本地最高分

## 游戏规则

- 角色自动向前奔跑，场景和障碍向左滚动。
- 分数按生存时间增加。
- 游戏速度逐步提升，并在可操作范围内封顶。
- 碰到任何障碍后本局结束，可立即重新开始。

## 2–3 分钟展示顺序

1. 展示开始页、操作说明和本机最高分。
2. 开始游戏，依次演示键盘和点击跳跃。
3. 说明三类随机障碍、实时分数和速度提升。
4. 主动碰撞，展示本局分数与最高分。
5. 连续重新开始，说明旧障碍和计时状态不会残留。

## 范围说明

基础版本不包含双段跳、滑铲、道具、音效、音乐、账号、排行榜、联机、多角色、多地图或复杂特效。
