# Bus Ticket Booking 🚌✨

**Bus Ticket Booking** is a modern, premium bus ticket booking platform designed for the Sri Lankan transport web ecosystem. It provides a seamless experience for passengers to book seats, view schedules, and manage their trips, while offering a powerful dashboard for administrators to manage the fleet and operations.

![Project Banner](public/og-image.png)

## 🚀 Key Features

### 🌍 For Passengers
- **Easy Booking**: Search for buses between major Sri Lankan cities (Colombo, Vauniya, Jaffna, etc.).
- **Interactive Seat Selection**: Visual seat map to pick your preferred spot.
- **E-Tickets**: Instant booking confirmation with QR Code tickets.
- **PDF Downloads**: Download high-quality PDF tickets for offline use.
- **Real-time Support**: 24/7 Chatbot assistance (**Powered by Creative Lab©**) to answer queries and connect with agents.
- **User Profiles**: Manage your profile and view your booking history.

### 🛡️ For Administrators
- **Comprehensive Dashboard**: Overview of revenue, bookings, and active buses.
- **Fleet Management**: Add, update, or remove buses (AC/Non-AC).
- **Route & Schedule Manager**: Define routes, stops, and departure times.
- **Booking Oversight**: View all passenger bookings and export reports.
- **Support Inbox**: Real-time chat interface to respond to customer inquiries.

## 🛠️ Technology Stack

This project is built using a modern, robust, and scalable tech stack:

- **Frontend Framework**: [React](https://reactjs.org/) (v18) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) for styling and [Framer Motion](https://www.framer.com/motion/) for animations.
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) for accessible and beautiful components.
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL) for:
  - Authentication (Email/Phone)
  - Database (Relational Data)
  - Real-time Subscriptions (Chat & Updates)
- **Icons**: [Lucide React](https://lucide.dev/)
- **State Management**: React Hooks & Context API.

## 🏁 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/nirosha-wheels-on-way.git
   cd nirosha-wheels-on-way
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env` file in the root directory and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:8080` to view the application.

## 📂 Project Structure

```
nirosha-wheels-on-way/
├── public/              # Static assets (images, icons)
├── src/
│   ├── components/      # Reusable UI components (Header, Footer, TicketView)
│   ├── hooks/           # Custom React hooks (useAuth, useAdminCheck)
│   ├── integrations/    # External service configurations (Supabase)
│   ├── lib/             # Utility functions and API calls
│   ├── pages/           # Application pages (Home, Admin, MyBookings)
│   ├── App.tsx          # Main application component & Routing
│   └── main.tsx         # Entry point
├── supabase/            # SQL scripts for database setup
└── package.json         # Dependencies and scripts
```

## 🔐 Database Setup

The project uses Supabase. You can find the necessary SQL scripts to set up the database tables (buses, routes, schedules, bookings, support_chats) in the `SUPABASE_CHAT_SETUP.sql` file or use the provided migrations.

## 🤝 Contributing



## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Designed an dDeveloped by Creative Lab©**  © 2026 All rights reserved.

Contact Via -- tkavishka101@gmail.com
LINKEDIN -- https://www.linkedin.com/in/kavishka-thilakarathna/
