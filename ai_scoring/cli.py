"""
AM Network — Interactive CLI scorer v2
Usage: python cli.py
"""

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, CrisisType, AssetLevel,
    score_recipient, format_report
)


def ask(prompt: str, default: str = "") -> str:
    val = input(f"{prompt} [{default}]: ").strip()
    return val if val else default


def ask_bool(prompt: str, default: bool = False) -> bool:
    d = "y" if default else "n"
    val = input(f"{prompt} (y/n) [{d}]: ").strip().lower()
    if val in ("y", "yes", "1"): return True
    if val in ("n", "no", "0"):  return False
    return default


def ask_choice(prompt: str, options: list, default: int = 0):
    print(f"\n{prompt}")
    for i, opt in enumerate(options):
        marker = " ← default" if i == default else ""
        print(f"  {i + 1}. {opt.value}{marker}")
    while True:
        val = input(f"Choose 1-{len(options)} [{default + 1}]: ").strip()
        if not val:
            return options[default]
        try:
            idx = int(val) - 1
            if 0 <= idx < len(options):
                return options[idx]
        except ValueError:
            pass
        print("Invalid choice, try again.")


def ask_float(prompt: str, default: float = 0.0) -> float:
    while True:
        val = input(f"{prompt} [{default}]: ").strip()
        if not val: return default
        try:    return float(val)
        except: print("Enter a number.")


def ask_int(prompt: str, default: int = 0) -> int:
    while True:
        val = input(f"{prompt} [{default}]: ").strip()
        if not val: return default
        try:    return int(val)
        except: print("Enter a whole number.")


