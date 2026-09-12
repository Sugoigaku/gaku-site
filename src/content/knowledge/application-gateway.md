---
title: Azure Application Gateway
description: A practical mental model for routing, securing, scaling, and troubleshooting regional application traffic in Azure.
category: Azure
tags: [Azure, Networking, Load Balancing, WAF]
publishedAt: 2026-09-12
reviewedAt: 2026-09-12
---

Azure Application Gateway is a regional traffic-management service for applications. Its core strength is Layer 7 routing: it can inspect HTTP request attributes such as the host name and URL path, then send the request to the appropriate backend.

The current generation is the **v2 SKU family** (`Standard_v2` and `WAF_v2`). Application Gateway v1 retired on April 28, 2026 and is no longer supported.

> **Current-scope note:** Application Gateway remains best known for HTTP and HTTPS application delivery. The v2 platform also offers TCP/TLS proxy capabilities for supported scenarios, so it should no longer be described as categorically HTTP/HTTPS-only.

## When Application Gateway Fits

Use Application Gateway when a regional application needs one or more of the following:

- Route different URL paths to different backend pools.
- Host multiple domain names behind one gateway.
- Terminate TLS centrally or re-encrypt traffic to the backend.
- Rewrite request or response headers and URLs.
- Remove unhealthy backends from rotation through application-aware probes.
- Scale gateway capacity with demand.
- Protect web applications with Azure Web Application Firewall (WAF).

Choose another service when the problem is fundamentally different:

| Requirement | Better starting point |
| --- | --- |
| Global HTTP routing, edge acceleration, or CDN behavior | Azure Front Door |
| DNS-based global traffic distribution | Azure Traffic Manager |
| General regional Layer 4 load balancing | Azure Load Balancer |

These services can also be combined. For example, Front Door can provide the global entry point while Application Gateway performs regional routing and WAF enforcement.

## The Request Flow

A useful way to understand the configuration is to follow a request through six building blocks:

```text
Client
  -> Frontend IP configuration
  -> Listener
  -> Request routing rule
  -> Backend setting
  -> Backend pool
  -> Health probe
```

| Component | Question it answers |
| --- | --- |
| Frontend IP | Where does traffic enter: a public or private address? |
| Listener | Which protocol, port, host name, and frontend should accept the request? |
| Routing rule | Which backend pool and backend settings should handle the request? |
| Backend setting | How should the gateway connect to the backend? |
| Backend pool | Which servers, addresses, or services can receive traffic? |
| Health probe | Which backend members are currently safe to use? |

The routing rule is the connector. A backend pool defines **who** can receive traffic, while its backend setting defines **how** Application Gateway communicates with them.

## Routing Patterns

### Path-based routing

Path rules let one domain send `/images/*` and `/videos/*` to different backend pools. This keeps a single public entry point while allowing services to scale and deploy independently.

### Multiple-site hosting

Multisite listeners distinguish requests by host name, such as `app1.example.com` and `app2.example.com`. Each site can have its own listener, certificate, routing rules, and WAF policy.

Host-based and path-based routing can be combined: first select a site by host name, then select a backend by URL path.

## TLS and Backend Connectivity

With **TLS termination**, Application Gateway decrypts the client connection at the gateway. This centralizes certificate management and reduces cryptographic work on backend servers. Traffic from the gateway to the backend can use HTTP when that is acceptable.

With **end-to-end TLS**, the gateway terminates the client connection, inspects the request, and establishes a new encrypted connection to the backend. Use this when policy or application requirements prohibit unencrypted backend traffic.

## Reliability Features

- **Custom health probes** can evaluate an application path and expected HTTP response instead of checking only whether a port is open.
- **Autoscaling** adjusts v2 capacity within the configured range as traffic changes.
- **Zone redundancy** can distribute instances across availability zones in supported regions. Confirm the deployment configuration rather than assuming every existing gateway is zone-redundant.
- **Cookie-based affinity** keeps a client on the same backend when a stateful application requires it, at the cost of less even distribution.
- **Connection draining** allows existing requests to finish when a backend is removed.

## WAF Policy Scope

`WAF_v2` supports WAF policies at three levels:

1. Gateway-wide policy
2. Listener or site policy
3. URL path policy

The most specific policy applies to a request: a path policy overrides a listener policy, and a listener policy overrides the global policy. This is useful for tuning one application, but it can also explain why a global rule appears not to apply.

## Subnet Planning

Application Gateway requires a dedicated subnet that contains only Application Gateway resources. Multiple Application Gateway deployments can share that subnet, but other Azure resource types cannot. Do not mix v1 and v2 gateways in the same subnet.

Subnet sizing matters because each instance consumes an address and v2 can scale substantially. Microsoft recommends planning enough space for expected autoscaling and maintenance operations; a `/24` is recommended for many v2 deployments, although the exact requirement depends on capacity.

## First Troubleshooting Checks

| Symptom | First checks |
| --- | --- |
| Deployment fails | Dedicated-subnet rules, subnet capacity, permissions, NSGs, and routes |
| 502 or unavailable backend | Backend health, probe host/path/status expectations, DNS, and network rules |
| Request reaches the wrong site | Listener host name, frontend binding, DNS, and rule priority |
| Path reaches the wrong backend | Path-map order, default rule, backend pool, and backend setting |
| WAF policy appears ineffective | Policy mode and association scope; check for a more specific policy |
| Sessions reset between requests | Whether the application is stateful and affinity is required |
| Requests fail during backend removal | Connection-draining configuration and timeout |

## Official References

- [What is Azure Application Gateway?](https://learn.microsoft.com/azure/application-gateway/overview)
- [What is Azure Application Gateway v2?](https://learn.microsoft.com/azure/application-gateway/overview-v2)
- [Application Gateway infrastructure configuration](https://learn.microsoft.com/azure/application-gateway/configuration-infrastructure)
- [Azure Application Gateway features](https://learn.microsoft.com/azure/application-gateway/features)
- [Azure WAF policy overview](https://learn.microsoft.com/azure/web-application-firewall/ag/policy-overview)

This article is a public English adaptation of personal study notes. Product behavior and limits can change; verify implementation decisions against current Microsoft documentation.