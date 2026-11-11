def test_user_not_found(client):
    response = client.get("/users/test", follow_redirects=True)
    assert response.status_code == 404

def test_register(client):
    response = client.post("/users/register",
        json={
            "email": "test@mail.com",
            "username": "test_user",
            "password": "test_password",
        }
                          )
    assert response.status_code == 201


def test_login(client, test_user):
    response = client.post("/users/login",
        json={
            "username": "test_username",
            "password": "test_password",
        }
    )
    assert response.status_code == 200

def test_login_invalid_credentials(client):
    response = client.post("/users/login",
        json={
            "username": "unknown_username",
            "password": "wrong_password",
        }
    )
    assert response.status_code == 401


def test_register_does_not_expose_password(client):
    response = client.post(
        "/users/register",
        json={
            "email": "secure@mail.com",
            "username": "secure_user",
            "password": "secure_password",
        },
    )

    assert response.status_code == 201

    data = response.json()

    assert "password_hash" not in data
    assert "password" not in data


def test_register_duplicate_email(client, test_user):
    response = client.post(
        "/users/register",
        json={
            "email": "test_mail@mail.ru",
            "username": "another_username",
            "password": "test_password",
        }
    )

    assert response.status_code == 409


def test_register_duplicate_username(client, test_user):
    response = client.post(
        "/users/register",
        json={
            "email": "test_mail2@mail.ru",
            "username": "test_username",
            "password": "test_password",
        }
    )

    assert response.status_code == 409