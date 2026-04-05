## Overview & Problem Statement

This integration pattern addresses the challenges of managing network segmentation for IBM Z and LinuxOne workloads. Manual network changes are error-prone and difficult to audit. By leveraging HashiCorp Consul, organizations can achieve version-controlled, automated network infrastructure for mainframe environments. The goal is to enable service mesh capabilities, automate HiperSockets network configuration, and provide robust service discovery for Z-based microservices.

## Architecture & Data Flow

The architecture integrates Consul as a service mesh and service discovery platform with IBM z/OS and LinuxOne systems. Consul agents run on distributed LinuxOne nodes and communicate with z/OS endpoints. HiperSockets are configured to provide high-speed, in-memory network connectivity between LPARs. Network segmentation policies are defined in Consul and propagated to Z workloads, ensuring consistent and auditable network state.

## Prerequisites & Setup

- IBM z/OS or LinuxOne environment with HiperSockets enabled
- HashiCorp Consul installed on LinuxOne nodes
- Network connectivity between Consul agents and z/OS endpoints
- Access to version control system for infrastructure as code

## Step-by-step Implementation

- Deploy Consul agents on LinuxOne nodes and configure them to join the Consul cluster.
- Define network segmentation policies in Consul using HCL configuration files.
- Automate HiperSockets configuration using scripts or infrastructure as code tools.
- Enable service discovery for Z microservices by registering them with Consul.
- Version-control all network and service definitions to ensure auditability and rollback.

```hcl
service {
  name = "zos-microservice"
  port = 8080
  tags = ["z", "mainframe"]
  check {
    http = "http://localhost:8080/health"
    interval = "10s"
  }
}
```

## Security Considerations

Ensure secure communication between Consul agents and z/OS endpoints using TLS. Limit access to Consul UI and APIs to authorized personnel. Regularly audit network segmentation policies and service registrations. Use version control to track changes and enable rollback in case of misconfiguration.

## References & Related

- HashiCorp Consul documentation: https://developer.hashicorp.com/consul/docs
- IBM z/OS HiperSockets: https://www.ibm.com/docs/en/zos

## Gaps & Known Limitations

This pattern is in discovery status and may require manual intervention for some network changes. Full automation of HiperSockets configuration is not yet available. Integration with native z/OS service registration may require custom development. Testing in production environments is recommended before broad adoption.

---

## References

- Source integration: Network Segmentation for Z/LinuxOne Workloads (Consul + z/OS)
- Jira story: https://hashicorp.atlassian.net/browse/ADVSA-452
