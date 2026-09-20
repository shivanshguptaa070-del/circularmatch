#!/usr/bin/env python3
"""
Purge / Cleanup demo data from CircularMatch.

This script calls the admin endpoint POST /api/admin/purge?dry_run=...
It safely removes all records flagged with is_demo=True while leaving
any real user data and production records untouched.

Usage:
    python scripts/cleanup_demo_data.py --dry-run
    python scripts/cleanup_demo_data.py --execute

Environment variables:
    CIRCULARMATCH_API_URL: API base url (default: http://localhost:8000)
    CIRCULARMATCH_ADMIN_TOKEN: Optional bearer token for real Supabase admin auth
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Clean up isolated demo data for CircularMatch hackathon personas."
    )
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument(
        "--dry-run",
        action="store_true",
        help="Preview what demo records would be deleted without deleting anything.",
    )
    group.add_argument(
        "--execute",
        action="store_true",
        help="Execute actual deletion of all demo records.",
    )
    parser.add_argument(
        "--api-url",
        default=os.getenv("CIRCULARMATCH_API_URL", "http://localhost:8000"),
        help="CircularMatch API base URL (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--admin-user-id",
        default="user-admin",
        help="Admin user ID to send in X-Demo-User-Id header (default: user-admin)",
    )

    args = parser.parse_args()

    api_url = args.api_url.rstrip("/")
    dry_run = not args.execute
    query_param = "true" if dry_run else "false"
    endpoint = f"{api_url}/api/admin/purge?dry_run={query_param}"

    headers = {
        "Content-Type": "application/json",
        "X-Demo-User-Id": args.admin_user_id,
    }

    token = os.getenv("CIRCULARMATCH_ADMIN_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    print("==================================================")
    print("CircularMatch Demo Data Cleanup Utility")
    print(f"Target URL: {endpoint}")
    print(f"Mode: {'DRY RUN (preview only)' if dry_run else 'EXECUTE (permanent deletion of demo data)'}")
    print("==================================================")

    req = urllib.request.Request(endpoint, data=b"{}", headers=headers, method="POST")

    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            payload = data.get("data", data)
            deleted_counts = payload.get("deleted_counts", {})
            message = payload.get("message", "")

            print(f"\nStatus: {message}\n")
            print("Breakdown of Demo Entities:")
            for entity, count in deleted_counts.items():
                print(f"  - {entity}: {count}")

            if dry_run:
                print("\n[NOTE] No changes made. Pass --execute to permanently delete demo records.")
            else:
                print("\n[SUCCESS] Demo records purged. Real user records preserved.")

    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        print(f"\n[ERROR] HTTP {e.code}: {e.reason}")
        print(f"Response: {body}")
        sys.exit(1)
    except urllib.error.URLError as e:
        print(f"\n[ERROR] Could not connect to API server at {api_url}: {e.reason}")
        print("Ensure the backend API server is running before executing this script.")
        sys.exit(1)


if __name__ == "__main__":
    main()
