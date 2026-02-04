# Build ProcStudio PDF para Windows

Guia completo para compilar o aplicativo desktop Tauri no Windows.

## Pré-requisitos

### 1. Java JDK 21 (recomendado) ou 17+

- **Download:** https://adoptium.net/temurin/releases/
- Escolha: **Windows x64**, **JDK**, **.msi installer**
- Durante instalação, marque a opção para configurar `JAVA_HOME`

**Verificar instalação:**
```powershell
java --version
jlink --version
```

### 2. Node.js 18+

- **Download:** https://nodejs.org/
- Use a versão **LTS** (Long Term Support)

**Verificar instalação:**
```powershell
node --version
npm --version
```

### 3. Rust

- **Download:** https://rustup.rs/
- Execute o instalador `rustup-init.exe` e siga as instruções
- **Reinicie o terminal** após instalação

**Verificar instalação:**
```powershell
rustc --version
cargo --version
```

### 4. Visual Studio Build Tools

- **Download:** https://visualstudio.microsoft.com/visual-cpp-build-tools/
- Execute o instalador e selecione:
  - **"Desktop development with C++"**
- Isso instala o compilador MSVC necessário para dependências nativas do Tauri

### 5. WebView2 Runtime

- Geralmente já vem instalado no Windows 10/11
- Se necessário: https://developer.microsoft.com/en-us/microsoft-edge/webview2/

---

## Build

### 1. Clonar o repositório

```powershell
git clone https://github.com/brpl20/procstudio-pdf.git
cd procstudio-pdf
```

### 2. Build do JAR backend

```powershell
$env:DISABLE_ADDITIONAL_FEATURES = "true"
.\gradlew clean bootJar
```

### 3. Build do JLink (JRE customizado)

```powershell
.\scripts\build-tauri-jlink.bat
```

Este script:
- Analisa as dependências do JAR
- Cria um JRE mínimo (~50-60MB) com apenas os módulos necessários
- Copia tudo para `frontend/src-tauri/libs` e `frontend/src-tauri/runtime`

### 4. Build do Tauri

```powershell
cd frontend
npm install
npm run tauri build
```

---

## Artefatos gerados

Após o build, os instaladores estarão em:

```
frontend/src-tauri/target/release/bundle/
├── msi/
│   └── ProcStudio-PDF_2.0.0_x64_en-US.msi    # Instalador MSI
└── nsis/
    └── ProcStudio-PDF_2.0.0_x64-setup.exe    # Instalador NSIS
```

---

## Troubleshooting

### Erro: "jlink não encontrado"
- Certifique que instalou o **JDK** (não apenas JRE)
- Verifique se `%JAVA_HOME%\bin` está no PATH

### Erro: "MSVC not found"
- Instale o Visual Studio Build Tools com workload "Desktop development with C++"
- Reinicie o terminal/PowerShell

### Erro: "WebView2 not found"
- Instale o WebView2 Runtime manualmente
- https://developer.microsoft.com/en-us/microsoft-edge/webview2/

### Erro durante `npm run tauri build`
- Verifique se o JAR foi gerado em `app/core/build/libs/`
- Verifique se o JRE foi criado em `frontend/src-tauri/runtime/jre/`

---

## Desenvolvimento

Para desenvolvimento local com hot-reload:

```powershell
# Terminal 1: Backend
.\gradlew bootRun

# Terminal 2: Frontend Tauri
cd frontend
npm run tauri dev
```
