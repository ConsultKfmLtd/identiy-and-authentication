# Identity & Auth Service
## Overview

The Identity & Auth Service is responsible for managing user identity, authentication, and authorization across the platform.
It acts as the authoritative source of truth for user accounts and security-sensitive operations, issuing tokens that allow other services to trust and identify users.

This service is intentionally designed with strong consistency guarantees and a minimal, security-focused surface area.

## API Endpoints

- POST /auth/register

  - body: { "email": "a@b.com", "password": "password123", "name": "Mercy" }

- POST /auth/login

  - body: { "email": "a@b.com", "password": "password123" }

- POST /auth/refresh

  - uses httpOnly cookie refresh_token (or send { refreshToken } in body)

- POST /auth/logout

## Setup

- Integrate with the prisma database:

To run this repository, integration with the [prisma repository](https://github.com/kfmGroups/PartyGbeDecoy/tree/main) is required.
```
npm install git+https://github.com/kfmGroups/PartyGbeDecoy.git#external_repo_integration
```
This was the branch with the export prisma functionality
Or
```
 npm install git+https://github.com/kfmGroups/PartyGbeDecoy.git
```
Use ONLY after the external_repo_integration has been merged


## Responsibilities

This service is responsible for:

- User account lifecycle management:

  - Sign-up and onboarding
  - Login and logout
  - Password reset and recovery
  - Email verification

- Authentication and authorization:

  - Issuing access and refresh tokens
  - Managing roles and permissions
  - Supporting token revocation

- Social login and SSO (where enabled)

- Enforcing security policies and rate limiting

This service does not manage user profile data or business-domain state.

## Owned Data

The Identity & Auth Service owns all authentication-related data, including:

- User identifiers and credentials:

  - user_id
  - email
  - hashed_password

- Account metadata:

  - Email verification status
  - Account status (active, locked, suspended)

- Security artifacts:

  - Refresh tokens
  - Password reset tokens
  - Email verification tokens

- Authorization data:

  - Roles
  - Permissions
  - Claims

No other service may write directly to this data.
