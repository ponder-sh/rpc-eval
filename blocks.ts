import { createClient, extractChain, hexToNumber, http, type Hex } from "viem";
import { getBlock, getBlockNumber } from "viem/actions";
import * as chains from "viem/chains";

const rpc = process.argv[2] as string;

const transport = http(rpc)({});

const chainId = await transport
	.request({ method: "eth_chainId" })
	.then((c) => hexToNumber(c as Hex));

const chain = extractChain({
	chains: Object.values(chains),
	id: chainId as (typeof chains)[keyof typeof chains]["id"],
});

const client = createClient({
	chain,
	transport: http(rpc),
});

const [block] = await Promise.all([
	getBlock(client, { blockTag: "latest" }),
	// getBlockNumber(client),
]);

// if (block.number !== blockNumber) {
// 	console.error(
// 		`eth_getBlockByNumber and eth_blocknumber returned inconsistent values. eth_getBlockByNumber: ${block.number} eth_blockNumber: ${blockNumber}`,
// 	);
// 	process.exit(1);
// }

const offset = Math.floor(Math.random() * 100);

await Promise.all([
	getBlock(client, { blockNumber: block.number }),
	getBlock(client, { blockNumber: block.number - BigInt(offset) }),

	getBlock(client, { blockHash: block.hash }),
	getBlock(client, { blockHash: block.parentHash }),
]);