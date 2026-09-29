document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;
        const activityTitle = document.createElement("h4");
        activityTitle.textContent = name;
        const description = document.createElement("p");
        description.textContent = details.description;
        const schedule = document.createElement("p");
        const scheduleLabel = document.createElement("strong");
        scheduleLabel.textContent = "Schedule:";
        schedule.append(scheduleLabel, document.createTextNode(` ${details.schedule}`));
        const availability = document.createElement("p");
        const availabilityLabel = document.createElement("strong");
        availabilityLabel.textContent = "Availability:";
        availability.append(
          availabilityLabel,
          document.createTextNode(` ${spotsLeft} spots left`)
        );
        const participantsSection = document.createElement("div");
        participantsSection.className = "activity-participants";
        const participantsHeading = document.createElement("h5");
        participantsHeading.textContent = "Participants";
        const participantsList = document.createElement("ul");
        participantsList.className = "participant-list";

        details.participants.forEach((email) => {
          const participant = document.createElement("li");
          const participantEmail = document.createElement("span");
          participantEmail.className = "participant-email";
          participantEmail.textContent = email;
          const cancelButton = document.createElement("button");
          cancelButton.type = "button";
          cancelButton.className = "cancel-signup";
          cancelButton.textContent = "🗑";
          cancelButton.title = `Cancel signup for ${email}`;
          cancelButton.setAttribute("aria-label", `Cancel signup for ${email}`);
          cancelButton.addEventListener("click", async () => {
            const confirmed = window.confirm(
              `Are you sure you want to cancel ${email}'s signup for ${name}?`
            );
            if (!confirmed) return;

            cancelButton.disabled = true;

            try {
              const response = await fetch(
                `/activities/${encodeURIComponent(name)}/signup?email=${encodeURIComponent(email)}`,
                { method: "DELETE" }
              );
              const result = await response.json();

              if (!response.ok) {
                throw new Error(result.detail || "Failed to cancel signup");
              }

              await fetchActivities();
              messageDiv.textContent = result.message;
              messageDiv.className = "success";
              messageDiv.classList.remove("hidden");
            } catch (error) {
              messageDiv.textContent = error.message || "Failed to cancel signup";
              messageDiv.className = "error";
              messageDiv.classList.remove("hidden");
              cancelButton.disabled = false;
            }

            setTimeout(() => {
              messageDiv.classList.add("hidden");
            }, 5000);
          });

          participant.append(participantEmail, cancelButton);
          participantsList.appendChild(participant);
        });

        participantsSection.append(participantsHeading, participantsList);
        activityCard.append(
          activityTitle,
          description,
          schedule,
          availability,
          participantsSection
        );

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        await fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
