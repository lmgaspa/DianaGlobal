import React from "react";

const Disclosures: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 text-sm md:text-base">
      <h1 className="text-3xl font-bold mb-4">Disclosures — Diana Global</h1>
      <p className="mb-4">Last updated: 10/14/2025</p>

      <h2 className="text-2xl font-bold mb-2">1) General Information</h2>
      <p className="mb-4">
        Diana Global provides access to a decentralized exchange (“DEX”) and the Diana Wallet. We do not
        take custody of user assets. On-chain transactions are final once confirmed and are executed by
        blockchain networks outside our control.
      </p>

      <h2 className="text-2xl font-bold mb-2">2) Risks</h2>
      <ul className="list-disc list-inside mb-4">
        <li className="mb-2">Digital assets are volatile and may lose value rapidly.</li>
        <li className="mb-2">Smart contracts can contain bugs or be exploited.</li>
        <li className="mb-2">Network congestion can increase fees or delay transactions.</li>
        <li className="mb-2">You are solely responsible for securing your wallet and private keys.</li>
      </ul>

      <h2 className="text-2xl font-bold mb-2">3) Fees</h2>
      <p className="mb-4">
        Network fees (e.g., gas) are paid to validators/miners and are not retained by Diana Global. Any
        platform/service fees will be disclosed in-app at the time of use.
      </p>

      <h2 className="text-2xl font-bold mb-2">4) Third-Party Protocols</h2>
      <p className="mb-4">
        Our Services may integrate third-party protocols, bridges, oracles, or dApps. We do not control,
        audit, or assume responsibility for third-party code or operations. Use at your own risk and
        review third-party terms and policies.
      </p>

      <h2 className="text-2xl font-bold mb-2">5) Conflicts of Interest</h2>
      <p className="mb-4">
        From time to time, we or our affiliates may hold digital assets listed or routed by the DEX. We
        do not engage in front-running or trade on non-public user order information.
      </p>

      <h2 className="text-2xl font-bold mb-2">6) Data & Analytics</h2>
      <p className="mb-4">
        We may use aggregated, anonymized analytics to improve the Services. Personal data is handled in
        accordance with our <a className="underline" href="/privacy-policy">Privacy Policy</a>. Analytics
        (e.g., GA4) only loads with your consent; see our <a className="underline" href="/cookies">Cookies Policy</a>.
      </p>

      <h2 className="text-2xl font-bold mb-2">7) Communications</h2>
      <p className="mb-4">
        Service announcements or security notices may be sent to your registered email. Marketing
        communications are optional and require your consent; you can opt out at any time.
      </p>

      <h2 className="text-2xl font-bold mb-2">8) Security Practices</h2>
      <p className="mb-4">
        We apply industry-standard security controls and conduct periodic reviews. However, no system is
        fully secure. You must keep your devices and credentials safe and updated.
      </p>

      <h2 className="text-2xl font-bold mb-2">9) Regulatory Position</h2>
      <p className="mb-4">
        Availability and functionality may vary by jurisdiction. You are responsible for ensuring that
        your use of the Services is legal where you are located and for complying with applicable laws,
        including tax obligations.
      </p>

      <h2 className="text-2xl font-bold mb-2">10) Governing Law & Venue (Brazil)</h2>
      <p className="mb-4">
        These Disclosures are provided under the laws of the Federative Republic of Brazil. Any disputes
        relating to this document or the Services shall be resolved exclusively by the courts of the
        City of São Paulo, State of São Paulo, Brazil, without prejudice to mandatory consumer rules.
      </p>

      <h2 className="text-2xl font-bold mb-2">11) Contact</h2>
      <address className="not-italic mb-4">
        <strong>Diana Global</strong><br />
        Email: andescoresoftware@gmail.com
      </address>
    </div>
  );
};

export default Disclosures;
