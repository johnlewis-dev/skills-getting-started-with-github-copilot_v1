def test_remove_participant_success(client, reset_activities):
    # Arrange
    activity = "Chess Club"
    email = "michael@mergington.edu"

    # Act
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})

    # Assert
    assert resp.status_code == 200
    assert email in resp.json().get("message", "")
    data = client.get("/activities").json()
    assert email not in data[activity]["participants"]


def test_remove_activity_not_found(client, reset_activities):
    # Arrange
    activity = "No Activity"
    email = "x@y.com"

    # Act
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})

    # Assert
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Activity not found"


def test_remove_participant_not_found(client, reset_activities):
    # Arrange
    activity = "Swimming Club"
    email = "notregistered@example.com"

    # Act
    resp = client.delete(f"/activities/{activity}/participants", params={"email": email})

    # Assert
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Participant not found"
