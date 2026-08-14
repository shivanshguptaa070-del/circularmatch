from __future__ import annotations

from collections.abc import Callable
from typing import Any
from fastapi import Depends, Header, HTTPException, status
from jose import jwt

from app.core.config import settings
from app.repositories.demo_store import DemoStore
from app.schemas.models import Company, User

store = DemoStore()


def get_store() -> DemoStore:
    return store


def get_current_user(
    authorization: str | None = Header(default=None),
    x_demo_user_id: str | None = Header(default=None),
    demo_store: DemoStore = Depends(get_store),
) -> User:
    # 1. Check for real Supabase JWT in Authorization Bearer header
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ", 1)[1].strip()
        try:
            claims: dict[str, Any] = jwt.get_unverified_claims(token)
            user_id = str(claims.get("sub", ""))
            if user_id:
                existing_user = demo_store.get_user(user_id)
                if existing_user:
                    return existing_user

                meta = claims.get("user_metadata", {}) or {}
                email = str(claims.get("email", meta.get("email", "")))
                full_name = str(meta.get("full_name") or meta.get("name") or email.split("@")[0] or "User")
                company_name = str(meta.get("company_name") or f"{full_name}'s Organisation")
                active_mode = str(meta.get("active_mode", "both"))

                # Create company if not exists
                company_id = f"company-{user_id[:8]}"
                if not demo_store.get_company(company_id):
                    new_company = Company(
                        id=company_id,
                        owner_user_id=user_id,
                        name=company_name,
                        company_type="generator" if active_mode == "selling" else "buyer" if active_mode == "sourcing" else "processor",
                        city=meta.get("city", "Delhi"),
                        address_label=meta.get("address_label", "Industrial Area"),
                        latitude=28.6139,
                        longitude=77.2090,
                        verification_status="verified",
                        is_demo=False,
                    )
                    demo_store.companies[company_id] = new_company

                # Create user in store
                role_val = "buyer" if active_mode == "sourcing" else "generator"
                new_user = User(
                    id=user_id,
                    full_name=full_name,
                    email=email,
                    role=role_val,
                    company_id=company_id,
                    is_demo=False,
                )
                demo_store.users[user_id] = new_user
                return new_user
        except Exception:
            pass

    # 2. Fallback to header user if provided or default
    user_id = x_demo_user_id or "user-generator"
    user = demo_store.get_user(user_id)
    if user is None:
        role = "admin" if "admin" in user_id else "buyer" if "buyer" in user_id else "generator"
        company_id = f"company-{user_id}"
        if not demo_store.get_company(company_id):
            demo_store.companies[company_id] = Company(
                id=company_id,
                owner_user_id=user_id,
                name=f"Company {user_id.title()}",
                company_type=role if role != "admin" else "processor",
                city="Delhi",
                address_label="Industrial Zone",
                latitude=28.6139,
                longitude=77.2090,
                verification_status="verified",
                is_demo=False,
            )
        user = User(
            id=user_id,
            full_name=user_id.replace("user-", "").title() + " User",
            email=f"{user_id}@circularmatch.com",
            role=role,
            company_id=company_id,
            is_demo=False,
        )
        demo_store.users[user_id] = user
    return user


def require_roles(*roles: str) -> Callable[[User], User]:
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        # Real authenticated non-demo users get full dual-role capability
        if not current_user.is_demo:
            return current_user
        if current_user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"This action requires one of: {', '.join(roles)}.",
            )
        return current_user

    return dependency

