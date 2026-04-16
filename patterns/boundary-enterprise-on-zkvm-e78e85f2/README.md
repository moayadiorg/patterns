## Overview & Problem Statement

This pattern explores the deployment of HashiCorp Boundary Enterprise on IBM z/KVM, enabling secure, identity-based access management for workloads running on IBM Z mainframes. The goal is to demonstrate how Boundary can be integrated with z/KVM environments to provide just-in-time, least-privilege access to critical systems, addressing the unique security and operational requirements of mainframe infrastructure.

## Architecture & Data Flow

Boundary Enterprise is deployed as a set of controller and worker nodes, with the controllers managing session brokering and policy, and workers handling session connectivity. On z/KVM, Boundary workers can be provisioned as virtual machines, providing access to mainframe-hosted applications. The data flow involves users authenticating to Boundary, which then brokers secure sessions to target resources running on z/KVM VMs.

## Prerequisites & Setup

- IBM z/KVM environment with networking configured.
- Boundary Enterprise binaries and valid license.
- Access to z/KVM management interfaces for VM provisioning.
- Network connectivity between Boundary controllers, workers, and target VMs.

## Step-by-step Implementation

- Provision z/KVM virtual machines for Boundary controller and worker nodes.
- Install Boundary Enterprise on the provisioned VMs.
- Configure Boundary controller with authentication methods and target definitions for z/KVM-hosted resources.
- Register Boundary workers to the controller and verify connectivity.
- Test access workflows: authenticate as a user, request access to a z/KVM VM, and establish a session through Boundary.

## Security Considerations

Boundary enforces identity-based access controls, session recording, and audit logging. On z/KVM, ensure that network segmentation and firewall rules restrict access to Boundary components and target VMs. Use strong authentication methods (such as OIDC or LDAP) and regularly review access policies. Monitor Boundary logs for anomalous activity.

## References & Related

- HashiCorp Boundary documentation: https://developer.hashicorp.com/boundary/docs
- IBM z/KVM documentation: https://www.ibm.com/docs/en/linux-on-systems?topic=virtualization-ibm-zkvm

## Gaps & Known Limitations

This integration is in progress and not yet fully validated for production use. Some advanced Boundary features (such as session recording or dynamic credential injection) may require additional configuration or may not be fully supported on z/KVM. Performance and scalability characteristics on mainframe hardware are still being evaluated.

---

## References

- Source integration: Boundary Enterprise on z/KVM (Boundary + z/KVM)
- Jira story: https://hashicorp.atlassian.net/browse/ADVSA-466
