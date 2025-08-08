# Project Tracker

A comprehensive project management application built with Next.js, TypeScript, and Tailwind CSS, integrated with a MongoDB backend API.

## Features

- **User Authentication**: Register, login, and profile management
- **Project Management**: Create, edit, delete, and track projects with priority levels
- **Task Management**: Assign tasks to team members, track progress, and manage deadlines
- **User Task Tracking**: Daily, weekly, monthly, and adhoc task tracking with hours spent
- **Dashboard**: Overview of projects, tasks, and team members
- **Real-time Data**: All data is fetched from and stored in MongoDB via REST API

## API Integration

The application is fully integrated with a MongoDB backend API that provides:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Project Endpoints
- `GET /api/projects` - Get all projects with filtering
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `GET /api/projects/:id/tasks` - Get project tasks

### Task Endpoints
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/status` - Update task status
- `PUT /api/tasks/:id/assign` - Assign task to user

### User Task Endpoints
- `GET /api/user-tasks` - Get user tasks with filtering
- `GET /api/user-tasks/:id` - Get user task by ID
- `POST /api/user-tasks` - Create new user task
- `PUT /api/user-tasks/:id` - Update user task
- `DELETE /api/user-tasks/:id` - Delete user task

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Dashboard Endpoints
- `GET /api/dashboard` - Get dashboard statistics
- `GET /api/dashboard/projects-summary` - Get projects summary
- `GET /api/dashboard/tasks-summary` - Get tasks summary

## Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB backend server running on `http://localhost:5000`

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd project-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Authentication
1. Register a new account or login with existing credentials
2. The application will store your authentication token and user data in localStorage
3. All API requests will include the authentication token automatically

### Project Management
1. Navigate to "Project Tracker" to view all projects
2. Click "Add New Project" to create a new project
3. Fill in project details including title, description, status, priority, dates, and assign team members
4. Edit or delete projects using the action buttons

### Task Management
1. View project details to see associated tasks
2. Edit task details including status, priority, assigned user, and hours
3. Track task progress and completion

### User Task Tracking
1. Navigate to "Task Tracker" to manage individual user tasks
2. Select a team member to view their tasks
3. Filter tasks by frequency (Daily, Weekly, Monthly, Adhoc)
4. Add new tasks with detailed information including hours spent
5. Update task status and progress

### Dashboard
- View overview statistics including active projects, total tasks, and team members
- See recent projects and task progress
- Monitor completion rates and project status

## Data Structure

### Project
```typescript
interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  priority: 'Low' | 'Medium' | 'High';
  startDate: string;
  dueDate: string;
  assignedTo?: string[];
}
```

### Task
```typescript
interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  priority: 'Low' | 'Medium' | 'High';
  assignedTo: string;
  dueDate: string;
  estimatedHours?: number;
  actualHours?: number;
}
```

### User Task
```typescript
interface UserTask {
  id: string;
  userId: string;
  date: string;
  typeOfWork: string;
  workDescription: string;
  project: string;
  task: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  status: 'Pending' | 'In Progress' | 'Completed';
  hoursSpent?: number;
  notes?: string;
}
```

## Error Handling

The application includes comprehensive error handling:
- Network errors are displayed to users
- Loading states for all async operations
- Form validation and error messages
- Graceful fallbacks for missing data

## Security

- JWT tokens are used for authentication
- All API requests include authorization headers
- User sessions are managed securely
- Protected routes prevent unauthorized access

## Technologies Used

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: React hooks and context
- **API Integration**: Fetch API with custom service layer
- **Authentication**: JWT tokens with localStorage
- **UI Components**: Custom components with Remix Icons
- **Backend**: MongoDB with REST API (separate service)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
