# Readme Creator

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mhmdwaelanwr@gmail.com) [![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/mhmdwaelanwr)

Here are a few improved versions, focusing on conciseness and professionalism:

**Option 1 (Concise & Direct):**

> Advanced Readme Creator is a powerful, intuitive, cross-platform application that streamlines the creation of professional `README.md` files. Leverage its visual drag-and-drop editor, AI-powered generation, and extensive customization options to rapidly craft comprehensive and engaging project documentation.

**Option 2 (Benefit-Focused):**

> Advanced Readme Creator simplifies and accelerates the creation of professional `README.md` files across desktop, web, and mobile. With a powerful visual drag-and-drop editor, AI-powered content generation, and extensive customization, you can design comprehensive and engaging READMEs in minutes.

**Option 3 (Very Concise):**

> Advanced Readme Creator is a powerful, cross-platform application for generating professional `README.md` files. Its visual drag-and-drop editor, AI capabilities, and customization options enable rapid creation of comprehensive and engaging project documentation.

## Features

*   **Visual Drag-and-Drop Editor**: Build your README by dragging and dropping various elements like headings, paragraphs, images, code blocks, lists, tables, badges, and more directly onto a live canvas.
*   **Live Markdown Preview**: Instantly see how your Markdown will render with a side-by-side live preview.
*   **AI-Powered Generation**:  **Generate from Codebase (AI)**: Automatically create an initial README by scanning your local project folder or a public GitHub repository using the Google Gemini AI.  **AI Assistant for Text**: Improve, fix grammar, or generate descriptions for text elements using AI.
*   **Comprehensive Element Library**: Includes specialized elements such as:  **GitHub Stats**: Display dynamic badges for stars, forks, issues, and licenses of your repository.  **Contributors**: Generate a grid or list of project contributors.  **Social Links**: Easily add customizable social media badges (GitHub, LinkedIn, Twitter/X, YouTube, etc.).  **Dev Icons**: Include popular technology and language icons from DevIcons.  **Embeds**: Integrate content from GitHub Gists, CodePen, and YouTube.  **Mermaid Diagrams**: Create flowcharts, sequence diagrams, and more with Mermaid.js syntax.  **Table of Contents**: Automatically generate a clickable table of contents based on your headings.  **Collapsible Sections**: Organize content with expandable/collapsible `<details>` sections.
*   **Theming & Customization**: Supports light/dark themes and allows customization of project-wide colors, list bullet styles, and section spacing.
*   **Social Preview Designer**: Craft and export visually appealing social media preview images (Open Graph/Twitter Card) for your project.
*   **GitHub Actions Generator**: Automate your README updates with pre-configured GitHub Actions workflows.
*   **Project Management**:  Save and load projects to a local library.  Create and restore local snapshots of your workspace.  Import existing Markdown files or raw Markdown content from URLs.  Export projects as JSON, Markdown, HTML, or a ZIP archive containing all generated files (including `LICENSE` and `CONTRIBUTING.md`).
*   **Keyboard Shortcuts**: Accelerate your workflow with a wide array of keyboard shortcuts for common actions and element insertion.
*   **Health Check**: Analyze your README for potential issues like missing alt text, broken links, or incorrect heading hierarchy.
*   **Internationalization**: Available in multiple languages (Arabic, German, English, Spanish, French, Hindi, Japanese, Portuguese, Russian, Chinese).

## Tech Stack

This application is built with **Flutter** using **Dart**. Key libraries and tools include:

*   **Frontend Framework**: Flutter
*   **State Management**: Provider
*   **AI Integration**: Google Generative AI (`google_generative_ai`)
*   **Markdown Parsing/Generation**: `markdown` library, custom `MarkdownGenerator`
*   **Code Highlighting**: `flutter_highlight` (with Dracula and GitHub themes)
*   **File Operations**: `file_picker`, `path_provider`, `archive`, `share_plus`
*   **UI/UX Enhancements**: `tutorial_coach_mark` (for onboarding), `google_fonts`, `flutter_colorpicker`, `font_awesome_flutter`, `flutter_svg`, `cached_network_image`
*   **Networking**: `http`, `url_launcher`
*   **Local Storage**: `shared_preferences`
*   **Utility**: `uuid`, `path`, `printing` (for PDF export)
*   **Linting**: `flutter_lints`

## Installation Instructions

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   **Flutter SDK**: Ensure you have Flutter installed and configured. You can find instructions [here](https://flutter.dev/docs/get-started/install).
*   **Dart SDK**: Included with Flutter.

### Clone the repository

```bash
git clone https://github.com/mhmdwaelanwr/Readme-Creator.git
cd Readme-Creator

```

### Install Dependencies

```bash
flutter pub get

```

### Setup Assets (Optional, for Native Apps)

Here are a few improved versions, focusing on professionalism and conciseness:

**Option 1 (Direct & Professional):**
> For native platform deployments (Android, iOS, Windows, Linux, macOS), configure application icons and splash screens.

**Option 2 (Benefit-Oriented, slightly more descriptive):**
> To ensure a polished and branded experience on native platforms (Android, iOS, Windows, Linux, macOS), configure application icons and splash screens.

**Option 3 (Very Concise):**
> Native builds (Android, iOS, Windows, Linux, macOS) require application icon and splash screen configuration.

1.  Place your desired app icon at `assets/icon/icon.png`.
2.  Place your desired splash screen image at `assets/splash/splash.png`.
3.  Run the following commands to generate platform-specific icons and splash screens:`dart run flutter_launcher_icons
dart run flutter_native_splash:create
`

### Run the Application

```bash
flutter run

```

This will launch the application on your default configured device (e.g., Chrome for web, or a desktop app).

### AI and GitHub Integration Setup (Optional)

To enable AI features and enhance GitHub API rate limits:

1.  **Gemini API Key**: For AI generation from codebase and text improvement features, obtain a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and enter it in the app's AI Settings.
2.  **GitHub Personal Access Token**: For higher rate limits when scanning public GitHub repositories, generate a [Personal Access Token](https://github.com/settings/tokens) (with `repo` scope for private repos, or no specific scope for public repos) and enter it in the app's AI Settings.

## Usage Guide

1.  **Start a New Project**: Upon opening, you can either start with a blank canvas or load a pre-built template from the "Templates" dropdown in the top action bar.
2.  **Add Elements**: Use the **Components Panel** on the left (or accessible via drawer on mobile) to drag and drop various Markdown elements onto the central **Editor Canvas**.
3.  **Edit Elements**: Click on any element in the **Editor Canvas** to select it. Its properties will appear in the **Settings Panel** on the right (or accessible via drawer on mobile). Here, you can modify text, URLs, levels, lists, and other specific attributes for the selected element.
4.  **Reorder Elements**: Drag and drop elements within the **Editor Canvas** to reorder them, or use the "Move Up" / "Move Down" buttons in the element settings.
5.  **Live Preview**: The **Settings Panel** also includes a "Preview" tab to show the raw Markdown output for the currently selected element. For a full README preview, enable "Show Live Preview" from the top action bar.
6.  **AI Features**: Utilize the AI Assistant button (purple magic wand icon) on text-based elements or the "Generate from Codebase (AI)" option in the "More Options" menu for advanced generation.
7.  **Customize Project Settings**: Access project-wide settings (variables, license, contributing guide, colors, formatting) via the settings icon in the action bar.
8.  **Export Your README**: Once your README is complete, click the "Download" icon in the top right corner. You can export as `.md`, `.html`, or a `.zip` file that includes `README.md`, `LICENSE`, `CONTRIBUTING.md`, and any local images.
9.  **Keyboard Shortcuts**: Press `F1` or `Ctrl + H` (⌘ + H on Mac) to view a list of available keyboard shortcuts.

## Project Structure

The project follows a standard Flutter application structure:

```
.
├── lib/
│   ├── core/                  # Core application components (constants, theme)
│   ├── generator/             # Logic for generating Markdown, Licenses
│   ├── l10n/                  # Localization (internationalization) files
│   ├── models/                # Data models for README elements, projects, snippets
│   ├── providers/             # State management using Provider
│   ├── screens/               # Main screens and navigation
│   ├── services/              # API services (AI, GitHub, GIPHY) and local scanning
│   ├── utils/                 # Utility functions (templates, exporter, downloader, onboarding, dialogs)
│   └── widgets/               # Reusable UI components (panels, canvas items, forms)
├── assets/                    # Application assets (icons, splash screens)
├── test/                      # Unit and widget tests
├── analysis_options.yaml      # Dart/Flutter linting rules
├── CONTRIBUTING.md            # Guidelines for contributing to this project
├── devtools_options.yaml      # DevTools settings
├── l10n.yaml                  # Localization configuration
├── pubspec.yaml               # Project dependencies and metadata
└── README.md                  # Project overview (this file)

```

## Contributing Guidelines

We welcome contributions to the Advanced Readme Creator! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) file for details on how to contribute, including guidelines for setting up your development environment, coding standards, and the pull request process.

## License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.

Copyright (c) 2026 Mohamed Anwar 