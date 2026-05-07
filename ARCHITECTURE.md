# Nexus — Architecture Document
*Milestone 1 — Week 1*

## Tech Stack
| Tool | Purpose |
|---|---|
| React 18 + TypeScript | Frontend framework |
| Vite | Build tool / dev server |
| Tailwind CSS | Styling |
| React Router v6 | Page navigation |
| localStorage | Stores logged-in user |
| react-hot-toast | Toast notifications |

## Folder Structure
src/
├── components/      # Shared UI pieces (navbar, sidebar, cards)
├── context/         # AuthContext — global login/logout state
├── data/            # Mock data (fake users, documents, etc.)
├── pages/           # One file per page
├── types/           # TypeScript data shapes
├── App.tsx          # All routes defined here
├── main.tsx         # App entry point
└── index.css        # Global styles

## All Routes
| URL | Page | Access |
|---|---|---|
| /login | LoginPage | Public |
| /register | RegisterPage | Public |
| /dashboard/entrepreneur | EntrepreneurDashboard | Auth only |
| /dashboard/investor | InvestorDashboard | Auth only |
| /profile/entrepreneur/:id | EntrepreneurProfile | Auth only |
| /profile/investor/:id | InvestorProfile | Auth only |
| /investors | InvestorsPage | Auth only |
| /entrepreneurs | EntrepreneursPage | Auth only |
| /messages | MessagesPage | Auth only |
| /notifications | NotificationsPage | Auth only |
| /documents | DocumentsPage | Auth only |
| /settings | SettingsPage | Auth only |
| /help | HelpPage | Auth only |
| /deals | DealsPage | Auth only |
| /chat | ChatPage | Auth only |
| /chat/:userId | ChatPage (specific user) | Auth only |

## How Auth Works
- No real backend — mock data lives in src/data/users.ts
- Login checks email + role against the mock users list
- Logged-in user is saved to localStorage
- Any component can get current user by calling useAuth()
- Two roles: entrepreneur and investor

## Data Types
| Type | What it represents |
|---|---|
| User | Base user (id, name, email, role, avatar, bio) |
| Entrepreneur | Extends User — adds startupName, industry, fundingNeeded |
| Investor | Extends User — adds investmentInterests, portfolioCompanies |
| Message | A single chat message between two users |
| ChatConversation | A full thread between two users |
| CollaborationRequest | Investor request to entrepreneur (pending/accepted/rejected) |
| Document | Uploaded file (name, type, size, url, ownerId) |

## Week 1 Checklist
- [x] Forked and cloned repo
- [x] Runs on localhost:5173
- [x] Architecture document written
- [ ] UI theme tokens set up
- [ ] Responsive layout verified (375px, 768px, 1280px)
- [ ] Pushed to GitHub
- [ ] Deployed to Vercel