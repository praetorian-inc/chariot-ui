export const sampleReport = `## EngagaementSummary
Company-inc-2023-12-0403 engaged Praetorian to conduct a security assessment. During the engagement, Praetorian identified 6 low risk(s).

## Findings
### Critical and High-Risk Findings

Critical and high-risk findings pose a material risk to the security of {{client_possessive}} most important assets, and should be prioritized for remediation. Praetorian identified the following critical and high-risk findings during the course of the engagement.

- **Unprotected Network Shares**
  - Praetorian identified unrestricted access to file share directories over the internal network.
  - This could lead to the disclosure of sensitive information and the potential for further attacks, including data modification or remote code execution.

- **Missing Security Patches**
  - Praetorian found systems missing security patches, making them vulnerable to known exploits.
  - This can result in high-risk vulnerabilities, potentially giving attackers full control of affected systems.

### Non-Critical Findings

Praetorian identified the following medium/low-risk findings during the course of the engagement.

- **Local Admin Privilege Escalation During Autopilot OOBE**
  - Praetorian discovered that unauthorized users could escalate privileges to the local administrator level during the Autopilot Out-of-Box Experience.
  - This could allow an attacker to gain persistent elevated access to systems, leading to unauthorized access and potential data compromise.

- **Sensitive Data Stored on Network Share without Encryption**
  - Praetorian found sensitive data stored on network shares without encryption.
  - An attacker or malicious insider could read this information, leading to data theft or exposure.


## Recommendations
### Recommendations for Critical and High-Risk Findings

Praetorian did not find any critical or high-risk findings during the course of the engagement.

### Recommendations for Non-Critical Findings

- Praetorian advises {{client_short}} to review file storage policies to ensure permissions on centrally stored files limit access to users with a need-to-know.
- Praetorian recommends that {{client_short}} implement a patch management strategy to apply missing security patches and monitor software versions.
- Praetorian advises {{client_short}} to utilize Windows Autopilot for Pre-Provisioned Deployment to apply policies before user interaction and to configure security measures such as renaming and enabling the built-in Administrator account, implementing Windows LAPS, and enabling Account Protection.
- Praetorian advises {{client_short}} to implement data encryption for sensitive information stored on network shares and to consider moving this data to a segmented network.
- Praetorian suggests that {{client_short}} secure the Redis server by configuring authentication with a strong password, restricting network access, and using Access Control Lists (ACLs) to define and limit user permissions.
- Praetorian advises {{client_short}} to enhance detection capabilities for suspicious activity that may lead to disabling the EDR system, improve incident response playbooks, and conduct regular security awareness training for personnel.

## Business Impact
The cybersecurity assessment identified notable vulnerabilities impacting the client's overall security posture. Most critically, the lack of protection for network file shares and missing security patches could lead to unauthorized access, disclosure of sensitive information, and potential full control over systems. Moreover, the ability to escalate privileges via the Autopilot OOBE phase allows unauthorized users to gain persistent and elevated access. These findings significantly increase the risk of data breaches, unauthorized data manipulation, and potential exploitation by attackers, ultimately compromising system integrity and trust.

Other significant issues include the storage of sensitive data on network shares without encryption and an unrestricted Redis server, both of which could lead to data theft and further network exploitation. Additionally, the possibility of disabling the EDR system by local administrators severely weakens the organization’s defenses against advanced threats. Ensuring secure configurations and continuous monitoring is essential to minimize these vulnerabilities and protect sensitive information from unauthorized access. These findings combined highlight critical areas needing immediate remediation to enhance the client's cybersecurity resilience.

## Conclusion
Praetorian thanks booking-holdings-inc-2023-12-0403 for the opportunity to perform risk analysis.`;

export const getReportSections = ({
  report = '',
  data = {},
  regex = /(^##\s+.*$)/,
}: {
  report: string;
  data?: Record<string, string>;
  regex?: RegExp;
}): Record<string, string | object> => {
  const headingRegex = new RegExp(regex, 'gm');
  const sections = report.match(headingRegex) || [];

  const sectionContent = sections.reduce(
    (acc, section, index) => {
      const startIndex = report.indexOf(section) + section.length;
      const endIndex =
        index === sections.length - 1
          ? report.length
          : report.indexOf(sections[index + 1]);
      const header = section.split('## ')[1];
      const content = report.slice(startIndex, endIndex).trim();
      const contentWithData = content.replace(
        /{{(.*?)}}/g,
        (current, key) => data?.[key] || current
      );

      const subContent = getReportSections({
        report: contentWithData,
        regex: /(^###\s+.*$)/,
        data,
      });

      return {
        ...acc,
        [header]:
          Object.keys(subContent).length === 0 ? contentWithData : subContent,
      };
    },
    {} as Record<string, string | object>
  );

  return sectionContent;
};
