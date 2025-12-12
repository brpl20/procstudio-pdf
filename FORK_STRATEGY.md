# Fork Strategy: Building Your PDF App from Stirling-PDF

## Overview
This document outlines the strategy for creating a derivative PDF application using only the MIT-licensed components of Stirling-PDF while excluding proprietary features.

---

## Phase 1: Repository Setup

### 1.1 Create Clean Fork
```bash
# Clone the repository
git clone https://github.com/Stirling-Tools/Stirling-PDF.git your-pdf-app
cd your-pdf-app

# Remove proprietary directories
rm -rf app/proprietary/
rm -rf frontend/src/proprietary/
rm -rf frontend/src/desktop/  # if exists

# Create .gitignore entries to prevent accidental inclusion
echo "app/proprietary/" >> .gitignore
echo "frontend/src/proprietary/" >> .gitignore
echo "frontend/src/desktop/" >> .gitignore
```

### 1.2 Update Branding
- Change application name in `build.gradle`
- Update `application.yml` configurations
- Replace logo files in `docs/` and `frontend/public/`
- Update README.md with your project information
- Modify package names from `stirling.software` to your namespace

### 1.3 License Compliance
- Keep MIT license file
- Add attribution to Stirling-PDF in your README
- Update copyright notices to include both original and your copyright

---

## Phase 2: Remove Proprietary Dependencies

### 2.1 Backend Cleanup

**Remove from `build.gradle`:**
- Any dependencies referencing `proprietary` modules
- Enterprise authentication libraries (if not needed)
- License validation dependencies

**Files to modify:**
- `SPDFApplication.java`: Remove proprietary feature flags
- `ConfigInitializer.java`: Remove enterprise config checks
- Remove security controllers that depend on proprietary code

**Environment variables to remove:**
- Enterprise license keys
- Proprietary feature flags
- SSO/SAML configurations

### 2.2 Frontend Cleanup

**Remove from `package.json`:**
- Stripe integration packages
- OAuth client libraries (if using proprietary implementation)

**Files to modify:**
- `frontend/src/main.tsx`: Remove proprietary context providers
- Remove imports from `frontend/src/proprietary/`
- Update routing to exclude proprietary routes

**Create stub replacements:**
```typescript
// frontend/src/contexts/AuthContext.tsx (simple replacement)
// Implement basic auth if needed, or make app fully public
```

---

## Phase 3: Available Features (MIT Licensed)

### 3.1 Core PDF Tools You Can Use
- **Conversion**: Office to PDF, PDF to images, HTML to PDF
- **Page Operations**: Merge, split, rotate, extract pages
- **Manipulation**: Compress, OCR, add/remove pages
- **Security**: Password protect, remove password, redact
- **Editing**: Add images, text, watermarks
- **Forms**: Fill, flatten forms
- **Metadata**: Edit PDF metadata
- **Repair**: Fix corrupted PDFs
- **Pipeline**: Automated workflows (basic version)

### 3.2 Architecture Components
- Spring Boot REST API
- React + Vite frontend
- FileContext state management
- IndexedDB persistence
- PDF.js rendering
- PDFBox processing
- LibreOffice integration
- Multi-language support (40+ languages)

### 3.3 Deployment Options
- Docker containers (ultra-lite, standard, fat)
- Docker Compose deployments
- Kubernetes support
- Native desktop builds (if you implement your own)

---

## Phase 4: Feature Implementation Strategy

### 4.1 What to Keep As-Is
- All PDF processing controllers in `app/core/src/main/java/.../controller/api/`
- Core services and utilities
- Frontend tool components in `frontend/src/tools/`
- FileContext and processing services
- API endpoints (non-enterprise)

### 4.2 What to Replace/Implement

**Simple Authentication (Optional):**
```java
// Implement basic Spring Security with in-memory or simple DB users
// OR make the app completely public (no auth required)
```

**Configuration:**
```yaml
# Simplified application.yml
your-app:
  name: "Your PDF App"
  security:
    enabled: false  # or implement simple auth
  features:
    # Enable only MIT-licensed features
```

