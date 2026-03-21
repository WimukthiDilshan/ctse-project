# Teacher Service - Mentor-Mentee Integration Guide

## Overview
The Teacher Service is now integrated with the Student Service, allowing teachers to register and manage students as mentees. This enables a holistic mentorship tracking system where teachers can track which students they mentor.

## Database Schema Updates

### Teacher Model
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  subject: String,
  bio: String,
  mentees: [
    {
      studentId: ObjectId,
      studentName: String,
      studentEmail: String,
      addedDate: Date
    }
  ]
}
```

## New API Endpoints

### 1. Add Student as Mentee
**Endpoint:** `POST /api/teachers/:id/add-mentee`

**Description:** Register a student as a mentee of a teacher. The system verifies the student exists in Student Service before adding.

**Request:**
```bash
curl -X POST http://localhost:5002/api/teachers/{teacherId}/add-mentee \
  -H "Content-Type: application/json" \
  -d {
    "studentId": "{studentId}"
  }
```

**Request Body:**
```json
{
  "studentId": "64a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Response (201 Created):**
```json
{
  "message": "John Doe has been added as a mentee",
  "teacher": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Mathematics",
    "bio": "Experienced math educator",
    "mentees": [
      {
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "addedDate": "2024-03-21T10:30:00.000Z"
      }
    ]
  }
}
```

**Error Cases:**
- `400 Bad Request`: Student ID is required
- `404 Not Found`: Student not found in Student Service
- `404 Not Found`: Teacher not found
- `400 Bad Request`: Student is already a mentee of this teacher

---

### 2. Get All Mentees of a Teacher
**Endpoint:** `GET /api/teachers/:id/mentees`

**Description:** Retrieve all students registered as mentees under a teacher.

**Request:**
```bash
curl http://localhost:5002/api/teachers/{teacherId}/mentees
```

**Response (200 OK):**
```json
{
  "teacherId": "64a1b2c3d4e5f6g7h8i9j0k1",
  "teacherName": "Jane Smith",
  "teacherSubject": "Mathematics",
  "menteeCount": 2,
  "mentees": [
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "addedDate": "2024-03-21T10:30:00.000Z"
    },
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k3",
      "studentName": "Jane Johnson",
      "studentEmail": "jane.j@example.com",
      "addedDate": "2024-03-21T11:15:00.000Z"
    }
  ]
}
```

---

### 3. Remove Student as Mentee
**Endpoint:** `DELETE /api/teachers/:id/mentees/:studentId`

**Description:** Remove a student from the mentee list.

**Request:**
```bash
curl -X DELETE http://localhost:5002/api/teachers/{teacherId}/mentees/{studentId}
```

**Response (200 OK):**
```json
{
  "message": "John Doe has been removed as a mentee",
  "teacher": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Mathematics",
    "mentees": [
      {
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k3",
        "studentName": "Jane Johnson",
        "studentEmail": "jane.j@example.com",
        "addedDate": "2024-03-21T11:15:00.000Z"
      }
    ]
  }
}
```

**Error Cases:**
- `404 Not Found`: Teacher not found
- `404 Not Found`: Mentee not found

---

### 4. Get Teacher Dashboard (With Mentees)
**Endpoint:** `GET /api/teachers/:id/dashboard`

**Description:** Get a complete teacher profile including mentees, class stats, and performance metrics.

**Request:**
```bash
curl http://localhost:5002/api/teachers/{teacherId}/dashboard
```

**Response (200 OK):**
```json
{
  "teacher": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Mathematics",
    "bio": "Experienced math educator"
  },
  "mentees": [
    {
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "studentName": "John Doe",
      "studentEmail": "john@example.com",
      "addedDate": "2024-03-21T10:30:00.000Z"
    }
  ],
  "menteeCount": 1,
  "classStats": {
    "_id": "Mathematics",
    "averageMarks": 78.5,
    "highestMarks": 95,
    "studentCount": 15
  },
  "message": "Welcome Jane Smith! You are mentoring 1 student(s)."
}
```

---

## Existing Endpoints (Still Available)

### Create Teacher
**POST /api/teachers**
```bash
curl -X POST http://localhost:5002/api/teachers \
  -H "Content-Type: application/json" \
  -d {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "subject": "Mathematics",
    "bio": "Experienced educator"
  }
```

### Get All Teachers
**GET /api/teachers**
```bash
curl http://localhost:5002/api/teachers
```

### Get Teacher Info
**GET /api/teachers/:id**
```bash
curl http://localhost:5002/api/teachers/{teacherId}
```

### Get Class Statistics
**GET /api/teachers/:id/class-stats**
```bash
curl http://localhost:5002/api/teachers/{teacherId}/class-stats
```

---

## Service-to-Service Communication

### Teacher Service → Student Service
The Teacher Service now communicates with the Student Service when:
1. **Adding a mentee** - Validates that the student exists before registering
2. **Dashboard view** - Retrieves student details for the mentee list

**Environment Variables Required:**
- `STUDENT_SERVICE_URL`: URL to Student Service (default: http://localhost:5001)

---

## Usage Workflow

### Step 1: Create a Teacher
```bash
curl -X POST http://localhost:5002/api/teachers \
  -H "Content-Type: application/json" \
  -d {
    "name": "Mr. Johnson",
    "email": "johnson@school.com",
    "subject": "Physics",
    "bio": "Physics teacher with 10 years experience"
  }
```

### Step 2: Create Students (in Student Service)
```bash
curl -X POST http://localhost:5001/api/students \
  -H "Content-Type: application/json" \
  -d {
    "name": "Alice Cooper",
    "email": "alice@school.com",
    "age": 16,
    "grade": "10"
  }
```

### Step 3: Register Student as Mentee
```bash
curl -X POST http://localhost:5002/api/teachers/{teacherId}/add-mentee \
  -H "Content-Type: application/json" \
  -d {
    "studentId": "{studentId}"
  }
```

### Step 4: View Mentees
```bash
curl http://localhost:5002/api/teachers/{teacherId}/mentees
```

---

## Docker Compose Configuration

The teacher service now requires the Student Service URL:

```yaml
teacher-service:
  build: ./services/teacher-service
  ports:
    - "5002:5002"
  environment:
    - MONGO_URI=mongodb://teacher-db:27017/teacher_db
    - RESULT_SERVICE_URL=http://result-service:5004
    - STUDENT_SERVICE_URL=http://student-service:5001
  depends_on:
    - teacher-db
    - student-service
```

---

## Summary of Changes

✅ Teacher service now integrates with Student Service
✅ Teachers can add registered students as mentees
✅ Mentee list is stored and managed in Teacher database
✅ Mentee data includes student name, email, and registration date
✅ Validation ensures students exist before adding as mentees
✅ Duplicate mentee prevention
✅ Full CRUD operations for mentor-mentee relationships
✅ Mentor dashboard showing all mentees and class statistics
