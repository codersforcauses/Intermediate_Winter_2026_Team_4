// ===================================================================
// Shared types for the "Me" page
// ===================================================================
// This is the data shape the page expects. Right now it's filled with
// dummy data (see lib/mockData.ts). Backend teammates can swap that
// file for real API calls later without touching any component.
// ===================================================================

export type UserProfile = {
  name: string;
  email: string;
};

export type SavedJob = {
  id: string;
  title: string;
  tag: string; // single skill tag shown next to the title, e.g. "Python"
  company: string;
  location: string;
  postedAgo: string; // e.g. "1d ago" — display string for now
  salary: string; // e.g. "$130,000" — formatted string for now
};

export type SavedSearch = {
  id: string;
  query: string;
  resultsCount: number;
  createdAgo: string; // e.g. "2d ago"
};