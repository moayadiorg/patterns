## Overview & Problem Statement

As enterprises accelerate digital strategies and adopt hybrid or multi-cloud architectures, secure SSH access to Unix-like servers becomes increasingly complex. Traditional SSH key management introduces risks such as private key compromise, difficult key rotation, unauthorized access, and operational complexity at scale. Many organizations seek SSH key management tools, but these often address only symptoms rather than the root challenge: secrets management. This article presents a scalable, secure, and consistent SSH access architecture using HashiCorp Vault as a certificate authority (CA), applicable across on-premises and public cloud environments.

## Architecture & Data Flow

The architecture leverages HashiCorp Vault's SSH Secrets Engine to act as an SSH CA, issuing short-lived SSH certificates based on authenticated user identity and role. Key features include:

- Identity-based security: Users/applications must authenticate before SSH access is granted.
- Role-based access control (RBAC): Vault policies and roles control which hosts can be accessed.
- Short-lived SSH credentials: Certificates expire automatically, reducing risk.
- Consistent workflows: Simplifies SSH key management across environments.

Workflow steps:

- User creates SSH key pair.
- User authenticates to Vault (e.g., via UserPass, LDAP, or OIDC).
- User submits public key to Vault for signing.
- Vault signs and returns SSH certificate.
- User connects to host using SSH certificate; host verifies certificate via trusted CA public key.

Vault roles and policies enforce which principals can be signed and which hosts can be accessed. The SSH server uses the AuthorizedPrincipalsFile configuration to map principals to local users.

## Prerequisites & Setup

Prerequisites:

- HashiCorp Vault installed and unsealed (can be run in dev mode for testing).
- Vault CLI access.
- Linux/Unix servers with SSH access.

User requirements and permissions are defined via Vault roles and policies, mapping users to SSH principals and access scopes.

## Step-by-step Implementation

1. Enable UserPass authentication and create users:

```shell
vault auth enable userpass
vault write auth/userpass/users/alice password="passw0rd" policies="administrator-policy"
vault write auth/userpass/users/bob password="passw0rd" policies="team-a-policy"
vault write auth/userpass/users/tim password="passw0rd" policies="team-b-policy"
```

2. Enable SSH secrets engine and generate CA key pair:

```shell
vault secrets enable -path=ssh-client-signer ssh
vault write ssh-client-signer/config/ca generate_signing_key=true
```

3. Create Vault roles for SSH certificate signing (example for administrator-role):

```json
{
  "allow_user_certificates": true,
  "allowed_users": "administrator",
  "allowed_extensions": "",
  "default_extensions": [ { "permit-pty": "" } ],
  "key_type": "ca",
  "default_user": "administrator",
  "ttl": "30m0s"
}
```

4. Create Vault policies to restrict users to their authorized roles (example for administrator-policy):

```hcl
path "ssh-client-signer/roles/*" {
  capabilities = ["list"]
}
path "ssh-client-signer/sign/administrator-role" {
  capabilities = ["create","update"]
}
```

5. Configure SSH hosts:

- Create local users (e.g., admin, appadmin).
- Add Vault CA public key to /etc/ssh/trusted-CA.pem.
- Set up /etc/ssh/auth_principals/ files for each user with allowed principals.
- Update sshd_config:

```shell
AuthorizedPrincipalsFile /etc/ssh/auth_principals/%u
ChallengeResponseAuthentication no
PasswordAuthentication no
TrustedUserCAKeys /etc/ssh/trusted-CA.pem
```

6. Client workflow: generate SSH key, authenticate to Vault, request certificate, and connect using SSH certificate.

```shell
ssh-keygen -b 2048 -t rsa -f ~/.ssh/alice-key
vault login -method=userpass username=alice password=passw0rd
vault write -field=signed_key ssh-client-signer/sign/administrator-role \
  public_key=@$HOME/.ssh/alice-key.pub valid_principals=administrator > ~/.ssh/alice-signed-key.pub
ssh -i ~/.ssh/alice-signed-key.pub admin@server "whoami"
```

## Security Considerations

This architecture offers several security advantages:

- Short-lived certificates minimize impact of credential leaks.
- All certificate requests require authentication to a central identity provider (IDP), enabling MFA.
- Minimal host changes; no need for SSH PAM or third-party plugins.
- Granular access control via Vault roles and policies.
- Hosts do not require direct Vault connectivity; only the CA public key is needed.
- Vault audit logs track all authentication and signing events.
- Multiple Vault SSH CAs can be configured for different environments (dev, test, prod).

## References & Related

- HashiCorp Vault SSH Secrets Engine: https://www.vaultproject.io/docs/secrets/ssh
- SSH Secrets Engine: One-Time SSH Password: https://learn.hashicorp.com/tutorials/vault/ssh-otp?in=vault/secrets-management
- Signed SSH Certificates: https://www.vaultproject.io/docs/secrets/ssh/signed-ssh-certificates
- Leveraging Signed SSH for Remote Access with Vault: https://www.hashicorp.com/resources/leveraging-signed-ssh-for-remote-access-with-vault
- sshd_config(5) AuthorizedPrincipalsFile: https://man.openbsd.org/sshd_config#AuthorizedPrincipalsFile

## Gaps & Known Limitations

Known limitations and considerations:

- Initial setup requires Vault and SSH host configuration changes.
- Host principal mapping must be maintained in AuthorizedPrincipalsFile for each user.
- Vault CA private key security is critical; compromise would impact all issued certificates.
- Does not address non-SSH privileged access management (PAM) requirements.
- Integration with IBM Z (z/OS) SSHD requires validation of OpenSSH feature parity and configuration compatibility.

---

## References

- Author: Moayad Ismail
