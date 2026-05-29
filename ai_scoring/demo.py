"""
AM Network — AI Scoring Demo v2
10 realistic test cases covering all 8 Asnaf categories.
"""

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, CrisisType, AssetLevel,
    score_recipient, format_report
)

DEMO_PROFILES = [

    # ── 1. IBN AL-SABIL: Syrian refugee widow, 5 children ──────────────────
    RecipientProfile(
        name="Umm Khalid Al-Halabi",
        country="TR", region="Gaziantep",
        monthly_income_usd=0,
        months_without_income=8,
        family_size=5, num_dependents=4, num_minor_children=3,
        is_widow=True, is_sole_breadwinner=True,
        is_refugee=True,
        crisis_type=CrisisType.BREADWINNER_LOSS,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.REFUGEE_CAMP,
        employment_status=EmploymentStatus.NONE,
        num_sick_dependents=1,
        is_food_insecure=True,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 2. AL-GHARIMIN: Palestinian family crushed by medical debt ──────────
    RecipientProfile(
        name="Hassan Abu Daoud",
        country="JO", region="Amman refugee camp",
        monthly_income_usd=90,
        monthly_expenses_usd=380,
        family_size=7, num_dependents=5, num_minor_children=4,
        is_sole_breadwinner=True,
        has_non_riba_debt=True, non_riba_debt_usd=4200,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.OVERCROWDED,
        employment_status=EmploymentStatus.INFORMAL,
        num_sick_dependents=2,
        crisis_type=CrisisType.MEDICAL_EMERGENCY,
        is_food_insecure=True,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 3. AL-MUALLAFAH: New Muslim convert, lost job after conversion ───────
    RecipientProfile(
        name="Dawud Petersen (prev. David)",
        country="DE", region="Berlin",
        monthly_income_usd=0,
        months_without_income=4,
        family_size=2, num_dependents=1, num_minor_children=1,
        is_new_convert=True,
        is_single_parent=True,
        asset_level=AssetLevel.MINIMAL,
        housing_status=HousingStatus.RENTING_DEBT,
        employment_status=EmploymentStatus.NONE,
        medical_status=MedicalStatus.MENTAL_HEALTH,
        crisis_type=CrisisType.SUDDEN_JOB_LOSS,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 4. AL-RIQAB: Trafficking victim in shelter ─────────────────────────
    RecipientProfile(
        name="Fatima Z. (identity protected)",
        country="MY", region="Kuala Lumpur shelter",
        monthly_income_usd=0,
        months_without_income=6,
        family_size=1, num_dependents=0,
        is_trafficking_victim=True,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.TEMPORARY_SHELTER,
        employment_status=EmploymentStatus.NONE,
        medical_status=MedicalStatus.CHRONIC_NO_ACCESS,
        crisis_type=CrisisType.DOMESTIC_VIOLENCE,
        documents_verified=False,
        local_oracle_confirmed=True,
    ),

    # ── 5. FI SABILILLAH: Islamic student, Qarawiyyin University ────────────
    RecipientProfile(
        name="Ibrahim Al-Mauritani",
        country="MA", region="Fes (Qarawiyyin)",
        monthly_income_usd=30,
        family_size=1, num_dependents=0,
        is_student_deen=True,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.WITH_RELATIVES,
        employment_status=EmploymentStatus.NONE,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 6. AL-FUQARA: Disabled father, 8-person family, Tajikistan ──────────
    RecipientProfile(
        name="Yusuf Nazarov",
        country="TJ", region="Khatlon province",
        monthly_income_usd=40,
        monthly_expenses_usd=220,
        family_size=8, num_dependents=6, num_minor_children=5,
        is_sole_breadwinner=True,
        has_riba_debt=True, debt_amount_usd=600,
        asset_level=AssetLevel.MINIMAL,
        sold_assets_to_survive=True,
        housing_status=HousingStatus.OVERCROWDED,
        employment_status=EmploymentStatus.SEASONAL,
        medical_status=MedicalStatus.DISABILITY,
        num_sick_dependents=1,
        is_food_insecure=True,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 7. CRISIS: Earthquake survivor, homeless widow ──────────────────────
    RecipientProfile(
        name="Aigerim Bekova",
        country="KZ", region="Almaty (post-earthquake)",
        monthly_income_usd=0,
        months_without_income=2,
        family_size=4, num_dependents=2, num_minor_children=2,
        is_widow=True, is_sole_breadwinner=True,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.HOMELESS,
        employment_status=EmploymentStatus.NONE,
        medical_status=MedicalStatus.MINOR,
        crisis_type=CrisisType.NATURAL_DISASTER,
        is_food_insecure=True,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 8. AL-MASAKIN: Elderly widow, no family support, Nigeria ────────────
    RecipientProfile(
        name="Khadijah Bint Yusuf",
        country="NG", region="Kano",
        monthly_income_usd=20,
        family_size=1, num_dependents=0,
        is_elderly_working=True,
        is_widow=True,
        asset_level=AssetLevel.NONE,
        housing_status=HousingStatus.RENTING,
        employment_status=EmploymentStatus.INFORMAL,
        medical_status=MedicalStatus.CHRONIC_NO_ACCESS,
        is_food_insecure=True,
        documents_verified=True,
        local_oracle_confirmed=True,
    ),

    # ── 9. LOW: Working poor student single mother, Indonesia ───────────────
    RecipientProfile(
        name="Siti Rahma",
        country="ID", region="Surabaya",
        monthly_income_usd=120,
        monthly_expenses_usd=210,
        family_size=3, num_dependents=1, num_minor_children=1,
        is_single_parent=True,
        is_student_general=True,
        asset_level=AssetLevel.MINIMAL,
        housing_status=HousingStatus.RENTING,
        employment_status=EmploymentStatus.PART_TIME,
        medical_status=MedicalStatus.MINOR,
        documents_verified=True,
        local_oracle_confirmed=False,
    ),

    # ── 10. INELIGIBLE: High income, assets above nisab, fraud flags ─────────
    RecipientProfile(
        name="Unknown Applicant",
        country="AE", region="Dubai",
        monthly_income_usd=3500,
        family_size=2, num_dependents=0,
        is_refugee=True,
        asset_level=AssetLevel.ABOVE_NISAB,
        housing_status=HousingStatus.OWNED_STABLE,
        employment_status=EmploymentStatus.FULL_TIME,
        previous_applications=4,
        months_since_last_application=2,
        documents_verified=False,
        local_oracle_confirmed=False,
    ),
]


def run_demo():
    print("\n" + "=" * 64)
    print("  AM NETWORK — AI SCORING PROTOTYPE DEMO v2")
    print("  10 applicant profiles · 8 Asnaf categories")
    print("=" * 64 + "\n")

    results = []
    for profile in DEMO_PROFILES:
        breakdown = score_recipient(profile)
        results.append((profile, breakdown))
        print(format_report(profile, breakdown))
        print()

    print("=" * 64)
    print("SUMMARY")
    print("=" * 64)
    print(f"{'Name':<32} {'Score':>6}  {'Tier':<12} {'Conf':<8} {'Need/mo'}")
    print("-" * 64)
    for profile, bd in results:
        need = f"${bd.estimated_monthly_need_usd:.0f}"
        print(
            f"{profile.name:<32} {bd.final_score:>5.1f}  "
            f"{bd.priority_tier:<12} {bd.confidence_level:<8} {need}"
        )
    print("=" * 64)


if __name__ == "__main__":
    run_demo()
