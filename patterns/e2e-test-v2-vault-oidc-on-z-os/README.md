## Overview & Problem Statement

This pattern demonstrates how to integrate HashiCorp Vault with OIDC authentication on IBM Z (z/OS) systems. By federating user identities from an external identity provider (such as Azure AD or Okta), z/OS applications can securely access Vault secrets without managing long-lived credentials. The approach enables centralized, identity-based access control for mainframe workloads.

## Architecture & Data Flow

- User authenticates to the external identity provider (IDP) via a browser.
- The IDP returns an OIDC token to the user.
- The user exchanges the OIDC token for a Vault token.
- The Vault token is used to retrieve secrets from Vault.
- The z/OS application uses the Vault API with the token to access required secrets.

## Prerequisites & Setup

- HashiCorp Vault 1.15 or later with the OIDC authentication method enabled.
- An external identity provider (Azure AD or Okta) configured with Vault as a relying party.
- IBM z/OS 2.5 or later with network connectivity to the Vault server.
- Vault policies defined and scoped to user roles as determined by IDP claims.

## Step-by-step Implementation

- Enable the OIDC authentication method in Vault.
```hcl
vault auth enable oidc
```
- Configure Vault as a relying party in your identity provider (Azure AD or Okta).
- Set up Vault OIDC configuration with client ID, client secret, and redirect URIs.
```hcl
vault write auth/oidc/config oidc_discovery_url="https://login.microsoftonline.com/<tenant>/v2.0" oidc_client_id="<client_id>" oidc_client_secret="<client_secret>" default_role="zos-role"
```
- Define Vault roles and policies mapped to IDP claims.
- On z/OS, implement client logic to perform OIDC browser authentication, exchange the OIDC token for a Vault token, and use the Vault API to retrieve secrets.

## Security Considerations

- No long-lived credentials are stored on z/OS systems.
- Access to secrets is controlled by identity-based policies derived from IDP claims.
- All secret access is logged in Vault's audit log for traceability.
- Vault token TTLs are enforced server-side to limit exposure.

## References & Related

- HashiCorp Vault OIDC Auth Method Documentation: https://developer.hashicorp.com/vault/docs/auth/oidc
- IBM z/OS Documentation: https://www.ibm.com/docs/en/zos

## Gaps & Known Limitations

- OIDC browser flow requires a reachable callback URL, which may be challenging in some z/OS environments.
- Token renewal and refresh must be handled by the client application logic.

---

## References

- Author: Automation Tester
