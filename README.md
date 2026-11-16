# Lecture Materials

Lecture materials for health sciences students, with a focus on physiology: interactive simulations, self-assessment tests and course documents. Student-facing content is available in Turkish and English (a TR/EN switch is built into each simulation; `?lang=en` or `?lang=tr` in the address selects the language).

**Website:** https://nuh-yilmaz.github.io/lecture-materials/

## Contents

| Folder | Topic | Materials |
|---|---|---|
| [`endocrine/`](endocrine/) | Endocrine system physiology (Endokrin Sistem Fizyolojisi) | [Hormone Simulator / Hormon Simülatörü](https://nuh-yilmaz.github.io/lecture-materials/endocrine/) (7 modules, pre/post test, Turkish + English) |
| [`digestion/`](digestion/) | Gastrointestinal physiology (Sindirim ve Beslenme Fizyolojisi) | [Digestion Simulator / Sindirim Simülatörü](https://nuh-yilmaz.github.io/lecture-materials/digestion/) (6 modules, pre/post test, Turkish + English) |
| [`hemolysis/`](hemolysis/) | Hemolysis, osmotic fragility and buffering practical (Hemoliz, Osmotik Frajilite ve Tamponlama) | [Hemolysis and Buffering Simulator / Hemoliz ve Tamponlama Simülatörü](https://nuh-yilmaz.github.io/lecture-materials/hemolysis/) (4 modules, pre/post test, mini-quizzes, Turkish + English) |
| [`introduction/`](introduction/) | Introduction to physiology (Fizyolojiye Giriş) | [Introduction to Physiology Simulator / Fizyolojiye Giriş Simülatörü](https://nuh-yilmaz.github.io/lecture-materials/introduction/) (5 modules, pre/post test, mini-quizzes, Turkish + English) |

## Structure

```
lecture-materials/
├── index.html          landing page listing all topics
├── <topic>/
│   ├── index.html      interactive simulation
│   └── docs/           handouts and other documents
└── apps-script/
    └── Code.gs         Google Sheets endpoint for test results
```

## Branches

- `main`: the last stable version. The student links (GitHub Pages) are built from `main`. Changes arrive only by pull request from `dev`, after the tests pass and the live test passed.
- `dev`: all development (engine, Apps Script, tests, new pages).
- Rollback point: commit `4a17a3e` (last `main` before this setup, 2026-11-13).
- The branches `engine-2026-11f`, `-11g` and `-11h` were merged into `dev` on 2026-11-16 and then deleted. Versions (for example engine 2026-11j) are named in commit messages, not in branch names.

## Collecting pre/post test results

Students submit results under an automatically generated code (NF-XXXX); names are not collected. Results go to a Google Sheet through the Apps Script web app in `apps-script/Code.gs`, and each topic writes to its own tab. The endpoint URL is the `SHEET_URL` constant in each simulation page.

The simulations are simplified teaching models, not clinical tools.
