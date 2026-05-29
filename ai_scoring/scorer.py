"""
AM Network — AI Recipient Scoring Engine v2.1
Score: 0–100.  Higher = greater need = higher distribution priority.

Islamic jurisprudence — 8 Asnaf categories:
  1. Al-Fuqara       — poor (income below nisab / poverty line)
  2. Al-Masakin      — destitute (no income AND no assets)
  3. Al-Gharimin     — debt-burdened (cannot repay debts)
  4. Al-Muallafah    — new converts in financial hardship
  5. Al-Riqab        — captives / modern: trafficking / forced labour victims
  6. Ibn Al-Sabil    — wayfarers: refugees, displaced, stranded travellers
  7. Fi Sabilillah   — students of Islamic knowledge / daawa workers
  8. Al-Amil         — zakat administrators (not recipients in this model)

AM Network recipient categories (mapped to Asnaf above):
  A.  Widows and single mothers with dependents          → Al-Fuqara / Al-Masakin
  B.  Orphans under 18 with no guardian income           → Al-Fuqara
  C.  Elderly forced to work for survival                → Al-Masakin
  D.  Disabled individuals unable to work                → Al-Fuqara / Al-Masakin
  E.  Families below poverty threshold                   → Al-Fuqara
  F.  Students from low-income backgrounds               → Fi Sabilillah / Al-Fuqara
  G.  People trapped in riba-based or crushing debt      → Al-Gharimin
  H.  Refugees and internally displaced persons          → Ibn Al-Sabil
  I.  Chronically ill without healthcare access          → Al-Fuqara / Al-Masakin
  J.  Large families with single breadwinner             → Al-Fuqara
  K.  Food-insecure households                           → Al-Masakin (acute)
  L.  New Muslim converts facing hardship                → Al-Muallafah
  M.  Trafficking / forced-labour survivors              → Al-Riqab
  N.  Conflict-zone / natural-disaster victims           → Ibn Al-Sabil (acute)
  O.  Those invisible to traditional charitable systems  → Al-Masakin

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
    NONE              = "none"
    MINOR             = "minor_illness"
    CHRONIC           = "chronic_illness"
    CHRONIC_NO_ACCESS = "chronic_no_healthcare_access"
    DISABILITY        = "disability_prevents_work"
    MENTAL_HEALTH     = "serious_mental_health_condition"
    TERMINAL          = "terminal_illness"


class CrisisType(str, Enum):
    NONE              = "none"
    NATURAL_DISASTER  = "natural_disaster"
    CONFLICT_ZONE     = "conflict_or_war_zone"
    BREADWINNER_LOSS  = "death_or_incapacity_of_breadwinner"
    SUDDEN_JOB_LOSS   = "sudden_job_loss_under_3_months"
    MEDICAL_EMERGENCY = "acute_medical_emergency"
    DOMESTIC_VIOLENCE = "domestic_violence_or_forced_displacement"
    ECONOMIC_SHOCK    = "sudden_economic_shock_hyperinflation_etc"


class AssetLevel(str, Enum):
    NONE        = "no_assets_no_savings"
    MINIMAL     = "minimal_below_nisab"
    MODERATE    = "moderate_near_nisab"
    ABOVE_NISAB = "above_nisab_threshold"


# ── Constants ────────────────────────────────────────────────────────────────

# Nisab in USD (85 g gold × ~$60/g ≈ $5 100)
NISAB_USD = 5_100.0

# Monthly poverty lines per person (USD) — regional approximations
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
    # Identity
    name: str
    country: str
    region: str = ""

    # Income
    monthly_income_usd: float = 0.0
    monthly_expenses_usd: float = 0.0
    months_without_income: int = 0

    # Debt (Al-Gharimin)
    has_riba_debt: bool = False
    debt_amount_usd: float = 0.0
    has_non_riba_debt: bool = False
    non_riba_debt_usd: float = 0.0

    # Assets (Nisab check)
    asset_level: AssetLevel = AssetLevel.NONE
    sold_assets_to_survive: bool = False

    # Family
    family_size: int = 1
    num_dependents: int = 0
    num_minor_children: int = 0
    num_elderly_dependents: int = 0
    is_single_parent: bool = False
    is_widow: bool = False
    is_sole_breadwinner: bool = False

    # Vulnerability / Asnaf flags
    is_orphan_under_18: bool = False
    is_refugee: bool = False
    is_internally_displaced: bool = False
    is_new_convert: bool = False
    is_trafficking_victim: bool = False
    is_student_deen: bool = False
    is_student_general: bool = False
    is_elderly_working: bool = False
    is_daawa_worker: bool = False
    is_food_insecure: bool = False

    # Medical
    medical_status: MedicalStatus = MedicalStatus.NONE
    num_sick_dependents: int = 0

    # Housing
    housing_status: HousingStatus = HousingStatus.RENTING

    # Employment
    employment_status: EmploymentStatus = EmploymentStatus.NONE

    # Crisis
    crisis_type: CrisisType = CrisisType.NONE
    in_conflict_zone: bool = False

    # Verification (anti-fraud)
    previous_applications: int = 0
    months_since_last_application: Optional[int] = None
    documents_verified: bool = False
    local_oracle_confirmed: bool = False


# ── Score Breakdown ───────────────────────────────────────────────────────────

@dataclass
class ScoreBreakdown:
    income_score: float = 0.0      # max 20
    asset_score: float = 0.0       # max 10
    family_score: float = 0.0      # max 15
    housing_score: float = 0.0     # max 12
    employment_score: float = 0.0  # max 10
    health_score: float = 0.0      # max 15
    asnaf_score: float = 0.0       # max 12
    crisis_score: float = 0.0      # max  6

    total: float = 0.0
    asnaf_categories: list = field(default_factory=list)
    fraud_flags: list = field(default_factory=list)
    fraud_penalty: float = 0.0
    final_score: float = 0.0
    priority_tier: str = ""
    recommendation: str = ""
    confidence_level: str = ""
    estimated_monthly_need_usd: float = 0.0
    recommended_support_types: list = field(default_factory=list)


# ── Scoring functions ─────────────────────────────────────────────────────────

def score_income(profile: RecipientProfile) -> float:
    """Per-capita income vs regional poverty line. Max 20 pts."""
    poverty_line = get_poverty_line(profile.country)
    per_capita = profile.monthly_income_usd / max(profile.family_size, 1)
    ratio = per_capita / poverty_line if poverty_line > 0 else 0

    if profile.months_without_income >= 3 or (profile.monthly_income_usd == 0):
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

    if profile.monthly_expenses_usd > profile.monthly_income_usd > 0:
        deficit = profile.monthly_expenses_usd - profile.monthly_income_usd
        deficit_ratio = deficit / profile.monthly_expenses_usd
        base = min(20.0, base + deficit_ratio * 4)

    if profile.is_food_insecure:
        base = min(20.0, base + 2.0)

    return min(20.0, base)


def score_assets(profile: RecipientProfile) -> float:
    """Nisab check and asset depletion. Max 10 pts."""
    asset_scores = {
        AssetLevel.NONE:        10.0,
        AssetLevel.MINIMAL:      7.0,
        AssetLevel.MODERATE:     3.0,
        AssetLevel.ABOVE_NISAB:  0.0,
    }
    score = asset_scores.get(profile.asset_level, 0.0)
    if profile.sold_assets_to_survive:
        score = min(10.0, score + 2.0)
    return score


def score_family(profile: RecipientProfile) -> float:
    """Family structure, dependents, breadwinner status. Max 15 pts."""
    score = 0.0

    score += min(profile.num_dependents * 2.0, 8.0)
    extra_minors = max(0, profile.num_minor_children - profile.num_dependents)
    score += min(extra_minors * 1.0, 3.0)
    score += min(profile.num_elderly_dependents * 0.5, 2.0)

    if profile.is_single_parent:   score += 3.0
    if profile.is_widow:           score += 2.0
    if profile.is_sole_breadwinner: score += 2.0
    if profile.is_orphan_under_18: score += 2.0

    return min(15.0, score)


def score_housing(profile: RecipientProfile) -> float:
    """Housing stability and safety. Max 12 pts."""
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
    """Employment status and unemployment duration. Max 10 pts."""
    employment_scores = {
        EmploymentStatus.FULL_TIME:     0.0,
        EmploymentStatus.FULL_TIME_LOW: 2.0,
        EmploymentStatus.PART_TIME:     4.0,
        EmploymentStatus.INFORMAL:      5.0,
        EmploymentStatus.SEASONAL:      6.0,
        EmploymentStatus.NONE:          8.0,
    }
    score = employment_scores.get(profile.employment_status, 0.0)

    if profile.months_without_income >= 6:
        score = min(10.0, score + 2.0)
    elif profile.months_without_income >= 3:
        score = min(10.0, score + 1.0)

    return score


def score_health(profile: RecipientProfile) -> float:
    """Medical status, disability, sick dependents. Max 15 pts."""
    health_scores = {
        MedicalStatus.NONE:               0.0,
        MedicalStatus.MINOR:              3.0,
        MedicalStatus.CHRONIC:            7.0,
        MedicalStatus.MENTAL_HEALTH:      8.0,
        MedicalStatus.CHRONIC_NO_ACCESS:  11.0,
        MedicalStatus.DISABILITY:         13.0,
        MedicalStatus.TERMINAL:           15.0,
    }
    score = health_scores.get(profile.medical_status, 0.0)
    score += min(profile.num_sick_dependents * 1.5, 4.0)
    return min(15.0, score)


def score_asnaf(profile: RecipientProfile) -> tuple[float, list[str]]:
    """
    Match all relevant Asnaf categories and AM Network recipient groups.
    Returns (score, matched_categories). Max 12 pts.
    """
    matched: list[str] = []
    score = 0.0
    poverty_line = get_poverty_line(profile.country)
    per_capita = profile.monthly_income_usd / max(profile.family_size, 1)

    # ── 1. Al-Masakin — destitute (no income + no assets) ──────────────────
    if profile.monthly_income_usd == 0 and profile.asset_level in (AssetLevel.NONE, AssetLevel.MINIMAL):
        matched.append("Al-Masakin — Destitute: zero income, no meaningful assets")
        score = max(score, 11.0)
    elif profile.asset_level == AssetLevel.NONE and per_capita < poverty_line * 0.25:
        matched.append("Al-Masakin — Critical poverty with no assets")
        score = max(score, 8.0)

    # ── 2. Al-Fuqara — poor (income below poverty line) ────────────────────
    if per_capita < poverty_line * 0.5:
        if profile.is_sole_breadwinner and profile.family_size >= 5:
            matched.append("Al-Fuqara — Large family (5+), sole breadwinner below poverty")
            score = max(score, 9.0)
        elif (profile.is_widow or profile.is_single_parent) and profile.num_dependents >= 1:
            matched.append("Al-Fuqara — Widow / single mother below poverty line with dependents")
            score = max(score, 9.0)
        else:
            matched.append("Al-Fuqara — Household income significantly below poverty line")
            score = max(score, 6.0)

    # Food insecurity — acute destitution marker
    if profile.is_food_insecure and profile.asset_level in (AssetLevel.NONE, AssetLevel.MINIMAL):
        matched.append("Al-Masakin — Food-insecure household (cannot afford adequate nutrition)")
        score = max(score, 8.0)

    # ── 3. Al-Gharimin — debt-burdened ─────────────────────────────────────
    total_debt = profile.debt_amount_usd + profile.non_riba_debt_usd
    monthly_income_safe = max(profile.monthly_income_usd, 1)
    debt_months = total_debt / monthly_income_safe
    if total_debt > 0:
        if debt_months >= 24:
            matched.append("Al-Gharimin — Crushing debt burden (> 2 years of income)")
            score = max(score, 11.0)
        elif debt_months >= 12:
            matched.append("Al-Gharimin — Heavy debt burden (> 1 year of income)")
            score = max(score, 8.0)
        elif debt_months >= 6:
            matched.append("Al-Gharimin — Significant debt (> 6 months of income)")
            score = max(score, 5.0)
        elif profile.has_riba_debt:
            matched.append("Al-Gharimin — Riba-based debt (urgent liberation needed)")
            score = max(score, 6.0)

    # ── 4. Al-Muallafah — new Muslim converts ──────────────────────────────
    if profile.is_new_convert:
        matched.append("Al-Muallafah Qulubuhum — New Muslim convert (≤ 3 years), economic hardship")
        score = max(score, 10.0)

    # ── 5. Al-Riqab — trafficking / forced labour / modern captivity ────────
    if profile.is_trafficking_victim:
        matched.append("Al-Riqab — Human trafficking or forced labour survivor")
        score = max(score, 12.0)

    # ── 6. Ibn Al-Sabil — refugees / displaced / conflict victims ───────────
    if profile.is_refugee or profile.in_conflict_zone:
        matched.append("Ibn Al-Sabil — Refugee or active conflict-zone resident")
        score = max(score, 12.0)
    elif profile.is_internally_displaced:
        matched.append("Ibn Al-Sabil — Internally displaced person (IDP)")
        score = max(score, 10.0)

    if profile.crisis_type in (CrisisType.NATURAL_DISASTER, CrisisType.CONFLICT_ZONE):
        if not profile.is_refugee and not profile.in_conflict_zone:
            matched.append("Ibn Al-Sabil — Disaster / conflict displaced (acute)")
            score = max(score, 9.0)

    # ── 7. Fi Sabilillah — students of Islamic knowledge / daawa workers ────
    if profile.is_student_deen:
        matched.append("Fi Sabilillah — Full-time student of Islamic sciences")
        score = max(score, 9.0)
    elif profile.is_daawa_worker:
        matched.append("Fi Sabilillah — Full-time daawa / Islamic community worker")
        score = max(score, 7.0)

    # ── AM Network supplementary categories ─────────────────────────────────

    # Orphan under 18 with no guardian income (Al-Fuqara)
    if profile.is_orphan_under_18:
        matched.append("Al-Fuqara — Orphan under 18, no guardian income")
        score = max(score, 10.0)

    # Elderly forced to work for survival (Al-Masakin subcategory)
    if profile.is_elderly_working:
        matched.append("Al-Masakin — Elderly forced to work for basic survival")
        score = max(score, 7.0)

    # Disabled, cannot work
    if profile.medical_status == MedicalStatus.DISABILITY:
        matched.append("Al-Fuqara — Disabled person unable to sustain livelihood")
        score = max(score, 9.0)

    # Chronically ill without healthcare access
    if profile.medical_status in (MedicalStatus.CHRONIC_NO_ACCESS, MedicalStatus.TERMINAL):
        matched.append("Al-Masakin — Chronically / terminally ill without healthcare access")
        score = max(score, 8.0)

    # General student from low-income family
    if profile.is_student_general and not profile.is_student_deen:
        matched.append("Al-Fuqara — Student from low-income family")
        score = max(score, 4.0)

    return min(12.0, score), matched


def score_crisis(profile: RecipientProfile) -> float:
    """Emergency and crisis situation scoring. Max 6 pts."""
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
    if profile.in_conflict_zone and profile.crisis_type != CrisisType.CONFLICT_ZONE:
        score = min(6.0, score + 1.5)
    return score


def detect_fraud_flags(profile: RecipientProfile) -> tuple[list, float]:
    """Anti-fraud checks. Returns (flags, penalty_points)."""
    flags: list[str] = []
    penalty = 0.0
    poverty_line = get_poverty_line(profile.country)

    if profile.monthly_income_usd > poverty_line * 3:
        flags.append("INCOME_HIGH: Monthly income > 3× regional poverty line")
        penalty += 15.0
    elif profile.monthly_income_usd > poverty_line * 2:
        flags.append("INCOME_ELEVATED: Monthly income > 2× regional poverty line — verify need")
        penalty += 8.0

    if profile.asset_level == AssetLevel.ABOVE_NISAB:
        flags.append("ASSETS_ABOVE_NISAB: Reported assets exceed nisab threshold ($5,100)")
        penalty += 20.0

    if profile.is_refugee and profile.housing_status == HousingStatus.OWNED_STABLE:
        flags.append("STATUS_CONFLICT: Refugee status + owned stable property")
        penalty += 20.0

    if profile.previous_applications >= 3:
        if profile.months_since_last_application is not None and profile.months_since_last_application < 6:
            flags.append("FREQUENT_APPS: 3+ applications within 6 months")
            penalty += 15.0

    if (profile.employment_status == EmploymentStatus.FULL_TIME
            and profile.monthly_income_usd > poverty_line * 2):
        flags.append("INCOME_CONFLICT: Full-time employed with income above 2× poverty line")
        penalty += 10.0

    if not profile.local_oracle_confirmed:
        flags.append("UNCONFIRMED: Awaiting local oracle (imam / social worker) confirmation")
        penalty += 5.0
    if not profile.documents_verified:
        flags.append("DOCS_PENDING: Supporting documents not yet verified")
        penalty += 5.0

    return flags, penalty


def recommend_support_types(profile: RecipientProfile, tier: str) -> list[str]:
    """Suggest appropriate Zakat distribution channels based on profile."""
    types: list[str] = []
    if tier == "INELIGIBLE":
        return []

    # Cash / basic needs
    if profile.monthly_income_usd == 0 or profile.is_food_insecure:
        types.append("Monthly cash transfer (basic subsistence)")

    # Housing
    if profile.housing_status in (HousingStatus.HOMELESS, HousingStatus.REFUGEE_CAMP,
                                   HousingStatus.TEMPORARY_SHELTER, HousingStatus.RENTING_DEBT):
        types.append("Emergency housing or rent assistance")

    # Medical
    if profile.medical_status in (MedicalStatus.CHRONIC_NO_ACCESS, MedicalStatus.DISABILITY,
                                   MedicalStatus.TERMINAL):
        types.append("Medical aid / healthcare fund")
    if profile.num_sick_dependents >= 1:
        types.append("Healthcare support for sick family members")

    # Debt relief
    total_debt = profile.debt_amount_usd + profile.non_riba_debt_usd
    if total_debt > 0:
        if profile.has_riba_debt:
            types.append("Riba debt liberation (urgent — prevents accumulating haram interest)")
        else:
            types.append("Halal debt relief fund")

    # Education
    if profile.is_student_deen:
        types.append("Islamic education stipend (tuition + living expenses)")
    elif profile.is_student_general:
        types.append("General education grant")

    # Livelihood / enterprise
    if profile.employment_status in (EmploymentStatus.NONE, EmploymentStatus.SEASONAL,
                                      EmploymentStatus.INFORMAL):
        if not (profile.medical_status == MedicalStatus.DISABILITY or
                profile.is_refugee or profile.is_elderly_working):
            types.append("Microenterprise / skills training support")

    # Food vouchers
    if profile.is_food_insecure:
        types.append("Food vouchers / in-kind food assistance")

    # Psychosocial
    if profile.is_trafficking_victim or profile.crisis_type == CrisisType.DOMESTIC_VIOLENCE:
        types.append("Psychosocial support & safe housing")

    if not types:
        types.append("Targeted Sadaqah / one-time emergency support")

    return types


def estimate_monthly_need(profile: RecipientProfile) -> float:
    """Estimate minimum monthly Zakat support needed (USD)."""
    poverty_line = get_poverty_line(profile.country)
    target = poverty_line * profile.family_size * 0.8
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
    """Score a recipient profile. Returns full ScoreBreakdown (0–100)."""
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
    bd.recommended_support_types = recommend_support_types(profile, bd.priority_tier)

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
    tier_icon  = tier_icons.get(bd.priority_tier, "⚪")
    conf_icon  = conf_icons.get(bd.confidence_level, "⚠️")

    lines = [
        "=" * 64,
        "  AM NETWORK — ZAKAT ELIGIBILITY REPORT v2.1",
        "=" * 64,
        f"  Applicant  : {profile.name}",
        f"  Location   : {profile.region}, {profile.country}" if profile.region else f"  Location   : {profile.country}",
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
        lines.append("── ☪  ASNAF / RECIPIENT CATEGORIES MATCHED ─────────────")
        for cat in bd.asnaf_categories:
            lines.append(f"  ✔ {cat}")
        lines.append("")

    if bd.recommended_support_types:
        lines.append("── 💰 RECOMMENDED SUPPORT TYPES ─────────────────────────")
        for s in bd.recommended_support_types:
            lines.append(f"  → {s}")
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
