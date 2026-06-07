"""
AM Network — ML Calibration Layer v1.0

Generates 500 synthetic recipient profiles, trains a gradient-boosted
classifier on top of the rule-based scores, and calibrates output
probabilities. This turns the rule engine into a real ML pipeline.

Usage:
    python ml_model.py              # train + evaluate + save model
    python ml_model.py --demo       # run demo profiles through trained model
    python ml_model.py --score      # interactive scoring with ML
"""

from __future__ import annotations
import random
import json
import argparse
import pickle
import os
from pathlib import Path

import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.calibration import CalibratedClassifierCV
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report

from scorer import (
    RecipientProfile, HousingStatus, EmploymentStatus,
    MedicalStatus, CrisisType, AssetLevel,
    score_recipient, format_report,
)

# ── Synthetic data generation ─────────────────────────────────────────────────

COUNTRIES = [
    "TR", "JO", "EG", "NG", "TJ", "ID", "PK", "BD",
    "MA", "SY", "IQ", "SD", "DE", "GB", "MY", "KZ",
    "UZ", "AF", "YE", "LB", "PS", "IN",
]

rng = random.Random(42)


def rand_enum(enum_cls, weights=None):
    members = list(enum_cls)
    return rng.choices(members, weights=weights, k=1)[0]


def synthetic_profile(idx: int) -> RecipientProfile:
    country = rng.choice(COUNTRIES)

    # Vary income distribution — skewed toward low income (realistic)
    income_class = rng.choices(
        ["zero", "very_low", "low", "medium", "ok"],
        weights=[0.35, 0.25, 0.20, 0.12, 0.08], k=1
    )[0]
    income_map = {
        "zero": 0,
        "very_low": rng.uniform(5, 60),
        "low": rng.uniform(60, 200),
        "medium": rng.uniform(200, 600),
        "ok": rng.uniform(600, 2000),
    }
    income = income_map[income_class]
    expenses = income * rng.uniform(0.8, 2.0) if income > 0 else rng.uniform(100, 400)
    months_no_inc = rng.choices([0, 1, 2, 3, 6, 12], weights=[0.5, 0.1, 0.1, 0.1, 0.1, 0.1], k=1)[0]

    family_size = rng.choices([1, 2, 3, 4, 5, 6, 7, 8, 9], weights=[0.15, 0.15, 0.15, 0.15, 0.15, 0.1, 0.07, 0.05, 0.03], k=1)[0]
    num_dep = max(0, rng.randint(0, family_size - 1))
    num_minors = max(0, rng.randint(0, num_dep))
    num_elderly_dep = max(0, rng.randint(0, max(0, num_dep - num_minors)))

    is_single_parent = rng.random() < 0.18
    is_widow = rng.random() < 0.14
    is_sole_bw = rng.random() < 0.35
    is_food_insecure = income_class in ("zero", "very_low") and rng.random() < 0.7

    asset_weights = {
        "zero": [0.65, 0.30, 0.04, 0.01],
        "very_low": [0.40, 0.40, 0.15, 0.05],
        "low": [0.20, 0.40, 0.30, 0.10],
        "medium": [0.05, 0.20, 0.45, 0.30],
        "ok": [0.01, 0.05, 0.24, 0.70],
    }
    asset_level = rng.choices(list(AssetLevel), weights=asset_weights[income_class], k=1)[0]

    is_refugee = rng.random() < 0.12
    is_idp = rng.random() < 0.08
    is_orphan = rng.random() < 0.06
    is_new_convert = rng.random() < 0.04
    is_trafficking = rng.random() < 0.03
    is_student_deen = rng.random() < 0.07
    is_student_gen = rng.random() < 0.10
    is_elderly = rng.random() < 0.08
    is_daawa = rng.random() < 0.03

    housing_weights = {
        "zero": [0.20, 0.25, 0.15, 0.15, 0.10, 0.10, 0.03, 0.02],
        "very_low": [0.05, 0.15, 0.15, 0.20, 0.20, 0.15, 0.07, 0.03],
        "low": [0.02, 0.05, 0.10, 0.15, 0.30, 0.20, 0.10, 0.08],
        "medium": [0.01, 0.02, 0.05, 0.08, 0.25, 0.15, 0.20, 0.24],
        "ok": [0.0, 0.01, 0.02, 0.03, 0.10, 0.10, 0.24, 0.50],
    }
    housing_order = [
        HousingStatus.HOMELESS, HousingStatus.REFUGEE_CAMP,
        HousingStatus.TEMPORARY_SHELTER, HousingStatus.RENTING_DEBT,
        HousingStatus.RENTING, HousingStatus.OVERCROWDED,
        HousingStatus.WITH_RELATIVES, HousingStatus.OWNED_STABLE,
    ]
    housing = rng.choices(housing_order, weights=housing_weights[income_class], k=1)[0]

    employ_weights = {
        "zero": [0.55, 0.20, 0.15, 0.06, 0.03, 0.01],
        "very_low": [0.30, 0.25, 0.25, 0.10, 0.07, 0.03],
        "low": [0.10, 0.15, 0.25, 0.25, 0.20, 0.05],
        "medium": [0.05, 0.05, 0.10, 0.20, 0.35, 0.25],
        "ok": [0.01, 0.02, 0.05, 0.10, 0.32, 0.50],
    }
    employ_order = [
        EmploymentStatus.NONE, EmploymentStatus.SEASONAL,
        EmploymentStatus.INFORMAL, EmploymentStatus.PART_TIME,
        EmploymentStatus.FULL_TIME_LOW, EmploymentStatus.FULL_TIME,
    ]
    employment = rng.choices(employ_order, weights=employ_weights[income_class], k=1)[0]

    medical_weights = {
        "zero": [0.20, 0.15, 0.15, 0.20, 0.15, 0.10, 0.05],
        "very_low": [0.35, 0.15, 0.15, 0.15, 0.10, 0.07, 0.03],
        "low": [0.50, 0.15, 0.15, 0.10, 0.05, 0.03, 0.02],
        "medium": [0.65, 0.15, 0.10, 0.05, 0.03, 0.01, 0.01],
        "ok": [0.80, 0.10, 0.06, 0.02, 0.01, 0.01, 0.00],
    }
    medical_order = [
        MedicalStatus.NONE, MedicalStatus.MINOR, MedicalStatus.CHRONIC,
        MedicalStatus.CHRONIC_NO_ACCESS, MedicalStatus.DISABILITY,
        MedicalStatus.MENTAL_HEALTH, MedicalStatus.TERMINAL,
    ]
    medical = rng.choices(medical_order, weights=medical_weights[income_class], k=1)[0]
    num_sick_dep = rng.choices([0, 1, 2, 3], weights=[0.65, 0.20, 0.10, 0.05], k=1)[0]

    crisis_weights = [0.55, 0.08, 0.08, 0.07, 0.07, 0.07, 0.05, 0.03]
    crisis = rng.choices(list(CrisisType), weights=crisis_weights, k=1)[0]
    in_conflict = country in ("SY", "YE", "IQ", "AF", "PS") or rng.random() < 0.05

    has_riba = rng.random() < 0.15
    debt_amt = rng.uniform(100, 5000) if has_riba else 0
    has_other_debt = rng.random() < 0.20
    other_debt = rng.uniform(100, 8000) if has_other_debt else 0

    sold_assets = rng.random() < 0.12
    docs_verified = rng.random() < 0.65
    oracle_confirmed = rng.random() < 0.60
    prev_apps = rng.choices([0, 1, 2, 3, 4], weights=[0.60, 0.20, 0.10, 0.06, 0.04], k=1)[0]
    months_since = rng.randint(1, 24) if prev_apps > 0 else None

    return RecipientProfile(
        name=f"Synthetic_{idx:04d}",
        country=country,
        monthly_income_usd=income,
        monthly_expenses_usd=expenses,
        months_without_income=months_no_inc,
        has_riba_debt=has_riba,
        debt_amount_usd=debt_amt,
        has_non_riba_debt=has_other_debt,
        non_riba_debt_usd=other_debt,
        asset_level=asset_level,
        sold_assets_to_survive=sold_assets,
        family_size=family_size,
        num_dependents=num_dep,
        num_minor_children=num_minors,
        num_elderly_dependents=num_elderly_dep,
        is_single_parent=is_single_parent,
        is_widow=is_widow,
        is_sole_breadwinner=is_sole_bw,
        is_food_insecure=is_food_insecure,
        is_orphan_under_18=is_orphan,
        is_refugee=is_refugee,
        is_internally_displaced=is_idp,
        is_new_convert=is_new_convert,
        is_trafficking_victim=is_trafficking,
        is_student_deen=is_student_deen,
        is_student_general=is_student_gen,
        is_elderly_working=is_elderly,
        is_daawa_worker=is_daawa,
        medical_status=medical,
        num_sick_dependents=num_sick_dep,
        housing_status=housing,
        employment_status=employment,
        crisis_type=crisis,
        in_conflict_zone=in_conflict,
        documents_verified=docs_verified,
        local_oracle_confirmed=oracle_confirmed,
        previous_applications=prev_apps,
        months_since_last_application=months_since,
    )


