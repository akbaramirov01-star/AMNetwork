"""
AM Network — AI Recipient Scoring Model
Scores Zakat/Sadaqah applicants 0-100 based on financial need.
Higher score = greater need = higher distribution priority.
"""

from dataclasses import dataclass, field
from typing import Optional
from enum import Enum


class HousingStatus(str, Enum):
    HOMELESS = "homeless"
    REFUGEE_CAMP = "refugee_camp"
    RENTING_DEBT = "renting_with_debt"
    RENTING = "renting"
    OVERCROWDED = "overcrowded"
    OWNED_STABLE = "owned_stable"


class EmploymentStatus(str, Enum):
    NONE = "none"
    SEASONAL = "seasonal"
    PART_TIME = "part_time"
    FULL_TIME_LOW = "full_time_low_income"
    FULL_TIME = "full_time"


class MedicalStatus(str, Enum):
    NONE = "none"
    MINOR = "minor_illness"
    CHRONIC_NO_ACCESS = "chronic_no_healthcare_access"
    CHRONIC = "chronic_illness"
    DISABILITY = "disability_prevents_work"
    TERMINAL = "terminal_illness"


@dataclass
class RecipientProfile:
    # Identity
    name: str
    country: str
    region: str

    # Financial
    monthly_income_usd: float
    has_riba_debt: bool = False
    debt_amount_usd: float = 0.0

    # Family
    family_size: int = 1
    num_dependents: int = 0
    is_single_parent: bool = False
    is_widow: bool = False

    # Vulnerability categories
    is_orphan_under_18: bool = False
    is_refugee: bool = False
    is_elderly_working: bool = False

    # Medical
    medical_status: MedicalStatus = MedicalStatus.NONE

    # Housing
    housing_status: HousingStatus = HousingStatus.RENTING

    # Employment
    employment_status: EmploymentStatus = EmploymentStatus.NONE

    # Zakat history (anti-fraud)
    previous_applications: int = 0
    months_since_last_application: Optional[int] = None

    # Document verification flags
    documents_verified: bool = False
    local_oracle_confirmed: bool = False


@dataclass
class ScoreBreakdown:
    income_score: float = 0.0          # max 25
    family_score: float = 0.0          # max 20
    medical_score: float = 0.0         # max 20
    housing_score: float = 0.0         # max 15
    employment_score: float = 0.0      # max 10
    vulnerability_score: float = 0.0   # max 10
    total: float = 0.0
    fraud_flags: list = field(default_factory=list)
    fraud_penalty: float = 0.0
    final_score: float = 0.0
    priority_tier: str = ""
    recommendation: str = ""


# Regional poverty thresholds (monthly USD)
POVERTY_THRESHOLDS = {
    "default": 200,
    "UAE": 800, "US": 1200, "UK": 1100, "DE": 900,
    "MY": 350, "ID": 150, "PK": 100, "BD": 80,
    "TJ": 80, "UZ": 90, "KZ": 250,
    "EG": 120, "MA": 130, "NG": 70,
}


def get_poverty_line(country: str) -> float:
    return POVERTY_THRESHOLDS.get(country, POVERTY_THRESHOLDS["default"])


def score_income(profile: RecipientProfile) -> float:
    """Score based on income relative to regional poverty line. Max 25."""
    poverty_line = get_poverty_line(profile.country)
    ratio = profile.monthly_income_usd / poverty_line if poverty_line > 0 else 0

    if ratio == 0:
        return 25.0
    elif ratio <= 0.25:
        return 22.0
    elif ratio <= 0.5:
        return 18.0
    elif ratio <= 0.75:
        return 12.0
    elif ratio <= 1.0:
        return 6.0
    elif ratio <= 1.5:
        return 2.0
    else:
        return 0.0


def score_family(profile: RecipientProfile) -> float:
    """Score based on family size and single-parent status. Max 20."""
    score = 0.0

    # Per dependent child/elderly
    score += min(profile.num_dependents * 3.0, 15.0)

    # Single parent bonus
    if profile.is_single_parent:
        score += 4.0
    if profile.is_widow:
        score += 3.0

    return min(score, 20.0)


def score_medical(profile: RecipientProfile) -> float:
    """Score based on medical/disability situation. Max 20."""
    medical_scores = {
        MedicalStatus.NONE: 0.0,
        MedicalStatus.MINOR: 4.0,
        MedicalStatus.CHRONIC: 10.0,
        MedicalStatus.CHRONIC_NO_ACCESS: 16.0,
        MedicalStatus.DISABILITY: 18.0,
        MedicalStatus.TERMINAL: 20.0,
    }
    return medical_scores.get(profile.medical_status, 0.0)


def score_housing(profile: RecipientProfile) -> float:
    """Score based on housing stability. Max 15."""
    housing_scores = {
        HousingStatus.OWNED_STABLE: 0.0,
        HousingStatus.OVERCROWDED: 5.0,
        HousingStatus.RENTING: 6.0,
        HousingStatus.RENTING_DEBT: 10.0,
        HousingStatus.REFUGEE_CAMP: 14.0,
        HousingStatus.HOMELESS: 15.0,
    }
    return housing_scores.get(profile.housing_status, 0.0)


def score_employment(profile: RecipientProfile) -> float:
    """Score based on employment situation. Max 10."""
    employment_scores = {
        EmploymentStatus.FULL_TIME: 0.0,
        EmploymentStatus.FULL_TIME_LOW: 2.0,
        EmploymentStatus.PART_TIME: 5.0,
        EmploymentStatus.SEASONAL: 7.0,
        EmploymentStatus.NONE: 10.0,
    }
    return employment_scores.get(profile.employment_status, 0.0)


