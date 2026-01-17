# feat: CTPS Compression and Digital Signing Workflow

## Overview

Add specialized CTPS (Carteira de Trabalho e Previdência Social) document processing features to ProcStudio PDF, including aggressive compression to meet the 5MB file size limit and integration with external A1 certificate signing API.

**Key Insight:** The existing compression infrastructure (`/api/v1/misc/compress-pdf`) already supports a target file size via `expectedOutputSize` parameter. This feature creates a streamlined CTPS-specific workflow that leverages existing capabilities.

## Problem Statement / Motivation

Brazilian labor documents (CTPS) often need to be:
1. **Compressed to under 5MB** for submission to government systems (eSocial, etc.)
2. **Digitally signed** with A1 certificates (ICP-Brasil) for legal validity
3. **OCR processed** when scanned from physical documents

Users currently need to manually chain multiple tools. A dedicated CTPS workflow would streamline this common Brazilian document processing use case.

## Proposed Solution

### Feature 1: CTPS Compression Endpoint

Create a specialized endpoint that wraps existing compression with CTPS-specific defaults:
- **Target size**: 5MB maximum
- **Aggressive optimization**: Level 7-9 for image-heavy scans
- **Grayscale conversion**: Optional (reduces size significantly)
- **OCR integration**: Optional pre-processing step

### Feature 2: A1 Signature Integration (Backend Proxy)

Create generic signing endpoints that proxy to the user's existing A1 signing API:
- **Upload + Sign flow**: Send PDF to external API, return signed PDF
- **Certificate validation**: Optional validation before signing
- **Configurable endpoint**: User will replace placeholder URLs with real API

### Feature 3: Combined CTPS Workflow (Frontend)

A single React tool that combines:
1. File upload with size validation
2. OCR (if needed for scanned documents)
3. Compression to 5MB target
4. A1 digital signature (via backend proxy)