# ── Feature extraction ────────────────────────────────────────────────────────

def profile_to_features(p: RecipientProfile) -> list[float]:
    """Convert a RecipientProfile to a numeric feature vector."""
    from scorer import get_poverty_line, NISAB_USD

    poverty_line = get_poverty_line(p.country)
    per_capita = p.monthly_income_usd / max(p.family_size, 1)
    income_ratio = per_capita / poverty_line if poverty_line > 0 else 0
    expense_gap = max(0, p.monthly_expenses_usd - p.monthly_income_usd)
    total_debt = p.debt_amount_usd + p.non_riba_debt_usd
    debt_income_ratio = total_debt / max(p.monthly_income_usd, 1)

    housing_ord = {
        HousingStatus.OWNED_STABLE: 0, HousingStatus.WITH_RELATIVES: 1,
        HousingStatus.OVERCROWDED: 2, HousingStatus.RENTING: 2,
        HousingStatus.RENTING_DEBT: 3, HousingStatus.TEMPORARY_SHELTER: 4,
        HousingStatus.REFUGEE_CAMP: 5, HousingStatus.HOMELESS: 6,
    }
    employ_ord = {
        EmploymentStatus.FULL_TIME: 0, EmploymentStatus.FULL_TIME_LOW: 1,
        EmploymentStatus.PART_TIME: 2, EmploymentStatus.INFORMAL: 3,
        EmploymentStatus.SEASONAL: 4, EmploymentStatus.NONE: 5,
    }
    medical_ord = {
        MedicalStatus.NONE: 0, MedicalStatus.MINOR: 1,
        MedicalStatus.CHRONIC: 2, MedicalStatus.MENTAL_HEALTH: 3,
        MedicalStatus.CHRONIC_NO_ACCESS: 4, MedicalStatus.DISABILITY: 5,
        MedicalStatus.TERMINAL: 6,
    }
    asset_ord = {
        AssetLevel.NONE: 0, AssetLevel.MINIMAL: 1,
        AssetLevel.MODERATE: 2, AssetLevel.ABOVE_NISAB: 3,
    }
    crisis_ord = {
        CrisisType.NONE: 0, CrisisType.SUDDEN_JOB_LOSS: 1,
        CrisisType.ECONOMIC_SHOCK: 2, CrisisType.MEDICAL_EMERGENCY: 3,
        CrisisType.DOMESTIC_VIOLENCE: 4, CrisisType.BREADWINNER_LOSS: 5,
        CrisisType.NATURAL_DISASTER: 6, CrisisType.CONFLICT_ZONE: 6,
    }

    return [
        # Income
        income_ratio,
        min(income_ratio, 3.0),
        float(p.monthly_income_usd == 0),
        float(p.months_without_income),
        expense_gap / max(poverty_line, 1),

        # Assets
        asset_ord.get(p.asset_level, 0),
        float(p.sold_assets_to_survive),

        # Family
        float(p.family_size),
        float(p.num_dependents),
        float(p.num_minor_children),
        float(p.num_elderly_dependents),
        float(p.is_single_parent),
        float(p.is_widow),
        float(p.is_sole_breadwinner),
        float(p.is_food_insecure),

        # Vulnerability flags
        float(p.is_orphan_under_18),
        float(p.is_refugee),
        float(p.is_internally_displaced),
        float(p.in_conflict_zone),
        float(p.is_trafficking_victim),
        float(p.is_new_convert),
        float(p.is_elderly_working),
        float(p.is_student_deen),
        float(p.is_student_general),

        # Medical
        medical_ord.get(p.medical_status, 0),
        float(p.num_sick_dependents),

        # Housing & employment
        housing_ord.get(p.housing_status, 0),
        employ_ord.get(p.employment_status, 0),

        # Crisis
        crisis_ord.get(p.crisis_type, 0),

        # Debt
        min(debt_income_ratio, 24.0),
        float(p.has_riba_debt),

        # Verification
        float(p.documents_verified),
        float(p.local_oracle_confirmed),
    ]


