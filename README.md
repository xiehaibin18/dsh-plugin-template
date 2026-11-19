# DSH 插件模板

这个模板将一个设置页挂到 DeepSeek Harness（DSH）的设置菜单。示例允许修改显示名称、切换状态提示，再把设置保存到当前宿主进程。重启后会恢复初始值。

## 开始开发

在 GitHub 点击 **Use this template → Create a new repository** 创建自己的仓库。克隆并进入新仓库，再执行后面的工具链安装步骤。

```sh
git clone https://github.com/YOUR_ACCOUNT/YOUR_REPO.git
cd YOUR_REPO
```

新仓库的初始包名是 `dsh-example-settings`。如果要在同一个 DSH profile 安装多份，请按下文为每一份设置不同的包名。

使用 Node.js 24.9 或更高版本及 DSH 0.2.2-rc.3。构建固定使用 Bun 1.4.4-canary.1，完整修订为 `963452075e9d7e2a47a482f297143af5ed4f76c0`。以下命令将它装到单独的工具链目录。

```sh
npm install --prefix "$HOME/.local/share/dsh-plugin-toolchain" --no-save --no-audit --no-fund bun@1.4.3-canary.20261021.1
export PATH="$HOME/.local/share/dsh-plugin-toolchain/node_modules/.bin:$PATH"
bun run toolchain:check
bun install --frozen-lockfile
bun run dev
```

打开终端给出的本机预览地址。预览里的中文、英文、浅色和深色切换都使用同一个设置页组件。预览服务从合成的示例数据开始，保存写入预览进程的内存。修改组件或样式会触发 Bun 浏览器 HMR。下面的命令让预览自动选择空闲端口。

```sh
PREVIEW_PORT=0 bun run dev
```

## 检查、打包与安装

```sh
bun run check
bun run pack
dsh plugin --profile YOUR_PROFILE add ./artifacts/dsh-example-settings-0.1.0.tgz --offline --ignore-scripts
```

将 `YOUR_PROFILE` 换成用于验收的 profile，然后在该 profile 的 DSH Web 设置中打开「示例设置」。改名、切换状态并保存，再次打开设置页即可核对当前值。安装包包含 Node ESM 宿主入口和由 DSH 模块加载器运行的浏览器脚本。浏览器脚本使用宿主共享的 React 和 React DOM。

## 修改这个示例

| 路径 | 职责 |
| --- | --- |
| `src/server/index.ts` | 在宿主 Connection 上注册受认证保护的设置路由，插件卸载时释放路由 |
| `src/server/settings-handler.ts` | 校验设置写入并持有实例数据，供真实宿主和预览复用 |
| `src/client/index.tsx` | 注册 DSH 设置页和中英文文案 |
| `src/client/SettingsPanel.tsx` | 共用的设置组件，包含输入、开关和保存操作 |
| `src/client/controls.tsx`、`src/client/styles.css` | shadcn 风格的本地 Base UI 封装，以及作用域内的 DSH 主题样式 |
| `src/shared/settings.ts` | 插件身份、接口路径和数据校验 |
| `preview/` | 本地 HTTP 服务、合成数据和预览外壳 |
| `scripts/build.ts` | 构建生成 `dist/`、DSH 安装清单和 patch，并检查生产依赖边界 |

先在 `package.json` 修改 `name` 与 `version`。宿主入口名、设置页 ID、接口路径、安装 patch 和 tarball 名称从这个包名生成。更新 `assets/locale/` 和 `src/client/messages.ts` 里的名称和说明，再刷新锁文件。

```sh
bun install
bun run check
bun run pack
```

## 来源与许可

模板采用 MIT 许可，构建和预览工具来自 [dsh-plugin-dev](https://github.com/xiehaibin18/dsh-plugin-dev)。设置页和主题接入参考 [Decision Review](https://github.com/xiehaibin18/dsh-decision-review) 与 [Tool Explorer](https://github.com/6pofx/dsh-tool-explorer)。控件参考 [shadcn/ui](https://ui.shadcn.com/) 的 Base UI 组合方式。浏览器包的第三方许可见 `LICENSES.client`。
