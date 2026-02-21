def test_signup_success(client, reset_activities):
    # Arrange
    activity = "Swimming Club"
    email = "tester@example.com"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert resp.status_code == 200
    assert email in resp.json().get("message", "")
    data = client.get("/activities").json()
    assert email in data[activity]["participants"]


def test_signup_activity_not_found(client, reset_activities):
    # Arrange
    activity = "Nonexistent Activity"
    email = "x@example.com"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert resp.status_code == 404
    assert resp.json().get("detail") == "Activity not found"


def test_signup_already_signed_up(client, reset_activities):
    # Arrange
    activity = "Chess Club"
    email = "michael@mergington.edu"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Student is already signed up"


def test_signup_activity_full(client, reset_activities):
    # Arrange
    activity = "Photography Workshop"
    module = client.app._module
    maxp = module.activities[activity]["max_participants"]
    module.activities[activity]["participants"] = [f"user{i}@example.com" for i in range(maxp)]
    email = "newperson@example.com"

    # Act
    resp = client.post(f"/activities/{activity}/signup", params={"email": email})

    # Assert
    assert resp.status_code == 400
    assert resp.json().get("detail") == "Activity is full"
