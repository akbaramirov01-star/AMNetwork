"""
AM Network — AI Recipient Scoring Engine v2
Score: 0-100.  Higher = greater need = higher distribution priority.

Scoring framework aligned with 8 Asnaf (Islamic jurisprudence):
  1. Al-Fuqara       — poor (income below nisab/poverty line)
  2. Al-Masakin      — destitute (no income AND no assets)
  3. Al-Gharimin     — debt-burdened (cannot repay debts)
  4. Al-Muallafah    — new converts in financial hardship
  5. Al-Riqab        — captives / modern: trafficking / forced labour victims
  6. Ibn Al-Sabil    — wayfarers: refugees, displaced, stranded
  7. Fi Sabilillah   — students of Islamic knowledge / daawa workers
  8. Al-Amil         — zakat administrators (not recipients in this model)

Score components (total = 100):
  Income & Per-Capita Need    max 20
  Asset & Nisab Check         max 10
  Family Structure            max 15
  Housing & Shelter           max 12
  Employment & Livelihood     max 10
  Health & Medical            max 15
  Asnaf Category Match        max 12
  Crisis & Emergency          max  6
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


# ── Enums ────────────────────────────────────────────────────────────────────

class HousingStatus(str, Enum):
    HOMELESS          = "homeless"
    REFUGEE_CAMP      = "refugee_camp"
    TEMPORARY_SHELTER = "temporary_shelter"
    RENTING_DEBT      = "renting_with_debt"
    RENTING           = "renting"
    OVERCROWDED       = "overcrowded"
    WITH_RELATIVES    = "with_relatives"
    OWNED_STABLE      = "owned_stable"


class EmploymentStatus(str, Enum):
    NONE          = "none"
    SEASONAL      = "seasonal"
    INFORMAL      = "informal_daily_labour"
    PART_TIME     = "part_time"
    FULL_TIME_LOW = "full_time_low_income"
    FULL_TIME     = "full_time"


class MedicalStatus(str, Enum):
    NONE             = "none"
    MINOR            = "minor_illness"
    CHRONIC          = "chronic_illness"
    CHRONIC_NO_ACCESS = "chronic_no_healthcare_access"
    DISABILITY       = "disability_prevents_work"
    MENTAL_HEALTH    = "serious_mental_health_condition"
    TERMINAL         = "terminal_illness"


class CrisisType(str, Enum):
    NONE                = "none"
    NATURAL_DISASTER    = "natural_disaster"
    CONFLICT_ZONE       = "conflict_or_war_zone"
    BREADWINNER_LOSS    = "death_or_incapacity_of_breadwinner"
    SUDDEN_JOB_LOSS     = "sudden_job_loss_under_3_months"
    MEDICAL_EMERGENCY   = "acute_medical_emergency"
    DOMESTIC_VIOLENCE   = "domestic_violence_or_forced_displacement"
    ECONOMIC_SHOCK      = "sudden_economic_shock_hyperinflation_etc"


class AssetLevel(str, Enum):
    NONE       = "no_assets_no_savings"
    MINIMAL    = "minimal_below_nisab"
    MODERATE   = "moderate_near_nisab"
    ABOVE_NISAB = "above_nisab_threshold"


# ── Constants ────────────────────────────────────────────────────────────────

# Approximate nisab in USD (85g gold @ ~$60/g = ~$5 100, rounded)
NISAB_USD = 5_100.0

# Regional monthly poverty lines (USD per person)
POVERTY_THRESHOLDS: dict[str, float] = {
    "default": 200,
    # Gulf / Middle East
    "AE": 800, "UAE": 800, "SA": 600, "QA": 900, "KW": 700,
    "BH": 500, "OM": 450, "JO": 200, "LB": 150, "IQ": 120,
    "SY": 80,  "YE": 60,  "PS": 100,
    # North Africa
    "EG": 120, "MA": 130, "TN": 160, "DZ": 140, "LY": 200,
    "SD": 70,  "SO": 50,
    # Sub-Saharan Africa
    "NG": 70,  "GH": 90,  "SN": 80,  "ML": 55,  "NE": 50,
    "TD": 50,  "ET": 55,  "KE": 110, "TZ": 65,  "UG": 60,
    "MZ": 55,
    # South & Southeast Asia
    "PK": 100, "BD": 80,  "AF": 60,  "NP": 70,
    "IN": 120, "LK": 130,
    "ID": 150, "MY": 350, "PH": 130, "TH": 200,
    "MM": 80,  "KH": 90,  "VN": 140,
    # Central Asia
    "TJ": 80,  "UZ": 90,  "KG": 100, "KZ": 250, "TM": 120,
    "AZ": 200,
    # Europe / Diaspora
    "DE": 900, "FR": 850, "GB": 1100, "UK": 1100,
    "NL": 900, "BE": 850, "SE": 950,  "NO": 1100,
    "IT": 700, "ES": 650, "TR": 350,  "RU": 300,
    # Americas / Oceania
    "US": 1200, "CA": 1100, "AU": 1000,
}


def get_poverty_line(country: str) -> float:
    return POVERTY_THRESHOLDS.get(country.upper(), POVERTY_THRESHOLDS["default"])


# ── Profile ───────────────────────────────────────────────────────────────────

@dataclass
class RecipientProfile:
    # ── Identity ──────────────────────────
    name: str
    country: str
    region: str

    # ── Income ────────────────────────────
    monthly_income_usd: float
    monthly_expenses_usd: float = 0.0       # if known; used for deficit calculation
    months_without_income: int = 0          # consecutive months with zero income

    # ── Debt (Al-Gharimin) ─────────────────
    has_riba_debt: bool = False
    debt_amount_usd: float = 0.0
    has_non_riba_debt: bool = False         # halal loans, medical bills, etc.
    non_riba_debt_usd: float = 0.0

    # ── Assets (Nisab check) ──────────────
    asset_level: AssetLevel = AssetLevel.NONE
    sold_assets_to_survive: bool = False    # distress indicator

    # ── Family ────────────────────────────
    family_size: int = 1
    num_dependents: int = 0                 # total dependents
    num_minor_children: int = 0             # children under 18
    num_elderly_dependents: int = 0         # elderly in care
    is_single_parent: bool = False
    is_widow: bool = False
    is_sole_breadwinner: bool = False       # only income earner for the household

    # ── Vulnerability (Asnaf categories) ──
    is_orphan_under_18: bool = False        # Al-Fuqara / Al-Masakin
    is_refugee: bool = False                # Ibn Al-Sabil
    is_internally_displaced: bool = False   # Ibn Al-Sabil (IDP)
    is_new_convert: bool = False            # Al-Muallafah Qulubuhum (< 3 years)
    is_trafficking_victim: bool = False     # Al-Riqab equivalent
    is_student_deen: bool = False           # Fi Sabilillah (Islamic student, no income)
    is_student_general: bool = False        # student from poor family
    is_elderly_working: bool = False        # elderly forced to work for survival
    is_daawa_worker: bool = False           # Fi Sabilillah: full-time daawa / charity worker
    is_food_insecure: bool = False          # cannot afford adequate nutrition

    # ── Medical ───────────────────────────
    medical_status: MedicalStatus = MedicalStatus.NONE
    num_sick_dependents: int = 0            # family members with serious illness

    # ── Housing ───────────────────────────
    housing_status: HousingStatus = HousingStatus.RENTING

    # ── Employment ────────────────────────
    employment_status: EmploymentStatus = EmploymentStatus.NONE

    # ── Crisis ────────────────────────────
    crisis_type: CrisisType = CrisisType.NONE
    in_conflict_zone: bool = False

    # ── Verification (anti-fraud) ─────────
    previous_applications: int = 0
    months_since_last_application: Optional[int] = None
    documents_verified: bool = False
    local_oracle_confirmed: bool = False


# ── Score Breakdown ───────────────────────────────────────────────────────────

@dataclass
class ScoreBreakdown:
    income_score: float = 0.0           # max 20
    asset_score: float = 0.0            # max 10
    family_score: float = 0.0           # max 15
    housing_score: float = 0.0          # max 12
    employment_score: float = 0.0       # max 10
    health_score: float = 0.0           # max 15
    asnaf_score: float = 0.0            # max 12
    crisis_score: float = 0.0           # max  6

    total: float = 0.0
    asnaf_categories: list = field(default_factory=list)
    fraud_flags: list = field(default_factory=list)
    fraud_penalty: float = 0.0
    final_score: float = 0.0
    priority_tier: str = ""
    recommendation: str = ""
    confidence_level: str = ""          # HIGH / MEDIUM / LOW
    estimated_monthly_need_usd: float = 0.0


# ── Scoring functions ─────────────────────────────────────────────────────────

def score_income(profile: RecipientProfile) -> float:
    """
    Per-capita income vs regional poverty line. Deficit bonus.
    Max 20 pts.
    """
    poverty_line = get_poverty_line(profile.country)
    per_capita = profile.monthly_income_usd / max(profile.family_size, 1)
    ratio = per_capita / poverty_line if poverty_line > 0 else 0

    if profile.months_without_income >= 3 or (profile.monthly_income_usd == 0 and profile.family_size > 0):
        base = 20.0
    elif ratio <= 0.10:
        base = 19.0
    elif ratio <= 0.20:
        base = 17.0
    elif ratio <= 0.35:
        base = 14.0
    elif ratio <= 0.50:
        base = 10.0
    elif ratio <= 0.75:
        base = 6.0
    elif ratio <= 1.0:
        base = 2.0
    elif ratio <= 1.5:
        base = 0.5
    else:
        base = 0.0

    # Deficit bonus: expenses exceed income
    if profile.monthly_expenses_usd > profile.monthly_income_usd > 0:
        deficit = profile.monthly_expenses_usd - profile.monthly_income_usd
        deficit_ratio = deficit / profile.monthly_expenses_usd
        base = min(20.0, base + deficit_ratio * 4)

    # Food insecurity adds weight to income score
    if profile.is_food_insecure:
        base = min(20.0, base + 2.0)

    return min(20.0, base)


def score_assets(profile: RecipientProfile) -> float:
    """
    Nisab check and asset depletion assessment.
    If assets > nisab, person may not be eligible as Fuqara/Masakin
    (though could still qualify as Gharimin or Ibn Al-Sabil).
    Max 10 pts.
    """
    asset_scores = {
        AssetLevel.NONE:        10.0,   # No assets — Al-Masakin (destitute)
        AssetLevel.MINIMAL:      7.0,   # Below nisab — Al-Fuqara
        AssetLevel.MODERATE:     3.0,   # Near nisab — borderline
        AssetLevel.ABOVE_NISAB:  0.0,   # Above nisab — not eligible as Fuqara
    }
    score = asset_scores.get(profile.asset_level, 0.0)

    # Sold assets to survive = extreme distress indicator
    if profile.sold_assets_to_survive:
        score = min(10.0, score + 2.0)

    return score


def score_family(profile: RecipientProfile) -> float:
    """
    Family structure, dependents, breadwinner status.
    Max 15 pts.
    """
    score = 0.0

    # Dependents scoring (2 pts per dependent, max 8)
    score += min(profile.num_dependents * 2.0, 8.0)

    # Additional for minor children specifically (1 pt each, max 3 extra)
    extra_minors = max(0, profile.num_minor_children - profile.num_dependents)
    score += min(extra_minors * 1.0, 3.0)

    # Elderly dependents (additional 0.5 per, max 2)
    score += min(profile.num_elderly_dependents * 0.5, 2.0)

    if profile.is_single_parent:
        score += 3.0
    if profile.is_widow:
        score += 2.0
    if profile.is_sole_breadwinner:
        score += 2.0
    if profile.is_orphan_under_18:
        score += 2.0

    return min(15.0, score)


def score_housing(profile: RecipientProfile) -> float:
    """
    Housing stability and safety.
    Max 12 pts.
    """
    housing_scores = {
        HousingStatus.OWNED_STABLE:      0.0,
        HousingStatus.WITH_RELATIVES:    2.0,
        HousingStatus.OVERCROWDED:       5.0,
        HousingStatus.RENTING:           5.0,
        HousingStatus.RENTING_DEBT:      8.0,
        HousingStatus.TEMPORARY_SHELTER: 10.0,
        HousingStatus.REFUGEE_CAMP:      11.0,
        HousingStatus.HOMELESS:          12.0,
    }
    return housing_scores.get(profile.housing_status, 0.0)


def score_employment(profile: RecipientProfile) -> float:
    """
    Employment status and duration of unemployment.
    Max 10 pts.
    """
    employment_scores = {
        EmploymentStatus.FULL_TIME:     0.0,
        EmploymentStatus.FULL_TIME_LOW: 2.0,
        EmploymentStatus.PART_TIME:     4.0,
        EmploymentStatus.INFORMAL:      5.0,
        EmploymentStatus.SEASONAL:      6.0,
        EmploymentStatus.NONE:          8.0,
    }
    score = employment_scores.get(profile.employment_status, 0.0)

    # Prolonged unemployment bonus
    if profile.months_without_income >= 6:
        score = min(10.0, score + 2.0)
    elif profile.months_without_income >= 3:
        score = min(10.0, score + 1.0)

    return score


def score_health(profile: RecipientProfile) -> float:
    """
    Medical status, disability, dependents with illness.
    Max 15 pts.
    """
    health_scores = {
        MedicalStatus.NONE:              0.0,
        MedicalStatus.MINOR:             3.0,
        MedicalStatus.CHRONIC:           7.0,
        MedicalStatus.MENTAL_HEALTH:     8.0,
        MedicalStatus.CHRONIC_NO_ACCESS: 11.0,
        MedicalStatus.DISABILITY:        13.0,
        MedicalStatus.TERMINAL:          15.0,
    }
    score = health_scores.get(profile.medical_status, 0.0)

    # Sick dependents add burden
    score += min(profile.num_sick_dependents * 1.5, 4.0)

    return min(15.0, score)


def score_asnaf(profile: RecipientProfile) -> tuple[float, list[str]]:
    """
    Islamic jurisprudence Asnaf category matching.
    Returns (score, matched_categories).
    Max 12 pts.
    """
    matched: list[str] = []
    score = 0.0

    # Ibn Al-Sabil — wayfarers, refugees, displaced (highest priority)
    if profile.is_refugee or profile.in_conflict_zone:
        matched.append("Ibn Al-Sabil — Refugee / displaced person")
        score = max(score, 12.0)
    elif profile.is_internally_displaced:
        matched.append("Ibn Al-Sabil — Internally displaced person (IDP)")
        score = max(score, 10.0)

    # Al-Muallafah Qulubuhum — new converts in financial hardship
    if profile.is_new_convert:
        matched.append("Al-Muallafah — New Muslim convert (≤ 3 years)")
        score = max(score, 10.0)

    # Al-Riqab — trafficking / forced labour / modern captivity
    if profile.is_trafficking_victim:
        matched.append("Al-Riqab — Trafficking or forced labour victim")
        score = max(score, 12.0)

    # Al-Gharimin — debt-burdened (cannot repay within reasonable time)
    total_debt = profile.debt_amount_usd + profile.non_riba_debt_usd
    monthly_income = max(profile.monthly_income_usd, 1)
    debt_months = total_debt / monthly_income
    if total_debt > 0:
        if debt_months >= 24:
            matched.append("Al-Gharimin — Crushing debt (> 2 years income)")
            score = max(score, 11.0)
        elif debt_months >= 12:
            matched.append("Al-Gharimin — Heavy debt burden (> 1 year income)")
            score = max(score, 8.0)
        elif debt_months >= 6:
            matched.append("Al-Gharimin — Significant debt (> 6 months income)")
            score = max(score, 5.0)
        elif profile.has_riba_debt:
            matched.append("Al-Gharimin — Riba-based debt (urgent liberation)")
            score = max(score, 6.0)

    # Fi Sabilillah — students of Islamic knowledge / daawa workers
    if profile.is_student_deen:
        matched.append("Fi Sabilillah — Student of Islamic sciences (full-time)")
        score = max(score, 8.0)
    elif profile.is_daawa_worker:
        matched.append("Fi Sabilillah — Full-time daawa / Islamic community worker")
        score = max(score, 7.0)

    # Al-Fuqara / Al-Masakin subgroup: orphan household
    if profile.is_orphan_under_18:
        matched.append("Al-Fuqara — Orphan under 18, no guardian income")
        score = max(score, 10.0)

    # Elderly forced to work (Al-Masakin subcategory)
    if profile.is_elderly_working:
        matched.append("Al-Masakin — Elderly forced to work for survival")
        score = max(score, 7.0)

    # General student in poverty (lower than deen student)
    if profile.is_student_general and not profile.is_student_deen:
        matched.append("Al-Fuqara — Student from low-income family")
        score = max(score, 4.0)

    return min(12.0, score), matched


def score_crisis(profile: RecipientProfile) -> float:
    """
    Emergency and crisis situation scoring.
    Max 6 pts.
    """
    crisis_scores = {
        CrisisType.NONE:              0.0,
        CrisisType.SUDDEN_JOB_LOSS:   3.0,
        CrisisType.ECONOMIC_SHOCK:    3.5,
        CrisisType.MEDICAL_EMERGENCY: 4.0,
        CrisisType.DOMESTIC_VIOLENCE: 4.5,
        CrisisType.BREADWINNER_LOSS:  5.5,
        CrisisType.NATURAL_DISASTER:  6.0,
        CrisisType.CONFLICT_ZONE:     6.0,
    }
    score = crisis_scores.get(profile.crisis_type, 0.0)

    # Additional for active conflict zone
    if profile.in_conflict_zone and profile.crisis_type != CrisisType.CONFLICT_ZONE:
        score = min(6.0, score + 1.5)

    return score


def detect_fraud_flags(profile: RecipientProfile) -> tuple[list, float]:
    """
    Anti-fraud checks. Returns (flags, penalty_points).
    """
    flags: list[str] = []
    penalty = 0.0
    poverty_line = get_poverty_line(profile.country)

    # Income above 3x poverty line with no offsetting factors
    if profile.monthly_income_usd > poverty_line * 3:
        flags.append("INCOME_HIGH: Monthly income > 3× regional poverty line")
        penalty += 15.0
    elif profile.monthly_income_usd > poverty_line * 2:
        flags.append("INCOME_ELEVATED: Monthly income > 2× regional poverty line — verify need")
        penalty += 8.0

    # Assets above nisab — not eligible as Fuqara/Masakin
    if profile.asset_level == AssetLevel.ABOVE_NISAB:
        flags.append("ASSETS_ABOVE_NISAB: Reported assets exceed nisab threshold ($5,100)")
        penalty += 20.0

    # Status conflict: refugee with stable owned home
    if profile.is_refugee and profile.housing_status == HousingStatus.OWNED_STABLE:
        flags.append("STATUS_CONFLICT: Refugee status + owned stable property")
        penalty += 20.0

    # Frequent recent applications
    if profile.previous_applications >= 3:
        if profile.months_since_last_application is not None and profile.months_since_last_application < 6:
            flags.append("FREQUENT_APPS: 3+ applications within 6 months")
            penalty += 15.0

    # Contradictory employment + income
    if (profile.employment_status == EmploymentStatus.FULL_TIME
            and profile.monthly_income_usd > poverty_line * 2):
        flags.append("INCOME_CONFLICT: Full-time employed with income above 2× poverty line")
        penalty += 10.0

    # Missing verification
    if not profile.local_oracle_confirmed:
        flags.append("UNCONFIRMED: Awaiting local oracle (imam / social worker) confirmation")
        penalty += 5.0
    if not profile.documents_verified:
        flags.append("DOCS_PENDING: Supporting documents not yet verified")
        penalty += 5.0

    return flags, penalty


def estimate_monthly_need(profile: RecipientProfile) -> float:
    """Estimate minimum monthly Zakat support needed (USD)."""
    poverty_line = get_poverty_line(profile.country)
    target = poverty_line * profile.family_size * 0.8  # 80% of poverty basket
    gap = max(0.0, target - profile.monthly_income_usd)
    return round(gap, 2)


def get_confidence_level(profile: RecipientProfile) -> str:
    if profile.documents_verified and profile.local_oracle_confirmed:
        return "HIGH"
    if profile.documents_verified or profile.local_oracle_confirmed:
        return "MEDIUM"
    return "LOW"


def get_priority_tier(score: float) -> tuple[str, str]:
    if score >= 80:
        return "CRITICAL", "Immediate distribution — life-critical need confirmed"
    elif score >= 65:
        return "HIGH", "Priority distribution within 48 hours"
    elif score >= 48:
        return "MEDIUM", "Standard queue — next distribution cycle"
    elif score >= 28:
        return "LOW", "Eligible for partial Sadaqah support"
    else:
        return "INELIGIBLE", "Does not meet current Zakat criteria — consider Sadaqah referral"


# ── Main scoring function ─────────────────────────────────────────────────────

def score_recipient(profile: RecipientProfile) -> ScoreBreakdown:
    """Score a recipient profile. Returns full ScoreBreakdown (0-100)."""
    bd = ScoreBreakdown()

    bd.income_score     = score_income(profile)
    bd.asset_score      = score_assets(profile)
    bd.family_score     = score_family(profile)
    bd.housing_score    = score_housing(profile)
    bd.employment_score = score_employment(profile)
    bd.health_score     = score_health(profile)
    bd.asnaf_score, bd.asnaf_categories = score_asnaf(profile)
    bd.crisis_score     = score_crisis(profile)

    bd.total = (
        bd.income_score + bd.asset_score + bd.family_score +
        bd.housing_score + bd.employment_score + bd.health_score +
        bd.asnaf_score + bd.crisis_score
    )

    bd.fraud_flags, bd.fraud_penalty = detect_fraud_flags(profile)
    bd.final_score = max(0.0, min(100.0, bd.total - bd.fraud_penalty))
    bd.priority_tier, bd.recommendation = get_priority_tier(bd.final_score)
    bd.confidence_level = get_confidence_level(profile)
    bd.estimated_monthly_need_usd = estimate_monthly_need(profile)

    return bd


# ── Report formatting ─────────────────────────────────────────────────────────

def format_report(profile: RecipientProfile, bd: ScoreBreakdown) -> str:
    bar_filled = int(bd.final_score / 5)
    bar = "█" * bar_filled + "░" * (20 - bar_filled)

    tier_icons = {
        "CRITICAL": "🔴", "HIGH": "🟠",
        "MEDIUM": "🟡", "LOW": "🟢", "INELIGIBLE": "⚪",
    }
    conf_icons = {"HIGH": "✅", "MEDIUM": "🟡", "LOW": "⚠️"}
    tier_icon = tier_icons.get(bd.priority_tier, "⚪")
    conf_icon = conf_icons.get(bd.confidence_level, "⚠️")

    lines = [
        "=" * 64,
        "  AM NETWORK — ZAKAT ELIGIBILITY REPORT v2",
        "=" * 64,
        f"  Applicant  : {profile.name}",
        f"  Location   : {profile.region}, {profile.country}",
        f"  Confidence : {conf_icon} {bd.confidence_level}",
        "",
        f"  SCORE : {bd.final_score:.1f} / 100   [{bar}]",
        f"  TIER  : {tier_icon} {bd.priority_tier}",
        f"  Est. monthly need : ${bd.estimated_monthly_need_usd:.0f} USD",
        "",
        "── SCORE BREAKDOWN ──────────────────────────────────────",
        f"  Income & Per-Capita Need  : {bd.income_score:5.1f} / 20",
        f"  Asset & Nisab Check       : {bd.asset_score:5.1f} / 10",
        f"  Family & Dependents       : {bd.family_score:5.1f} / 15",
        f"  Housing & Shelter         : {bd.housing_score:5.1f} / 12",
        f"  Employment & Livelihood   : {bd.employment_score:5.1f} / 10",
        f"  Health & Medical          : {bd.health_score:5.1f} / 15",
        f"  Asnaf Category Match      : {bd.asnaf_score:5.1f} / 12",
        f"  Crisis & Emergency        : {bd.crisis_score:5.1f} /  6",
        f"  {'─' * 44}",
        f"  Raw Total                 : {bd.total:5.1f} / 100",
    ]

    if bd.fraud_penalty > 0:
        lines.append(f"  Risk / Fraud Penalty      : -{bd.fraud_penalty:4.1f}")

    lines.append(f"  FINAL SCORE               : {bd.final_score:5.1f} / 100")
    lines.append("")

    if bd.asnaf_categories:
        lines.append("── ☪  ASNAF CATEGORIES MATCHED ──────────────────────────")
        for cat in bd.asnaf_categories:
            lines.append(f"  ✔ {cat}")
        lines.append("")

    if bd.fraud_flags:
        lines.append("── ⚠️  FLAGS ──────────────────────────────────────────────")
        for flag in bd.fraud_flags:
            lines.append(f"  • {flag}")
        lines.append("")

    lines += [
        "── RECOMMENDATION ───────────────────────────────────────",
        f"  {bd.recommendation}",
        "=" * 64,
    ]

    return "\n".join(lines)
