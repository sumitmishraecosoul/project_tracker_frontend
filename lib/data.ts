
export interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Active' | 'Completed' | 'On Hold';
  createdDate: string;
  dueDate: string;
}

export interface Task {
  id: string;
  projectId: string;
  task: string;
  eta: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Blocked';
  assignedTo: string;
  remark: string;
  roadBlock: string;
  supportNeeded: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: string;
  department: string;
}

export interface UserTask {
  id: string;
  userId: string;
  date: string;
  typeOfWork: string;
  workDescription: string;
  projectForTask: string;
  frequency: 'Daily' | 'Weekly' | 'Monthly' | 'Adhoc';
  status: 'Pending' | 'In Progress' | 'Completed';
}

// Departments list
export const departments = [
  'Engineering',
  'Design',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations',
  'Product Management'
];

// Sample Projects Data
export const projectsData: Project[] = [
  {
    id: '1',
    title: 'E-commerce Website Development',
    description: 'Complete online store with payment integration',
    status: 'Active',
    createdDate: '2024-01-15',
    dueDate: '2024-04-30'
  },
  {
    id: '2',
    title: 'Mobile App UI/UX Redesign',
    description: 'Redesign mobile application interface',
    status: 'Completed',
    createdDate: '2024-02-01',
    dueDate: '2024-03-15'
  },
  {
    id: '3',
    title: 'Data Analytics Dashboard',
    description: 'Business intelligence dashboard development',
    status: 'Active',
    createdDate: '2024-01-20',
    dueDate: '2024-05-10'
  }
];

// Sample Tasks Data
export const tasksData: Task[] = [
  {
    id: '1',
    projectId: '1',
    task: 'Setup project structure and dependencies',
    eta: '2024-02-01',
    status: 'Completed',
    assignedTo: 'John Doe',
    remark: 'Initial setup complete',
    roadBlock: 'None',
    supportNeeded: 'None'
  },
  {
    id: '2',
    projectId: '1',
    task: 'Design database schema',
    eta: '2024-02-05',
    status: 'In Progress',
    assignedTo: 'Jane Smith',
    remark: 'Working on user table design',
    roadBlock: 'Waiting for requirements clarification',
    supportNeeded: 'Database architect review'
  },
  {
    id: '3',
    projectId: '1',
    task: 'Implement user authentication',
    eta: '2024-02-10',
    status: 'Not Started',
    assignedTo: 'Mike Johnson',
    remark: 'Pending database completion',
    roadBlock: 'Dependencies not ready',
    supportNeeded: 'Security review'
  },
  {
    id: '4',
    projectId: '2',
    task: 'Create wireframes for new design',
    eta: '2024-02-08',
    status: 'Completed',
    assignedTo: 'Sarah Wilson',
    remark: 'Wireframes approved by client',
    roadBlock: 'None',
    supportNeeded: 'None'
  },
  {
    id: '5',
    projectId: '2',
    task: 'Design high-fidelity mockups',
    eta: '2024-02-15',
    status: 'In Progress',
    assignedTo: 'Sarah Wilson',
    remark: 'Working on color scheme',
    roadBlock: 'Brand guidelines pending',
    supportNeeded: 'Brand manager input'
  },
  {
    id: '6',
    projectId: '3',
    task: 'Research data visualization libraries',
    eta: '2024-02-03',
    status: 'Completed',
    assignedTo: 'Alex Chen',
    remark: 'Recommended Chart.js and D3.js',
    roadBlock: 'None',
    supportNeeded: 'None'
  }
];

// Sample Users Data
export const usersData: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@company.com',
    password: 'password123',
    role: 'Full Stack Developer',
    department: 'Engineering'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@company.com',
    password: 'password123',
    role: 'Database Administrator',
    department: 'Engineering'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@company.com',
    password: 'password123',
    role: 'Backend Developer',
    department: 'Engineering'
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@company.com',
    password: 'password123',
    role: 'UI/UX Designer',
    department: 'Design'
  },
  {
    id: '5',
    name: 'Alex Chen',
    email: 'alex.chen@company.com',
    password: 'password123',
    role: 'Data Analyst',
    department: 'Operations'
  },
  {
    id: '6',
    name: 'Emily Davis',
    email: 'emily.davis@company.com',
    password: 'password123',
    role: 'Marketing Manager',
    department: 'Marketing'
  },
  {
    id: '7',
    name: 'Robert Brown',
    email: 'robert.brown@company.com',
    password: 'password123',
    role: 'Sales Representative',
    department: 'Sales'
  },
  {
    id: '8',
    name: 'Lisa Taylor',
    email: 'lisa.taylor@company.com',
    password: 'password123',
    role: 'HR Specialist',
    department: 'HR'
  }
];

// Sample User Tasks Data
export const userTasksData: UserTask[] = [
  {
    id: '1',
    userId: '1',
    date: '2024-01-29',
    typeOfWork: 'Development',
    workDescription: 'Implemented login functionality',
    projectForTask: 'E-commerce Website Development',
    frequency: 'Daily',
    status: 'Completed'
  },
  {
    id: '2',
    userId: '1',
    date: '2024-01-30',
    typeOfWork: 'Code Review',
    workDescription: 'Reviewed database schema changes',
    projectForTask: 'E-commerce Website Development',
    frequency: 'Daily',
    status: 'Completed'
  },
  {
    id: '3',
    userId: '2',
    date: '2024-01-29',
    typeOfWork: 'Database Design',
    workDescription: 'Created user table schema',
    projectForTask: 'E-commerce Website Development',
    frequency: 'Daily',
    status: 'In Progress'
  },
  {
    id: '4',
    userId: '3',
    date: '2024-01-30',
    typeOfWork: 'Planning',
    workDescription: 'Sprint planning meeting',
    projectForTask: 'Mobile App UI/UX Redesign',
    frequency: 'Weekly',
    status: 'Completed'
  },
  {
    id: '5',
    userId: '4',
    date: '2024-01-29',
    typeOfWork: 'Design',
    workDescription: 'Created mockups for dashboard',
    projectForTask: 'Data Analytics Dashboard',
    frequency: 'Daily',
    status: 'In Progress'
  }
];
