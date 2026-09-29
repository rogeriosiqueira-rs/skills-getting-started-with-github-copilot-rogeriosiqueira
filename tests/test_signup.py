from src.app import activities


def test_signup_adds_student_to_activity(client):
    # Arrange
    email = "student@example.edu"

    # Act
    response = client.post(
        "/activities/Basketball%20Team/signup",
        params={"email": email},
    )

    # Assert
    assert response.status_code == 200
    assert email in activities["Basketball Team"]["participants"]


def test_signup_rejects_duplicate_email(client):
    # Arrange
    email = "student@example.edu"
    activities["Basketball Team"]["participants"].append(email)
    url = "/activities/Basketball%20Team/signup"

    # Act
    response = client.post(url, params={"email": email})

    # Assert
    assert response.status_code == 400
    assert activities["Basketball Team"]["participants"].count(email) == 1


def test_signup_rejects_full_activity(client):
    # Arrange
    activity = activities["Basketball Team"]
    activity["participants"][:] = [
        f"student-{index}@example.edu"
        for index in range(activity["max_participants"])
    ]

    # Act
    response = client.post(
        "/activities/Basketball%20Team/signup",
        params={"email": "new-student@example.edu"},
    )

    # Assert
    assert response.status_code == 400
    assert response.json()["detail"] == "Activity is full"


def test_signup_rejects_unknown_activity(client):
    # Arrange

    # Act
    response = client.post(
        "/activities/Unknown%20Activity/signup",
        params={"email": "student@example.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"