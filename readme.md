# ⚒️ TaskForge

> A modern **project and task management platform** inspired by tools like Trello, Jira and Azure DevOps.

TaskForge is a **full-stack Kanban project management system** designed to help teams organize work, collaborate efficiently and track project progress.

Built as a **professional portfolio project**, it demonstrates real-world architecture including:

- Authentication
- Role-based permissions
- Kanban board
- Notifications
- Cloud database
- Full CRUD operations
- Monorepo architecture

---

# 🚀 Live Demo

🌐 Demo: *(coming soon)*

---

# 🎬 Preview

### Dashboard

![Dashboard](docs/gifs/dashboard.gif)

### Kanban Board

![Kanban](docs/gifs/kanban.gif)

### Creating Tasks

![Tasks](docs/gifs/tasks.gif)

### Notifications

![Notifications](docs/gifs/notifications.gif)

---

# ✨ Features

## 🔐 Authentication

- User registration
- Secure login system
- JWT authentication
- Token verification
- Session persistence using localStorage
- Protected routes

---

## 📊 Project Management

- Create projects
- View project details
- Delete projects
- Project statistics
- Manage project members

---

## 👥 Team Collaboration

- Invite members by email
- Role-based permissions
- Owner / Admin / Member roles
- Team visibility inside projects

---

## 📋 Kanban Board

Interactive task board with drag-and-drop:

- 📌 To Do
- ⚙️ In Progress
- ✅ Done

Features include:

- Create tasks
- Edit tasks
- Delete tasks
- Drag and drop between columns
- Task assignment
- Due dates
- Priority system

---

## ⚡ Task Priorities

Each task can be assigned a priority level:

- Low
- Medium
- High
- Urgent

---

## 💬 Comments

Team members can discuss tasks using comments.

- Comment history
- Real-time collaboration style workflow
- Discussion tracking

---

## 🔔 Notifications

Users receive notifications for:

- Assigned tasks
- New comments
- Upcoming deadlines
- Project invitations

---

## 📱 Responsive Design

TaskForge works across multiple devices:

| Device | Layout |
|------|------|
Desktop | Full Kanban view |
Tablet | Adaptive layout |
Mobile | Vertical stacked columns |

---

# 🏗️ Architecture

TaskForge uses a **Monorepo architecture** similar to what many modern tech companies adopt.


taskforge/
│
├── apps/
│ ├── api/ # Backend (Node.js + Express)
│ └── web/ # Frontend
│
├── packages/ # Shared packages
│
├── docs/ # Images, gifs and documentation
│
├── docker-compose.yml
├── package.json
└── README.md


This structure allows:

- Easier dependency sharing
- Simpler versioning
- Unified development workflow

---

# 🛠 Tech Stack

## Backend

| Technology | Purpose |
|--------|--------|
Node.js | Runtime environment |
Express | Backend framework |
MySQL | Database |
JWT | Authentication |
bcrypt | Password hashing |
mysql2 | Database driver |

---

## Frontend

| Technology | Purpose |
|--------|--------|
HTML5 | Structure |
CSS3 | Styling |
JavaScript | Logic |
Font Awesome | Icons |

---

## Dev Tools

- Git
- GitHub
- Aiven (Cloud Database)

---

# ⚙️ Installation

## 1️⃣ Clone repository

```bash
git clone https://github.com/your-username/taskforge.git
cd taskforge
2️⃣ Install dependencies

Backend:

cd backend
npm install
3️⃣ Configure environment variables

Create .env file.

DATABASE_URL=mysql://USER:PASSWORD@HOST:PORT/DATABASE
JWT_SECRET=super-secret-key
PORT=3000
4️⃣ Create database tables
node scripts/create-all-tables.js
5️⃣ Start backend
npm run dev

Server will run on:

http://localhost:3000
6️⃣ Run frontend

Open another terminal.

cd frontend
npx http-server -p 8080

Frontend available at:

http://localhost:8080
🔌 API Reference
Authentication
Method	Endpoint
POST	/api/auth/register
POST	/api/auth/login
GET	/api/auth/verify
Projects
Method	Endpoint
GET	/api/projects
POST	/api/projects
GET	/api/projects/:id
DELETE	/api/projects/:id
POST	/api/projects/:id/invite
Tasks
Method	Endpoint
POST	/api/tasks
PUT	/api/tasks/:id
PATCH	/api/tasks/:id/move
DELETE	/api/tasks/:id
Comments
Method	Endpoint
POST	/api/tasks/:id/comments
GET	/api/tasks/:id/comments
Notifications
Method	Endpoint
GET	/api/notifications
GET	/api/notifications/unread
PATCH	/api/notifications/:id/read
POST	/api/notifications/read-all
🧪 Testing
Backend
node scripts/test-connection.js

Check projects:

node scripts/check-projects.js

Reset database:

node scripts/reset-database.js
🐛 Troubleshooting
Database connection error

Verify .env:

cat .env

Test connection:

node scripts/test-connection.js
Unauthorized errors

Possible causes:

Token expired

Token not sent in headers

User not authenticated

Clear browser storage:

localStorage.clear()
🔒 Security

TaskForge follows modern backend security practices:

Password hashing with bcrypt

JWT authentication

Role-based access control

SQL injection prevention

Environment variable protection

Secure database connection (SSL)

📊 Future Improvements

Planned improvements:

Real-time updates with WebSockets

Activity logs

File attachments

Dark mode

API documentation with Swagger

Docker deployment

CI/CD pipeline

🤝 Contributing

Contributions are welcome!

Fork the project

Create your feature branch

git checkout -b feature/amazing-feature

Commit your changes

git commit -m "Add amazing feature"

Push to branch

git push origin feature/amazing-feature

Open a Pull Request

📄 License

This project is licensed under the MIT License.

👨‍💻 Author

Renan Leal

Computer Engineering Student
Brazil 🇧🇷

GitHub:

https://github.com/your-username
⭐ Support

If you like this project:

⭐ Star this repository
🍴 Fork it
📢 Share it