FEATURE_NAMES = [
    "income_ratio_to_poverty", "income_ratio_capped3x", "is_zero_income",
    "months_without_income", "expense_gap_ratio",
    "asset_level_ord", "sold_assets",
    "family_size", "num_dependents", "num_minor_children", "num_elderly_dep",
    "is_single_parent", "is_widow", "is_sole_breadwinner", "is_food_insecure",
    "is_orphan", "is_refugee", "is_idp", "in_conflict_zone", "is_trafficking",
    "is_new_convert", "is_elderly_working", "is_student_deen", "is_student_gen",
    "medical_severity", "num_sick_dependents",
    "housing_severity", "employment_severity",
    "crisis_severity",
    "debt_income_ratio", "has_riba_debt",
    "docs_verified", "oracle_confirmed",
]


def tier_label(score: float) -> int:
    """Convert score to 5-class label: 4=CRITICAL, 3=HIGH, 2=MEDIUM, 1=LOW, 0=INELIGIBLE"""
    if score >= 80: return 4
    if score >= 65: return 3
    if score >= 48: return 2
    if score >= 28: return 1
    return 0


TIER_NAMES = {4: "CRITICAL", 3: "HIGH", 2: "MEDIUM", 1: "LOW", 0: "INELIGIBLE"}
TIER_COLORS = {4: "🔴", 3: "🟠", 2: "🟡", 1: "🟢", 0: "⚪"}

