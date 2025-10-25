// Sample Task Data Structure for Firebase
// Collection: 'tasks'

// Example Task Document:
{
  "id": "task_001",
  "title": "Hello World Program",
  "description": "Write your first C program that prints 'Hello, World!' to the console.",
  "courseId": "course_001", // This should match the course ID
  "difficulty": "easy", // "easy", "medium", or "hard"
  "points": 10,
  "completed": false, // Optional: track completion status
  "instructions": "Create a simple C program that uses printf to display 'Hello, World!'",
  "expectedOutput": "Hello, World!",
  "hints": [
    "Use #include <stdio.h>",
    "Use printf() function",
    "Don't forget the semicolon"
  ],
  "solution": "#include <stdio.h>\n\nint main() {\n    printf(\"Hello, World!\");\n    return 0;\n}",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}

// Example Course Document (update existing):
{
  "id": "course_001",
  "title": "C Programming Basics",
  "description": "Learn the fundamentals of C programming",
  "categoryId": "programming",
  "isProgramming": true,
  "language": "C",
  "premium": false,
  "content": "This course covers the basics of C programming...",
  "tasks": ["task_001", "task_002", "task_003"] // Optional: array of task IDs
}

// How to add tasks to Firebase:
// 1. Go to Firebase Console
// 2. Navigate to Firestore Database
// 3. Create a new collection called "tasks"
// 4. Add documents with the structure above
// 5. Make sure the courseId matches an existing course ID

// Difficulty Colors:
// - Easy: Green (#43e97b)
// - Medium: Yellow (#ffc107) 
// - Hard: Red (#dc3545)

// Points System:
// - Easy tasks: 5-15 points
// - Medium tasks: 15-30 points
// - Hard tasks: 30-50 points
