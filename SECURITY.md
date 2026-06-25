# Security Policy

Thank you for helping keep Graz and the wider Cosmos application ecosystem safe.

Graz is a React library for connecting applications to Cosmos wallets, clients,
and signers. Security reports are especially important when they involve wallet
connection flows, signer handling, transaction construction, dependency supply
chain issues, or behavior that could cause users to connect to the wrong chain,
sign unexpected data, expose account information, or leak sensitive application
configuration.

## Supported Versions

Security updates are applied to the latest published version of the `graz` npm
package. Maintainers may also patch an older release line when the impact and
upgrade path justify it, but users should generally upgrade to the latest
available version before reporting that a vulnerability remains unfixed.

Example applications and local generated files in this repository are maintained
to support the current library release. They are not treated as independently
supported products.

## Reporting a Vulnerability

Please report suspected security vulnerabilities privately through GitHub
Security Advisories:

https://github.com/graz-sh/graz/security/advisories/new

If GitHub Security Advisories are unavailable to you, contact a maintainer
privately using the contact information on their GitHub profile.

Please do not open a public issue, discussion, or pull request for a suspected
vulnerability until a maintainer has confirmed that public disclosure is
appropriate.

When possible, include:

- A description of the issue and the affected package, version, or commit.
- Steps to reproduce, a proof of concept, or a minimal example.
- The wallet, chain, browser, runtime, and operating system involved.
- The expected impact, including whether funds, signatures, account data, RPC
  calls, dependencies, or application secrets may be affected.
- Any known mitigations or workarounds.

## What to Expect

Maintainers will acknowledge private reports as soon as practical and will work
with the reporter to validate impact, identify affected versions, prepare a fix,
and coordinate disclosure.

Accepted reports may result in a patch release, a GitHub Security Advisory, an
npm release note, documentation updates, or a combination of these depending on
severity and user impact.

## Handling Sensitive Information

Do not include real wallet mnemonics, private keys, seed phrases, access tokens,
or production RPC credentials in reports, examples, tests, screenshots, logs, or
pull requests. Use test wallets, local development mnemonics, redacted logs, and
public testnets whenever possible.

Graz does not need direct access to wallet seed phrases or private keys. If an
integration appears to require exposing those secrets to application code,
treat that as a security concern and report it privately.
