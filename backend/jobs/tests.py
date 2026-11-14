from django.test import SimpleTestCase

from .market import location_group, posting_salary, salary_by_skill, skill_pattern, top_locations
from .services import is_us_washington_posting


class SkillPatternTests(SimpleTestCase):
    def test_does_not_match_inside_longer_words(self):
        self.assertIsNone(skill_pattern('Java').search('Senior JavaScript Developer'))
        self.assertIsNone(skill_pattern('SQL').search('MySQL administrator'))

    def test_matches_whole_words_case_insensitively(self):
        self.assertIsNotNone(skill_pattern('Java').search('Experienced java, Spring'))
        self.assertIsNotNone(skill_pattern('Python').search('Python/Django developer'))

    def test_handles_symbols_in_skill_names(self):
        self.assertIsNotNone(skill_pattern('.NET').search('C# and .NET Core'))


class PostingSalaryTests(SimpleTestCase):
    def test_midpoint_of_range(self):
        self.assertEqual(posting_salary(80000, 100000), 90000)

    def test_single_bound_is_used_as_is(self):
        self.assertEqual(posting_salary(90000, None), 90000)
        self.assertEqual(posting_salary(None, 90000), 90000)

    def test_missing_or_implausible_salaries_are_ignored(self):
        self.assertIsNone(posting_salary(None, None))
        self.assertIsNone(posting_salary(215, 287))  # US salaries in thousands
        self.assertIsNone(posting_salary(900000, 1000000))


class SalaryBySkillTests(SimpleTestCase):
    def test_averages_per_skill_sorted_highest_first(self):
        postings = [
            {'title': 'Python Developer', 'description': '', 'salary_min': 80000, 'salary_max': 100000},
            {'title': 'Senior Python Engineer', 'description': '', 'salary_min': 120000, 'salary_max': 140000},
            {'title': 'Data Analyst', 'description': 'SQL reporting', 'salary_min': 70000, 'salary_max': 70000},
        ]
        result = salary_by_skill(postings, ['Python', 'SQL', 'Java'])
        self.assertEqual(
            result,
            [
                {'skill': 'Python', 'salary': 110000, 'count': 2},
                {'skill': 'SQL', 'salary': 70000, 'count': 1},
            ],
        )

    def test_skips_postings_without_a_usable_salary(self):
        postings = [
            {'title': 'Python Developer', 'description': '', 'salary_min': None, 'salary_max': None},
            {'title': 'Python Developer', 'description': '', 'salary_min': 100, 'salary_max': 200},
        ]
        self.assertEqual(salary_by_skill(postings, ['Python']), [])

    def test_java_does_not_count_javascript_postings(self):
        postings = [
            {'title': 'JavaScript Developer', 'description': '', 'salary_min': 90000, 'salary_max': 90000},
        ]
        self.assertEqual(salary_by_skill(postings, ['Java']), [])


class LocationTests(SimpleTestCase):
    def test_location_group(self):
        self.assertEqual(location_group('Perth, Perth Region'), 'Perth')
        self.assertEqual(location_group('Subiaco, Perth'), 'Perth')
        self.assertEqual(location_group('Western Australia, Australia'), 'Western Australia')
        self.assertEqual(location_group('Perth'), 'Perth')
        self.assertIsNone(location_group(''))
        self.assertIsNone(location_group(None))

    def test_top_locations_counts_and_limits(self):
        locations = ['Perth, Perth Region'] * 3 + ['Subiaco, Perth'] + ['Sydney, Sydney Region'] * 2 + ['']
        self.assertEqual(
            top_locations(locations, limit=2),
            [{'location': 'Perth', 'count': 4}, {'location': 'Sydney', 'count': 2}],
        )


class WashingtonStateFilterTests(SimpleTestCase):
    def test_flags_us_washington_postings(self):
        self.assertTrue(is_us_washington_posting('Engineer', 'Work Location: Redmond, WA (Onsite)'))
        self.assertTrue(is_us_washington_posting('Engineer', 'Based in Seattle, Washington'))

    def test_flags_postings_adzuna_mislocated_to_marbelup(self):
        self.assertTrue(is_us_washington_posting('Engineer', 'Remote role', 'Marbelup, Albany Area'))

    def test_keeps_western_australia_postings(self):
        self.assertFalse(is_us_washington_posting('Dev', 'Based in Perth, Western Australia', 'Perth, Perth Region'))
        self.assertFalse(is_us_washington_posting('Dev', 'Joondalup WA 6027', 'Joondalup, Wanneroo Area'))
