"""Baseline characterization, not an acceptance suite; defects are expected here."""

import importlib.util
import random
import sys
from datetime import date
from pathlib import Path
from unittest.mock import patch

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "backend"))

from fastapi.testclient import TestClient
from app.main import app
from app import routes


def main():
    client = TestClient(app, raise_server_exceptions=False)
    base = client.get("/api/metrics").json()
    ignored = client.get("/api/metrics", params={"business_type": "B2B"}).json()
    assert ignored == base
    assert {m["business_type"] for m in ignored} == {"B2B", "B2C"}
    print("B01: business_type=B2B ignored:", len(ignored), "records, both types")

    params = {"start_date": "2026-02-01", "end_date": "2026-01-01"}
    for endpoint in ["/api/metrics", "/api/metrics/summary", "/api/metrics/comparison"]:
        response = client.get(endpoint, params=params)
        assert response.status_code == 200
        print("B02:", endpoint, "inverted dates:", response.status_code, response.json())

    response = client.get(
        "/api/metrics/comparison",
        params={"start_date": "0001-01-01", "end_date": "0001-01-01"},
    )
    assert response.status_code == 500
    print("B03: comparison date.min ->", response.status_code, response.text)

    random.seed(123)
    before = random.getstate()
    reference = routes.generate_mock_movements(seed=42)
    assert before != random.getstate()
    original_uniform = random.uniform
    interrupted = False

    def interleaved_uniform(a, b):
        nonlocal interrupted
        if not interrupted:
            interrupted = True
            routes.generate_mock_movements(seed=7)
        return original_uniform(a, b)

    with patch.object(random, "uniform", interleaved_uniform):
        changed = routes.generate_mock_movements(seed=42)
    assert changed != reference
    print("B04: global RNG changed; forced interleaving changes seed=42 output")

    class FixedDate(date):
        @classmethod
        def today(cls):
            return cls(2026, 10, 4)

    with patch.object(routes, "date", FixedDate):
        fixed = routes.generate_mock_movements(seed=42)
        comparison = client.get(
            "/api/metrics/comparison",
            params={"start_date": "2025-03-01", "end_date": "2025-03-31"},
        ).json()
    assert comparison == {
        "current_period": 0.0, "previous_period": 0.0,
        "delta_abs": 0.0, "delta_pct": None,
    }
    print("B05: frozen 2026-10-04; March-2025 test uses no data:", comparison)
    print("B06: seed=42 dates", fixed[0].create_date, fixed[-1].create_date, "vs header 2024")

    negative = routes.FinancialMovement(
        create_date="2026-01-01", amount=-1, operation_type="income",
        category="sales", business_type="B2B",
    )
    assert negative.amount == -1
    try:
        routes.build_metrics_facets([])
    except IndexError:
        print("B07: amount=-1 accepted; facets([]) raises IndexError (helper precondition)")
    else:
        raise AssertionError("Expected empty facets precondition failure")

    summary = [
        routes.MetricsSummaryItem(period="2026-01", income=0, outcome=100, net=-100),
        routes.MetricsSummaryItem(period="2026-02", income=0, outcome=130, net=-130),
    ]
    assert routes.detect_outcome_alerts(summary, 0.3) == []
    assert len(routes.detect_outcome_alerts(summary, 0.29)) == 1
    print("B08: strict >; increase=30% is not alerted at threshold=0.3")

    spec = importlib.util.spec_from_file_location(
        "baseline_tests", ROOT / "backend/tests/test_routes.py",
    )
    tests = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(tests)
    with patch.object(
        routes, "summarize_movements",
        return_value=[routes.MetricsSummaryItem(period="wrong", income=1, outcome=1, net=999)],
    ):
        tests.test_metrics_summary_by_month_returns_balances()
        tests.test_metrics_summary_by_week_honors_business_type_filter()
    print("B09: summary tests PASS with period='wrong', net=999, same result for every segment")
    with patch.object(routes, "detect_outcome_alerts", return_value=[]):
        tests.test_metrics_alerts_returns_anomaly_candidates()
    print("B10: alerts test PASSES with always-empty detector")
    with patch.object(routes, "calculate_net_value", return_value=0):
        tests.test_metrics_comparison_returns_delta_fields()
    print("B11: comparison test PASSES with always-zero net calculator")

    schema = app.openapi()["components"]["schemas"]["FinancialMovement"]
    assert "minimum" not in schema["properties"]["amount"]
    assert set(schema["properties"]) == {
        "create_date", "amount", "operation_type", "category", "business_type",
    }
    print("B12: OpenAPI has five fields; amount has no minimum constraint")


if __name__ == "__main__":
    main()
