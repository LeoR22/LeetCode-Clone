# ADR-004: Implementación de React para Frontend

**Estado:** Aceptado  
**Fecha:** Febrero 2026  
**Decisores:** Tech Lead Frontend, Arquitecto de Software  

---

## Contexto y Problema

Se necesita construir una interfaz de usuario moderna para LeapCode con:
- **Editor de código** con syntax highlighting
- **Interfaz responsiva** para diferentes dispositivos
- **Navegación fluida** entre problemas
- **Experiencia interactiva** con feedback inmediato
- **Actualización dinámica** sin recargas de página

### Opciones Consideradas:
- **Opción A:** React
- **Opción B:** Vue.js
- **Opción C:** Angular
- **Opción D:** Svelte

---

## Decisión

**Seleccionamos React** como biblioteca de frontend por:

### Razones Principales:
1. **Ecosistema más grande** del mercado
2. **Monaco Editor** (VSCode editor) se integra nativamente con React
3. **Component-based architecture** ideal para UI modular
4. **Virtual DOM** para renders eficientes
5. **Comunidad masiva** y recursos abundantes

---

## Justificación

### Ventajas de React:

#### 1. **Integración con Monaco Editor**
```jsx
import Editor from '@monaco-editor/react';

function CodeEditor({ language, value, onChange }) {
  return (
    <Editor
      height="500px"
      language={language}
      value={value}
      onChange={onChange}
      theme="vs-dark"
      options={{
        minimap: { enabled: false },
        fontSize: 14,
        automaticLayout: true
      }}
    />
  );
}
```
- Editor de nivel profesional (mismo que VSCode)
- Syntax highlighting automático
- IntelliSense y autocompletado
- Múltiples temas

#### 2. **Arquitectura de Componentes**
```jsx
// Estructura modular
<App>
  <Navbar />
  <ProblemsList>
    <ProblemCard />
    <ProblemCard />
  </ProblemsList>
  <CodeEditor />
  <ResultsPanel />
</App>
```
- Reutilización de código
- Separación de responsabilidades
- Mantenibilidad alta

#### 3. **Single Page Application (SPA)**
```jsx
import { BrowserRouter, Route, Routes } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/problems" element={<ProblemsPage />} />
        <Route path="/problems/:id" element={<ProblemDetail />} />
        <Route path="/editor" element={<CodeEditor />} />
      </Routes>
    </BrowserRouter>
  );
}
```
- Navegación sin recargas
- Transiciones suaves
- Mejor UX

#### 4. **State Management**
```jsx
import { useState, useEffect } from 'react';

function CodeEditorPage() {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRunCode = async () => {
    setLoading(true);
    const result = await executeCode(code);
    setOutput(result.output);
    setLoading(false);
  };

  return (
    // UI components
  );
}
```
- Hooks para manejo de estado
- Context API para estado global
- Simplicidad vs Redux (no necesario aún)

#### 5. **Ecosistema Rico**
- **React Router:** Navegación SPA
- **Axios:** HTTP client
- **Material-UI / Tailwind:** Componentes UI
- **React Query:** Caché y sincronización de datos
- **React Testing Library:** Testing

### Comparación con Alternativas:

#### **Vue.js:** ❌ Rechazado
**Pros:**
- Curva de aprendizaje más suave
- Template syntax familiar
- Buen performance

**Contras:**
- Ecosistema más pequeño que React
- Menos recursos para Monaco Editor
- Menor cantidad de librerías de terceros
- Menor pool de desarrolladores

**Razón:** React tiene mejor integración con herramientas de código (Monaco) y ecosistema más robusto.

#### **Angular:** ❌ Rechazado
**Pros:**
- Framework completo con todo incluido
- TypeScript por defecto
- Arquitectura muy estructurada

**Contras:**
- Muy pesado y complejo para SPA simple
- Curva de aprendizaje empinada
- Overhead de configuración
- Exceso de abstracción

**Razón:** Demasiado complejo para las necesidades actuales. React ofrece flexibilidad sin complejidad.

