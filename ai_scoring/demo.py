"""
AM Network — AI Scoring Demo
Runs 5 realistic test cases to demonstrate the scoring model.
"""

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, score_recipient, format_report
)


DEMO_PROFILES = [
    # ── Case 1: Critical — widow, refugee, sick child ──
    RecipientProfile(
        name="Fatima Al-Hassan",
        country="EG",
        region="Cairo",
        monthly_income_usd=0,
        family_size=4,
        num_dependents=3,
        is_single_parent=True,
        is_widow=True,
        is_refugee=True,
        medical_status=MedicalStatus.CHRONIC_NO_ACCESS,
        housing_status=HousingStatus.REFUGEE_CAMP,
        employment_status=EmploymentStatus.NONE,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── Case 2: High — disabled father, large family ──
    RecipientProfile(
        name="Ahmad Karimov",
        country="TJ",
        region="Dushanbe",
        monthly_income_usd=45,
        family_size=6,
        num_dependents=4,
        is_single_parent=False,
        medical_status=MedicalStatus.DISABILITY,
        housing_status=HousingStatus.RENTING_DEBT,
        employment_status=EmploymentStatus.NONE,
        has_riba_debt=True,
        debt_amount_usd=800,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── Case 3: Medium — student, part-time, debt ──
    RecipientProfile(
        name="Yusuf Ibrahim",
        country="NG",
        region="Lagos",
        monthly_income_usd=60,
        family_size=2,
        num_dependents=1,
        is_single_parent=False,
        medical_status=MedicalStatus.NONE,
        housing_status=HousingStatus.RENTING,
        employment_status=EmploymentStatus.PART_TIME,
        has_riba_debt=True,
        debt_amount_usd=300,
        documents_verified=True,
        local_oracle_confirmed=False,
    ),

    # ── Case 4: Low — employed but below poverty line ──
    RecipientProfile(
        name="Siti Rahma",
        country="ID",
        region="Jakarta",
        monthly_income_usd=110,
        family_size=3,
        num_dependents=1,
        medical_status=MedicalStatus.MINOR,
        housing_status=HousingStatus.OVERCROWDED,
        employment_status=EmploymentStatus.FULL_TIME_LOW,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── Case 5: Fraud flags — inconsistent profile ──
    RecipientProfile(
        name="Unknown Applicant",
        country="UAE",
        region="Dubai",
        monthly_income_usd=2500,
        family_size=1,
        num_dependents=0,
        is_refugee=True,
        housing_status=HousingStatus.OWNED_STABLE,
        employment_status=EmploymentStatus.FULL_TIME,
        medical_status=MedicalStatus.NONE,
        previous_applications=4,
        months_since_last_application=2,
        documents_verified=False,
        local_oracle_confirmed=False,
    ),
]


def run_demo():
    print("\n" + "=" * 60)
    print("  AM NETWORK — AI SCORING PROTOTYPE DEMO")
    print("  Scoring 5 applicant profiles")
    print("=" * 60 + "\n")

    results = []
    for profile in DEMO_PROFILES:
        breakdown = score_recipient(profile)
        results.append((profile, breakdown))
        print(format_report(profile, breakdown))
        print()

    # Summary table
    print("=" * 60)
    print("SUMMARY — ALL APPLICANTS")
    print("=" * 60)
    print(f"{'Name':<25} {'Score':>6}  {'Tier':<12} {'Flags'}")
    print("-" * 60)
    for profile, bd in results:
        flag_count = len(bd.fraud_flags)
        flags_str = f"{flag_count} flag(s)" if flag_count else "clean"
        print(f"{profile.name:<25} {bd.final_score:>5.1f}  {bd.priority_tier:<12} {flags_str}")
    print("=" * 60)


if __name__ == "__main__":
    run_demo()
