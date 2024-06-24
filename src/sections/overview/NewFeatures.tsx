export const NewFeatures = () => {
  return (
    <div className="rounded-[2px] bg-white p-6 shadow-md">
      <h2 className="mb-4 text-2xl font-bold">0.18.0 (Latest)</h2>
      <h3 className="text-lg font-semibold">New Features</h3>
      <ul className="list-inside list-disc text-gray-700">
        <li className="mb-2">
          We added an option for the free plan users to upgrade to the managed
          plan where we will triage their risks for 7 days. This allows them to
          experience the value of our security expertise, guiding them along the
          path of evaluating Chariot.
        </li>
        <li className="mb-2">
          We added custom dashboards in the UI, leveraging the open-source
          nature of the UI codebase. Developers can contribute to add new
          widgets. Non-developers can pick from a gallery of widgets to add to
          their dashboards.
        </li>
        <li className="mb-2">
          The filters for risks were updated to allow for multi-select for each
          field.
        </li>
        <li className="mb-2">
          In the class filter on risks, you will discover a entry --
          Misconfiguration. This initially groups together risks such as domain
          expirations.
        </li>
      </ul>
      <h3 className="text-lg font-semibold">Capabilities</h3>
      <ul className="list-inside list-disc text-gray-700">
        <li className="mb-2">
          GitHub integration was updated to report newly public repositories as
          risks; additionally organizations members&apos; public repositories
          are added as assets and scanned.
        </li>
        <li className="mb-2">
          GitLab integration was added. It is integrated with Nosey Parker for
          discovering secret exposure risks.
        </li>
        <li className="mb-2">
          Azure integration is upgraded to support enumerating child
          organizations.
        </li>
      </ul>
    </div>
  );
};
