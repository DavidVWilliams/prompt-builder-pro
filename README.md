# promptbuilderpro

Prompt Builder Pro (Anthropic Edition) 🧠✨

Prompt Builder Pro is a high-performance workspace designed to help developers and AI enthusiasts craft robust, reliable, and sophisticated prompts. This tool translates the core philosophies discussed by the Anthropic Prompt Engineering Team (Amanda Askell, David Hershey, Zack Witten, and Alex) into a functional, iterative environment.

🚀 The Philosophy

Based on the expert roundtable "AI Prompt Engineering: A Deep Dive," this app is built on four central pillars of effective prompting:

Externalize the Brain: Don't just give the model a role; give it your full context. If an "educated layperson" couldn't do the task with your instructions, the AI shouldn't be expected to either.

The Temp Agency Test: Treat the AI like a highly competent temp worker who knows the world but knows nothing about your company's internal jargon or hidden assumptions.

Give it an Out: Robust prompts include instructions on what to do when things go wrong (e.g., using <unsure> tags).

Concept Over Format: Few-shot examples should be diverse and illustrative to teach the AI the logic of a task, rather than just a rote pattern.

🛠 Features

Externalize Brain Mode: Transforms messy, raw thoughts into structured, professional prompts with clear constraints and context.

Temp Agency Mode: Acts as a critic to identify jargon, missing information, and implicit assumptions that might cause a model to fail.

Edge Case Red-Team: Anticipates failure modes (like empty data or malformed inputs) and suggests specific "fail-safe" language to add to your prompt.

Illustrative Examples: Generates highly diverse few-shot examples to anchor the model’s understanding of complex tasks.

💻 Tech Stack

Frontend: React 18 (via CDN)

Styling: Tailwind CSS (with Typography plugin)

Icons: Lucide Icons

AI Core: Powered by the Gemini 2.5 Flash Preview API

📦 Deployment to GitHub Pages

This application is designed as a single-file static site, making it perfect for free hosting on GitHub Pages.

Create a new repository on GitHub.

Upload the index.html file.

Go to Settings > Pages and enable deployment from the main branch.

Your expert prompting assistant is live!

Inspired by the Anthropic Prompt Engineering Roundtable. Designed for those who seek to eke out the top 0.1% of AI performance.
