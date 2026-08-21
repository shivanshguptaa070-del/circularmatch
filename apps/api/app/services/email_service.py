"""Email notification service for CircularMatch.

Uses the Resend API (https://resend.com) to send transactional emails.
httpx is already a project dependency, so no extra package is needed.

Set the RESEND_API_KEY environment variable in Render to enable live emails.
When the key is absent the service logs a warning and silently skips sending,
so the app always starts cleanly even in local/demo mode.
"""

from __future__ import annotations

import logging
from typing import Any

import httpx

logger = logging.getLogger(__name__)

_RESEND_SEND_URL = "https://api.resend.com/emails"
_FROM_ADDRESS = "CircularMatch <noreply@circularmatch.in>"
_TIMEOUT = 10.0  # seconds


def _send(api_key: str, payload: dict[str, Any]) -> bool:
    """POST to Resend. Returns True on success, False on any error."""
    try:
        with httpx.Client(timeout=_TIMEOUT) as client:
            resp = client.post(
                _RESEND_SEND_URL,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
        if resp.status_code in (200, 201):
            logger.info("Email sent via Resend: %s", resp.json().get("id"))
            return True
        logger.warning("Resend API returned %s: %s", resp.status_code, resp.text[:400])
        return False
    except Exception:
        logger.exception("Failed to send email via Resend")
        return False


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
) -> bool:
    """Send a contact-intent email to the other party in a match.

    Args:
        api_key: Resend API key. If None/empty, logs a warning and returns False.
        recipient_name: Full name of the person being notified.
        recipient_email: Email address of the person being notified.
        sender_name: Full name of the person who clicked "Contact".
        sender_email: Email of the person who clicked "Contact".
        material: Canonical material name (e.g. "HDPE Scrap").
        match_score: The match's total_score (0–100).
        note: Optional message the sender wrote.
        match_url: Deep link to the match detail page.
        sender_role: "buyer" or "generator".
    """
    if not api_key:
        logger.warning(
            "RESEND_API_KEY not configured — skipping email to %s (%s)",
            recipient_name,
            recipient_email,
        )
        return False

    if sender_role == "buyer":
        subject = f"A buyer wants to connect with you about {material} — CircularMatch"
        intro = f"A buyer, <strong>{sender_name}</strong>, is interested in sourcing your <strong>{material}</strong> waste stream."
        cta_label = "View the match &amp; respond"
    else:
        subject = f"A generator wants to supply you {material} — CircularMatch"
        intro = f"A generator, <strong>{sender_name}</strong>, has expressed interest in supplying your requirement for <strong>{material}</strong>."
        cta_label = "View the match &amp; respond"

    note_block = ""
    if note.strip():
        note_block = f"""
        <div style="background:#f0faf5;border-left:4px solid #2d6a4f;padding:14px 18px;border-radius:6px;margin:20px 0;">
          <p style="margin:0;font-size:14px;color:#1b4332;font-style:italic;">&#8220;{note}&#8221;</p>
          <p style="margin:6px 0 0;font-size:12px;color:#6b8179;">— {sender_name}</p>
        </div>"""

    html = f"""
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>{subject}</title></head>
<body style="margin:0;padding:0;background:#f4f7f4;font-family:Inter,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f7f4;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

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
        <p style="margin:0 0 8px;font-size:14px;color:#2d6a4f;font-weight:600;text-transform:uppercase;letter-spacing:.07em;">
          New contact request
        </p>
        <h2 style="margin:0 0 20px;font-size:22px;color:#081c15;font-weight:700;line-height:1.3;">
          Hi {recipient_name},<br>{intro}
        </h2>

        <!-- Match card -->
        <div style="border:1px solid #d8f3dc;border-radius:12px;padding:20px 24px;margin:0 0 24px;">
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
          You can reply directly to this email to reach {sender_name}
          at <a href="mailto:{sender_email}" style="color:#2d6a4f;">{sender_email}</a>,
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
          This notification was triggered when {sender_name} clicked <em>Contact {recipient_name.split()[0]}</em>
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

    payload: dict[str, Any] = {
        "from": _FROM_ADDRESS,
        "to": [recipient_email],
        "reply_to": sender_email,
        "subject": subject,
        "html": html,
        "text": plain,
    }

    return _send(api_key, payload)
