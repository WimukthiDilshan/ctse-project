# SLIIT | DEPARTMENT OF COMPUTER SCIENCE & SOFTWARE ENGINEERING
## Module: Current Trends in Software Engineering (SE4010)
### Cloud Computing Assignment - School Management System (SMS)

---

## 1. Shared Architecture Diagram
The following diagram illustrates the four microservices, their isolated databases, and the creative inter-service communication paths.

```mermaid
graph TD
    User((User))
    Frontend[React Dashboard]
    
    subgraph "Cloud Infrastructure / Docker Network"
        StudentSvc[Student Service]
        TeacherSvc[Teacher Service]
        CourseSvc[Course Service]
        ResultSvc[Result Service]
        
        DB1[(Student DB)]
        DB2[(Teacher DB)]
        DB3[(Course DB)]
        DB4[(Result DB)]
    end

    User --> Frontend
    Frontend --> StudentSvc
    Frontend --> TeacherSvc
    Frontend --> CourseSvc
    Frontend --> ResultSvc

    %% Inter-service Communication
    StudentSvc -- "GET /api/results" --> ResultSvc
    TeacherSvc -- "GET /api/results/stats" --> ResultSvc
    CourseSvc -- "GET /api/teachers/:id" --> TeacherSvc
    ResultSvc -- "PATCH /api/students/:id/rank" --> StudentSvc
```

---

## 2. Microservice Rationale
Each service represents a core component of a cohesive educational ecosystem:
- **Student Service**: Responsible for high-availability learner profile management.
- **Teacher Service**: Manages faculty records and provides subject-level analytics.
- **Course Service**: Serves as the curriculum hub, ensuring course data is enriched with faculty insights.
- **Result Service**: Acts as the central grading and synchronization engine.

---

## 3. Inter-Service Communication (With Examples)
Services integrate via RESTful APIs over an internal network:
- **Example 1**: The `Result Service` sends a `PATCH` request to the `Student Service` to update a student's `rank` (milestone) immediately after a grade is posted.
- **Example 2**: The `Course Service` performs a `GET` request to the `Teacher Service` to include the instructor's bio when a user explores course details.
- **Example 3**: The `Teacher Service` calls the `Student Service` to verify students exist before registering them as mentees, enabling mentor-mentee relationship tracking.

---

## 4. Security & Access Control (Advanced RBAC)
The system implements a granular **Role-Based Access Control (RBAC)** system. Users can register as one of 5 types, with the dashboard dynamically restricting visibility based on their profile.

| Role | Access Restricted To | Description |
| :--- | :--- | :--- |
| **Master Admin** | Superuser access to all services and data. | Full control over the system. |
| **Student** | Can only interact with the **Student Hub**. | View personal profile, results, and enroll in courses. |
| **Teacher** | Can only interact with **Teacher Command**. | Manage courses, view student results, and update grades. |
| **Course Lead** | Can only interact with **Course Navigator**. | Oversee course content, assign teachers, and manage curriculum. |
| **Result Lead** | Grading Portal | Post results and manage student ranks. |

- **Authentication Hub**: The `Student Service` serves as the core identity provider.
- **Student-Led Actions**: Students can **Self-Register** their profile and **Enroll** in courses. Enrollment integrates with the `Course Service` (to fetch options) and `Result Service` (to initialize records).
- **Login Persistence**: Sessions are secured via local browser storage.
- **UI Logic**: Responsive sidebar allows each member to demonstrate their specific service in isolation.

---

## 5. Challenges & Solutions
- **Challenge**: Resolving Cross-Origin Resource Sharing (CORS) between the frontend and multiple back-end services.
- **Solution**: Implemented `cors` middleware across all Node.js services to securely allow required origins.
- **Challenge**: Synchronizing state (Rank) across disparate databases.
- **Solution**: Implemented an event-driven style REST hook where the `Result Service` triggers a rank update in the `Student Service`.
- **Challenge**: Teachers need to establish mentor-mentee relationships with students.
- **Solution**: Extended the `Teacher Service` to integrate with the `Student Service`, allowing teachers to register students as mentees with automatic validation and role-based dashboard views.

---

## 5.1 Teacher Mentor-Mentee Feature
The Teacher Service now supports comprehensive mentor-mentee relationship management:

### Key Features:
- **Register Mentees**: Teachers can add registered students as mentees via `POST /api/teachers/:id/add-mentee`
- **Validate Students**: System automatically verifies student existence in Student Service before adding
- **Prevent Duplicates**: Cannot add the same student twice as a mentee
- **View Mentees**: Teachers can view all their mentees with `/api/teachers/:id/mentees`
- **Remove Mentees**: Teachers can remove mentees using `DELETE /api/teachers/:id/mentees/:studentId`
- **Dashboard View**: Comprehensive dashboard showing mentees + class statistics at `/api/teachers/:id/dashboard`

### Data Stored:
Each mentee relationship includes:
- Student ID and Name
- Student Email
- Date Mentee was Added
- Teacher maintains full mentee history

For complete documentation, see [TEACHER_SERVICE_MENTOR_GUIDE.md](TEACHER_SERVICE_MENTOR_GUIDE.md)

---

## 6. API Contract (Contractual Summary)
| Service | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Auth Hub** | POST | `/api/auth/register` | Register new user with specific role |
| **Auth Hub** | POST | `/api/auth/login` | Validate and start secure session |
| **Student** | POST | `/api/students` | Self-Register/Create student profile |
| **Student** | GET | `/api/students/:id/dashboard` | Integration: Fetch profile + results |
| **Teacher** | POST | `/api/teachers/:id/add-mentee` | **NEW**: Register student as teacher's mentee |
| **Teacher** | GET | `/api/teachers/:id/mentees` | **NEW**: Retrieve all mentees of a teacher |
| **Teacher** | DELETE | `/api/teachers/:id/mentees/:studentId` | **NEW**: Remove student as mentee |
| **Teacher** | GET | `/api/teachers/:id/dashboard` | **NEW**: Teacher dashboard with mentees + class stats |
| **Teacher** | GET | `/api/teachers/:id/class-stats` | Integration: Fetch subject analytics |
| **Course** | GET | `/api/courses/:id/full-info` | Integration: Fetch course + faculty bio |
| **Result** | POST | `/api/results` | Integration: Post result + update student rank |

---

## 7. How to Run Locally
1. Clone the repository.
2. Run `docker-compose up --build`.
3. Dashboard: `http://localhost:3000`.
4. Inspect DBs: See ports 27017-27020 in **MongoDB Compass**.