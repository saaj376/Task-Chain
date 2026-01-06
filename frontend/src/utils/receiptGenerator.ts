import type { ContributionReceipt } from "../types/receipt";

export async function generateReceipt(
    taskId: string,
    taskTitle: string,
    reward: string,
    claimerAddress: string,
    txHash: string
): Promise<ContributionReceipt> {

    // In a real app, we would fetch block number and other details from the provider using the txHash
    // For now, we generate a valid receipt object synchronously

    const receipt: ContributionReceipt = {
        receiptId: crypto.randomUUID(),
        taskId,
        taskTitle,
        taskReward: reward,
        claimerAddress,
        completedAt: new Date().toISOString(),

        onChainTxHash: txHash,
        blockNumber: 12345678, // Mock
        networkId: 31337, // Localhost / Hardhat

        ipfsCid: "QmMock" + Date.now().toString(),

        metadata: {
            repository: "taskchain-CIT",
            commitHash: "Verified via on-chain hash",
        },

        verifiers: [
            {
                verifierName: "TaskChain Protocol",
                verifierAddress: "0xProtocolVerifier...",
                signature: "0xSignedByProtocol",
                timestamp: new Date().toISOString()
            }
        ]
    };

    return receipt;
}
