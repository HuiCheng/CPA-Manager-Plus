# AI 提供商

AI 提供商列出已配置的 Gemini、Codex、Claude、Vertex、xAI 与 OpenAI-compatible 提供商，并打开各家族的新建或编辑路由。

## Sub-features

- `providers-list` 打开提供商列表。
- `providers-gemini-edit` 打开 Gemini 新建或编辑。
- `providers-codex-edit` 打开 Codex 新建或编辑。
- `providers-claude-edit` 打开 Claude 新建或编辑及嵌套 models。
- `providers-vertex-edit` 打开 Vertex 新建或编辑。
- `providers-openai-edit` 打开 OpenAI-compatible 新建或编辑及嵌套 models。

## How to get to it (user POV)

- 在侧栏选择 `AI Providers`。
- 打开 `#/demo/ai-providers`。
- 打开新建路由，例如 `#/demo/ai-providers/gemini/new`、`#/demo/ai-providers/codex/new`、`#/demo/ai-providers/claude/new`、`#/demo/ai-providers/vertex/new`、`#/demo/ai-providers/openai/new`。
- 打开编辑路由，例如 `#/demo/ai-providers/gemini/0`，以及 Claude 或 OpenAI 嵌套的 `#/demo/ai-providers/claude/0/models`。

## Driving it with control-cpamp

Preconditions:

- Demo 面板健康。
- `doctor` 为绿。

- **列表入口。** 选择 `AI Providers`。执行 `control-cpamp click --role link --name 'AI Providers'`。页面显示 `AI Providers Configuration`。
- **Gemini 新建。** 打开 Gemini 新建路由。执行 `control-cpamp goto --hash '#/demo/ai-providers/gemini/new'`。Gemini 编辑表单出现。
- **Codex 新建。** 打开 `#/demo/ai-providers/codex/new`。执行 `control-cpamp goto --hash '#/demo/ai-providers/codex/new'`。Codex 编辑表单出现。
- **Claude 新建。** 打开 `#/demo/ai-providers/claude/new`。执行 `control-cpamp goto --hash '#/demo/ai-providers/claude/new'`。Claude 编辑表单出现。
- **Claude models。** 打开 `#/demo/ai-providers/claude/new/models`。执行 `control-cpamp goto --hash '#/demo/ai-providers/claude/new/models'`。Claude models 子页出现。
- **Vertex 新建。** 打开 `#/demo/ai-providers/vertex/new`。执行 `control-cpamp goto --hash '#/demo/ai-providers/vertex/new'`。Vertex 编辑表单出现。
- **OpenAI 新建。** 打开 `#/demo/ai-providers/openai/new`。执行 `control-cpamp goto --hash '#/demo/ai-providers/openai/new'`。OpenAI-compatible 编辑表单出现。
- **OpenAI models。** 打开 `#/demo/ai-providers/openai/new/models`。执行 `control-cpamp goto --hash '#/demo/ai-providers/openai/new/models'`。models 子页出现。
- **返回列表。** 打开 `#/demo/ai-providers`。执行 `control-cpamp goto --hash '#/demo/ai-providers'`。列表再次可见。
- **证明。** 捕获列表。执行 `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/ai-providers.aria.txt` 与 `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/ai-providers.png`。

## Gotchas

- 带索引的编辑路由需要该索引处有 fixture 或 live 提供商。索引为空时，结构证明优先用 `/new`。
- 在 live CPA 上保存提供商编辑会改路由。写证明留在一次性实例。
