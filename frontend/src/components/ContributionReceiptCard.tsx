import React from 'react';
import type { ContributionReceipt } from '../types/receipt';
import { CheckCircle, Share2, Download, ExternalLink } from 'lucide-react';

interface ContributionReceiptCardProps {
    receipt: ContributionReceipt;
    onClose?: () => void;
}

export const ContributionReceiptCard: React.FC<ContributionReceiptCardProps> = ({ receipt, onClose }) => {
    const handleShare = () => {
        const text = `I just completed Task #${receipt.taskId} on TaskChain! 🚀\nReward: ${receipt.taskReward}\nProof: ${receipt.onChainTxHash}`;
        if (navigator.share) {
            navigator.share({
                title: 'Contribution Receipt',
                text: text,
                url: window.location.href
            }).catch(console.error);
        } else {
            navigator.clipboard.writeText(text);
            alert('Receipt copied to clipboard!');
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>TASKCHAIN // RECEIPT</div>
                    <div style={styles.statusBadge}>
                        <CheckCircle size={14} color="#000" fill="#00ff88" />
                        <span>VERIFIED ON-CHAIN</span>
                    </div>
                </div>

                <div style={styles.body}>
                    <div style={styles.row}>
                        <div style={styles.label}>CONTRIBUTION ID</div>
                        <div style={styles.valueMono}>{receipt.receiptId.slice(0, 8).toUpperCase()}</div>
                    </div>

                    <div style={styles.divider} />

                    <div style={styles.mainInfo}>
                        <h2 style={styles.taskTitle}>{receipt.taskTitle}</h2>
                        <div style={styles.reward}>{receipt.taskReward}</div>
                    </div>

                    <div style={styles.grid}>
                        <div style={styles.field}>
                            <div style={styles.label}>CLAIMER</div>
                            <div style={styles.valueMono}>{receipt.claimerAddress.slice(0, 8)}...{receipt.claimerAddress.slice(-6)}</div>
                        </div>
                        <div style={styles.field}>
                            <div style={styles.label}>COMPLETED</div>
                            <div style={styles.value}>{new Date(receipt.completedAt).toLocaleDateString()}</div>
                        </div>
                    </div>

                    <div style={styles.field}>
                        <div style={styles.label}>TX HASH</div>
                        <a
                            href={`https://sepolia.etherscan.io/tx/${receipt.onChainTxHash}`}
                            target="_blank"
                            rel="noreferrer"
                            style={styles.link}
                        >
                            {receipt.onChainTxHash.slice(0, 20)}... <ExternalLink size={10} />
                        </a>
                    </div>

                    <div style={styles.field}>
                        <div style={styles.label}>VERIFIER SIGNATURE</div>
                        <div style={styles.sigBlock}>
                            {receipt.verifiers[0]?.signature.slice(0, 40)}...
                        </div>
                    </div>

                </div>

                <div style={styles.footer}>
                    <button style={styles.iconBtn} onClick={handleShare}>
                        <Share2 size={16} /> SHARE
                    </button>
                    <button style={styles.iconBtn}>
                        <Download size={16} /> SAVE
                    </button>
                    {onClose && (
                        <button style={styles.closeBtn} onClick={onClose}>
                            CLOSE
                        </button>
                    )}
                </div>

                <div style={styles.watermark}>NON-FUNGIBLE PROOF OF WORK</div>
            </div>
        </div>
    );
};

const styles: any = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        animation: 'fadeIn 0.3s ease'
    },
    card: {
        background: 'linear-gradient(145deg, #111, #0a0a0a)',
        border: '1px solid #333',
        width: '400px',
        borderRadius: '16px',
        padding: '0',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(0,255,136,0.1)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'JetBrains Mono', monospace",
    },
    header: {
        background: '#050505',
        padding: '20px',
        borderBottom: '1px solid #222',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    logo: {
        color: '#666',
        fontWeight: 'bold',
        fontSize: '12px',
        letterSpacing: '2px'
    },
    statusBadge: {
        background: '#00ff88',
        color: '#000',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '10px',
        fontWeight: 'bold',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
    },
    body: {
        padding: '30px',
    },
    row: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: '20px'
    },
    label: {
        color: '#555',
        fontSize: '10px',
        fontWeight: 'bold',
        letterSpacing: '1px',
        marginBottom: '6px'
    },
    valueMono: {
        color: '#fff',
        fontSize: '12px',
        fontFamily: 'monospace'
    },
    value: {
        color: '#fff',
        fontSize: '13px',
        fontWeight: '500'
    },
    divider: {
        height: '1px',
        background: '#222',
        margin: '0 0 20px 0'
    },
    mainInfo: {
        marginBottom: '20px'
    },
    taskTitle: {
        color: '#fff',
        fontSize: '20px',
        margin: '0 0 5px 0',
        lineHeight: '1.2'
    },
    reward: {
        color: '#f9d423',
        fontSize: '16px',
        fontWeight: 'bold'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '20px'
    },
    field: {
        marginBottom: '15px'
    },
    link: {
        color: '#00ff88',
        textDecoration: 'none',
        fontSize: '12px',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
    },
    sigBlock: {
        background: '#080808',
        border: '1px dashed #333',
        padding: '10px',
        fontSize: '10px',
        color: '#444',
        wordBreak: 'break-all'
    },
    footer: {
        background: '#080808',
        padding: '15px 30px',
        borderTop: '1px solid #222',
        display: 'flex',
        gap: '10px',
        justifyContent: 'space-between'
    },
    iconBtn: {
        background: 'transparent',
        border: 'none',
        color: '#888',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'color 0.2s',
        ':hover': { color: '#fff' }
    },
    closeBtn: {
        background: 'transparent',
        border: '1px solid #333',
        color: '#fff',
        padding: '6px 16px',
        borderRadius: '4px',
        fontSize: '11px',
        fontWeight: 'bold',
        cursor: 'pointer'
    },
    watermark: {
        position: 'absolute',
        bottom: '10px',
        right: '20px',
        fontSize: '100px',
        fontWeight: '900',
        color: 'rgba(255,255,255,0.01)',
        pointerEvents: 'none',
        zIndex: 0
    }
}
