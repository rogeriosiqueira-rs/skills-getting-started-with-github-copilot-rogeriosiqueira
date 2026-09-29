from src.app import activities


def test_cancel_signup_removes_student_from_activity(client):
    # Arrange
    activity_name = "Basketball Team"
    email = "student@example.edu"
    activities[activity_name]["participants"].append(email)

    # Act
    response = client.delete(
        "/activities/Basketball%20Team/signup",
        params={"email": email},
    )

    # Assert
    assert response.status_code == 200
    assert email not in activities[activity_name]["participants"]


def test_cancel_signup_rejects_student_not_signed_up(client):
    # Arrange

    # Act
    response = client.delete(
        "/activities/Basketball%20Team/signup",
        params={"email": "student@example.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Student is not signed up for this activity"


def test_cancel_signup_rejects_unknown_activity(client):
    # Arrange

    # Act
    response = client.delete(
        "/activities/Unknown%20Activity/signup",
        params={"email": "student@example.edu"},
    )

    # Assert
    assert response.status_code == 404
    assert response.json()["detail"] == "Activity not found"