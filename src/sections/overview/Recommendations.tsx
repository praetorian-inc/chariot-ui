export const Recommendations = ({ client_short }: { client_short: string }) => {
  return (
    <div>
      <h2 className="mb-4 text-2xl font-bold">Recommendations</h2>

      <div className="space-y-4">
        <div className="border-l-4 border-red-600 pl-4">
          <h3 className="text-lg font-semibold">
            Recommendations for Critical and High-Risk Findings
          </h3>
          <p className="text-gray-700">
            Praetorian advises {client_short} to immediately upgrade to the
            fixed GitLab CE and EE versions to mitigate the account takeover
            vulnerability via password reset. If an upgrade is not possible,
            consider restricting which domains can receive emails sent from the
            GitLab server.
          </p>
        </div>

        <div className="border-l-4 border-yellow-600 pl-4">
          <h3 className="text-lg font-semibold">
            Recommendations for Non-Critical Findings
          </h3>
          <ul className="ml-4 list-inside list-disc text-gray-700">
            <li className="mb-2">
              Praetorian suggests that {client_short} update Cisco ASA to a
              patched version as per Cisco&apos;s security advisory to address
              the path traversal vulnerability.
            </li>
            <li className="mb-2">
              Praetorian encourages {client_short} to apply missing patches and
              update Keycloak to the latest available version(s) to mitigate the
              XSS vulnerability.
            </li>
            <li className="mb-2">
              Praetorian recommends that {client_short} secure metric pages
              behind an identity-aware proxy or corporate VPN to protect the
              exposed Kubelet metrics endpoint.
            </li>
            <li className="mb-2">
              Praetorian recommends that {client_short} update the affected
              Apache HTTP Server to version 2.4.41 or later to mitigate the HTML
              injection and partial cross-site scripting vulnerability.
            </li>
            <li className="mb-2">
              Praetorian advises {client_short} to set the NODE_ENV variable to
              &ldquot;production&ldquot; for internet-exposed Express
              applications to disable development mode.
            </li>
            <li className="mb-2">
              Praetorian suggests that {client_short} place the Prometheus
              exporter server behind a private proxy and ensure proper
              authorization controls are configured to prevent unauthorized
              access.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
