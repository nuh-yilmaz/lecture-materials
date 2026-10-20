# Interactive Physiology

Lecture materials for health sciences students, with a focus on physiology: interactive simulations, self-assessment tests and course documents. Student-facing content is in Turkish.

**Website:** https://nuh-yilmaz.github.io/lecture-materials/

## Contents

| Folder | Topic | Materials |
|---|---|---|
| [`endocrine/`](endocrine/) | Endokrin Sistem Fizyolojisi | [Hormon Simülatörü](https://nuh-yilmaz.github.io/lecture-materials/endocrine/) (7 modules, pre/post test) |

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

## Collecting pre/post test results

Students submit results under a self-generated alias; names are not collected. Results go to a Google Sheet through the Apps Script web app in `apps-script/Code.gs`, and each topic writes to its own tab. The endpoint URL is the `SHEET_URL` constant in each simulation page.

The simulations are simplified teaching models, not clinical tools.
