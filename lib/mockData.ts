import { UserProfile, SavedJob, SavedSearch } from "@/types/me";

export function getMockUserProfile(): UserProfile {
  return {
    name: "Yeona Kim",
    email: "yeonakim@email.com",
  };
}

export function getMockSavedJobs(): SavedJob[] {
  return [
    { id: "job-001", title: "Senior Python Developer", tag: "Python", company: "Tech Co", location: "Perth", postedAgo: "1d ago", salary: "$130,000" },
    { id: "job-002", title: "Java Backend Engineer", tag: "Java", company: "FinServe", location: "Perth", postedAgo: "3d ago", salary: "$145,000" },
    { id: "job-003", title: "Frontend Developer (React)", tag: "JavaScript", company: "Webly", location: "Perth", postedAgo: "2d ago", salary: "$110,000" },
  ];
}

export function getMockSavedSearches(): SavedSearch[] {
  return [
    { id: "search-001", query: "Python developer in Perth", resultsCount: 134, createdAgo: "2d ago" },
    { id: "search-002", query: "Frontend developer remote", resultsCount: 256, createdAgo: "5d ago" },
  ];
}