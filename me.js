// ================================================================
// Mock data
// ================================================================
// FOR BACKEND TEAMMATES:
// Replace these objects/arrays with real fetch() calls to your API.
// As long as the data has the same fields, nothing else needs to change.
// ================================================================

const mockUser = {
  name: "Yeona Kim",
  email: "yeonakim@email.com",
};

const mockSavedJobs = [
  {
    id: "job-001",
    title: "Senior Python Developer",
    tag: "Python",
    company: "Tech Co",
    location: "Perth",
    postedAgo: "1d ago",
    salary: "$130,000",
  },
  {
    id: "job-002",
    title: "Java Backend Engineer",
    tag: "Java",
    company: "FinServe",
    location: "Perth",
    postedAgo: "3d ago",
    salary: "$145,000",
  },
  {
    id: "job-003",
    title: "Frontend Developer (React)",
    tag: "JavaScript",
    company: "Webly",
    location: "Perth",
    postedAgo: "2d ago",
    salary: "$110,000",
  },
];

const mockSavedSearches = [
  {
    id: "search-001",
    query: "Python developer in Perth",
    resultsCount: 134,
    createdAgo: "2d ago",
  },
  {
    id: "search-002",
    query: "Frontend developer remote",
    resultsCount: 256,
    createdAgo: "5d ago",
  },
];

// ================================================================
// Helper: turn "Yeona Kim" into "YK"
// ================================================================
function getInitials(name) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ================================================================
// Render profile card
// ================================================================
function renderProfile() {
  document.getElementById("avatar-initials").textContent = getInitials(mockUser.name);
  document.getElementById("profile-name").textContent = mockUser.name;
  document.getElementById("profile-email").textContent = mockUser.email;
  document.getElementById("stat-jobs").textContent = mockSavedJobs.length;
  document.getElementById("stat-searches").textContent = mockSavedSearches.length;
  document.getElementById("tab-jobs-count").textContent = mockSavedJobs.length;
  document.getElementById("tab-searches-count").textContent = mockSavedSearches.length;
}

// ================================================================
// Render job cards
// ================================================================
function renderJobs() {
  const container = document.getElementById("tab-jobs-content");

  // Build a card for each saved job and join them into the container
  container.innerHTML = mockSavedJobs
    .map(
      (job) => `
      <div class="job-card">
        <div class="job-main">
          <div class="job-title-row">
            <p class="job-title">${job.title}</p>
            <span class="job-tag">${job.tag}</span>
          </div>
          <p class="job-meta">${job.company} · ${job.location} · ${job.postedAgo}</p>
          <p class="job-salary">${job.salary}</p>
        </div>
        <div class="job-actions">
          <span class="star" aria-label="Saved">★</span>
          <a class="view-button" href="#">View ↗</a>
        </div>
      </div>
    `
    )
    .join("");
}

// ================================================================
// Render saved search cards
// ================================================================
function renderSearches() {
  const container = document.getElementById("tab-searches-content");

  container.innerHTML = mockSavedSearches
    .map(
      (search) => `
      <div class="search-card">
        <div>
          <p class="search-query">"${search.query}"</p>
          <p class="search-meta">${search.resultsCount} results · saved ${search.createdAgo}</p>
        </div>
        <a class="view-button" href="#">View ↗</a>
      </div>
    `
    )
    .join("");
}

// ================================================================
// Tab switching
// ================================================================
function switchTab(tab) {
  const jobsContent = document.getElementById("tab-jobs-content");
  const searchesContent = document.getElementById("tab-searches-content");
  const jobsBtn = document.getElementById("tab-jobs-btn");
  const searchesBtn = document.getElementById("tab-searches-btn");

  if (tab === "jobs") {
    jobsContent.style.display = "flex";
    searchesContent.style.display = "none";
    jobsBtn.classList.add("tab-active");
    searchesBtn.classList.remove("tab-active");
  } else {
    jobsContent.style.display = "none";
    searchesContent.style.display = "flex";
    searchesBtn.classList.add("tab-active");
    jobsBtn.classList.remove("tab-active");
  }
}

// ================================================================
// Run everything when the page loads
// ================================================================
renderProfile();
renderJobs();
renderSearches();