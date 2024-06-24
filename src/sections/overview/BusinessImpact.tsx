export const BusinessImpact = () => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Business Impact</h2>
      <p className="mb-4 text-gray-700">
        The cybersecurity assessment revealed several critical and high-risk
        vulnerabilities that could significantly impact the client&apos;s
        business. The most severe finding involves a flaw in the GitLab email
        verification process for password resets, allowing a potential attacker
        to take over user accounts. This vulnerability presents considerable
        risk, as unauthorized access to accounts could lead to data breaches,
        loss of sensitive information, and potential legal and financial
        repercussions. Immediate action to upgrade GitLab or implement
        restrictive measures for email domains is crucial to mitigate this
        threat.
      </p>
      <p className="text-gray-700">
        The assessment also uncovered a variety of medium and low-risk
        vulnerabilities. These include a path traversal issue in the Cisco
        Adaptive Security Appliance, which could enable unauthorized read and
        delete access to sensitive files. Other findings highlighted exposure
        concerns, such as the public accessibility of a Prometheus exporter and
        an exposed Kubelet metrics endpoint, which could provide attackers with
        valuable information to enhance their attacks. Additional
        vulnerabilities were identified in Keycloak, Apache HTTP Server, and
        Node.js applications, potentially facilitating phishing attacks,
        cross-site scripting, or leakage of detailed error messages. Addressing
        these vulnerabilities by updating to latest software versions and
        implementing recommended security practices will enhance the
        client&apos;s overall security posture.
      </p>
    </div>
  );
};
