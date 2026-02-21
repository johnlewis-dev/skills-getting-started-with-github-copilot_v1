def test_root_redirects_to_static_index_and_static_returns_200(client, reset_activities):
    # Arrange

    # Act
    resp = client.get("/", follow_redirects=False)

    # Assert
    assert resp.status_code == 307
    assert resp.headers.get("location") == "/static/index.html"

    # Act: request the static index
    resp2 = client.get("/static/index.html")

    # Assert
    assert resp2.status_code == 200
