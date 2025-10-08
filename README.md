# Language Learning Platform

A comprehensive language learning application built with Next.js, Supabase, Tailwind CSS, and shadcn/ui components. This platform offers multiple interactive tools to help users improve their language skills with optional progress tracking.

## ✨ Features

### Guest & Authenticated Modes
- **Guest Mode**: Access all features without creating an account
- **Full Access Mode**: Login to unlock progress tracking and personalized dashboard
- **Progress Persistence**: All user activity is saved to Supabase when logged in

### Core Services

#### 1. 🔄 Conversions
Various language conversion tools to help with text transformation and formatting.

#### 2. 📝 Quizzes
Interactive quizzes across different subjects to test and improve language proficiency:
- Multiple subjects available
- Track your scores and improvement over time (logged-in users)
- Instant feedback on answers

#### 3. 🗣️ Pronunciation Practice
Learn proper pronunciation with audio guidance:
- Practice individual words
- Work on full sentences
- Audio playback for reference

#### 4. 📚 Vocabulary Builder
Expand your vocabulary systematically:
- Learn new words daily
- Organized by difficulty and topic
- Track learned vocabulary (logged-in users)

### 📊 Dashboard (Logged-in Users)
- View your learning progress across all services
- Track quiz scores and completion rates
- Monitor vocabulary growth
- See pronunciation practice history

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (React framework)
- **Database & Auth**: [Supabase](https://supabase.com/) (Backend-as-a-Service)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (Utility-first CSS)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Re-usable components)
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd <project-directory>
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes (protected)
│   ├── conversions/       # Conversion tools
│   ├── quiz/              # Quiz feature
│   ├── pronunciation/     # Pronunciation practice
│   └── vocabulary/        # Vocabulary builder
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions
│   ├── supabase/        # Supabase client & helpers
│   └── ...
├── public/              # Static assets
└── styles/              # Global styles
```

## 🗄️ Database Schema

### Users Progress Table
Stores user learning progress when logged in:
- Quiz scores and completion
- Vocabulary learned count
- Pronunciation practice sessions
- Conversion tool usage

## 🔐 Authentication

- Powered by Supabase Auth
- Supports email/password authentication
- Optional social login providers
- Guest mode available for trying features

## 🎨 Customization

The project uses Tailwind CSS for styling and shadcn/ui for components. You can customize:
- Theme colors in `tailwind.config.js`
- Component styles in respective component files
- Global styles in `globals.css`

## 📱 Responsive Design

Fully responsive design that works seamlessly on:
- Desktop computers
- Tablets
- Mobile devices

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🐛 Bug Reports

If you discover any bugs, please create an issue on GitHub with detailed information about the problem.

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using Next.js and Supabase