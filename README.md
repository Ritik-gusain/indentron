# 🚀 Indentron - Smart Code Formatter

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://indentron.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-black?style=for-the-badge&logo=github)](https://github.com/Ritik-gusain/indentron)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

A professional code formatter with modern glassmorphism UI and support for 12+ programming languages. Built with Node.js, Express, and vanilla JavaScript with stunning animations and VS Code-inspired dark theme.

## Features

- **Multi-language Support**: JavaScript, TypeScript, Python, Java, C, C++, C#, JSON, CSS, HTML
- **Real-time Processing**: Instant formatting with live statistics
- **VS Code Theme**: Dark editor with syntax highlighting
- **Modern UI**: Glassmorphism design with smooth animations
- **Professional Structure**: Enterprise-level code organization

## 🎯 Live Demo

**Try it now:** [https://indentron.vercel.app](https://indentron.vercel.app)

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/Ritik-gusain/indentron.git
   cd indentron
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory 


4. **Start development server**
   ```bash
   cd packages/indentron
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Production Deployment

```bash
npm start
```

## How to Use

1. **Select Language**: Choose your programming language from the dropdown
2. **Choose Action**: 
   - **Format**: Clean up indentation and structure
   - **Beautify**: Add extra spacing for readability

3. **Paste Code**: Enter your code in the input area
4. **Click Format**: Process your code instantly
5. **Copy Result**: Get your formatted code from the output area

## Supported Languages

- **JavaScript/TypeScript**: Template literal support, proper indentation, string handling. Basic support for TypeScript syntax.
- **Python**: PEP 8 compliant formatting with proper indentation
- **Java/C/C++/C#**: C-style formatting with brace alignment, comment preservation
- **JSON**: Pretty printing with proper structure
- **CSS**: Clean stylesheet formatting with proper nesting
- **HTML**: Proper tag indentation and self-closing tag handling

## API Usage

### Format Code
```bash
POST /format
Content-Type: application/json

{
  "code": "function hello(){console.log('world')}",
  "language": "javascript",
  "action": "format"
}
```

### Get Supported Languages
```bash
GET /languages
```

### Health Check
```bash
GET /health
```

### Get Analytics
```bash
GET /analytics
```

### Share Code
```bash
POST /share
Content-Type: application/json

{
  "code": "function hello(){console.log('world')}",
  "language": "javascript"
}
```

### Get Shared Code
```bash
GET /share/:id
```

### Upload File
```bash
POST /upload
Content-Type: multipart/form-data

(File attached with key 'codeFile')
```

See [API Documentation](docs/API.md) for complete details.

## Project Structure

```
Indentron/
├── config/
│   └── config.js                    # Application configuration
├── docs/
│   └── API.md                      # API documentation
├── public/
│   └── index.html                  # Frontend with VS Code theme
├── src/
│   ├── controllers/
│   │   ├── FormatController.js     # Request handling logic
│   │   ├── ShareController.js      # Handles sharing logic
│   │   └── FileUploadController.js # Handles file uploads
│   ├── services/
│   │   └── FormatterService.js     # Core formatting algorithms
│   ├── routes/
│   │   ├── formatRoutes.js         # Formatting routes
│   │   ├── shareRoutes.js          # Sharing routes
│   │   └── fileUploadRoutes.js     # File upload routes
│   └── utils/
│       └── logger.js               # Logging utility
├── package.json                    # Dependencies and scripts
├── README.md                       # Project documentation
└── server.js                       # Express server entry point
```

## Architecture

- **MVC Pattern**: Controllers handle requests, services contain business logic
- **Modular Design**: Separated concerns for better maintainability
- **Configuration Management**: Centralized settings in config folder
- **Professional Logging**: Structured logging with timestamps
- **API Documentation**: Complete endpoint documentation

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📸 Screenshots

### Main Interface
![Indentron Interface](https://via.placeholder.com/800x400/667eea/ffffff?text=Indentron+Interface)

### Code Formatting in Action
![Code Formatting](https://via.placeholder.com/800x400/764ba2/ffffff?text=Code+Formatting)

## 🌟 Star History

[![Star History Chart](https://api.star-history.com/svg?repos=Ritik-gusain/indentron&type=Date)](https://star-history.com/#Ritik-gusain/indentron&Date)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ritik Gusain**
- GitHub: [@Ritik-gusain](https://github.com/Ritik-gusain)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/ritik-gusain-7640a9334/)

## 🙏 Acknowledgments

- Inspired by modern code editors like VS Code
- Built with love for the developer community
- Special thanks to all contributors

---

⭐ **If you found this project helpful, please give it a star!** ⭐
