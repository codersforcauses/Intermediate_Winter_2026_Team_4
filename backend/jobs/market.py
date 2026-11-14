"""Pure helpers behind the market overview endpoint.

They take plain dicts / strings rather than querysets so they can be unit
tested without the (unmanaged) job tables.
"""

import re
from collections import Counter

# Adzuna sometimes returns hourly/daily rates or placeholder values in the
# salary fields. Anything outside this annual range is ignored in averages.
MIN_ANNUAL_SALARY = 30_000
MAX_ANNUAL_SALARY = 400_000


def skill_pattern(skill):
    """Case-insensitive match for a skill that isn't part of a longer word, so
    "Java" doesn't match "JavaScript" and "SQL" doesn't match "MySQL"."""
    return re.compile(r'(?<![A-Za-z0-9])' + re.escape(skill) + r'(?![A-Za-z0-9])', re.IGNORECASE)


def posting_salary(salary_min, salary_max):
    """Midpoint of a posting's salary range, or None if missing or implausible."""
    values = [v for v in (salary_min, salary_max) if v]
    if not values:
        return None
    midpoint = sum(values) / len(values)
    if MIN_ANNUAL_SALARY <= midpoint <= MAX_ANNUAL_SALARY:
        return midpoint
    return None


def salary_by_skill(postings, skills):
    """Average salary of cached postings that mention each skill in their title
    or description. Only skills with at least one salaried posting are returned,
    highest salary first, each with the number of postings behind the average."""
    patterns = [(skill, skill_pattern(skill)) for skill in skills]
    samples = {skill: [] for skill in skills}

    for posting in postings:
        salary = posting_salary(posting.get('salary_min'), posting.get('salary_max'))
        if salary is None:
            continue
        text = f"{posting.get('title') or ''} {posting.get('description') or ''}"
        for skill, pattern in patterns:
            if pattern.search(text):
                samples[skill].append(salary)

    rows = [
        {'skill': skill, 'salary': round(sum(values) / len(values)), 'count': len(values)}
        for skill, values in samples.items()
        if values
    ]
    return sorted(rows, key=lambda row: row['salary'], reverse=True)


def location_group(display_name):
    """Collapse an Adzuna location ("Subiaco, Perth Region") to a city/region."""
    parts = [part.strip() for part in (display_name or '').split(',') if part.strip()]
    if not parts:
        return None
    if len(parts) == 1:
        return parts[0]
    last = parts[-1]
    if last == 'Australia':
        return parts[-2]
    return re.sub(r'\s+(Region|Area)$', '', last)


def top_locations(locations, limit=8):
    """Most common locations, grouped by city/region."""
    counts = Counter(group for group in map(location_group, locations) if group)
    return [{'location': name, 'count': count} for name, count in counts.most_common(limit)]
