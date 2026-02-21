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

      // Clear loading message and reset activity select
      activitiesList.innerHTML = "";
      activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p class="availability"><strong>Availability:</strong> ${spotsLeft} spots left</p>
          <div class="participants-container"></div>
        `;

        activitiesList.appendChild(activityCard);

        // Render participants list (with remove buttons)
        const container = activityCard.querySelector('.participants-container');
        if (details.participants && details.participants.length > 0) {
          const title = document.createElement('p');
          title.innerHTML = `<strong>Participants (${details.participants.length}):</strong>`;
          container.appendChild(title);

          const ul = document.createElement('ul');
          ul.className = 'participants-list';

          details.participants.forEach((email) => {
            const li = document.createElement('li');
            li.className = 'participant-item';

            const span = document.createElement('span');
            span.className = 'participant-email';
            span.textContent = email;

            const btn = document.createElement('button');
            btn.className = 'participant-remove';
            btn.title = 'Remove participant';
            btn.innerHTML = '&times;';

            btn.addEventListener('click', async (e) => {
              e.preventDefault();
              try {
                const resp = await fetch(
                  `/activities/${encodeURIComponent(name)}/participants?email=${encodeURIComponent(email)}`,
                  { method: 'DELETE' }
                );
                const result = await resp.json();
                if (resp.ok) {
                  messageDiv.textContent = result.message;
                  messageDiv.className = 'success';
                  // remove from DOM
                  li.remove();
                  // update availability and count
                  const availP = activityCard.querySelector('.availability');
                  // decrement local count (details.participants is a reference to fetched data)
                  const idx = details.participants.indexOf(email);
                  if (idx !== -1) details.participants.splice(idx, 1);
                  const newSpots = details.max_participants - details.participants.length;
                  if (availP) availP.innerHTML = `<strong>Availability:</strong> ${newSpots} spots left`;
                  const titleEl = container.querySelector('p');
                  if (details.participants.length === 0) {
                    container.innerHTML = `<p class="info">No participants yet</p>`;
                  } else if (titleEl) {
                    titleEl.innerHTML = `<strong>Participants (${details.participants.length}):</strong>`;
                  }
                } else {
                  messageDiv.textContent = result.detail || 'Failed to remove participant';
                  messageDiv.className = 'error';
                }
              } catch (err) {
                console.error('Error removing participant:', err);
                messageDiv.textContent = 'Failed to remove participant. Please try again.';
                messageDiv.className = 'error';
              }
              messageDiv.classList.remove('hidden');
              setTimeout(() => messageDiv.classList.add('hidden'), 4000);
            });

            li.appendChild(span);
            li.appendChild(btn);
            ul.appendChild(li);
          });

          container.appendChild(ul);
        } else {
          container.innerHTML = `<p class="info">No participants yet</p>`;
        }

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
        signupForm.reset();
        // refresh activities so the new participant appears immediately
        await fetchActivities();
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
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