MODEL_PATH = Path(__file__).parent / "am_scoring_model.pkl"


# ── Training ──────────────────────────────────────────────────────────────────

def generate_dataset(n: int = 500) -> tuple[np.ndarray, np.ndarray, list[float]]:
    profiles = [synthetic_profile(i) for i in range(n)]
    scores = [score_recipient(p).final_score for p in profiles]
    labels = np.array([tier_label(s) for s in scores])
    features = np.array([profile_to_features(p) for p in profiles])
    return features, labels, scores


def train_model(n_samples: int = 500) -> dict:
    print(f"\n{'='*60}")
    print("  AM NETWORK — ML MODEL TRAINING")
    print(f"  Generating {n_samples} synthetic profiles...")
    print(f"{'='*60}")

    X, y, scores = generate_dataset(n_samples)

    # Class distribution
    from collections import Counter
    dist = Counter(y.tolist())
    print("\n  Class distribution:")
    for cls in sorted(dist.keys(), reverse=True):
        bar = "█" * (dist[cls] // 5)
        print(f"    {TIER_COLORS[cls]} {TIER_NAMES[cls]:<12} {dist[cls]:>4}  {bar}")

    # Gradient Boosted + Platt calibration
    base = GradientBoostingClassifier(
        n_estimators=150,
        learning_rate=0.08,
        max_depth=4,
        subsample=0.85,
        min_samples_leaf=5,
        random_state=42,
    )
    model = CalibratedClassifierCV(base, cv=3, method="sigmoid")

    print("\n  Cross-validation (5-fold)...")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    cv_scores = cross_val_score(model, X, y, cv=cv, scoring="accuracy")
    print(f"  Accuracy: {cv_scores.mean():.3f} ± {cv_scores.std():.3f}")

    # Train final model on full dataset
    model.fit(X, y)

    # Feature importances (from base estimator)
    importances = base.fit(X, y).feature_importances_
    top_idx = np.argsort(importances)[::-1][:10]
    print("\n  Top 10 features by importance:")
    for i in top_idx:
        bar = "█" * int(importances[i] * 100)
        print(f"    {FEATURE_NAMES[i]:<30} {importances[i]:.4f}  {bar}")

    # Save
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(model, f)
    print(f"\n  ✅ Model saved → {MODEL_PATH.name}")

    return {"model": model, "cv_acc": cv_scores.mean(), "cv_std": cv_scores.std()}


def load_model():
    if not MODEL_PATH.exists():
        print("  Model not found — training now...")
        result = train_model()
        return result["model"]
    with open(MODEL_PATH, "rb") as f:
        return pickle.load(f)


# ── ML-enhanced scoring ───────────────────────────────────────────────────────

def ml_score(profile: RecipientProfile, model=None) -> dict:
    """
    Hybrid scoring: rule engine score + ML calibration.
    Returns extended breakdown with ML confidence probabilities.
    """
    if model is None:
        model = load_model()

    rule_bd = score_recipient(profile)
    features = np.array([profile_to_features(profile)])

    probs = model.predict_proba(features)[0]
    ml_class = int(model.predict(features)[0])

    # Weighted average: 70% rule engine + 30% ML confidence
    rule_score = rule_bd.final_score
    ml_tier_mid = {4: 90, 3: 72, 2: 57, 1: 38, 0: 14}
    ml_score_est = sum(ml_tier_mid[c] * p for c, p in enumerate(probs))
    hybrid_score = 0.70 * rule_score + 0.30 * ml_score_est
    hybrid_score = max(0.0, min(100.0, hybrid_score))

    return {
        "rule_score": rule_score,
        "ml_score_estimate": round(ml_score_est, 1),
        "hybrid_score": round(hybrid_score, 1),
        "ml_class_prediction": TIER_NAMES[ml_class],
        "ml_probabilities": {TIER_NAMES[c]: round(float(p), 3) for c, p in enumerate(probs)},
        "rule_breakdown": rule_bd,
        "confidence_note": (
            "HIGH — rule engine + ML agreement"
            if TIER_NAMES[ml_class] == rule_bd.priority_tier else
            "MEDIUM — minor model disagreement, human review advised"
        ),
    }


def format_ml_report(profile: RecipientProfile, result: dict) -> str:
    bd = result["rule_breakdown"]
    probs = result["ml_probabilities"]

    bar_filled = int(result["hybrid_score"] / 5)
    bar = "█" * bar_filled + "░" * (20 - bar_filled)

    tier_icons = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🟢", "INELIGIBLE": "⚪"}
    tier = bd.priority_tier
    icon = tier_icons.get(tier, "⚪")

    lines = [
        "=" * 64,
        "  AM NETWORK — ML-ENHANCED ELIGIBILITY REPORT v1.0",
        "=" * 64,
        f"  Applicant  : {profile.name}",
        f"  Country    : {profile.country}",
        "",
        f"  HYBRID SCORE : {result['hybrid_score']:.1f} / 100   [{bar}]",
        f"  TIER         : {icon} {tier}",
        f"  Confidence   : {result['confidence_note']}",
        f"  Est. need    : ${bd.estimated_monthly_need_usd:.0f}/mo",
        "",
        "── DUAL ENGINE COMPARISON ───────────────────────────────",
        f"  Rule Engine Score  : {result['rule_score']:.1f}",
        f"  ML Score Estimate  : {result['ml_score_estimate']:.1f}",
        f"  Hybrid (70/30)     : {result['hybrid_score']:.1f}",
        f"  ML Prediction      : {result['ml_class_prediction']}",
        "",
        "── ML TIER PROBABILITIES ────────────────────────────────",
    ]

    prob_order = ["CRITICAL", "HIGH", "MEDIUM", "LOW", "INELIGIBLE"]
    for t in prob_order:
        p = probs.get(t, 0)
        bar_p = "█" * int(p * 20)
        icon_t = tier_icons.get(t, "⚪")
        lines.append(f"  {icon_t} {t:<12} {p:5.1%}  {bar_p}")

    lines += [
        "",
        "── RULE ENGINE BREAKDOWN ────────────────────────────────",
        f"  Income & Need      : {bd.income_score:5.1f} / 20",
        f"  Assets / Nisab     : {bd.asset_score:5.1f} / 10",
        f"  Family Structure   : {bd.family_score:5.1f} / 15",
        f"  Housing            : {bd.housing_score:5.1f} / 12",
        f"  Employment         : {bd.employment_score:5.1f} / 10",
        f"  Health / Medical   : {bd.health_score:5.1f} / 15",
        f"  Asnaf Match        : {bd.asnaf_score:5.1f} / 12",
        f"  Crisis / Emergency : {bd.crisis_score:5.1f} /  6",
        f"  Final (after flags): {bd.final_score:5.1f} / 100",
    ]

    if bd.asnaf_categories:
        lines += ["", "── ASNAF CATEGORIES MATCHED ─────────────────────────────"]
        for cat in bd.asnaf_categories:
            lines.append(f"  ✔ {cat}")

    if bd.recommended_support_types:
        lines += ["", "── RECOMMENDED SUPPORT ──────────────────────────────────"]
        for s in bd.recommended_support_types:
            lines.append(f"  → {s}")

    if bd.fraud_flags:
        lines += ["", "── ⚠  FLAGS ──────────────────────────────────────────────"]
        for flag in bd.fraud_flags:
            lines.append(f"  • {flag}")

    lines += ["", "── RECOMMENDATION ───────────────────────────────────────",
              f"  {bd.recommendation}", "=" * 64]
    return "\n".join(lines)


# ── CLI ───────────────────────────────────────────────────────────────────────

def run_demo(model=None):
    from demo import DEMO_PROFILES
    if model is None:
        model = load_model()

    print("\n" + "=" * 64)
    print("  AM NETWORK — ML-ENHANCED SCORING DEMO")
    print("  10 real test cases · Hybrid Rule+ML engine")
    print("=" * 64 + "\n")

    print(f"{'Name':<35} {'Rule':>5} {'ML':>5} {'Hybrid':>7}  {'Tier':<12} {'ML-Pred'}")
    print("-" * 78)

    for profile in DEMO_PROFILES:
        result = ml_score(profile, model)
        print(
            f"{profile.name:<35} "
            f"{result['rule_score']:>5.1f} "
            f"{result['ml_score_estimate']:>5.1f} "
            f"{result['hybrid_score']:>7.1f}  "
            f"{result['rule_breakdown'].priority_tier:<12} "
            f"{result['ml_class_prediction']}"
        )

    print("\n--- Detailed report for top case ---\n")
    top = max(DEMO_PROFILES, key=lambda p: score_recipient(p).final_score)
    print(format_ml_report(top, ml_score(top, model)))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AM Network ML Scoring Engine")
    parser.add_argument("--demo", action="store_true", help="Run demo profiles")
    parser.add_argument("--train", action="store_true", help="Retrain model")
    parser.add_argument("--samples", type=int, default=500, help="Training samples")
    args = parser.parse_args()

    if args.train or not MODEL_PATH.exists():
        result = train_model(args.samples)
        model = result["model"]
    else:
        model = load_model()
        print(f"  ✅ Loaded model from {MODEL_PATH.name}")

    if args.demo:
        run_demo(model)
    elif not args.train:
        run_demo(model)
