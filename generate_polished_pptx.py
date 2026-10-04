"""
CircularMatch — Polished Presentation Deck Generator (V3 Final Master)
HACKDAY 1.0 (DECODEP) & SustainTech 2026
Solo Architect: Shivansh Gupta
"""

import sys
import os

# Delegate directly to the comprehensive master deck builder
from generate_master_deck import build_circularmatch_master_deck

if __name__ == '__main__':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass
    print("=" * 70)
    print("Building CircularMatch Master Deck (15 Slides · Solo Architect: Shivansh Gupta)")
    print("=" * 70)
    build_circularmatch_master_deck()
    print("=" * 70)
    print("BUILD COMPLETE: Deck generated in pptx_slides/ and project root.")
    print("=" * 70)
