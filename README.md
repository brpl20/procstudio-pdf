# ProcStudio PDF

ProcStudio PDF is a powerful, open-source PDF editing platform based on [Stirling-PDF](https://github.com/Stirling-Tools/Stirling-PDF). Edit, sign, redact, convert, and automate PDFs without sending documents to external services.

## Overview

This is a clean fork of Stirling-PDF using only MIT-licensed components. Enterprise and proprietary features have been removed to create a fully open-source PDF processing platform.

## Key Features

- **50+ PDF Tools** - Merge, split, rotate, compress, OCR, watermark, and more
- **Conversion** - Office to PDF, PDF to images, HTML to PDF
- **Security** - Password protect, remove passwords, redact content
- **Forms** - Fill and flatten PDF forms
- **Automation** - Create processing pipelines with REST APIs
- **Multi-language** - Interface available in 40+ languages
- **Self-hosted** - Run locally or deploy on your own servers

## Quick Start

### Docker

```bash
docker build -t procstudio-pdf:latest .
docker run -p 8080:8080 procstudio-pdf:latest
```

Then open: http://localhost:8080

### Local Development

**Requirements:**
- Java 17+ (Java 21 recommended)
- Node.js 18+ (for frontend development)

**Backend:**
```bash
./gradlew clean build
./gradlew bootRun
```

**Frontend Development:**
```bash
cd frontend
npm install
npm run dev
```

## Architecture

- **Backend**: Spring Boot with PDFBox, LibreOffice integration
- **Frontend**: React + Vite + TypeScript + Mantine UI
- **PDF Processing**: PDFBox, PDF.js for rendering
- **Storage**: H2 database, IndexedDB for client-side caching
- **Deployment**: Docker (ultra-lite, standard, fat variants)

## Available PDF Tools

### Conversion
- Office documents to PDF
- PDF to images (PNG, JPG, TIFF)
- HTML to PDF

### Page Operations
- Merge multiple PDFs
- Split PDFs by page or range
- Rotate pages
- Extract specific pages
- Reorder pages

### Manipulation
- Compress PDFs
- OCR (extract text from scanned documents)
- Add/remove pages
- Add images and watermarks
- Add text overlays

### Security
- Password protect PDFs
- Remove password protection
- Redact sensitive content
- Edit metadata

### Forms & Metadata
- Fill PDF forms
- Flatten forms
- Edit PDF metadata
- Repair corrupted PDFs

### Automation
- REST APIs for all operations
- Pipeline workflows
- Batch processing

## Configuration

Configuration options are in `app/core/src/main/resources/application.properties`.

Key settings:
- `server.servlet.context-path` - Base URL path
- `spring.servlet.multipart.max-file-size` - Max upload size (default: 2000MB)
- `DOCKER_ENABLE_SECURITY` - Enable authentication (default: false)

## Development

See [CLAUDE.md](CLAUDE.md) for detailed development instructions including:
- Build commands
- Testing strategies
- Docker development
- Frontend architecture
- Tool development patterns

## License

ProcStudio PDF is licensed under the MIT License. See [LICENSE](LICENSE) for details.

**Based on Stirling-PDF** by Stirling Tools
Original project: https://github.com/Stirling-Tools/Stirling-PDF

## Attribution

This project is a fork of Stirling-PDF, using only the MIT-licensed core components. All proprietary features have been removed to create a fully open-source alternative.

We thank the Stirling-PDF team and community for creating the excellent foundation that makes this project possible.

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `./gradlew test`
5. Format code: `./gradlew spotlessApply`
6. Submit a pull request

## Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/procstudio-pdf/issues)
- **Documentation**: See [CLAUDE.md](CLAUDE.md) for technical details

## Deployment Options

### Docker Variants

**Ultra-lite** (minimal dependencies):
```bash
docker build -t procstudio-pdf:ultra-lite -f ./Dockerfile.ultra-lite .
```

**Standard** (full features):
```bash
docker build -t procstudio-pdf:latest -f ./Dockerfile .
```

**Fat** (air-gapped, includes all dependencies):
```bash
docker build -t procstudio-pdf:fat -f ./Dockerfile.fat .
```

### Environment Variables

- `DOCKER_ENABLE_SECURITY` - Enable authentication (true/false)
- `SYSTEM_ROOTURIPATH` - Base path for deployment (e.g., `/pdf`)
- `SYSTEM_CONNECTIONTIMEOUTMILLISECONDS` - Request timeout (default: 1200000)

## API Documentation

API documentation is auto-generated and available at:
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v1/api-docs`

## What's Different from Stirling-PDF?

**Removed:**
- Proprietary enterprise features
- Desktop application (Tauri builds)
- SSO/SAML authentication
- Advanced user management
- Audit logging
- Stripe integration
- Licensed signature features

**Kept (MIT Licensed):**
- All core PDF processing tools
- REST API endpoints
- React frontend with FileContext architecture
- Multi-language support
- Docker deployment
- Pipeline automation
- Basic authentication (optional)

## Roadmap

This is a community-driven fork. Future development depends on contributor interests and needs.

Potential areas for enhancement:
- Additional PDF processing tools
- Improved UI/UX customization
- Enhanced batch processing
- Custom plugin system
- Additional export formats

## Version

Current version: 1.0.0

Based on Stirling-PDF v2.1.3 (MIT-licensed components only)
