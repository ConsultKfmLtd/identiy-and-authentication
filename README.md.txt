Identity & Auth Service
Overview

The Identity & Auth Service is responsible for managing user identity, authentication, and authorization across the platform.
It acts as the authoritative source of truth for user accounts and security-sensitive operations, issuing tokens that allow other services to trust and identify users.

This service is intentionally designed with strong consistency guarantees and a minimal, security-focused surface area.

Responsibilities

This service is responsible for:

User account lifecycle management:

Sign-up and onboarding

Login and logout

Password reset and recovery

Email verification

Authentication and authorization:

Issuing access and refresh tokens

Managing roles and permissions

Supporting token revocation

Social login and SSO (where enabled)

Enforcing security policies and rate limiting

This service does not manage user profile data or business-domain state.

Owned Data

The Identity & Auth Service owns all authentication-related data, including:

User identifiers and credentials:

user_id

email

hashed_password

Account metadata:

Email verification status

Account status (active, locked, suspended)

Security artifacts:

Refresh tokens

Password reset tokens

Email verification tokens

Authorization data:

Roles

Permissions

Claims

No other service may write directly to this data.