## Overview & Problem Statement

Permanent privileged accounts on mainframe systems such as IBM z/OS introduce significant security risks, including potential misuse and lack of accountability. This integration pattern addresses the need for zero standing privileges and provides a complete session audit trail by leveraging HashiCorp Boundary with IBM RACF. The goal is to enable just-in-time privileged access to z/OS systems, ensuring that privileged credentials are only provisioned when needed and all access is fully auditable.  More changes made here.  Another change.  Is it the rebase that makes it the same commit?

## Architecture & Data Flow

The integration architecture consists of HashiCorp Boundary acting as the privileged access broker, interfacing with IBM RACF for dynamic credential provisioning. When a user requests access to a z/OS resource, Boundary authenticates the user, provisions a temporary privileged credential via RACF, and brokers the session. All session activity is recorded for audit purposes. The data flow is as follows:

- User requests privileged access to a z/OS system via Boundary.
- Boundary authenticates the user and checks policy.
- Boundary requests a dynamic credential from RACF.
- User session is brokered through Boundary, with session recording enabled.
- Upon session termination, credentials are revoked and a complete audit trail is available.

## Prerequisites & Setup

- HashiCorp Boundary deployed and configured.
- IBM z/OS system with RACF enabled for dynamic credential management.
- Network connectivity between Boundary and z/OS endpoints.
- Session recording and audit logging configured in Boundary.

## Step-by-step Implementation

- Deploy and configure HashiCorp Boundary in your environment.
- Integrate Boundary with your identity provider for user authentication.
- Configure Boundary to request dynamic credentials from RACF for z/OS targets.
- Define policies in Boundary to control who can request privileged access.
- Enable session recording and audit logging in Boundary.
- Test the end-to-end workflow: request access, establish session, verify credential issuance and revocation, and review audit logs.

## Security Considerations

This pattern eliminates permanent privileged accounts, reducing the attack surface and risk of credential misuse. All privileged access is time-bound and fully auditable. Ensure that Boundary and RACF are securely configured, network communications are encrypted, and audit logs are protected from tampering. Regularly review policies and audit trails to detect anomalies.

## References & Related

- HashiCorp Boundary documentation: https://developer.hashicorp.com/boundary/docs
- IBM RACF documentation: https://www.ibm.com/docs/en/zos/latest?topic=products-resource-access-control-facility-racf

## Gaps & Known Limitations

This pattern is in discovery and not yet production-validated. Owner assignment and further development are needed. Integration with RACF for dynamic credential provisioning may require custom scripting or middleware. Session recording granularity and audit integration with mainframe native tools may be limited. Additional testing is required for high-availability and failover scenarios.

---

## References

- Source integration: Privileged Access for Automation (Boundary) (Boundary + RACF)
- Jira story: https://hashicorp.atlassian.net/browse/ADVSA-450