def main():
    print("\n" + "=" * 64)
    print("  AM NETWORK — RECIPIENT SCORING TOOL v2")
    print("  Applicant details → Zakat eligibility score 0-100")
    print("=" * 64 + "\n")

    # ── Identity ──────────────────────────────────────────────────────────
    name    = ask("Full name", "Applicant")
    country = ask("Country code (e.g. EG, TJ, MY, NG, ID, TR, DE)", "EG")
    region  = ask("Region / City", "")

    # ── Income & Financial ────────────────────────────────────────────────
    print("\n── INCOME & FINANCIAL ──────────────────────────────────────")
    income           = ask_float("Monthly household income (USD)", 0.0)
    expenses         = ask_float("Monthly household expenses (USD, 0 if unknown)", 0.0)
    months_no_income = ask_int("Consecutive months without income", 0)

    has_riba_debt = ask_bool("Has riba-based (interest) debt?", False)
    debt_amt = 0.0
    if has_riba_debt:
        debt_amt = ask_float("  Total riba debt (USD)", 0.0)

    has_other_debt = ask_bool("Has other debt (medical bills, halal loans)?", False)
    other_debt_amt = 0.0
    if has_other_debt:
        other_debt_amt = ask_float("  Total other debt (USD)", 0.0)

    # ── Assets ────────────────────────────────────────────────────────────
    print("\n── ASSETS & NISAB CHECK ────────────────────────────────────")
    asset_level = ask_choice(
        "Asset level (savings + property + valuables combined):",
        list(AssetLevel), default=0
    )
    sold_assets = ask_bool("Sold personal assets to survive basic needs?", False)

    # ── Family ────────────────────────────────────────────────────────────
    print("\n── FAMILY STRUCTURE ────────────────────────────────────────")
    family_size   = ask_int("Total household members (incl. applicant)", 1)
    num_dep       = ask_int("Number of dependents (children + elderly)", 0)
    num_minors    = ask_int("  Of which: minor children under 18", 0)
    num_elderly_d = ask_int("  Of which: elderly dependents", 0)
    single_parent = ask_bool("Single parent?", False)
    widow         = ask_bool("Widow / widower?", False)
    sole_bw       = ask_bool("Sole breadwinner for the household?", False)
    food_insecure = ask_bool("Food insecure (cannot afford adequate food)?", False)

    # ── Asnaf categories ──────────────────────────────────────────────────
    print("\n── VULNERABILITY & ASNAF CATEGORIES ───────────────────────")
    orphan          = ask_bool("Orphan under 18 (no guardian income)?", False)
    refugee         = ask_bool("Refugee / stateless person?", False)
    idp             = ask_bool("Internally displaced person (IDP)?", False)
    elderly         = ask_bool("Elderly forced to work for survival?", False)
    new_convert     = ask_bool("New Muslim convert (within 3 years)?", False)
    trafficking     = ask_bool("Trafficking / forced labour victim?", False)
    student_deen    = ask_bool("Full-time student of Islamic sciences?", False)
    student_general = ask_bool("General student from low-income family?", False)
    daawa_worker    = ask_bool("Full-time daawa / Islamic community worker?", False)

    # ── Medical ───────────────────────────────────────────────────────────
    print("\n── HEALTH & MEDICAL ────────────────────────────────────────")
    medical      = ask_choice("Medical / disability status:", list(MedicalStatus), default=0)
    num_sick_dep = ask_int("Number of family members with serious illness", 0)

    # ── Housing ───────────────────────────────────────────────────────────
    print("\n── HOUSING ─────────────────────────────────────────────────")
    housing = ask_choice("Housing situation:", list(HousingStatus), default=5)

    # ── Employment ────────────────────────────────────────────────────────
    print("\n── EMPLOYMENT ──────────────────────────────────────────────")
    employment = ask_choice("Employment status:", list(EmploymentStatus), default=0)

    # ── Crisis ────────────────────────────────────────────────────────────
    print("\n── CRISIS & EMERGENCY ──────────────────────────────────────")
    crisis        = ask_choice("Current crisis / emergency:", list(CrisisType), default=0)
    conflict_zone = ask_bool("Currently in or recently fled a conflict zone?", False)

    # ── Verification ──────────────────────────────────────────────────────
    print("\n── VERIFICATION ────────────────────────────────────────────")
    docs_verified    = ask_bool("Documents verified?", False)
    oracle_confirmed = ask_bool("Local oracle (imam / social worker) confirmed?", False)
    prev_apps        = ask_int("Number of previous Zakat applications", 0)
    months_since     = None
    if prev_apps > 0:
        months_since = ask_int("Months since last application", 12)

    profile = RecipientProfile(
        name=name,
        country=country,
        region=region,
        monthly_income_usd=income,
        monthly_expenses_usd=expenses,
        months_without_income=months_no_income,
        has_riba_debt=has_riba_debt,
        debt_amount_usd=debt_amt,
        has_non_riba_debt=has_other_debt,
        non_riba_debt_usd=other_debt_amt,
        asset_level=asset_level,
        sold_assets_to_survive=sold_assets,
        family_size=family_size,
        num_dependents=num_dep,
        num_minor_children=num_minors,
        num_elderly_dependents=num_elderly_d,
        is_single_parent=single_parent,
        is_widow=widow,
        is_sole_breadwinner=sole_bw,
        is_food_insecure=food_insecure,
        is_orphan_under_18=orphan,
        is_refugee=refugee,
        is_internally_displaced=idp,
        is_elderly_working=elderly,
        is_new_convert=new_convert,
        is_trafficking_victim=trafficking,
        is_student_deen=student_deen,
        is_student_general=student_general,
        is_daawa_worker=daawa_worker,
        medical_status=medical,
        num_sick_dependents=num_sick_dep,
        housing_status=housing,
        employment_status=employment,
        crisis_type=crisis,
        in_conflict_zone=conflict_zone,
        documents_verified=docs_verified,
        local_oracle_confirmed=oracle_confirmed,
        previous_applications=prev_apps,
        months_since_last_application=months_since,
    )

    breakdown = score_recipient(profile)
    print("\n")
    print(format_report(profile, breakdown))


if __name__ == "__main__":
    main()