**Frontend Adjustments:**
```typescript
// Remove proprietary tool references
// Update navigation menus
// Simplify settings (remove enterprise options)
```

### 4.3 Optional Enhancements
- Add your own analytics (not using proprietary audit system)
- Implement custom theming
- Add additional PDF tools
- Create your own API key system (if needed)
- Build desktop app using Tauri (MIT code only)

---

## Phase 5: Build Configuration

### 5.1 Gradle Modifications
```gradle
// Remove proprietary module references
// Update application name and version
// Ensure no proprietary dependencies
```

### 5.2 Docker Build Strategy

**Create simplified Dockerfile:**
```dockerfile
# Use Stirling's base approach but exclude proprietary features
# Build with DOCKER_ENABLE_SECURITY=false
# Ensure proprietary directories are not copied
```

**Docker Compose:**
```yaml
services:
  your-pdf-app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DOCKER_ENABLE_SECURITY=false
      - APP_NAME=YourPDFApp
    volumes:
      - ./configs:/configs
```

---

## Phase 6: Testing & Validation

### 6.1 Verify Clean Build
```bash
# Ensure no proprietary code is referenced
grep -r "proprietary" app/core/src/ frontend/src/
# Should return no results

# Build without errors
./gradlew clean build

# Run tests
./gradlew test
```

### 6.2 Docker Testing
```bash
# Build Docker image
docker build -t your-pdf-app:latest .

# Run container
docker run -p 8080:8080 your-pdf-app:latest

# Verify all core tools work
# Test: http://localhost:8080
```

### 6.3 Feature Validation
- Test all PDF tools you plan to use
- Verify no enterprise features are accessible
- Check that removed features don't break core functionality

---

## Phase 7: Ongoing Maintenance

### 7.1 Upstream Sync Strategy
```bash
# Add upstream remote
git remote add upstream https://github.com/Stirling-Tools/Stirling-PDF.git

# Sync MIT-licensed improvements (carefully)
git fetch upstream
git checkout -b sync-upstream
# Manually merge only core/ and non-proprietary changes
```

### 7.2 Contribution Back
- Bug fixes in MIT code can be contributed back
- New tools/features can be PR'd to upstream
- Maintain good relationship with Stirling community

---

## Phase 8: Deployment

### 8.1 Production Checklist
- [ ] All proprietary code removed
- [ ] Custom branding applied
- [ ] MIT license properly attributed
- [ ] Docker images built and tested
- [ ] Documentation updated
- [ ] Security hardening applied
- [ ] Monitoring/logging configured

### 8.2 Distribution
You can freely:
- Host as SaaS
- Sell as product
- Embed in other applications
- Modify and redistribute
- Create commercial offerings

**Attribution requirement:** Include MIT license notice

---

## Quick Start Commands

```bash
# 1. Clone and clean
git clone https://github.com/Stirling-Tools/Stirling-PDF.git my-pdf-app
cd my-pdf-app
rm -rf app/proprietary/ frontend/src/proprietary/

# 2. Build
./gradlew clean build

# 3. Run locally
./gradlew bootRun

# 4. Or run with Docker
docker build -t my-pdf-app:latest .
docker run -p 8080:8080 my-pdf-app:latest
```

---

## Legal Considerations

### What You Must Do
- Include MIT license text
- Attribute Stirling-PDF
- Keep copyright notices

### What You Cannot Do
- Use proprietary code without paid license
- Claim the code is entirely your own
- Remove existing license/copyright notices

### What You Can Do
- Use commercially
- Modify freely
- Distribute/sell
- Keep modifications private
- Sublicense

---

## Support & Resources

- **Original Docs**: https://docs.stirlingpdf.com
- **API Reference**: Use Swagger UI at `/swagger-ui/index.html`
- **Community**: Consider joining Discord for general PDF processing questions
- **Code Reference**: Study the MIT-licensed code for architecture patterns

---

## Success Metrics

Your fork is successful when:
- Builds without proprietary dependencies
- All core PDF tools function correctly
- Can deploy via Docker
- No license violations
- Properly attributed
- Documented for your team/users
