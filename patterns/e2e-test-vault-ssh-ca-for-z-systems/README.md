## Overview & Problem Statement

This reference implementation demonstrates how to use HashiCorp Vault as an SSH Certificate Authority (CA) for IBM Z (z/OS) systems. The primary goal is to enable secure, short-lived SSH certificates for administrative access, replacing the use of long-lived static SSH keys. This approach enhances security by reducing the risk associated with static credentials and provides centralized control and auditing of SSH access.

## Architecture & Data Flow

- User authenticates to Vault using OIDC or userpass methods.
- User submits their public SSH key to the Vault SSH secrets engine sign endpoint.
- Vault returns a signed SSH certificate with a 30-minute TTL.
- User uses the certificate to SSH into z/OS hosts.
- z/OS host trusts certificates signed by the Vault CA.

## Prerequisites & Setup

- Vault cluster v1.15+ with SSH secrets engine enabled.
- OpenSSH client 7.5+ installed on all IBM Z hosts.
- Network connectivity from z/OS to the Vault API endpoint.
- Vault policy granting 'sign' permission to the SSH certificate requester.

## Step-by-step Implementation

- Enable the SSH secrets engine in Vault:
```hcl
vault secrets enable ssh
```
- Configure the SSH CA and roles in Vault:
```hcl
vault write ssh/config/ca generate_signing_key=true
```
- Create a Vault policy to allow signing:
```hcl
path "ssh/sign/zos-admin" {
  capabilities = ["update"]
}
```
- User authenticates to Vault and requests a signed certificate:
```shell
vault write ssh/sign/zos-admin public_key=@~/.ssh/id_rsa.pub
```
- Configure z/OS OpenSSH to trust the Vault CA public key (add to /etc/ssh/sshd_config):
```shell
TrustedUserCAKeys /etc/ssh/vault_ca.pub
AuthorizedPrincipalsFile /etc/ssh/auth_principals/%u
```

## Security Considerations

- SSH certificates are short-lived (30 minutes by default), reducing the risk of credential leakage.
- No static SSH keys are stored on the z/OS hosts.
- Principals are enforced via the AuthorizedPrincipalsFile configuration.
- Vault audit log captures all certificate signing events for traceability.

## References & Related

- HashiCorp Vault SSH Secrets Engine documentation: https://developer.hashicorp.com/vault/docs/secrets/ssh
- IBM z/OS OpenSSH documentation: https://www.ibm.com/docs/en/zos/2.5.0?topic=openssh

## Gaps & Known Limitations

- z/OS OpenSSH port may require additional tuning to fully support certificate authentication.
- No automated revocation mechanism if Vault is compromised; rely on certificate TTL expiry.

---

## References

- Author: Automation Tester
