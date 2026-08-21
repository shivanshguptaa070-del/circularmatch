from __future__ import annotations

import logging
from collections.abc import Callable
from typing import Any

from fastapi import Depends, Header, HTTPException, status
from jose import ExpiredSignatureError, JWTError, jwt

from app.core.config import settings
from app.repositories.demo_store import DemoStore
from app.schemas.models import Company, User

logger = logging.getLogger(__name__)

store = DemoStore()

# Supabase JWTs use HS256 and are signed with the JWT secret from the project settings.
# The anon key is a public JWT but the *JWT secret* (in Supabase dashboard > API settings)
# is what verifies tokens issued by Supabase Auth. We use the service role key's JWT
# payload to derive the audience, but the actual verification key must be set as
# SUPABASE_JWT_SECRET in the environment.
_SUPABASE_ALGORITHMS = ["HS256"]


def _verify_supabase_token(token: str) -> dict[str, Any] | None:
    """
    Verify and decode a Supabase-issued JWT.

    Returns decoded claims on success, None if the token is invalid/missing secret.
    Raises HTTPException(401) for expired tokens so callers get a clear signal.
    """
    jwt_secret = settings.supabase_jwt_secret
    if not jwt_secret:
        # No secret configured — cannot verify signatures.
        # This is a critical error and we must fail closed to protect data.
        logger.error(
            "SUPABASE_JWT_SECRET is not set. JWT signatures cannot be verified. "
            "Rejecting all authenticated requests."
        )
        return None

    try:
        claims: dict[str, Any] = jwt.decode(
            token,
            jwt_secret,
            algorithms=_SUPABASE_ALGORITHMS,
            audience="authenticated",
        )
        return claims
    except ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as exc:
        logger.debug("JWT verification failed: %s", exc)
        return None


def get_store() -> DemoStore:
    return store


