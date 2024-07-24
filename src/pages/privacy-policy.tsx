import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Privacy Policy for Diana Global</h1>
      <p className="mb-4">Last updated: 07/24/2024</p>

      <p className="mb-4">
        Welcome to Diana Global! This privacy policy explains how we handle and protect your personal data when you use our decentralized exchange (DEX) and Diana Wallet. Your privacy is important to us, and we are committed to safeguarding it.
      </p>

      <h2 className="text-2xl font-bold mb-2">1. Introduction</h2>
      <p className="mb-4">
        Diana Global operates a decentralized exchange (DEX) and provides the Diana Wallet (referred to as "we," "our," "us," or "Diana Global"). This privacy policy outlines how we collect, use, and protect your personal data.
      </p>

      <h2 className="text-2xl font-bold mb-2">2. Data We Collect</h2>
      <p className="mb-4">We collect the following types of data:</p>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">
          <strong>Personal Data:</strong> Email address (for account setup and communication), Transaction data (for processing and verification), Wallet address (for transaction processing)
        </li>
        <li className="mb-2">
          <strong>Non-Personal Data:</strong> Usage data (for improving user experience), Device information (for compatibility and troubleshooting), Log data (for security monitoring)
        </li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">3. How We Use Your Data</h2>
      <p className="mb-4">We use your data to:</p>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">Provide and maintain our services</li>
        <li className="mb-2">Process transactions and verify user identity</li>
        <li className="mb-2">Communicate with you regarding updates, promotions, and support</li>
        <li className="mb-2">Improve our platform and user experience</li>
        <li className="mb-2">Ensure security and prevent fraud</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">4. Data Sharing and Disclosure</h2>
      <p className="mb-4">
        We do not sell, trade, or otherwise transfer your personal data to outside parties. We may share data with:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">Service providers (to assist in operations and improve our services)</li>
        <li className="mb-2">Legal authorities (if required by law or to protect our rights)</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">5. Data Security</h2>
      <p className="mb-4">
        We implement a variety of security measures to maintain the safety of your personal data. These measures include:
      </p>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">Encryption of sensitive data</li>
        <li className="mb-2">Regular security audits</li>
        <li className="mb-2">Access controls to data</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">6. Data Retention</h2>
      <p className="mb-4">
        We retain your personal data only as long as necessary to fulfill the purposes outlined in this policy. Once your data is no longer needed, we will securely delete or anonymize it.
      </p>

      <h2 className="text-2xl font-bold mb-2">7. User Rights</h2>
      <p className="mb-4">You have the right to:</p>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">Access your personal data</li>
        <li className="mb-2">Request corrections to inaccurate data</li>
        <li className="mb-2">Request deletion of your personal data</li>
        <li className="mb-2">Object to or restrict the processing of your data</li>
        <li className="mb-2">Withdraw consent for data processing</li>
      </ul>
      <p className="mb-4">To exercise these rights, please contact us at [Privacy Contact Email].</p>

      <h2 className="text-2xl font-bold mb-2">8. Changes to This Privacy Policy</h2>
      <p className="mb-4">
        We may update this privacy policy from time to time. Any changes will be posted on this page, and we will notify you via email or through our platform.
      </p>

      <h2 className="text-2xl font-bold mb-2">9. Contact Us</h2>
      <p className="mb-4">
        If you have any questions or concerns about this privacy policy, please contact us at:
      </p>
      <address className="not-italic mb-4">
        <strong>Diana Global</strong><br />
        Email: luizmgasparettodev@gmail.com
      </address>
    </div>
  );
}

export default PrivacyPolicy;
