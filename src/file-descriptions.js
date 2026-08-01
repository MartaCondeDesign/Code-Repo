export function getFileExplanation(path, lang, matchedNode, fileContent) {
  if (matchedNode) {
    return lang === "es"
      ? `Este archivo forma parte de **${matchedNode.title}**. ${matchedNode.what}`
      : `This file is part of **${matchedNode.title}**. ${matchedNode.what_en || matchedNode.what}`;
  }

  const filename = path.split("/").pop();
  const ext = filename.split(".").pop().toLowerCase();

  if (filename === "package.json") {
    return lang === "es"
      ? "Define las dependencias de Node.js, scripts de ejecución del proyecto y metadatos básicos de compilación."
      : "Defines Node.js dependencies, project execution scripts, and basic build metadata.";
  }
  if (filename === "package-lock.json") {
    return lang === "es"
      ? "Registra el árbol exacto de dependencias de npm instalado para garantizar compilaciones reproducibles."
      : "Records the exact npm dependency tree installed to guarantee reproducible builds.";
  }
  if (filename === "vite.config.js" || filename === "vite.config.ts") {
    return lang === "es"
      ? "Configuración de Vite: define plugins, puertos, proxies y la integración del servidor auxiliar de análisis."
      : "Vite configuration: defines plugins, ports, proxies, and the auxiliary analyzer server integration.";
  }
  if (filename === "tsconfig.json" || filename === "jsconfig.json") {
    return lang === "es"
      ? "Configuración del compilador de TypeScript o ajustes de ruta para JavaScript en el editor."
      : "TypeScript compiler configuration or JavaScript path mapping settings for the editor.";
  }
  if (filename === "AGENTS.md") {
    return lang === "es"
      ? "Instrucciones de trabajo y flujos recomendados para los agentes de IA en este repositorio."
      : "Working instructions and recommended workflows for AI agents in this repository.";
  }
  if (ext === "md") {
    if (fileContent) {
      const lines = fileContent.split("\n");
      let title = "";
      let firstParagraph = "";
      for (let line of lines) {
        line = line.trim();
        if (!line) continue;
        if (line.startsWith("#")) {
          if (!title) {
            title = line.replace(/^#+\s*/, "");
          }
        } else if (!line.startsWith("`") && !line.startsWith("-") && !line.startsWith("*") && !line.startsWith("[") && !line.startsWith("!")) {
          if (!firstParagraph) {
            firstParagraph = line;
          }
        }
        if (title && firstParagraph) break;
      }
      if (title || firstParagraph) {
        let description = lang === "es"
          ? `Documentación Markdown.`
          : `Markdown documentation.`;
        if (title) {
          description += lang === "es"
            ? ` Título: **${title}**.`
            : ` Title: **${title}**.`;
        }
        if (firstParagraph) {
          description += ` ${firstParagraph}`;
        }
        if (description.length > 250) {
          description = description.slice(0, 247) + "...";
        }
        return description;
      }
    }
    return lang === "es"
      ? `Documentación en Markdown. Explica guías, arquitectura o detalles de implementación relacionados con ${filename}.`
      : `Markdown documentation. Explains guides, architecture, or implementation details related to ${filename}.`;
  }
  if (ext === "css" || ext === "scss" || ext === "sass") {
    return lang === "es"
      ? `Hoja de estilos CSS. Define la presentación visual, variables de diseño y clases asociadas a ${filename}.`
      : `CSS stylesheet. Defines the visual presentation, design variables, and classes associated with ${filename}.`;
  }
  if (["js", "jsx", "ts", "tsx", "mjs"].includes(ext)) {
    if (path.includes("server/")) {
      return lang === "es"
        ? `Archivo de código del servidor API auxiliar (${filename}) que implementa la clonación y análisis de repositorios.`
        : `Server API code file (${filename}) implementing repository cloning and analysis.`;
    }
    return lang === "es"
      ? `Archivo de código fuente de JavaScript/TypeScript (${filename}) que implementa la lógica o componentes de la aplicación.`
      : `JavaScript/TypeScript source code file (${filename}) implementing application logic or components.`;
  }
  if (filename.startsWith(".")) {
    return lang === "es"
      ? `Archivo de configuración oculto (${filename}) del entorno de desarrollo o control de versiones.`
      : `Hidden environment or version control configuration file (${filename}).`;
  }

  return lang === "es"
    ? `Archivo ${filename} en el repositorio. Contiene datos o código auxiliar necesario para el proyecto.`
    : `File ${filename} in the repository. Contains data or auxiliary code required for the project.`;
}

export function getFolderExplanation(path, lang) {
  const folderName = path.split("/").pop().toLowerCase();
  
  const FOLDER_PURPOSES = {
    src: ["Contiene el código fuente principal de la aplicación.", "Contains the main source code of the application."],
    app: ["Organiza las pantallas, rutas y lógica principal de la aplicación.", "Organizes the screens, routes, and main logic of the application."],
    components: ["Agrupa piezas reutilizables de interfaz de usuario (UI).", "Groups reusable user interface (UI) building blocks."],
    packages: ["Separa los paquetes, módulos e integraciones independientes del repositorio.", "Separates package directories, modules, and independent integrations in the repository."],
    public: ["Recursos estáticos expuestos directamente (imágenes, fuentes, iconos).", "Static assets served directly (images, fonts, icons)."],
    server: ["Lógica del lado del servidor, controladores API e integraciones de backend.", "Server-side logic, API handlers, and backend integrations."],
    docs: ["Reúne manuales, guías y documentación de arquitectura del proyecto.", "Gathers manuals, guides, and project architecture documentation."],
    test: ["Pruebas unitarias, de integración o historias de verificación de comportamiento.", "Unit/integration tests or behavior verification stories."],
    tests: ["Pruebas unitarias, de integración o historias de verificación de comportamiento.", "Unit/integration tests or behavior verification stories."],
    scripts: ["Herramientas de desarrollo, compilación automatizada y scripts auxiliares.", "Developer tooling, build automation, and auxiliary helper scripts."],
    "node_modules": ["Contiene los paquetes y dependencias externas instaladas a través de npm.", "Contains external dependency packages installed via npm."],
    dist: ["Código de producción compilado y optimizado listo para desplegar.", "Compiled and optimized production code ready for deployment."],
    build: ["Código compilado listo para su distribución.", "Compiled distribution-ready code."],
  };

  if (FOLDER_PURPOSES[folderName]) {
    return lang === "es" ? FOLDER_PURPOSES[folderName][0] : FOLDER_PURPOSES[folderName][1];
  }

  return lang === "es"
    ? `Carpeta del proyecto para agrupar archivos relacionados con la sección o módulo "${folderName}".`
    : `Project directory to group files belonging to the "${folderName}" section or module.`;
}

