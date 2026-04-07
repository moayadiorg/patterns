## Overview & Problem Statement

Legacy mainframe batch schedulers such as CA-7 and IBM Tivoli Workload Scheduler (TWS) are limited in their ability to support modern, cloud-native orchestration patterns. Organizations running high-performance computing (HPC) or batch workloads on IBM z/OS and z/Linux are seeking to modernize their workload orchestration, enable container-based workflows, and migrate JCL-based jobs to more flexible platforms. This pattern explores the use of HashiCorp Nomad to orchestrate batch jobs on z/Linux, facilitate JCL workload migration, and enable USS batch scheduling, addressing the need for scalable, cloud-native batch processing on mainframe environments.  more stuff to add.

## Architecture & Data Flow

The integration leverages HashiCorp Nomad as the central orchestrator for batch and HPC workloads. Nomad schedules and manages jobs on z/Linux partitions, with the potential to trigger or replace traditional JCL-based workloads. Data flow typically involves:

- Nomad submits and schedules batch jobs on z/Linux nodes.
- Jobs may invoke scripts or containers that interact with USS (UNIX System Services) or trigger JCL workloads via APIs or automation bridges.
- Job status and logs are collected by Nomad and can be integrated with enterprise monitoring.

## Prerequisites & Setup

- IBM z/OS mainframe with z/Linux partitions enabled.
- HashiCorp Nomad cluster deployed with access to z/Linux nodes.
- Network connectivity between Nomad clients and mainframe USS/JCL interfaces.
- Optional: Automation bridge or API gateway for JCL invocation from Nomad jobs.

## Step-by-step Implementation

- Deploy Nomad server and client agents on z/Linux and supporting infrastructure.
- Configure Nomad jobs to run batch workloads as containers or scripts on z/Linux.
- For JCL migration, encapsulate JCL logic in scripts or containers, or use automation to trigger JCL from Nomad jobs.
- Integrate job status and logs with enterprise monitoring tools.

```hcl
job "zlinux-batch" {
  datacenters = ["mainframe-dc"]
  type = "batch"
  group "batch-group" {
    task "run-batch" {
      driver = "docker"
      config {
        image = "myorg/zlinux-batch-job:latest"
        command = "/scripts/run_batch.sh"
      }
    }
  }
}
```

## Security Considerations

Ensure secure communication between Nomad and z/Linux nodes using TLS. Limit Nomad job permissions to only required resources. When invoking JCL or USS workloads, use secure APIs or automation bridges with proper authentication and authorization. Monitor and audit job execution to detect unauthorized access or privilege escalation.

## References & Related

- HashiCorp Nomad Documentation: https://developer.hashicorp.com/nomad/docs
- IBM z/OS UNIX System Services: https://www.ibm.com/docs/en/zos/latest?topic=services-unix-system
- IBM z/Linux Overview: https://www.ibm.com/products/linuxone

## Gaps & Known Limitations

This pattern is in discovery and not production-hardened. Direct orchestration of native z/OS JCL jobs from Nomad is not natively supported; requires custom automation or API bridges. Integration with legacy schedulers (CA-7, TWS) may require additional adapters. USS and z/Linux coverage is strong, but mainframe-native workload orchestration is limited to what can be exposed via UNIX interfaces or automation.

---

## References

- Source integration: Batch/HPC Workload Orchestration (Nomad) (Nomad + z/OS)
- Jira story: https://hashicorp.atlassian.net/browse/ADVSA-458
