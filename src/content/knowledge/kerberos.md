---
title: Kerberos, from Tickets to Azure NetApp Files
description: A practical explanation of Kerberos exchanges, session keys, service identities, and their use with Azure NetApp Files.
category: Identity
tags: [Kerberos, Active Directory, Authentication, Azure NetApp Files]
publishedAt: 2026-09-12
reviewedAt: 2026-09-12
---

Kerberos is a ticket-based network authentication protocol. It lets a client and a service prove their identities through a trusted **Key Distribution Center (KDC)** without sending a reusable plaintext password to the service.

In an Active Directory environment, a domain controller acts as the KDC. Kerberos answers **who are you?** Authorization remains the target service's responsibility.

## The Three Exchanges

| Exchange | Messages | Purpose |
| --- | --- | --- |
| Authentication Service | `AS-REQ` / `AS-REP` | Obtain a Ticket-Granting Ticket (TGT) |
| Ticket-Granting Service | `TGS-REQ` / `TGS-REP` | Exchange the TGT for a service ticket |
| Application | `AP-REQ` / optional `AP-REP` | Present the service ticket to the target service |

The simplified flow is:

```text
1. Client -> KDC: prove identity and request a TGT
2. KDC -> Client: return a TGT and client/KDC session material
3. Client -> KDC: present the TGT and request a ticket for a named service
4. KDC -> Client: return a service ticket and client/service session material
5. Client -> Service: present the service ticket and an authenticator
6. Service -> Client: optionally prove its identity for mutual authentication
```

## Why Tickets and Session Keys Matter

The TGT is encrypted so that the ticket-granting service can read it. A service ticket is protected with key material associated with the target service, so the client cannot simply alter the ticket contents.

Kerberos also gives the client and service shared session-key material. The client uses it to create an **authenticator**, which is sent with the ticket and helps prove that the presenter is the principal for whom the ticket was issued. Timestamps and replay detection limit reuse of captured authentication messages.

Pre-authentication commonly requires the client to prove possession of its long-term key before the KDC issues a TGT. In Active Directory this is normally derived from the user's sign-in secret, but the password itself is not sent as reusable plaintext.

## Identities and Authorization Data

### Service Principal Names

A **Service Principal Name (SPN)** identifies a service instance, commonly in a form such as `service/host`. The KDC uses the SPN to locate the account whose key material protects the service ticket. Missing, duplicate, or incorrectly registered SPNs are common causes of Kerberos failures.

### Privilege Attribute Certificate

Active Directory service tickets can contain a **Privilege Attribute Certificate (PAC)** with authorization information such as user and group security identifiers. The receiving Windows service can use this data when it builds an access token. The ticket authenticates the identity; the service still makes the authorization decision.

## Time and Ticket Lifetime

Kerberos depends on synchronized clocks because tickets and authenticators contain timestamps. The default maximum clock skew in Windows is five minutes, but administrators can change policy and configuration.

Ticket lifetimes are also KDC-controlled. A roughly ten-hour user-ticket lifetime is common in default Windows policy, but it should not be treated as a protocol constant. Check the effective domain policy when diagnosing expiration or renewal behavior.

Common Windows and Azure NetApp Files-related ports include Kerberos on TCP/UDP 88 and password change on TCP/UDP 464. Real deployments may also require DNS, LDAP, Global Catalog, and other Active Directory connectivity. Port 749 is associated with a Kerberos administration service in some implementations; it is not a universal Windows AD requirement.

## Encryption Types and Traffic Protection

Kerberos **encryption types** protect tickets and protocol exchanges. They are not automatically the same thing as encrypting all application data in transit.

For Azure NetApp Files, current guidance favors AES. Supported choices depend on protocol and configuration:

- SMB and dual-protocol Active Directory scenarios can negotiate AES-128 or AES-256; RC4-HMAC is legacy transition material and should not be a long-term target.
- NFSv4.1 Kerberos supports AES-based authentication. Current Microsoft guidance recommends AES-256 while also documenting AES-128 support in the current AES configuration model.
- The client, KDC, and service account configuration must agree on an encryption type. If they do not, authentication can fall back to a weaker permitted type or fail.

For NFS, the selected security mode determines how much of the NFS conversation is protected:

| Mode | Protection |
| --- | --- |
| `krb5` | Kerberos authentication; NFS payload is not encrypted |
| `krb5i` | Authentication plus integrity protection |
| `krb5p` | Authentication, integrity, and privacy; NFS payload is encrypted |

For SMB, data-in-transit encryption is controlled through SMB encryption behavior. Do not infer that all SMB payload is encrypted merely because Kerberos authenticated the user.

## Azure NetApp Files Context

Azure NetApp Files uses an Active Directory connection for SMB, dual-protocol, and NFSv4.1 Kerberos scenarios. Successful operation depends on more than Kerberos port 88:

- DNS must resolve clients, domain controllers, and storage service names correctly.
- Clock synchronization must stay within the configured tolerance.
- The required computer accounts and service identities must exist and support compatible encryption types.
- Network paths must allow the relevant DNS, Kerberos, LDAP, and password-management traffic.
- NFS clients need correct realm, keytab, mount, and identity-mapping configuration.

When authentication fails, start by checking DNS, time, SPNs or service identities, ticket availability, encryption-type compatibility, and network reachability before changing security policy.

## Common Attacks and Defensive Priorities

Kerberos attacks often target weak account configuration or stolen long-term keys rather than a flaw in the basic ticket flow. Examples include Kerberoasting, AS-REP roasting, Golden Ticket attacks, and Silver Ticket attacks.

Defensive priorities include enforcing pre-authentication, using strong managed service-account credentials, preferring modern AES encryption, protecting domain-controller and service-account keys, monitoring unusual ticket activity, and maintaining reliable time synchronization.

## Official References

- [Understand Kerberos in Azure NetApp Files](https://learn.microsoft.com/azure/azure-netapp-files/kerberos)
- [Configure NFSv4.1 Kerberos encryption for Azure NetApp Files](https://learn.microsoft.com/azure/azure-netapp-files/configure-kerberos-encryption)
- [Understand AES in Azure NetApp Files](https://learn.microsoft.com/azure/azure-netapp-files/understand-advanced-encryption-standard)
- [Kerberos authentication troubleshooting guidance](https://learn.microsoft.com/troubleshoot/windows-server/windows-security/kerberos-authentication-troubleshooting-guidance)
- [Kerberos protocol registry entries and KDC configuration keys](https://learn.microsoft.com/troubleshoot/windows-server/windows-security/kerberos-protocol-registry-kdc-configuration-keys)

This article is a public English adaptation of personal study notes. Security defaults and service capabilities change; verify operational decisions against current official documentation.