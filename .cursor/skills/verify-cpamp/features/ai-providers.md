# AI providers

AI providers lists configured Gemini, Codex, Claude, Vertex, xAI, and OpenAI-compatible providers, and opens create or edit routes for each family.

## Sub-features

- `providers-list` opens the providers list.
- `providers-gemini-edit` opens Gemini create or edit.
- `providers-codex-edit` opens Codex create or edit.
- `providers-claude-edit` opens Claude create or edit and nested models.
- `providers-vertex-edit` opens Vertex create or edit.
- `providers-openai-edit` opens OpenAI-compatible create or edit and nested models.

## How to get to it (user POV)

- Choose `AI Providers` in the sidebar.
- Open `#/demo/ai-providers`.
- Open create routes such as `#/demo/ai-providers/gemini/new`, `#/demo/ai-providers/codex/new`, `#/demo/ai-providers/claude/new`, `#/demo/ai-providers/vertex/new`, `#/demo/ai-providers/openai/new`.
- Open edit routes such as `#/demo/ai-providers/gemini/0` and Claude or OpenAI nested `#/demo/ai-providers/claude/0/models`.

## Driving it with control-cpamp

Preconditions:

- Demo panel is healthy.
- `doctor` is green.

- **List entry.** Choose `AI Providers`. Run `control-cpamp click --role link --name 'AI Providers'`. The page shows `AI Providers Configuration`.
- **Gemini create.** Open the Gemini create route. Run `control-cpamp goto --hash '#/demo/ai-providers/gemini/new'`. The Gemini editor form appears.
- **Codex create.** Open `#/demo/ai-providers/codex/new`. Run `control-cpamp goto --hash '#/demo/ai-providers/codex/new'`. The Codex editor form appears.
- **Claude create.** Open `#/demo/ai-providers/claude/new`. Run `control-cpamp goto --hash '#/demo/ai-providers/claude/new'`. The Claude editor form appears.
- **Claude models.** Open `#/demo/ai-providers/claude/new/models`. Run `control-cpamp goto --hash '#/demo/ai-providers/claude/new/models'`. The Claude models subpage appears.
- **Vertex create.** Open `#/demo/ai-providers/vertex/new`. Run `control-cpamp goto --hash '#/demo/ai-providers/vertex/new'`. The Vertex editor form appears.
- **OpenAI create.** Open `#/demo/ai-providers/openai/new`. Run `control-cpamp goto --hash '#/demo/ai-providers/openai/new'`. The OpenAI-compatible editor form appears.
- **OpenAI models.** Open `#/demo/ai-providers/openai/new/models`. Run `control-cpamp goto --hash '#/demo/ai-providers/openai/new/models'`. The models subpage appears.
- **Return to list.** Open `#/demo/ai-providers`. Run `control-cpamp goto --hash '#/demo/ai-providers'`. The list is visible again.
- **Proof.** Capture the list. Run `control-cpamp snapshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/ai-providers.aria.txt` and `control-cpamp screenshot --path .cursor/skills/verify-cpamp/artifacts/$CPAMP_VERIFY_RUN_ID/ai-providers.png`.

## Gotchas

- Indexed edit routes need a fixture or live provider at that index. Prefer `/new` for structural proof when indexes are empty.
- Saving provider edits on a live CPA changes routing. Keep write proofs on disposable instances.
