"""Email notification service for CircularMatch.

Uses the Resend API (https://resend.com) to send transactional emails.
httpx is already a project dependency, so no extra package is needed.

Features:
- Branded responsive HTML + plain text fallback
- Auto-handles Resend free-tier sandbox mode: if sending to an unverified recipient
  is restricted by Resend, it automatically catches the verified account address
  and delivers the test email there with a clear sandbox banner.
"""

from __future__ import annotations

import logging
import re
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_RESEND_SEND_URL = "https://api.resend.com/emails"
# Use Resend's shared sender — works without domain verification on free plan.
# Once a custom domain is verified in Resend dashboard, this can be changed to that domain.
_FROM_ADDRESS = "CircularMatch <onboarding@resend.dev>"
_TIMEOUT = 12.0  # seconds


def _send_payload(api_key: str, payload: dict[str, Any]) -> tuple[bool, str | None, dict[str, Any] | None]:
    """POST to Resend. Returns (success, error_message, response_json)."""
    try:
        with httpx.Client(timeout=_TIMEOUT) as client:
            resp = client.post(
                _RESEND_SEND_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
        data = {}
        try:
            data = resp.json()
        except Exception:
            pass

        if resp.status_code in (200, 201):
            email_id = data.get("id", "ok")
            logger.info("Email sent via Resend: %s", email_id)
            return True, None, data

        error_msg = data.get("message") or resp.text
        logger.warning("Resend API returned %s: %s", resp.status_code, error_msg[:400])
        return False, error_msg, data
    except Exception as exc:
        logger.exception("Failed to connect to Resend API")
        return False, str(exc), None


def send_contact_notification(
    *,
    api_key: str | None,
    recipient_name: str,
    recipient_email: str,
    sender_name: str,
    sender_email: str,
    material: str,
    match_score: float,
    note: str,
    match_url: str,
    sender_role: str,  # "buyer" or "generator"
    admin_email: str | None = None,  # Optional platform owner email
) -> tuple[bool, str]:
    """Send a contact-intent email to the other party in a match.

    Returns:
        tuple[bool, str]: (success, status_description)
    """
    if not api_key:
        msg = f"RESEND_API_KEY not configured on server. Email to {recipient_name} ({recipient_email}) was skipped."
        logger.warning(msg)
        return False, msg

    if sender_role == "buyer":
        subject = f"♻ Match Request: Buyer interested in {material} — CircularMatch"
        intro = f"A buyer, <strong>{sender_name}</strong>, is interested in sourcing your <strong>{material}</strong> waste stream."
        cta_label = "View the match &amp; respond"
    else:
        subject = f"♻ Supply Offer: Generator offers {material} — CircularMatch"
        intro = f"A generator, <strong>{sender_name}</strong>, has expressed interest in supplying your requirement for <strong>{material}</strong>."
        cta_label = "View the match &amp; respond"

    note_block = ""
    if note.strip():
        note_block = f"""
        <div style="background:#f0faf5;border-left:4px solid #2d6a4f;padding:14px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#1b4332;font-style:italic;">&#8220;{note}&#8221;</p>
          <p style="margin:6px 0 0;font-size:12px;color:#6b8179;">— {sender_name} ({sender_email})</p>
        </div>"""

    def render_html(sandbox_banner: str = "") -> str:
        return f"""<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{subject}</title></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Inter,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);max-width:100%;">

      <!-- Header -->
      <tr><td style="background:#1b4332;padding:28px 40px;">
        <h1 style="margin:0;font-size:22px;color:#d8f3dc;font-weight:700;letter-spacing:-0.5px;">
          ♻ CircularMatch
        </h1>
        <p style="margin:4px 0 0;font-size:12px;color:#95d5b2;letter-spacing:.08em;text-transform:uppercase;">
          Industrial Waste Marketplace
        </p>
      </td></tr>

      <!-- Body -->
      <tr><td style="padding:36px 40px;">
        {sandbox_banner}
        <p style="margin:0 0 8px;font-size:14px;color:#2d6a4f;font-weight:600;text-transform:uppercase;letter-spacing:.07em;">
          New contact request
        </p>
        <h2 style="margin:0 0 20px;font-size:22px;color:#081c15;font-weight:700;line-height:1.3;">
          Hi {recipient_name},<br>{intro}
        </h2>

        <!-- Match card -->
        <div style="border:1px solid #d8f3dc;border-radius:12px;padding:20px 24px;margin:0 0 24px;background:#f9fdfa;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="font-size:12px;color:#6b8179;text-transform:uppercase;letter-spacing:.07em;">Material</td>
              <td style="font-size:12px;color:#6b8179;text-transform:uppercase;letter-spacing:.07em;text-align:right;">Match score</td>
            </tr>
            <tr>
              <td style="font-size:18px;font-weight:700;color:#1b4332;padding-top:4px;">{material}</td>
              <td style="font-size:18px;font-weight:700;color:#1b4332;padding-top:4px;text-align:right;">{match_score:.0f} / 100</td>
            </tr>
          </table>
        </div>

        {note_block}

        <p style="margin:0 0 24px;font-size:15px;color:#344e41;line-height:1.6;">
          You can reply directly to this email to reach <strong>{sender_name}</strong>
          at <a href="mailto:{sender_email}" style="color:#2d6a4f;font-weight:600;">{sender_email}</a>,
          or open the match inside CircularMatch to review full details and take the next step.
        </p>

        <!-- CTA -->
        <table cellpadding="0" cellspacing="0"><tr><td>
          <a href="{match_url}"
             style="display:inline-block;background:#2d6a4f;color:#d8f3dc;text-decoration:none;
                    padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;">
            {cta_label}
          </a>
        </td></tr></table>
      </td></tr>

      <!-- Footer -->
      <tr><td style="background:#f0faf5;padding:20px 40px;border-top:1px solid #d8f3dc;">
        <p style="margin:0;font-size:12px;color:#6b8179;line-height:1.6;">
          This notification was triggered when {sender_name} clicked <em>Contact</em>
          in the CircularMatch platform. CircularMatch does not manage payments, transport, or contracts —
          all commercial decisions remain between the buyer and generator.
        </p>
      </td></tr>

    </table>
  </td></tr>
</table>
</body>
</html>"""

    plain = (
        f"Hi {recipient_name},\n\n"
        f"{intro.replace('<strong>', '').replace('</strong>', '')}\n\n"
        + (f'Message from {sender_name}: "{note}"\n\n' if note.strip() else "")
        + f"Reply directly to this email to reach {sender_name} at {sender_email}.\n\n"
        f"View the match: {match_url}\n\n"
        "-- CircularMatch team"
    )

    # 1. Attempt primary send to recipient_email
    payload: dict[str, Any] = {
        "from": _FROM_ADDRESS,
        "to": [recipient_email],
        "reply_to": sender_email,
        "subject": subject,
        "html": render_html(),
        "text": plain,
    }

    success, error_msg, _ = _send_payload(api_key, payload)
    if success:
        return True, f"Email delivered to {recipient_name} ({recipient_email})"

    # 2. Check if Resend rejected due to free tier sandbox restriction
    # Resend error format: "You can only send testing emails to your own email address (user@domain.com)..."
    logger.info("Primary send failed (%s). Checking for Resend test mode fallback...", error_msg)
    verified_email: str | None = None
    if error_msg:
        match = re.search(r"\(([^)]+@[^)]+)\)", error_msg)
        if match:
            verified_email = match.group(1).strip()

    fallback_target = verified_email or admin_email or sender_email
    if fallback_target and fallback_target != recipient_email:
        logger.info("Retrying delivery to verified Resend test address: %s", fallback_target)
        sandbox_banner = f"""
        <div style="background:#fff8db;border:1px solid #f5df84;color:#745100;padding:12px 16px;border-radius:8px;margin-bottom:24px;font-size:13px;line-height:1.5;">
          <strong>⚡ Resend Test Mode Delivery:</strong><br>
          This email was addressed to <strong>{recipient_name}</strong> (<code>{recipient_email}</code>).
          Because Resend is currently in sandbox testing mode, it was delivered to your verified address (<code>{fallback_target}</code>).
        </div>
        """
        fallback_payload: dict[str, Any] = {
            "from": _FROM_ADDRESS,
            "to": [fallback_target],
            "reply_to": sender_email,
            "subject": f"[Test Delivery for {recipient_name}] {subject}",
            "html": render_html(sandbox_banner),
            "text": f"[Resend Sandbox Delivery for {recipient_name} <{recipient_email}>]\n\n" + plain,
        }
        fb_success, fb_error, _ = _send_payload(api_key, fallback_payload)
        if fb_success:
            return True, f"Email delivered to your verified test inbox ({fallback_target})"
        logger.warning("Fallback send to %s also failed: %s", fallback_target, fb_error)

    return False, f"Could not send email: {error_msg or 'Resend API error'}"