## Technical Approach

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (React)                          │
├─────────────────────────────────────────────────────────────────┤
│  CTPSProcessor.tsx                                               │
│  ├── File Upload (max 100MB input)                              │
│  ├── OCR Toggle (optional)                                       │
│  ├── Compression Settings                                        │
│  │   ├── Target: 5MB (fixed for CTPS)                           │
│  │   ├── Grayscale: optional                                     │
│  │   └── Quality: auto-determined                                │
│  └── Sign Toggle (optional, uses external API)                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Backend (Spring Boot)                       │
├─────────────────────────────────────────────────────────────────┤
│  CTPSController.java                                             │
│  ├── POST /api/v1/ctps/compress                                 │
│  │   └── Wraps CompressController with 5MB target               │
│  ├── POST /api/v1/ctps/process (combined workflow)              │
│  │   ├── Step 1: OCR (if enabled)                               │
│  │   ├── Step 2: Compress to 5MB                                │
│  │   └── Step 3: Sign (if enabled, via proxy)                   │
│  └── POST /api/v1/signing/a1-proxy (generic signing proxy)      │
│       └── Forwards to configurable external API                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External A1 Signing API                       │
│                    (User's existing service)                     │
└─────────────────────────────────────────────────────────────────┘
```

### Implementation Phases

#### Phase 1: Backend CTPS Compression Endpoint

**Files to create:**

1. `app/core/src/main/java/stirling/software/SPDF/controller/api/misc/CTPSController.java`

```java
@RestController
@RequestMapping("/api/v1/ctps")
@Slf4j
@Tag(name = "CTPS", description = "CTPS Document Processing APIs")
@RequiredArgsConstructor
public class CTPSController {

    private final CompressController compressController;
    private final OCRController ocrController;
    private final CustomPDFDocumentFactory pdfDocumentFactory;

    @AutoJobPostMapping(value = "/compress", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Compress CTPS to 5MB limit")
    public ResponseEntity<byte[]> compressCTPS(@ModelAttribute CTPSCompressRequest request) {
        // Build OptimizePdfRequest with CTPS defaults
        OptimizePdfRequest optimizeRequest = new OptimizePdfRequest();
        optimizeRequest.setFileInput(request.getFileInput());
        optimizeRequest.setExpectedOutputSize("5MB");
        optimizeRequest.setOptimizeLevel(request.getOptimizeLevel() != null
            ? request.getOptimizeLevel() : 7); // Aggressive default
        optimizeRequest.setGrayscale(request.getGrayscale() != null
            ? request.getGrayscale() : false);

        return compressController.optimizePdf(optimizeRequest);
    }
}
```

2. `app/core/src/main/java/stirling/software/SPDF/model/api/ctps/CTPSCompressRequest.java`

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class CTPSCompressRequest extends PDFFile {

    @Schema(description = "Optimization level (7-9 recommended for CTPS)",
            defaultValue = "7", allowableValues = {"5", "6", "7", "8", "9"})
    private Integer optimizeLevel = 7;

    @Schema(description = "Convert to grayscale for maximum compression",
            defaultValue = "false")
    private Boolean grayscale = false;

    @Schema(description = "Apply OCR before compression", defaultValue = "false")
    private Boolean applyOcr = false;

    @Schema(description = "OCR language (if applyOcr is true)", defaultValue = "por")
    private String ocrLanguage = "por";
}
```

#### Phase 2: A1 Signing Proxy Endpoint

**Files to create:**

1. `app/core/src/main/java/stirling/software/SPDF/controller/api/signing/A1SigningProxyController.java`

```java
@RestController
@RequestMapping("/api/v1/signing")
@Slf4j
@Tag(name = "Signing", description = "Document Signing APIs")
@RequiredArgsConstructor
public class A1SigningProxyController {

    private final RestTemplate restTemplate;
    private final ApplicationProperties applicationProperties;

    @PostMapping(value = "/a1-proxy", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Sign PDF with A1 certificate via external API")
    public ResponseEntity<byte[]> signWithA1(@ModelAttribute A1SigningRequest request) {
        // TODO: Replace with real API endpoint
        String signingApiUrl = applicationProperties.getSigning().getA1ApiUrl();

        if (signingApiUrl == null || signingApiUrl.isBlank()) {
            throw new IllegalStateException("A1 signing API URL not configured");
        }

        // Forward to external signing API
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", request.getFileInput().getResource());
        body.add("certificatePassword", request.getCertificatePassword());
        // Add other parameters as needed

        HttpEntity<MultiValueMap<String, Object>> requestEntity =
            new HttpEntity<>(body, headers);

        ResponseEntity<byte[]> response = restTemplate.exchange(
            signingApiUrl,
            HttpMethod.POST,
            requestEntity,
            byte[].class
        );

        return response;
    }
}
```

2. `app/core/src/main/java/stirling/software/SPDF/model/api/signing/A1SigningRequest.java`

```java
@Data
@EqualsAndHashCode(callSuper = true)
public class A1SigningRequest extends PDFFile {

    @Schema(description = "A1 certificate password", format = "password",
            requiredMode = Schema.RequiredMode.REQUIRED)
    private String certificatePassword;

    @Schema(description = "Reason for signing")
    private String reason;

    @Schema(description = "Location where signing occurs")
    private String location;

    @Schema(description = "Show visible signature", defaultValue = "false")
    private Boolean showSignature = false;

    @Schema(description = "Page for visible signature (1-indexed)", defaultValue = "1")
    private Integer pageNumber = 1;
}
```

3. Add configuration to `ApplicationProperties.java`:

```java
@Data
public static class Signing {
    private String a1ApiUrl = ""; // User configures this
    private String a1ApiKey = "";
}
```

#### Phase 3: Frontend CTPS Tool

**Files to create:**

1. `frontend/src/hooks/tools/ctps/useCTPSParameters.ts`
2. `frontend/src/hooks/tools/ctps/useCTPSOperation.ts`
3. `frontend/src/components/tools/ctps/CTPSSettings.tsx`
4. `frontend/src/tools/CTPS.tsx`

Following the pattern from `ADDING_TOOLS.md`:

```typescript
// frontend/src/hooks/tools/ctps/useCTPSOperation.ts
export const ctpsOperationConfig = {
  toolType: ToolType.singleFile,
  buildFormData: buildCTPSFormData,
  operationType: 'ctps',
  endpoint: '/api/v1/ctps/compress',
  filePrefix: 'ctps_compressed_',
  defaultParameters,
} as const;
```

## Acceptance Criteria

### Functional Requirements

- [ ] **CTPS Compression Endpoint** (`/api/v1/ctps/compress`)
  - Accepts PDF files up to 100MB
  - Compresses to exactly 5MB or less
  - Returns error if 5MB target cannot be achieved
  - Supports grayscale conversion option
  - Supports optional OCR pre-processing

- [ ] **A1 Signing Proxy Endpoint** (`/api/v1/signing/a1-proxy`)
  - Forwards PDF to configurable external API
  - Handles certificate password securely
  - Returns signed PDF from external API
  - Proper error handling for API failures

- [ ] **Frontend CTPS Tool**
  - File upload with drag-and-drop
  - Real-time file size display
  - Compression progress indicator
  - Download compressed result
  - Integration with signing (optional toggle)

### Non-Functional Requirements

- [ ] Compression completes within 60 seconds for files up to 50MB
- [ ] Memory usage stays under 2GB during processing
- [ ] API endpoints follow existing Swagger documentation patterns

### Quality Gates

- [ ] All existing tests pass after changes
- [ ] New endpoints documented in Swagger
- [ ] Frontend tool follows `useToolOperation` pattern from `ADDING_TOOLS.md`
- [ ] Translations added to `frontend/public/locales/en-GB/translation.toml`

## Dependencies & Prerequisites

1. **Ghostscript** must be available for aggressive compression (already configured in Docker)
2. **Tesseract/OCRmyPDF** for OCR functionality (already configured)
3. **Portuguese language pack** (`por.traineddata`) for OCR (verify installation)
4. **External A1 signing API** must be available and documented

## File Changes Summary

### New Files

| File | Purpose |
|------|---------|
| `app/core/src/main/java/stirling/software/SPDF/controller/api/misc/CTPSController.java` | CTPS compression endpoint |
| `app/core/src/main/java/stirling/software/SPDF/model/api/ctps/CTPSCompressRequest.java` | Request model |
| `app/core/src/main/java/stirling/software/SPDF/controller/api/signing/A1SigningProxyController.java` | Signing proxy |
| `app/core/src/main/java/stirling/software/SPDF/model/api/signing/A1SigningRequest.java` | Signing request model |
| `frontend/src/hooks/tools/ctps/useCTPSParameters.ts` | Frontend parameters hook |
| `frontend/src/hooks/tools/ctps/useCTPSOperation.ts` | Frontend operation hook |
| `frontend/src/components/tools/ctps/CTPSSettings.tsx` | Settings component |
| `frontend/src/tools/CTPS.tsx` | Main CTPS tool component |

### Modified Files

| File | Change |
|------|--------|
| `app/common/src/main/java/stirling/software/common/model/ApplicationProperties.java` | Add `Signing` config class |
| `frontend/src/data/useTranslatedToolRegistry.tsx` | Register CTPS tool |
| `frontend/public/locales/en-GB/translation.toml` | Add translations |

## Risk Analysis

| Risk | Mitigation |
|------|------------|
| Compression cannot achieve 5MB | Auto-escalate optimization level up to 9, convert to grayscale, warn user if impossible |
| External signing API unavailable | Clear error message, allow user to download compressed PDF without signing |
| Large files cause memory issues | Leverage existing memory management patterns from `CompressController` |
| OCR increases file size | Apply OCR before compression, not after |

## References

### Internal References

- Compression implementation: `app/core/src/main/java/stirling/software/SPDF/controller/api/misc/CompressController.java:650`
- OCR implementation: `app/core/src/main/java/stirling/software/SPDF/controller/api/misc/OCRController.java:75`
- Tool development guide: `ADDING_TOOLS.md`
- Project conventions: `CLAUDE.md`

### External References

- Brazilian A1 certificates (ICP-Brasil): https://www.gov.br/iti/pt-br/assuntos/certificado-digital
- PDFBox compression: https://pdfbox.apache.org/
- Ghostscript PDF optimization: https://ghostscript.com/docs/VectorDevices.htm

## Notes

- The A1 signing proxy uses **placeholder URLs** - user will replace with their real API during implementation
- CTPS is specifically for Brazilian labor documents but the compression logic is generic
- Consider adding Portuguese translations (`pt-BR`) for better UX in Brazil
