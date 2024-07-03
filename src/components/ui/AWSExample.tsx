function AWSExample() {
  return (
    <div>
      <p className="my-4 text-sm">
        In addition to providing your account ID, add{' '}
        <a
          href="/templates/aws-permissions-template.yaml"
          download
          className="bold font-medium text-brand"
        >
          this CloudFormation template
        </a>{' '}
        to the target AWS account. To integrate an organization and
        automatically discover its member accounts, deploy the above template as
        a Stack in the management account and as a StackSet to the desired
        Organization Units.
      </p>
      <p className="text-sm">
        To provide real-time updates to Chariot from your AWS account, add{' '}
        <a
          href="/templates/aws-events-template.yaml"
          download
          className="bold font-medium text-brand"
        >
          this CloudFormation template
        </a>{' '}
        to the target AWS account. Provide your Chariot Webhook URL as a
        parameter when prompted. CloudTrail must be enabled in the target
        account(s).
      </p>
    </div>
  );
}

export default AWSExample;