def score_vulnerability(profile: RecipientProfile) -> float:
    """Score based on special vulnerability categories. Max 10."""
    score = 0.0

    if profile.is_refugee:
        score += 10.0
    elif profile.is_orphan_under_18:
        score += 10.0
    elif profile.is_elderly_working:
        score += 7.0

    if profile.has_riba_debt:
        debt_poverty = profile.debt_amount_usd / max(get_poverty_line(profile.country), 1)
        score += min(debt_poverty * 0.5, 4.0)

    return min(score, 10.0)


def detect_fraud_flags(profile: RecipientProfile) -> tuple[list, float]:
    """
    Anti-fraud checks. Returns (flags, penalty_points).
    Penalty reduces final score.
    """
    flags = []
    penalty = 0.0

    # High income but claiming max vulnerability
    if profile.monthly_income_usd > get_poverty_line(profile.country) * 2:
        flags.append("INCOME_ABOVE_2X_POVERTY: Verify need justification")
        penalty += 10.0

    # Too many recent applications
    if profile.previous_applications >= 3:
        if profile.months_since_last_application and profile.months_since_last_application < 6:
            flags.append("FREQUENT_APPLICATIONS: 3+ applications within 6 months")
            penalty += 15.0

    # Claims refugee + stable owned home
    if profile.is_refugee and profile.housing_status == HousingStatus.OWNED_STABLE:
        flags.append("STATUS_CONFLICT: Refugee + owned stable home")
        penalty += 20.0

    # No local oracle confirmation (required for high scores)
    if not profile.local_oracle_confirmed:
        flags.append("UNCONFIRMED: Awaiting local oracle (imam/social worker) verification")
        penalty += 5.0

    # Documents not verified
    if not profile.documents_verified:
        flags.append("DOCS_UNVERIFIED: Documents pending review")
        penalty += 5.0

    return flags, penalty


def get_priority_tier(score: float) -> tuple[str, str]:
    """Convert score to priority tier and recommendation."""
    if score >= 80:
        return "CRITICAL", "Immediate distribution — highest need confirmed"
    elif score >= 65:
        return "HIGH", "Priority distribution within 48 hours"
    elif score >= 45:
        return "MEDIUM", "Standard distribution queue — next cycle"
    elif score >= 25:
        return "LOW", "Eligible for partial Sadaqah distribution"
    else:
        return "INELIGIBLE", "Does not meet minimum Zakat criteria — consider Sadaqah referral"


def score_recipient(profile: RecipientProfile) -> ScoreBreakdown:
    """
    Main scoring function. Returns full breakdown with final score 0-100.
    """
    breakdown = ScoreBreakdown()

    breakdown.income_score = score_income(profile)
    breakdown.family_score = score_family(profile)
    breakdown.medical_score = score_medical(profile)
    breakdown.housing_score = score_housing(profile)
    breakdown.employment_score = score_employment(profile)
    breakdown.vulnerability_score = score_vulnerability(profile)

    breakdown.total = (
        breakdown.income_score +
        breakdown.family_score +
        breakdown.medical_score +
        breakdown.housing_score +
        breakdown.employment_score +
        breakdown.vulnerability_score
    )

    breakdown.fraud_flags, breakdown.fraud_penalty = detect_fraud_flags(profile)

    breakdown.final_score = max(0.0, min(100.0, breakdown.total - breakdown.fraud_penalty))
    breakdown.priority_tier, breakdown.recommendation = get_priority_tier(breakdown.final_score)

    return breakdown


def format_report(profile: RecipientProfile, breakdown: ScoreBreakdown) -> str:
    """Generate human-readable scoring report."""
    bar_filled = int(breakdown.final_score / 5)
    bar = "█" * bar_filled + "░" * (20 - bar_filled)

    tier_colors = {
        "CRITICAL": "🔴",
        "HIGH": "🟠",
        "MEDIUM": "🟡",
        "LOW": "🟢",
        "INELIGIBLE": "⚪",
    }
    tier_icon = tier_colors.get(breakdown.priority_tier, "⚪")

    lines = [
        "=" * 60,
        f"AM NETWORK — ZAKAT ELIGIBILITY REPORT",
        "=" * 60,
        f"Applicant : {profile.name}",
        f"Location  : {profile.region}, {profile.country}",
        f"",
        f"SCORE: {breakdown.final_score:.1f}/100  [{bar}]",
        f"TIER : {tier_icon} {breakdown.priority_tier}",
        f"",
        "── SCORE BREAKDOWN ──────────────────────────",
        f"  Income & Poverty    : {breakdown.income_score:5.1f} / 25",
        f"  Family & Dependents : {breakdown.family_score:5.1f} / 20",
        f"  Medical & Disability: {breakdown.medical_score:5.1f} / 20",
        f"  Housing Stability   : {breakdown.housing_score:5.1f} / 15",
        f"  Employment Status   : {breakdown.employment_score:5.1f} / 10",
        f"  Vulnerability Bonus : {breakdown.vulnerability_score:5.1f} / 10",
        f"  ─────────────────────────────────────────",
        f"  Raw Total           : {breakdown.total:5.1f} / 100",
    ]

    if breakdown.fraud_penalty > 0:
        lines.append(f"  Fraud/Risk Penalty  : -{breakdown.fraud_penalty:4.1f}")

    lines.append(f"  FINAL SCORE         : {breakdown.final_score:5.1f} / 100")
    lines.append("")

    if breakdown.fraud_flags:
        lines.append("── ⚠️  FLAGS ────────────────────────────────")
        for flag in breakdown.fraud_flags:
            lines.append(f"  • {flag}")
        lines.append("")

    lines += [
        "── RECOMMENDATION ───────────────────────────",
        f"  {breakdown.recommendation}",
        "=" * 60,
    ]

    return "\n".join(lines)
