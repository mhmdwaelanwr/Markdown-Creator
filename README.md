# Readme Creator

[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mhmdwaelanwr@gmail.com)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/mhmdwaelanwr)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![Flutter](https://img.shields.io/badge/Flutter-%2302569B.svg?style=for-the-badge&logo=Flutter&logoColor=white)](https://flutter.dev/)
[![Dart](https://img.shields.io/badge/dart-%230175C2.svg?style=for-the-badge&logo=dart&logoColor=white)](https://dart.dev/)
[![Platforms](https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux%20%7C%20Web%20%7C%20Android%20%7C%20iOS-blue?style=for-the-badge)](https://flutter.dev/multi-platform)

**Readme Creator** is the ultimate developer tool for crafting stunning, professional `README.md` files in minutes. Stop wrestling with Markdown syntax and start documenting your projects with style and efficiency.

Leveraging a powerful visual drag-and-drop editor, AI-powered content generation, and extensive customization options, Readme Creator empowers developers, open-source contributors, and technical writers to focus on their code while ensuring their documentation makes a lasting impression.

## 🚀 Why Readme Creator?

*   **⏱️ Save Time**: What takes hours manually takes minutes with our intuitive drag-and-drop interface.
*   **✨ Professional Quality**: Ensure every project you ship has top-tier documentation that impresses recruiters and users.
*   **🧠 AI-Assisted**: Let AI handle the heavy lifting—summarizing code, fixing grammar, and generating descriptions.
*   **📱 Cross-Platform**: Experience a seamless workflow across Desktop (Windows, macOS, Linux), Web, and Mobile (Android, iOS).

## 🎥 Demo & Screenshots

| **Editor Canvas** | **Live Preview** |
|:---:|:---:|
| ![Editor Canvas](assets/screenshots/editor.png) | ![Live Preview](assets/screenshots/preview.png) |
*(Placeholders - Add your screenshots in `assets/screenshots/`)*

## ✨ Features

*   **🎨 Visual Drag-and-Drop Editor**: Build your README by dragging and dropping elements like headings, images, code blocks, lists, tables, and badges directly onto a live canvas.
*   **👁️ Live Markdown Preview**: Instantly see how your Markdown will render with a side-by-side live preview.
*   **🤖 AI-Powered Generation**:
    *   **Generate from Codebase**: Automatically create an initial README by scanning your local project folder or a public GitHub repository using Google Gemini AI.
    *   **AI Assistant**: Improve text, fix grammar, or generate descriptions for specific elements.
*   **📚 Comprehensive Element Library**:
    *   **GitHub Stats**: Dynamic badges for stars, forks, and issues.
    *   **Contributors**: Generate grids or lists of project contributors.
    *   **Social Links**: Customizable social media badges.
    *   **Dev Icons**: Popular technology and language icons.
    *   **Embeds**: Integrate GitHub Gists, CodePen, and YouTube.
    *   **Mermaid Diagrams**: Create flowcharts and diagrams.
    *   **Table of Contents**: Auto-generated clickable TOC.
*   **🎨 Theming & Customization**: Light/Dark modes, custom colors, bullet styles, and spacing.
*   **🖼️ Social Preview Designer**: Create visually appealing Open Graph/Twitter Card images.
*   **⚙️ GitHub Actions Generator**: Automate README updates with pre-configured workflows.
*   **💾 Project Management**: Save/load projects, create snapshots, import existing Markdown, and export as JSON, Markdown, HTML, or ZIP.
*   **⌨️ Keyboard Shortcuts**: Speed up your workflow with extensive shortcuts.
*   **🏥 Health Check**: Analyze your README for issues like missing alt text or broken links.
*   **🌍 Internationalization**: Available in 10+ languages including Arabic, English, Spanish, French, and Japanese.

## 🛠️ Tech Stack

Built with **Flutter** and **Dart**.

*   **Frontend**: Flutter
*   **State Management**: Provider
*   **AI**: Google Generative AI SDK
*   **Markdown**: `markdown` package, custom generators
*   **Utils**: `file_picker`, `archive`, `share_plus`, `printing`

## 🚀 Getting Started

### Prerequisites

*   **Flutter SDK**: [Install Flutter](https://flutter.dev/docs/get-started/install)
*   **Dart SDK**: Included with Flutter

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/mhmdwaelanwr/Readme-Creator.git
    cd Readme-Creator
    ```

2.  **Install Dependencies**
    ```bash
    flutter pub get
    ```

3.  **Run the Application**
    ```bash
    flutter run
    ```

### AI & GitHub Setup (Optional)

To unlock full AI capabilities and higher GitHub API limits:
1.  **Gemini API Key**: Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey) and enter it in **Settings > AI Settings**.
2.  **GitHub Token**: Generate a [Personal Access Token](https://github.com/settings/tokens) and enter it in **Settings > AI Settings**.

## 📖 Usage

1.  **Start**: Create a blank project or load a template.
2.  **Drag & Drop**: Use the **Components Panel** to add elements.
3.  **Edit**: Click an element to customize its properties in the **Settings Panel**.
4.  **Preview**: Toggle "Live Preview" to see the result.
5.  **Export**: Click the download icon to export your `README.md` and related files.

## 🗺️ Roadmap

- [ ] **Cloud Sync**: Sync projects across devices using Google Drive/Dropbox.
- [ ] **Team Collaboration**: Real-time collaborative editing.
- [ ] **Custom Templates**: Create and share your own templates with the community.
- [ ] **Plugin System**: Extend functionality with community plugins.

## 📂 Project Structure

```
lib/
├── core/          # Constants, themes
├── generator/     # Markdown & License generation logic
├── l10n/          # Localization files
├── models/        # Data models
├── providers/     # State management
├── screens/       # UI Screens
├── services/      # API services (AI, GitHub)
├── utils/         # Helpers (export, download, dialogs)
└── widgets/       # Reusable UI components
```

## 🤝 Contributing

Contributions are welcome! We want to make Readme Creator the best tool for developers. Please read our [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests.

## 💖 Support

If you find this project useful, please consider giving it a ⭐ on GitHub! It helps others find the project and motivates further development.

## 🛡️ Security

For security issues, please refer to our [Security Policy](SECURITY.md).

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

## 🌐 Connect with the Developer

<div align="center">

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/mhmdwaelanwr)
[![GitLab](https://img.shields.io/badge/GitLab-FC6D26?style=for-the-badge&logo=gitlab&logoColor=white)](https://gitlab.com/mhmdwaelanwr)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mhmdwaelanwr)
[![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:mhmdwaelanwr@gmail.com)
[![PayPal](https://img.shields.io/badge/PayPal-00457C?style=for-the-badge&logo=paypal&logoColor=white)](https://paypal.me/mhmdwaelanwar)

[![YouTube](https://img.shields.io/badge/YouTube-FF0000?style=for-the-badge&logo=youtube&logoColor=white)](https://youtube.com/@mhmdwaelanwr)
[![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/mhmdwaelanwr)
[![Telegram](https://img.shields.io/badge/Telegram-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/mhmdwaelanwr)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/201010412724)

[![Facebook](https://img.shields.io/badge/Facebook-1877F2?style=for-the-badge&logo=facebook&logoColor=white)](https://facebook.com/mhmdwaelanwr)
[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/mhmdwaelanwr)
[![Threads](https://img.shields.io/badge/Threads-000000?style=for-the-badge&logo=threads&logoColor=white)](https://www.threads.net/@mhmdwaelanwr)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://tiktok.com/@mhmdwaelanwr)
[![Snapchat](https://img.shields.io/badge/Snapchat-FFFC00?style=for-the-badge&logo=snapchat&logoColor=black)](https://www.snapchat.com/add/mhmdwaelanwr)

[![Reddit](https://img.shields.io/badge/Reddit-FF4500?style=for-the-badge&logo=reddit&logoColor=white)](https://reddit.com/user/mhmdwaelanwar)
[![Twitch](https://img.shields.io/badge/Twitch-9146FF?style=for-the-badge&logo=twitch&logoColor=white)](https://twitch.tv/mhmdwaelanwr)
[![Spotify](https://img.shields.io/badge/Spotify-1ED760?style=for-the-badge&logo=spotify&logoColor=white)](https://open.spotify.com/user/mhmdwaelanwr)

</div>

---

<div align="center">
  Developed with ❤️ by <a href="https://github.com/mhmdwaelanwr">Mohamed Anwar</a>
</div>

