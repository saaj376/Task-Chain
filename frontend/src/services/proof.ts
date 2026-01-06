/**
 * Proof of Work Service
 * Handles client-side hashing and IPFS upload simulation.
 */

// Generate SHA-256 hash of any content (String, File, or Byte Array)
export async function calculateHash(content: string | Uint8Array | File): Promise<string> {
    let data: Uint8Array;

    if (typeof content === 'string') {
        data = new TextEncoder().encode(content);
    } else if (content instanceof File) {
        const buffer = await content.arrayBuffer();
        data = new Uint8Array(buffer);
    } else {
        data = content;
    }

    // Use crypto.subtle for browser-native SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data as any);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = '0x' + hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

// Mock IPFS Upload (In production, replace with Pinata/Infura API call)
export async function uploadProofToIPFS(content: string | File): Promise<string> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Return a mock CID based on content type
    const typeStr = content instanceof File ? "file" : "text";
    const mockCid = `Qm${typeStr}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    console.log(`[IPFS MOCK] Uploaded ${typeStr} proof. CID: ${mockCid}`);
    return mockCid;
}

// Helper to structure the proof data object
export interface ProofData {
    type: 'GITHUB_PR' | 'FILE' | 'LINK' | 'TEXT';
    value: string; // URL, Text, or Filename
    description?: string;
    timestamp: number;
}

export async function createProofArtifact(data: ProofData): Promise<{ hash: string, cid: string }> {
    const serialized = JSON.stringify(data);
    const hash = await calculateHash(serialized);
    const cid = await uploadProofToIPFS(serialized);
    return { hash, cid };
}
