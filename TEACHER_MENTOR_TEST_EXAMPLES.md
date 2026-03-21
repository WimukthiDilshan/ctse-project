# Teacher Service - Mentor-Mentee Integration - Test Examples

This file contains complete curl examples to test the new mentor-mentee functionality.

## Prerequisites
- Ensure services are running with `docker-compose up --build`
- Services running at: Student (5001), Teacher (5002), Result (5004)

---

## Test Scenario: Complete Mentor-Mentee Workflow

### Step 1: Create a Student
```bash
curl -X POST http://localhost:5001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alice Cooper",
    "email": "alice@school.com",
    "age": 16,
    "grade": "10"
  }'
```

**Expected Response (201):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k1",
  "name": "Alice Cooper",
  "email": "alice@school.com",
  "age": 16,
  "grade": "10",
  "rank": "Bronze"
}
```

*Save the `_id` as `{STUDENT_ID_1}`*

---

### Step 2: Create Another Student
```bash
curl -X POST http://localhost:5001/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Bob Smith",
    "email": "bob@school.com",
    "age": 16,
    "grade": "10"
  }'
```

*Save the `_id` as `{STUDENT_ID_2}`*

---

### Step 3: Create a Teacher
```bash
curl -X POST http://localhost:5002/api/teachers \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Jane Johnson",
    "email": "jane.johnson@school.com",
    "subject": "Physics",
    "bio": "PhD in Physics, 15 years teaching experience"
  }'
```

**Expected Response (201):**
```json
{
  "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
  "name": "Dr. Jane Johnson",
  "email": "jane.johnson@school.com",
  "subject": "Physics",
  "bio": "PhD in Physics, 15 years teaching experience",
  "mentees": []
}
```

*Save the `_id` as `{TEACHER_ID}`*

---

### Step 4: Register First Student as Mentee (Success Case)
```bash
curl -X POST http://localhost:5002/api/teachers/{TEACHER_ID}/add-mentee \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{STUDENT_ID_1}"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Alice Cooper has been added as a mentee",
  "teacher": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Dr. Jane Johnson",
    "email": "jane.johnson@school.com",
    "subject": "Physics",
    "bio": "PhD in Physics, 15 years teaching experience",
    "mentees": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "studentName": "Alice Cooper",
        "studentEmail": "alice@school.com",
        "addedDate": "2024-03-21T10:30:00.000Z"
      }
    ]
  }
}
```

---

### Step 5: Register Second Student as Mentee
```bash
curl -X POST http://localhost:5002/api/teachers/{TEACHER_ID}/add-mentee \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{STUDENT_ID_2}"
  }'
```

**Expected Response (201):**
```json
{
  "message": "Bob Smith has been added as a mentee",
  "teacher": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Dr. Jane Johnson",
    "email": "jane.johnson@school.com",
    "subject": "Physics",
    "bio": "PhD in Physics, 15 years teaching experience",
    "mentees": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
        "studentName": "Alice Cooper",
        "studentEmail": "alice@school.com",
        "addedDate": "2024-03-21T10:30:00.000Z"
      },
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
        "studentName": "Bob Smith",
        "studentEmail": "bob@school.com",
        "addedDate": "2024-03-21T10:32:00.000Z"
      }
    ]
  }
}
```

---

### Step 6: Get All Mentees
```bash
curl http://localhost:5002/api/teachers/{TEACHER_ID}/mentees
```

**Expected Response (200):**
```json
{
  "teacherId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "teacherName": "Dr. Jane Johnson",
  "teacherSubject": "Physics",
  "menteeCount": 2,
  "mentees": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "studentName": "Alice Cooper",
      "studentEmail": "alice@school.com",
      "addedDate": "2024-03-21T10:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "studentName": "Bob Smith",
      "studentEmail": "bob@school.com",
      "addedDate": "2024-03-21T10:32:00.000Z"
    }
  ]
}
```

---

### Step 7: View Teacher Dashboard (With Mentees & Stats)
```bash
curl http://localhost:5002/api/teachers/{TEACHER_ID}/dashboard
```

**Expected Response (200):**
```json
{
  "teacher": {
    "id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Dr. Jane Johnson",
    "email": "jane.johnson@school.com",
    "subject": "Physics",
    "bio": "PhD in Physics, 15 years teaching experience"
  },
  "mentees": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k3",
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k1",
      "studentName": "Alice Cooper",
      "studentEmail": "alice@school.com",
      "addedDate": "2024-03-21T10:30:00.000Z"
    },
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "studentName": "Bob Smith",
      "studentEmail": "bob@school.com",
      "addedDate": "2024-03-21T10:32:00.000Z"
    }
  ],
  "menteeCount": 2,
  "classStats": {
    "message": "Performance statistics currently unavailable"
  },
  "message": "Welcome Dr. Jane Johnson! You are mentoring 2 student(s)."
}
```

---

### Step 8: Try to Add Duplicate Mentee (Error Case)
```bash
curl -X POST http://localhost:5002/api/teachers/{TEACHER_ID}/add-mentee \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "{STUDENT_ID_1}"
  }'
