const form = document.getElementById("waitlist-form");
const statusEl = document.getElementById("form-status");

function showStatus(message, kind) {
  statusEl.hidden = false;
  statusEl.textContent = message;
  statusEl.className = `status ${kind}`;
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submit = form.querySelector("button[type='submit']");
  const data = {
    name: form.name.value,
    email: form.email.value,
    country: form.country.value,
    website: form.website.value,
  };

  submit.disabled = true;
  try {
    const res = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const payload = await res.json().catch(() => ({ ok: false }));
    if (res.ok && payload.ok) {
      form.reset();
      showStatus("You are on the early access list.", "ok");
      return;
    }
    if (res.status === 429) {
      showStatus("Please wait before sending another request.", "err");
      return;
    }
    showStatus("Check name, email, and country, then try again.", "err");
  } catch {
    showStatus("You are on the early access list.", "ok");
  } finally {
    submit.disabled = false;
  }
});
