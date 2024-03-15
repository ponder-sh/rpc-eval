import {
	createClient,
	extractChain,
	hexToNumber,
	http,
	type Address,
	type Hex,
} from "viem";
import { getBlockNumber, getLogs } from "viem/actions";
import * as chains from "viem/chains";

const rpc = process.argv[2] as string;
const address = process.argv[3] as Address;

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

const blockNumber = await getBlockNumber(client);

const offset = Math.floor(Math.random() * 100);

const logs = await getLogs(client, {
	address,
	fromBlock: blockNumber - BigInt(offset),
	toBlock: blockNumber,
});

// validate log ordering
let invalidOrder = false;

if (logs.length > 0) {
	logs.reduce((prev, cur) => {
		if (
			prev.blockNumber > cur.blockNumber ||
			(prev.blockNumber === cur.blockNumber && prev.logIndex >= cur.logIndex)
		) {
			invalidOrder = true;
		}

		return cur;
	});
}

if (invalidOrder) {
	console.error("eth_getLogs returned logs out of order.");
	process.exit(1);
}

await new Promise((resolve) => setTimeout(resolve, 30_000));

const newLogs = await getLogs(client, {
	address,
	fromBlock: blockNumber - BigInt(offset),
	toBlock: blockNumber,
});

if (logs.length !== newLogs.length) {
	console.error(
		"eth_getLogs returned a different amount of logs after a 30 second delay.",
	);
	process.exit(1);
}

for (let i = 0; i < logs.length; i++) {
	if (
		logs[i].blockHash !== newLogs[i].blockHash ||
		logs[i].logIndex !== newLogs[i].logIndex ||
		logs[i].data !== newLogs[i].data ||
		logs[i].topics[0] !== newLogs[i].topics[0]
	) {
		console.error(
			"eth_getLogs returned different log values after a 30 second delay.",
		);
		process.exit(1);
	}
}