```

**Expected Response (400):**
```json
{
  "error": "Student is already a mentee of this teacher"
}
```

---

### Step 9: Try to Add Non-Existent Student (Error Case)
```bash
curl -X POST http://localhost:5002/api/teachers/{TEACHER_ID}/add-mentee \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "999999999999999999999999"
  }'
```

**Expected Response (404):**
```json
{
  "error": "Student not found in Student Service"
}
```

---

### Step 10: Remove a Mentee
```bash
curl -X DELETE http://localhost:5002/api/teachers/{TEACHER_ID}/mentees/{STUDENT_ID_1}
```

**Expected Response (200):**
```json
{
  "message": "Alice Cooper has been removed as a mentee",
  "teacher": {
    "_id": "64a1b2c3d4e5f6g7h8i9j0k2",
    "name": "Dr. Jane Johnson",
    "email": "jane.johnson@school.com",
    "subject": "Physics",
    "bio": "PhD in Physics, 15 years teaching experience",
    "mentees": [
      {
        "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
        "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
        "studentName": "Bob Smith",
        "studentEmail": "bob@school.com",
        "addedDate": "2024-03-21T10:32:00.000Z"
      }
    ]
  }
}
```

---

### Step 11: Verify Mentee was Removed
```bash
curl http://localhost:5002/api/teachers/{TEACHER_ID}/mentees
```

**Expected Response (200):**
```json
{
  "teacherId": "64a1b2c3d4e5f6g7h8i9j0k2",
  "teacherName": "Dr. Jane Johnson",
  "teacherSubject": "Physics",
  "menteeCount": 1,
  "mentees": [
    {
      "_id": "64a1b2c3d4e5f6g7h8i9j0k4",
      "studentId": "64a1b2c3d4e5f6g7h8i9j0k2",
      "studentName": "Bob Smith",
      "studentEmail": "bob@school.com",
      "addedDate": "2024-03-21T10:32:00.000Z"
    }
  ]
}
```

---

## Error Test Cases

### Missing Student ID
```bash
curl -X POST http://localhost:5002/api/teachers/{TEACHER_ID}/add-mentee \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Expected Response (400):**
```json
{
  "error": "Student ID is required"
}
```

---

### Invalid Teacher ID
```bash
curl http://localhost:5002/api/teachers/invalid_id/mentees
```

**Expected Response (500):**
```json
{
  "error": "Cast to ObjectId failed for value \"invalid_id\""
}
```

---

### Non-Existent Teacher
```bash
curl http://localhost:5002/api/teachers/64a1b2c3d4e5f6g7h8i9j0kz/mentees
```

**Expected Response (404):**
```json
{
  "error": "Teacher not found"
}
```

---

### Non-Existent Mentee to Remove
```bash
curl -X DELETE http://localhost:5002/api/teachers/{TEACHER_ID}/mentees/64a1b2c3d4e5f6g7h8i9j0kz
```

**Expected Response (404):**
```json
{
  "error": "Mentee not found"
}
```

---

## Integration Testing Notes

1. **Service Discovery**: Ensure teachers' service can reach students' service on `http://student-service:5001/` in Docker
2. **Data Isolation**: Each mentee has unique student ID and email from Student Service
3. **Timestamp Tracking**: `addedDate` is automatically set when mentee is added
4. **Cascade**: Removing students from Student Service does NOT auto-remove them from Teacher mentees (by design)
5. **Idempotency**: Adding same mentee twice is prevented with error message