#### **Svelte:** ❌ Rechazado
**Pros:**
- Muy rápido (sin virtual DOM)
- Código más conciso
- Bundle size pequeño

**Contras:**
- Ecosistema joven y pequeño
- Menos recursos y tutoriales
- Menor pool de desarrolladores
- Integración limitada con herramientas enterprise

**Razón:** Muy nuevo y riesgoso para proyecto que necesita estabilidad. React es más seguro.

---

## Consecuencias

### Positivas:
✅ **Gran comunidad:** Fácil encontrar soluciones  
✅ **Ecosistema maduro:** Librerías para todo  
✅ **Monaco Editor:** Mejor editor de código  
✅ **Performance:** Virtual DOM optimiza renders  
✅ **Hiring:** Fácil encontrar desarrolladores React  
✅ **Documentación:** Recursos abundantes  

### Negativas:
❌ **Bundle size:** Más grande que alternativas (Svelte)  
❌ **Opciones infinitas:** Puede causar "decision fatigue"  
❌ **JSX learning curve:** Sintaxis diferente a HTML puro  
❌ **Tooling complejo:** Webpack, Babel (mitigado con CRA/Vite)  

---

## Implementación

### Estructura del Proyecto React:

```
src/
├── App.jsx                 # Componente raíz
├── index.js                # Entry point
├── components/
│   ├── Navbar.jsx
│   ├── ProblemCard.jsx
│   ├── CodeEditor.jsx
│   ├── ResultsPanel.jsx
│   └── LoadingSpinner.jsx
├── pages/
│   ├── HomePage.jsx
│   ├── ProblemsPage.jsx
│   ├── ProblemDetailPage.jsx
│   └── EditorPage.jsx
├── services/
│   └── api.js              # Axios API calls
├── hooks/
│   └── useCodeExecution.js # Custom hook
├── styles/
│   └── globals.css
└── utils/
    └── validators.js
```

### Stack Tecnológico Frontend:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.11.0",
    "@monaco-editor/react": "^4.5.1",
    "axios": "^1.4.0",
    "@mui/material": "^5.13.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.0",
    "vite": "^4.3.9",
    "eslint": "^8.42.0"
  }
}
```

### Ejemplo de Componente Clave:

```jsx
// CodeEditor.jsx
import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';

function CodeEditor({ problem }) {
  const [code, setCode] = useState(problem.boilerplate);
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const executeCode = async () => {
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/execute', {
        code,
        language: 'python',
        testCases: problem.testCases
      });
      setOutput(response.data.output);
    } catch (error) {
      setOutput('Error: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="code-editor-container">
      <Editor
        height="60vh"
        defaultLanguage="python"
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
      />
      
      <button onClick={executeCode} disabled={loading}>
        {loading ? 'Running...' : 'Run Code'}
      </button>
      
      <div className="output-panel">
        <h3>Output:</h3>
        <pre>{output}</pre>
      </div>
    </div>
  );
}

export default CodeEditor;
```

### Build y Despliegue:

```bash
# Desarrollo local
npm run dev            # Vite dev server (HMR rápido)

# Producción
npm run build          # Genera bundle optimizado
npm run preview        # Preview del build

# Deploy a Vercel
vercel --prod
```

---

## Optimizaciones Aplicadas

### 1. **Code Splitting**
```jsx
import { lazy, Suspense } from 'react';

const EditorPage = lazy(() => import('./pages/EditorPage'));

<Suspense fallback={<LoadingSpinner />}>
  <EditorPage />
</Suspense>
```

### 2. **Memoization**
```jsx
import { useMemo, useCallback } from 'react';

const MemoizedEditor = React.memo(CodeEditor);

const handleSubmit = useCallback(() => {
  submitCode(code);
}, [code]);
```

### 3. **Vite en lugar de Create React App**
- Startup instantáneo
- Hot Module Replacement ultra-rápido
- Build optimizado con Rollup

---

## Referencias
- [React Documentation](https://react.dev/)
- [Monaco Editor React](https://github.com/suren-atoyan/monaco-react)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

---

**Estado:**  Implementado  
**Próxima Revisión:** Q3 2026  
**Tech Stack Review:** Anual
