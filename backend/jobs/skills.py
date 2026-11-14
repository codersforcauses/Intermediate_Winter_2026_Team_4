"""Skills tracked for the market overview page.

Shared by the `fetch_jobs` command (which records a daily demand snapshot per
skill) and the market overview API (which matches postings against the same
list), so the page's skill filter always lines up with the data.
"""

TRACKED_SKILLS = [
    'Python',
    'Java',
    'JavaScript',
    'React',
    'SQL',
    'Data Analyst',
    'DevOps',
    'Cloud',
    'Machine Learning',
    '.NET',
]
