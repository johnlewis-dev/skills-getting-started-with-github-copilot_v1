def test_get_activities_returns_json_and_contains_expected_keys(client, reset_activities):
    # Arrange

    # Act
    resp = client.get("/activities")

    # Assert
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    activity = data["Chess Club"]
    assert set(["description", "schedule", "max_participants", "participants"]).issubset(set(activity.keys()))
