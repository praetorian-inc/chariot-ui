export const Findings = () => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Findings</h2>
      <p className="mb-4 text-gray-700">
        Critical and high-risk findings pose a material risk to the security of
        the client&apos;s most important assets, and should be prioritized for
        remediation. Praetorian identified the following critical and high-risk
        findings during the course of the engagement.
      </p>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">
          Critical and High-Risk Findings
        </h3>
        <div className="border-l-4 border-red-600 pl-4">
          <div className="mt-2">
            <strong className="text-lg">
              GitLab CE/EE - Account Takeover via Password Reset
            </strong>
            <p className="text-gray-700">
              Praetorian identified a flaw in the email verification process for
              password resets in certain versions of GitLab, allowing an
              attacker to manipulate passwords and take over user accounts. An
              attacker exploiting this vulnerability could take over any account
              on the server, posing a significant security risk.
            </p>
          </div>
        </div>

        <h3 className="text-lg font-semibold">Medium and Low-Risk Findings</h3>
        <div className="border-l-4 border-yellow-600 pl-4">
          <div className="mt-2">
            <strong className="text-lg">
              Cisco Adaptive Security Appliance Path Traversal
            </strong>
            <p className="text-gray-700">
              Praetorian discovered a vulnerability in the web services
              interface of Cisco ASA that could allow attackers to conduct
              directory traversal attacks and access sensitive files. The
              ability to view and delete arbitrary files could leak sensitive
              information, although reloading the device will restore the files.
            </p>
          </div>

          <div className="mt-2">
            <strong className="text-lg">Exposed Kubelet Metrics</strong>
            <p className="text-gray-700">
              Praetorian found an exposed Kubelet metrics endpoint during
              automated analysis. An attacker could use this information to
              increase the efficacy of an attack by knowing more about the
              internal environment and system metrics.
            </p>
          </div>

          <div className="mt-2">
            <strong className="text-lg">
              Node.js Express Development Mode Enabled
            </strong>
            <p className="text-gray-700">
              Praetorian observed that the Express application was running in
              development mode, which provides detailed error messages. These
              detailed error messages could potentially contain information that
              might be leveraged by an attacker in a more impactful attack.
            </p>
          </div>

          <div className="mt-2">
            <strong className="text-lg">Prometheus Exporter Detected</strong>
            <p className="text-gray-700">
              Praetorian identified a publicly accessible Prometheus exporter
              service. Exposing this service to the internet could allow an
              attacker to obtain sensitive information stored in logs and
              exploit any new vulnerabilities quickly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
