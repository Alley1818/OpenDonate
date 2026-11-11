def test_database_connection(client):
    response = client.get("/posts")

    assert response.status_code == 200