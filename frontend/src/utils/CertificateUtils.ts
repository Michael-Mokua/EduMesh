import { QRCodeCanvas } from 'qrcode.react';

export interface CertificateData {
    studentName: string;
    subject: string;
    masteryLevel: number;
    issueDate: string;
    verificationHash: string;
    issuer: string;
}

/**
 * Generates a mock "cryptographic" verification hash for the certificate.
 * In a real-world scenario, this would involve signing a message with a private key.
 */
export const generateVerificationHash = (studentId: string, subjectId: string, timestamp: string): string => {
    const raw = `${studentId}:${subjectId}:${timestamp}:EDUMESH_PROTOCOL_V1`;
    // Simple hash simulation
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
};

/**
 * Validates a certificate hash.
 */
export const verifyCertificate = (hash: string): boolean => {
    // In a real implementation, we would check this against the blockchain or a central registry.
    return hash.length === 8;
};
