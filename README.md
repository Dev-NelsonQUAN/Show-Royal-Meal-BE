# Scope of Work (SOW)

## Project Overview

**Name:** Ambucare
**Objective:** Emergency

**Deliverables:**

1. **Mobile Apps:** Android and iOS applications.
2. **Web App:** A responsive web platform with administrative and user functionalities.

---

## Technical Stack

| SN  | Technology | Purpose            |
| --- | ---------- | ------------------ |
| 1   | React      | Frontend framework |
| 2   | Node.js    | Backend runtime    |
| 3   | TypeScript | Strongly typed JS  |
| 4   | MongoDB    | Database           |
| 5   | Next       | Landing Page       |

---

## API Design

- **Style:** RESTful APIs with consistent versioning (e.g., `/api/v1/...`).
- **Data Format:** JSON.

**Security:**

- Use HTTPS for all endpoints.
- Token-based authentication (JWT).
- Role-based access control (RBAC) for different user levels.

**Error Handling:**

- Standard error codes with descriptive messages.

---

## User Interface (UI/UX)

- **Design Tool:** Figma.
- **Design Process:** All UI/UX designs must be approved by the team lead before development.
- **Accessibility:** Adhere to WCAG 2.1 standards to ensure inclusivity.
- **Responsiveness:** Designs must adapt seamlessly to all screen sizes (mobile, tablet, desktop).

---

## Testing Strategy

- **Initial Testing:** Introduced post version 0.0.1 release.
- **Unit Testing:** Required for all new components and features.
- **Integration Testing:** Validate interaction between modules.

**Tools:**

- **Frontend:** React Testing Library, Vitest.
- **Backend:** Mocha, Chai, Supertest.
- **Mobile:** Detox or Appium for end-to-end testing.

---

## Deployment and Scaling

- **Containerization:** Use Docker to package and deploy applications.
- **CI/CD:** Automate builds, tests, and deployments using GitHub Actions, GitLab CI/CD or Jenkins.
- **Scaling:** Implement auto-scaling using Kubernetes, AWS Elastic Beanstalk or Runners.

---

## API Documentation

- **Tool:** Postman.
- **Standard:** Document all endpoints with examples, expected responses, and error codes.

---

## Project Management

| Scope         | Tool   | Purpose                                    |
| ------------- | ------ | ------------------------------------------ |
| Task Tracking | Jira   | Manage sprints, assign tasks, and track... |
| Visualization | Miro   | Collaborative brainstorming and mapping.   |
| Communication | Slack  | Real-time collaboration.                   |
| Communication | Notion | Real-time collaboration.                   |

---

## Libraries

| Scope             | Library      |
| ----------------- | ------------ |
| State Management  | Zustand      |
| API Data Handling | React Query  |
| Data Validation   | Zod          |
| Styling Framework | Tailwind CSS |
| UI Components     | Shadcn       |

---

## Code Consistency and Automation

| Scope      | Tool     | Purpose                              |
| ---------- | -------- | ------------------------------------ |
| Linter     | ESLint   | Enforce code quality.                |
| Formatter  | Prettier | Maintain consistent code formatting. |
| Pre-commit | Husky    | Ensure checks are passed pre-commit. |

**Rules:**

1. Pre-commit hooks run ESLint and Prettier to catch issues before pushing.
2. Modifications to automation configuration files are strictly prohibited.

## 📍 Collaboration and Version Control / Mono Merger:

| SN  | Rule                                                                                                                                              |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Git version control system for tracking changes.                                                                                                  |
| 2   | ⚠️ Developers are to create task-specific branches using their name as a prefix (e.g., lucky-admin-auth-model).                                   |
| 3   | ⚠️ The main branch is reserved for production-ready code, with all development updates merged into the dev branch .                               |
| 4   | ⚠️ Developers must request code reviews and merging from the designated merger [David Okih](https://github.com/Davidokih) after completing tasks. |
| 5   | ⚠️ Strict adherence to this process ensures code quality and consistency.                                                                         |
| 6   | ⚠️ Tasks carried out outside this defined scope will be removed or left unattended to maintain project assurance.                                 |

---

## Roles and Responsibilities

1. **Frontend Developers:**
   - Implement responsive and interactive UIs based on Figma designs.
   - Integrate APIs and ensure smooth user experiences.

2. **Backend Developers:**
   - Design and develop scalable APIs.
   - Manage database schemas, migrations, and queries.

3. **Team Lead (You):**
   - Oversee progress and resolve blockers.
   - Review designs and code.
   - Ensure adherence to timelines and quality standards.

---

## Key Milestones

| Milestone               | Deadline       | Responsible Team    |
| ----------------------- | -------------- | ------------------- |
| API Development (v1)    | July 30, 2025  | Backend Developers  |
| Frontend MVP Completion | July 30, 2025  | Frontend Developers |
| Initial Testing Phase   | August 1, 2025 | QA Team             |
| Beta Launch             | August 1, 2025 | All Teams           |
