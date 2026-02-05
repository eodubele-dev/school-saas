import * as React from 'react';

interface WelcomeEmailProps {
    schoolName: string;
    subdomain: string;
    userEmail: string;
}

export const WelcomePlatinumEmail: React.FC<WelcomeEmailProps> = ({
    schoolName,
    subdomain,
    userEmail,
}) => (
    <div style={{ fontFamily: 'Arial, sans-serif', maxWidth: '600px', margin: '0 auto', color: '#1a1a1a' }}>
        {/* Header */}
        <div style={{ backgroundColor: '#000000', padding: '30px', textAlign: 'center' }}>
            <h1 style={{ color: '#ffffff', margin: 0, fontSize: '24px', letterSpacing: '1px' }}>{schoolName}</h1>
            <p style={{ color: '#00F5FF', margin: '10px 0 0', fontFamily: 'monospace', fontSize: '12px', textTransform: 'uppercase' }}>
                Status: Live // Protocol: Platinum
            </p>
        </div>

        {/* Body */}
        <div style={{ padding: '40px 30px', backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderTop: 'none' }}>
            <h2 style={{ fontSize: '20px', marginBottom: '20px' }}>Your Institutional Operating System is Live.</h2>

            <p style={{ lineHeight: '1.6', color: '#4a4a4a' }}>
                Dear Proprietor,
            </p>

            <p style={{ lineHeight: '1.6', color: '#4a4a4a' }}>
                Congratulations. You have successfully provisioned <strong>EduFlow Platinum</strong> for {schoolName}.
                Your digital campus is now active, and your forensic security protocols are standing by.
            </p>

            {/* Credentials Box */}
            <div style={{ backgroundColor: '#f9fafb', border: '1px solid #e5e5e5', borderRadius: '8px', padding: '20px', margin: '30px 0' }}>
                <h3 style={{ margin: '0 0 15px', fontSize: '16px', color: '#1a1a1a' }}>🚀 Your Access Credentials</h3>

                <p style={{ margin: '10px 0', fontSize: '14px' }}>
                    <strong>Command Center URL:</strong><br />
                    <a href={`https://${subdomain}.eduflow.ng`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                        https://{subdomain}.eduflow.ng
                    </a>
                </p>

                <p style={{ margin: '10px 0', fontSize: '14px' }}>
                    <strong>Login Identity:</strong><br />
                    {userEmail}
                </p>
            </div>

            <h3 style={{ fontSize: '16px', marginTop: '30px' }}>📚 Next Steps for Total Command</h3>

            <ul style={{ paddingLeft: '20px', color: '#4a4a4a', lineHeight: '1.6' }}>
                <li style={{ marginBottom: '10px' }}>
                    <strong>Platform Documentation:</strong> Learn how to automate results-blurring and configure "Pay-to-Unlock".
                </li>
                <li style={{ marginBottom: '10px' }}>
                    <strong>The Global Command Center:</strong> A guide for managing multiple campuses.
                </li>
            </ul>

            <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#fff1f2', borderRadius: '4px', borderLeft: '4px solid #f43f5e' }}>
                <strong style={{ display: 'block', color: '#be123c', marginBottom: '4px' }}>🛡️ Security Note</strong>
                <span style={{ fontSize: '13px', color: '#881337' }}>
                    Your System Audit & Integrity Log is now recording all administrative actions.
                    Every grade change or fee modification is being tracked to ensure 100% institutional transparency.
                </span>
            </div>
        </div>

        {/* Footer */}
        <div style={{ backgroundColor: '#f5f5f5', padding: '20px', textAlign: 'center', color: '#666666', fontSize: '12px' }}>
            <p>&copy; {new Date().getFullYear()} EduFlow Platinum. Elevating Education.</p>
            <p>Lagos Executive Support Team: support@eduflow.ng</p>
        </div>
    </div>
);
