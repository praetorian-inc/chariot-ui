export const Definitions = () => {
  return (
    <div className="rounded-[2px] bg-white p-6 shadow-md">
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
            Risks are the identified vulnerabilities and threats found during
            the scanning process.
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
  );
};
