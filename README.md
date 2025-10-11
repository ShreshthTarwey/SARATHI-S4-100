🎓✨ SARATHI — Supportive Assistive Reach for Accessible Teaching & Holistic Inclusion

"Every child deserves to learn, express, and dream — regardless of ability."

🌈 About SARATHI

SARATHI (Supportive Assistive Reach for Accessible Teaching & Holistic Inclusion) is a visionary initiative dedicated to transforming education for children with disabilities — including those who are deaf, blind, mute, autistic, or have Down syndrome.

SARATHI acts as a digital companion and guide, enabling communication, expression, and learning through a blend of AI, accessibility, and playful interaction.

It’s not just a website — it’s a movement for inclusive learning, bridging the gap between special needs education and modern technology.

🧭 Our Mission

To empower differently-abled children with a joyful, accessible, and personalized digital education environment — where learning feels like play and every child feels seen, heard, and understood.

💡 What SARATHI Aims to Do

SARATHI brings inclusivity to the core of education by offering:

👁️‍🗨️ Accessible Communication Tools

For children who are visually, vocally, or hearing impaired, SARATHI offers intuitive systems like:

🗣️ Speech-to-text and text-to-speech converters

🎧 Voice navigation and hover-based audio guidance

🌐 AI-powered translation & communication bridge between users with different impairments

🧩 Learning Through Play (Gamified Education)

For children with Down Syndrome and Autism Spectrum Disorder (ASD), SARATHI includes interactive educational games aligned with a school-certified syllabus — designed in collaboration with educators and therapists.

These games focus on:

🧠 Improving cognitive abilities and motor coordination

👥 Enhancing social understanding through fun, visual experiences

🌟 Building confidence and curiosity through reward-based progress

🧠 AI-Powered Adaptation

SARATHI intelligently adapts to each learner’s needs and preferences:

⚙️ Adjusts difficulty levels based on progress

👁️ Uses voice feedback and visual cues tailored to sensory capabilities

🕹️ Encourages independent exploration through assistive hints

🎯 Our Vision

To make SARATHI a universal inclusive learning ecosystem, where technology becomes a teacher, translator, and friend for every child — creating classrooms without barriers and communication without limits.

Because inclusion isn’t a feature — it’s the foundation of education.

🪄 Key Highlights
Category	Feature
🎧 Accessibility	Speech & text communication bridge for visually and vocally impaired students
🎮 Gamified Learning	Curriculum-based interactive games for Down Syndrome & Autism learners
🗣️ Voice Commands	Navigate and learn through voice inputs
🧏 Instant Translation	Converts speech/text between different disabilities seamlessly
🌍 Dual Interface	Custom UI flows for deaf vs blind users, automatically adapted
💫 AI Personalization	Smart learning path based on user’s abilities & engagement
💬 Real-time Connection	Socket-based communication for live interactive learning
🖌️ Design Philosophy

SARATHI embraces a playful yet accessible visual language —
bright colors, clear typography, large touch targets, and animated feedback make learning fun, safe, and intuitive for all users.

Every design choice — from glowing icons to responsive voices — carries one principle:

👉 Learning should be accessible to everyone, everywhere.

🌍 Impact Vision

🎓 Empower 1M+ differently-abled children with inclusive education tools

💬 Bridge communication gaps in classrooms and homes

🧩 Provide educators with AI-driven teaching aids

❤️ Build confidence and independence in special-needs learners

🤝 In Collaboration With

Educators • Therapists • Accessibility Experts • AI Developers

Together, we’re creating an ecosystem that redefines what inclusive education means in the digital era.

💫 In Essence

SARATHI is more than a platform.
It’s a friend, a teacher, and a voice of hope for every child who learns differently — guiding them step by step towards a brighter, more inclusive future.

🌟 "When technology becomes compassionate, learning becomes limitless."

⚙️ Project Setup Guide

Follow the steps below to run SARATHI locally on your machine.

🧱 Tech Stack

Frontend: Next.js + React.js + Tailwind CSS

Backend: Node.js (Next.js API Routes)

Database: MongoDB (via Mongoose)

Language: JavaScript / JSX

AI & Accessibility APIs: SpeechSynthesis, SpeechRecognition, Custom ML/AI modules

Real-time Communication: Socket.io

🚀 Getting Started
1️⃣ Clone the Repository
git clone https://github.com/<your-username>/sarathi.git
cd sarathi

2️⃣ Install Dependencies

Make sure Node.js (>=18) and npm or yarn are installed.

npm install
# or
yarn install

3️⃣ Create Environment File

In the project root, create a .env.local file and add your MongoDB connection string and other required environment variables:

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/sarathi
NEXT_PUBLIC_APP_NAME=SARATHI


🧩 If you’re using other APIs (like text-to-speech, translation, or socket servers), include them here too.

4️⃣ Run the Development Server
npm run dev
# or
yarn dev


Then visit 👉 http://localhost:3000

You should see the SARATHI home page up and running! 🎉

5️⃣ Build for Production (Optional)

When ready for deployment:

npm run build
npm start

🗂️ Project Structure
sarathi/
│
├── public/                 # Static assets (icons, images, videos)
├── pages/                  # Next.js pages & API routes
│   ├── api/                # Backend API routes (MongoDB, Socket.io, etc.)
│   └── index.jsx           # Main landing page
│
├── components/             # Reusable UI components
├── styles/                 # Global and Tailwind styles
├── lib/                    # Utility functions & DB connection
├── models/                 # MongoDB schemas (Mongoose)
├── package.json
├── tailwind.config.js
├── next.config.js
└── .env.local              # Environment configuration

🧠 Developer Notes

All accessibility features (speech synthesis, recognition, hover guidance) are powered using Web Speech API and custom handlers.

MongoDB stores user data, progress, and accessibility preferences.

The app uses Next.js API Routes to handle backend logic — no separate Express server needed.

Tailwind CSS ensures responsive, accessible, and vibrant UI design.

🧑‍💻 Contributing

We welcome all developers, educators, and accessibility enthusiasts to contribute.

Fork the repository

Create your feature branch (git checkout -b feature/awesome-feature)

Commit your changes (git commit -m "Add new accessibility feature")

Push to the branch (git push origin feature/awesome-feature)

Open a Pull Request 🚀

📄 License

This project is licensed under the MIT License — feel free to use, modify, and distribute with attribution.

🏁 Final Note

SARATHI stands as a bridge between technology and empathy, ensuring that every learner, regardless of ability, gets a chance to shine. 🌈

✨ Together, let’s build a future where inclusion is the default — not an option.
