## Overview & Problem Statement

This integration pattern demonstrates how to use Infrastructure as Code (IaC) with HashiCorp Terraform to automate the provisioning and management of VMware resources. The goal is to enable consistent, repeatable, and auditable infrastructure deployments on VMware environments, reducing manual effort and minimizing configuration drift.

## Architecture & Data Flow

The architecture consists of the following components:

- Terraform CLI or HCP Terraform as the IaC orchestrator.
- VMware vSphere as the target infrastructure platform.
- Terraform VMware vSphere Provider to interact with VMware APIs.

Data flow: Terraform reads configuration files, authenticates with VMware vSphere, and applies the desired state by creating, updating, or deleting VMware resources as defined in the Terraform code.

## Prerequisites & Setup

- Access to a VMware vSphere environment (vCenter, ESXi hosts).
- Terraform CLI installed (or access to HCP Terraform).
- Terraform VMware vSphere Provider configured.
- Network connectivity between the Terraform runner and vSphere API endpoint.

## Step-by-step Implementation

Below is a full example of using Terraform to provision a VMware virtual machine:

```hcl
provider "vsphere" {
  user           = var.vsphere_user
  password       = var.vsphere_password
  vsphere_server = var.vsphere_server
  allow_unverified_ssl = true
}

data "vsphere_datacenter" "dc" {
  name = var.datacenter
}

data "vsphere_datastore" "datastore" {
  name          = var.datastore
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_compute_cluster" "cluster" {
  name          = var.cluster
  datacenter_id = data.vsphere_datacenter.dc.id
}

data "vsphere_network" "network" {
  name          = var.network
  datacenter_id = data.vsphere_datacenter.dc.id
}

resource "vsphere_virtual_machine" "vm" {
  name             = "terraform-test-vm"
  resource_pool_id = data.vsphere_compute_cluster.cluster.resource_pool_id
  datastore_id     = data.vsphere_datastore.datastore.id

  num_cpus = 2
  memory   = 4096
  guest_id = "otherGuest"

  network_interface {
    network_id   = data.vsphere_network.network.id
    adapter_type = "vmxnet3"
  }

  disk {
    label            = "disk0"
    size             = 20
    eagerly_scrub    = false
    thin_provisioned = true
  }

  clone {
    template_uuid = var.template_uuid
  }
}
```

## Security Considerations

Ensure that credentials used by Terraform are stored securely, such as in environment variables or a secrets manager. Limit the permissions of the vSphere user to only what is necessary for provisioning. Enable SSL/TLS for all API communications and avoid using 'allow_unverified_ssl' in production environments.

## References & Related

- Terraform VMware vSphere Provider documentation: https://registry.terraform.io/providers/hashicorp/vsphere/latest/docs
- HashiCorp Terraform documentation: https://developer.hashicorp.com/terraform/docs

## Gaps & Known Limitations

Some advanced VMware features may not be fully supported by the Terraform provider. Changes made directly in vSphere may not be reflected in Terraform state, leading to potential drift. Using 'allow_unverified_ssl' is not recommended for production. Integration with IBM Z-specific VMware environments may require additional configuration.

---

## References

- Author: Moayad
