import * as chains from "viem/chains";

let out = `
name: Eval Blocks (generated)

on:
  schedule:
    - cron: "0 0 * * *"
  workflow_dispatch:

jobs:
`;

for (const chain of Object.values(chains)) {
  if (
    chain.name === chains.foundry.name ||
    chain.name === chains.anvil.name ||
    chain.name === chains.localhost.name ||
    chain.name === chains.hardhat.name ||
    chain.name === chains.moonbeamDev.name
  )
    continue;

  let i = 0;
  for (const rpc of chain.rpcUrls.default.http) {
    out = out.concat(`
  blocks-${chain.name.toLowerCase().replace(/[\s|()]/g, "_")}-${chain.id}-${i++}:
    name: blocks (${rpc})
    runs-on: "ubuntu-latest"

    steps:
      - uses: actions/checkout@v4
      - uses: oven-sh/setup-bun@v1
        with:
          bun-version: latest

      - run: bun install
      - run: bun run blocks.ts ${rpc}`);
  }
}

Bun.write(".github/workflows/evalBlocksGenerated.yml", out);
