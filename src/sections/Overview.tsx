/* eslint-disable react/no-unescaped-entities */
import React from 'react';

import Counts from '@/components/ui/Counts';

export const Overview = () => {
  const client_short = 'Acme Corp.';
  return (
    <div className="flex min-h-screen flex-col space-y-6">
      <Counts
        stats={{
          seeds: 100,
          assets: 300,
          risks: 50,
        }}
        type="overview"
      />

      <div className="flex space-x-6">
        {/* Left Column: New Features */}
        <div className="w-1/4 rounded-[2px] bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">0.18.0 (Latest)</h2>
          <h3 className="text-lg font-semibold">New Features</h3>
          <ul className="list-inside list-disc text-gray-700">
            <li className="mb-2">
              We added an option for the free plan users to upgrade to the
              managed plan where we will triage their risks for 7 days. This
              allows them to experience the value of our security expertise,
              guiding them along the path of evaluating Chariot.
            </li>
            <li className="mb-2">
              We added custom dashboards in the UI, leveraging the open-source
              nature of the UI codebase. Developers can contribute to add new
              widgets. Non-developers can pick from a gallery of widgets to add
              to their dashboards.
            </li>
            <li className="mb-2">
              The filters for risks were updated to allow for multi-select for
              each field.
            </li>
            <li className="mb-2">
              In the class filter on risks, you will discover a entry --
              Misconfiguration. This initially groups together risks such as
              domain expirations.
            </li>
          </ul>
          <h3 className="text-lg font-semibold">Capabilities</h3>
          <ul className="list-inside list-disc text-gray-700">
            <li className="mb-2">
              GitHub integration was updated to report newly public repositories
              as risks; additionally organizations members' public repositories
              are added as assets and scanned.
            </li>
            <li className="mb-2">
              GitLab integration was added. It is integrated with Nosey Parker
              for discovering secret exposure risks.
            </li>
            <li className="mb-2">
              Azure integration is upgraded to support enumerating child
              organizations.
            </li>
          </ul>
        </div>

        {/* Center Column: Main Report Information */}
        <div className="w-2/4">
          <div className="rounded-[2px] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Findings</h2>
            <p className="mb-4 text-gray-700">
              Critical and high-risk findings pose a material risk to the
              security of the client's most important assets, and should be
              prioritized for remediation. Praetorian identified the following
              critical and high-risk findings during the course of the
              engagement.
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
                    Praetorian identified a flaw in the email verification
                    process for password resets in certain versions of GitLab,
                    allowing an attacker to manipulate passwords and take over
                    user accounts. An attacker exploiting this vulnerability
                    could take over any account on the server, posing a
                    significant security risk.
                  </p>
                </div>
              </div>

              <h3 className="text-lg font-semibold">
                Medium and Low-Risk Findings
              </h3>
              <div className="border-l-4 border-yellow-600 pl-4">
                <div className="mt-2">
                  <strong className="text-lg">
                    Cisco Adaptive Security Appliance Path Traversal
                  </strong>
                  <p className="text-gray-700">
                    Praetorian discovered a vulnerability in the web services
                    interface of Cisco ASA that could allow attackers to conduct
                    directory traversal attacks and access sensitive files. The
                    ability to view and delete arbitrary files could leak
                    sensitive information, although reloading the device will
                    restore the files.
                  </p>
                </div>

                <div className="mt-2">
                  <strong className="text-lg">Exposed Kubelet Metrics</strong>
                  <p className="text-gray-700">
                    Praetorian found an exposed Kubelet metrics endpoint during
                    automated analysis. An attacker could use this information
                    to increase the efficacy of an attack by knowing more about
                    the internal environment and system metrics.
                  </p>
                </div>

                <div className="mt-2">
                  <strong className="text-lg">
                    Node.js Express Development Mode Enabled
                  </strong>
                  <p className="text-gray-700">
                    Praetorian observed that the Express application was running
                    in development mode, which provides detailed error messages.
                    These detailed error messages could potentially contain
                    information that might be leveraged by an attacker in a more
                    impactful attack.
                  </p>
                </div>

                <div className="mt-2">
                  <strong className="text-lg">
                    Prometheus Exporter Detected
                  </strong>
                  <p className="text-gray-700">
                    Praetorian identified a publicly accessible Prometheus
                    exporter service. Exposing this service to the internet
                    could allow an attacker to obtain sensitive information
                    stored in logs and exploit any new vulnerabilities quickly.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2px] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Recommendations</h2>

            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="text-lg font-semibold">
                  Recommendations for Critical and High-Risk Findings
                </h3>
                <p className="text-gray-700">
                  Praetorian advises {client_short} to immediately upgrade to
                  the fixed GitLab CE and EE versions to mitigate the account
                  takeover vulnerability via password reset. If an upgrade is
                  not possible, consider restricting which domains can receive
                  emails sent from the GitLab server.
                </p>
              </div>

              <div className="border-l-4 border-yellow-600 pl-4">
                <h3 className="text-lg font-semibold">
                  Recommendations for Non-Critical Findings
                </h3>
                <ul className="ml-4 list-inside list-disc text-gray-700">
                  <li className="mb-2">
                    Praetorian suggests that {client_short} update Cisco ASA to
                    a patched version as per Cisco's security advisory to
                    address the path traversal vulnerability.
                  </li>
                  <li className="mb-2">
                    Praetorian encourages {client_short} to apply missing
                    patches and update Keycloak to the latest available
                    version(s) to mitigate the XSS vulnerability.
                  </li>
                  <li className="mb-2">
                    Praetorian recommends that {client_short} secure metric
                    pages behind an identity-aware proxy or corporate VPN to
                    protect the exposed Kubelet metrics endpoint.
                  </li>
                  <li className="mb-2">
                    Praetorian recommends that {client_short} update the
                    affected Apache HTTP Server to version 2.4.41 or later to
                    mitigate the HTML injection and partial cross-site scripting
                    vulnerability.
                  </li>
                  <li className="mb-2">
                    Praetorian advises {client_short} to set the NODE_ENV
                    variable to "production" for internet-exposed Express
                    applications to disable development mode.
                  </li>
                  <li className="mb-2">
                    Praetorian suggests that {client_short} place the Prometheus
                    exporter server behind a private proxy and ensure proper
                    authorization controls are configured to prevent
                    unauthorized access.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-[2px] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Business Impact</h2>
            <p className="mb-4 text-gray-700">
              The cybersecurity assessment revealed several critical and
              high-risk vulnerabilities that could significantly impact the
              client's business. The most severe finding involves a flaw in the
              GitLab email verification process for password resets, allowing a
              potential attacker to take over user accounts. This vulnerability
              presents considerable risk, as unauthorized access to accounts
              could lead to data breaches, loss of sensitive information, and
              potential legal and financial repercussions. Immediate action to
              upgrade GitLab or implement restrictive measures for email domains
              is crucial to mitigate this threat.
            </p>
            <p className="text-gray-700">
              The assessment also uncovered a variety of medium and low-risk
              vulnerabilities. These include a path traversal issue in the Cisco
              Adaptive Security Appliance, which could enable unauthorized read
              and delete access to sensitive files. Other findings highlighted
              exposure concerns, such as the public accessibility of a
              Prometheus exporter and an exposed Kubelet metrics endpoint, which
              could provide attackers with valuable information to enhance their
              attacks. Additional vulnerabilities were identified in Keycloak,
              Apache HTTP Server, and Node.js applications, potentially
              facilitating phishing attacks, cross-site scripting, or leakage of
              detailed error messages. Addressing these vulnerabilities by
              updating to latest software versions and implementing recommended
              security practices will enhance the client's overall security
              posture.
            </p>
          </div>

          <div className="mt-6 rounded-[2px] bg-white p-6 shadow-md">
            <h2 className="mb-4 text-2xl font-bold">Conclusion</h2>
            <p className="text-gray-700">
              Praetorian thanks managed_services+halliburton@praetorian.com for
              the opportunity to perform risk analysis.
            </p>
          </div>
        </div>

        {/* Right Column: Definitions */}
        <div className="w-1/4 rounded-[2px] bg-white p-6 shadow-md">
          <h2 className="mb-4 text-2xl font-bold">Definitions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Seeds</h3>
              <p className="text-gray-700">
                A seed can be a domain, IPv4, IPv6, CIDR range, or GitHub
                organization.
              </p>
              <a href="#" className="text-primary">
                Learn more
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Assets</h3>
              <p className="text-gray-700">
                Assets are the discovered items from the scanning process.
              </p>
              <a href="#" className="text-primary">
                Learn more
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Risks</h3>
              <p className="text-gray-700">
                Risks are the identified vulnerabilities and threats found
                during the scanning process.
              </p>
              <a href="#" className="text-primary">
                Learn more
              </a>
            </div>

            <div>
              <h3 className="text-lg font-semibold">Jobs</h3>
              <p className="text-gray-700">
                Jobs are the tasks and processes performed by the platform.
              </p>
              <a href="#" className="text-primary">
                Learn more
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
