"""
AM Network — Interactive CLI scorer
Usage: python cli.py
"""

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, score_recipient, format_report
)


def ask(prompt: str, default: str = "") -> str:
    val = input(f"{prompt} [{default}]: ").strip()
    return val if val else default


def ask_bool(prompt: str, default: bool = False) -> bool:
    d = "y" if default else "n"
    val = input(f"{prompt} (y/n) [{d}]: ").strip().lower()
    if val in ("y", "yes", "1"):
        return True
    if val in ("n", "no", "0"):
        return False
    return default


def ask_choice(prompt: str, options: list, default: int = 0) -> str:
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
        if not val:
            return default
        try:
            return float(val)
        except ValueError:
            print("Enter a number.")


def ask_int(prompt: str, default: int = 0) -> int:
    while True:
        val = input(f"{prompt} [{default}]: ").strip()
        if not val:
            return default
        try:
            return int(val)
        except ValueError:
            print("Enter a whole number.")


def main():
    print("\n" + "=" * 60)
    print("  AM NETWORK — RECIPIENT SCORING TOOL")
    print("  Enter applicant details to calculate Zakat score")
    print("=" * 60 + "\n")

    name    = ask("Full name", "Applicant")
    country = ask("Country code (e.g. EG, TJ, MY, NG, ID)", "EG")
    region  = ask("Region / City", "")

    print("\n── FINANCIAL ──────────────────────────────")
    income = ask_float("Monthly household income (USD)", 0.0)
    has_debt = ask_bool("Has riba-based debt?", False)
    debt_amt = 0.0
    if has_debt:
        debt_amt = ask_float("  Total debt amount (USD)", 0.0)

    print("\n── FAMILY ─────────────────────────────────")
    family_size   = ask_int("Total family members (incl. applicant)", 1)
    num_dep       = ask_int("Number of dependents (children, elderly)", 0)
    single_parent = ask_bool("Single parent?", False)
    widow         = ask_bool("Widow/widower?", False)

    print("\n── VULNERABILITY ──────────────────────────")
    orphan   = ask_bool("Orphan under 18?", False)
    refugee  = ask_bool("Refugee / displaced person?", False)
    elderly  = ask_bool("Elderly forced to work for survival?", False)

    print("\n── MEDICAL ────────────────────────────────")
    medical = ask_choice(
        "Medical / disability status:",
        list(MedicalStatus),
        default=0
    )

    print("\n── HOUSING ────────────────────────────────")
    housing = ask_choice(
        "Housing situation:",
        list(HousingStatus),
        default=4
    )

    print("\n── EMPLOYMENT ─────────────────────────────")
    employment = ask_choice(
        "Employment status:",
        list(EmploymentStatus),
        default=0
    )

    print("\n── VERIFICATION ───────────────────────────")
    docs_verified   = ask_bool("Documents verified?", False)
    oracle_confirmed = ask_bool("Local oracle (imam/social worker) confirmed?", False)
    prev_apps       = ask_int("Number of previous applications", 0)
    months_since    = None
    if prev_apps > 0:
        months_since = ask_int("Months since last application", 12)

    profile = RecipientProfile(
        name=name,
        country=country,
        region=region,
        monthly_income_usd=income,
        has_riba_debt=has_debt,
        debt_amount_usd=debt_amt,
        family_size=family_size,
        num_dependents=num_dep,
        is_single_parent=single_parent,
        is_widow=widow,
        is_orphan_under_18=orphan,
        is_refugee=refugee,
        is_elderly_working=elderly,
        medical_status=medical,
        housing_status=housing,
        employment_status=employment,
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
