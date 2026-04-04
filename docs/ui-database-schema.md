# UI-Driven Database Schema

This project is organized around consultation cases and their related clinical and collaboration data.

## Core Tables

- `users`
  - Specialists, consultants, and the current logged-in profile.
- `patients`
  - Master patient identity record.
  - Stores `cid`, `hn`, name, demographics, phone, district, province, blood type, allergies, and conditions.
- `cases`
  - Consultation workflow record shown in Dashboard, Active Cases, Requests, Archive Cases, and Patient Detail.
  - Links to `patients` via `patient_id`.
- `case_vitals`
  - Time-series vitals for the Patient Detail overview.
- `case_labs`
  - Lab results for the Labs tab.
- `case_medications`
  - Medication timeline for the Medications tab.
- `case_notes`
  - Clinical notes and specialist recommendations.
- `case_messages`
  - Case chat thread used by Message Specialist and Patient Detail.
- `case_team`
  - Team members assigned to the case.
- `case_files`
  - Imaging, reports, CSVs, PDFs, and other attachments for case files.
- `notifications`
  - User-specific alerts for requests, messages, and clinical events.
- `activities`
  - Dashboard activity feed and activity-history page.

## Relationship Rules

- One `patient` can have many `cases`.
- One `case` can have many `vitals`, `labs`, `medications`, `notes`, `messages`, `team` members, and `case_files`.
- One `user` can author notes/messages, receive notifications, and join a case team.

## UI Coverage

- Dashboard:
  - `cases`, `users`, `activities`
- Active Cases and Requests:
  - `cases`
- Patient Detail:
  - `cases`, `case_vitals`, `case_labs`, `case_medications`, `case_notes`, `case_messages`, `case_team`, `case_files`
- Specialist Directory:
  - `users`
- Notifications and Activity History:
  - `notifications`, `activities`

## Seed Set

- The local mock seed uses five patients and five consultation cases.
- Seed data is intentionally Thai-localized for Phitsanulok hospitals and districts.
- Seed rows are prefixed consistently so the data can be refreshed safely in dev.