def get_current_user(
    authorization: str | None = Header(default=None),
    x_demo_user_id: str | None = Header(default=None),
    x_active_mode: str | None = Header(default=None),
    demo_store: DemoStore = Depends(get_store),
) -> User:
    """
    Resolve the current user from:
      1. A verified Supabase JWT in the Authorization: Bearer <token> header.
      2. The X-Active-Mode or X-Demo-User-Id header.
      3. A safe default demo persona (generator) if neither header is present.

    Real users (is_demo=False) are created on first authenticated request and
    cached in the in-memory store for the lifetime of the server process.
    """
    header_mode = (x_active_mode or "").lower()

    # ── 1. Real Supabase JWT ──────────────────────────────────────────────────
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        claims = _verify_supabase_token(token)

        if claims:
            user_id = str(claims.get("sub", ""))
            if user_id:
                meta: dict[str, Any] = claims.get("user_metadata", {}) or {}
                email = str(claims.get("email", meta.get("email", "")))

                # Check for explicit admin via metadata or configured admin email
                is_admin_meta = meta.get("role") == "admin"
                is_admin_email = bool(settings.admin_email) and email.lower() == settings.admin_email.lower()
                is_admin = is_admin_meta or is_admin_email

                # Determine role from header or metadata
                active_mode = header_mode or meta.get("active_mode", "selling")
                if is_admin:
                    role_val = "admin"
                elif active_mode in {"sourcing", "buyer"}:
                    role_val = "buyer"
                else:
                    role_val = "generator"

                # Return existing cached user, but dynamically apply role from active mode
                existing_user = demo_store.get_user(user_id)
                if existing_user:
                    if not is_admin and existing_user.role != role_val:
                        # Return a copy with the updated role (don't mutate shared cache)
                        return existing_user.model_copy(update={"role": role_val})
                    return existing_user

                # Bootstrap a real user profile from JWT claims
                full_name = str(
                    meta.get("full_name") or meta.get("name") or email.split("@")[0] or "User"
                )
                company_name = str(meta.get("company_name") or f"{full_name}'s Organisation")

                company_id = f"company-{user_id[:8]}"
                if not demo_store.get_company(company_id):
                    demo_store.companies[company_id] = Company(
                        id=company_id,
                        owner_user_id=user_id,
                        name=company_name,
                        company_type="processor",
                        city=str(meta.get("city", "Delhi")),
                        address_label=str(meta.get("address_label", "Industrial Area")),
                        latitude=28.6139,
                        longitude=77.2090,
                        verification_status="verified",
                        is_demo=False,
                    )

                new_user = User(
                    id=user_id,
                    full_name=full_name,
                    email=email,
                    role=role_val,
                    company_id=company_id,
                    is_demo=False,
                )
                demo_store.users[user_id] = new_user
                demo_store._save_snapshot()
                return new_user

    # ── 2. Local development fallback ────────────────────────────────────────
    # Only allow bypassing authentication if explicitly running in local dev mode.
    # In production, this falls through and raises 401.
    if settings.demo_mode and (not authorization or not authorization.startswith("Bearer ")):
        # Absolute fallback — behaves like the old shared demo persona.
        user_id = "user-buyer" if header_mode in {"sourcing", "buyer"} else "user-generator"

        user = demo_store.get_user(user_id)
        if user is None:
            role = "buyer" if "buyer" in user_id else "generator"
            company_id = f"company-{user_id}"
            if not demo_store.get_company(company_id):
                demo_store.companies[company_id] = Company(
                    id=company_id,
                    owner_user_id=user_id,
                    name=f"Company {user_id.split('-')[1].title() if '-' in user_id else user_id}",
                    company_type=role if role != "admin" else "processor",
                    city="Delhi",
                    address_label="Industrial Zone",
                    latitude=28.6139,
                    longitude=77.2090,
                    verification_status="verified",
                    is_demo=True,
                )
            user = User(
                id=user_id,
                full_name=user_id.replace("user-", "").title() + " User",
                email=f"{user_id}@circularmatch.com",
                role=role,
                company_id=company_id,
                is_demo=True,
            )
            demo_store.users[user_id] = user

            # Seed initial data to prevent empty dashboards for new demo users
            if role == "generator":
                base_listings = [ls for ls in demo_store.listings.values() if ls.company_id == "company-user-generator"]
                if base_listings:
                    new_listing = base_listings[0].model_copy(update={"id": demo_store.new_id("listing"), "company_id": company_id})
                    demo_store.listings[new_listing.id] = new_listing
            elif role == "buyer":
                base_reqs = [req for req in demo_store.requirements.values() if req.company_id == "company-user-buyer"]
                if base_reqs:
                    new_req = base_reqs[0].model_copy(update={"id": demo_store.new_id("requirement"), "company_id": company_id})
                    demo_store.requirements[new_req.id] = new_req
                    base_specs = [s for s in demo_store.acceptance_specs.values() if s.buyer_requirement_id == base_reqs[0].id]
                    if base_specs:
                        new_spec = base_specs[0].model_copy(update={"id": demo_store.new_id("spec"), "buyer_requirement_id": new_req.id})
                        demo_store.acceptance_specs[new_spec.buyer_requirement_id] = new_spec
        return user

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing or invalid authentication token.",
        headers={"WWW-Authenticate": "Bearer"},
    )


def require_roles(*roles: str) -> Callable[[User], User]:
    """
    Dependency that enforces role-based access for demo and real users.
    - Admins always bypass role checks.
    - Users matching required roles directly pass.
    - Real registered marketplace users have dual access to both generator & buyer operations.
    """
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role == "admin":
            return current_user

        if current_user.role in roles:
            return current_user

        # Real users can perform both generator and buyer actions on the marketplace
        if not current_user.is_demo and ("admin" not in roles):
            return current_user

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"This action requires one of the following roles: {', '.join(roles)}.",
        )

    return dependency
