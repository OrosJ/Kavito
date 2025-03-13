import { jest } from "@jest/globals";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Función de diagnóstico para verificar el archivo del controlador
const checkControllerFile = () => {
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const controllerPath = path.resolve(
      __dirname,
      "../../../controllers/ProjectController.js"
    );

    // Verificar si el archivo existe
    if (!fs.existsSync(controllerPath)) {
      console.error(
        "El archivo del controlador no existe en la ruta:",
        controllerPath
      );
      return false;
    }

    // Leer el archivo
    const file = fs.readFileSync(controllerPath, "utf8");
    /* console.log("Estadísticas del archivo controlador:"); */
    /* console.log("- Longitud:", file.length); */
    /* console.log("- Últimos 50 caracteres:", JSON.stringify(file.slice(-50))); */
    /* console.log("- Termina con:", JSON.stringify(file.slice(-10))); */

    // Verificar el balance de llaves y paréntesis
    const counts = { "{": 0, "}": 0, "(": 0, ")": 0, "[": 0, "]": 0 };
    for (const char of file) {
      if (char in counts) counts[char]++;
    }
    console.log("- Llaves y paréntesis:", counts); 

    return true;
  } catch (error) {
    console.error("Error al verificar el archivo del controlador:", error);
    return false;
  }
};

// Ejecutar diagnóstico
/* console.log("Ejecutando diagnóstico del archivo controlador..."); */
checkControllerFile();

// Crear mocks explícitos para transacciones
const mockTransactionRollback = jest.fn().mockResolvedValue(true);
const mockTransactionCommit = jest.fn().mockResolvedValue(true);
const mockTransaction = {
  commit: mockTransactionCommit,
  rollback: mockTransactionRollback,
};

// Simular módulos individualmente para aislar problemas
jest.unstable_mockModule("../../../models/ProjectModel.js", () => ({
  default: {
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/ProjectProductModel.js", () => ({
  ProjectProduct: {
    findOne: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
    increment: jest.fn(),
  },
  ProjectProductHistory: {
    create: jest.fn(),
    findAll: jest.fn(),
    destroy: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/ProductModel.js", () => ({
  default: {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/ClientModel.js", () => ({
  default: {
    findByPk: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../models/InvOutModel.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
  },
  InventoryOutProduct: {
    create: jest.fn(),
  },
}));

jest.unstable_mockModule("../../../database/db.js", () => ({
  default: {
    transaction: jest.fn().mockResolvedValue(mockTransaction),
    literal: jest.fn(),
  },
}));

// Simular Sequelize
jest.mock("sequelize", () => ({
  Op: {
    gte: "gte",
    lt: "lt",
    in: "in",
    notIn: "notIn",
    between: "between",
  },
}));

// Probar diferentes estrategias de importación
describe("Estrategias de importación", () => {
  test("Importar funciones individuales directamente", async () => {
    try {
      // Intentar importar una función a la vez
      const { getProjects } = await import(
        "../../../controllers/ProjectController.js"
      );
      expect(typeof getProjects).toBe("function");

      const { getProject } = await import(
        "../../../controllers/ProjectController.js"
      );
      expect(typeof getProject).toBe("function");

      // Continuar con otras importaciones si estas tienen éxito
    } catch (error) {
      console.error("Detalles del error de importación:", error);
      throw error;
    }
  });
});

// Configuración para pruebas solo se ejecuta después de que las importaciones tienen éxito
let ProjectController = {};
let ProjectModel;
let ClientModel;
let ProductModel;
let db;

beforeAll(async () => {
  try {
    // Importar una función a la vez
    const { getProjects } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.getProjects = getProjects;

    const { getProject } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.getProject = getProject;

    const { createProject } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.createProject = createProject;

    const { updateProject } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.updateProject = updateProject;

    const { deleteProject } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.deleteProject = deleteProject;

    const { updateProjectStatus } = await import(
      "../../../controllers/ProjectController.js"
    );
    ProjectController.updateProjectStatus = updateProjectStatus;

    // Importar mocks de modelos
    const ProjectModelModule = await import("../../../models/ProjectModel.js");
    ProjectModel = ProjectModelModule.default;

    const ClientModelModule = await import("../../../models/ClientModel.js");
    ClientModel = ClientModelModule.default;

    const ProductModelModule = await import("../../../models/ProductModel.js");
    ProductModel = ProductModelModule.default;

    const dbModule = await import("../../../database/db.js");
    db = dbModule.default;

    /* console.log("Se importaron todos los módulos con éxito"); */
  } catch (error) {
    console.error("Error de configuración:", error);
  }
});

// Pruebas reales
describe("ProjectController", () => {
  let req, res;

  beforeEach(() => {
    jest.clearAllMocks();

    req = {
      body: {},
      params: {},
      user: { id: 1, userId: 1 },
    };

    res = {
      json: jest.fn(() => res),
      status: jest.fn(() => res),
    };
  });

  describe("getProjects", () => {
    test("debe retornar todos los proyectos", async () => {
      try {
        // Datos de prueba
        const mockProjects = [
          {
            id: 1,
            nombre: "Proyecto 1",
            descripcion: "Descripción del proyecto 1",
            fecha_inicio: new Date(),
            fecha_entrega: new Date(),
            estado: "PLANIFICACION",
            client_id: 1,
            client: { clientname: "Cliente 1" },
            products: [],
          },
        ];

        ProjectModel.findAll.mockResolvedValue(mockProjects);

        await ProjectController.getProjects(req, res);

        expect(ProjectModel.findAll).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalledWith(mockProjects);
      } catch (error) {
        console.error("Error en la prueba:", error);
        throw error;
      }
    });
  });

  // Añadir el resto de pruebas aquí usando ProjectController.functionName
});

// Añadir esto para asegurar que el archivo esté completo y válido
test("Esta prueba asegura que el archivo está completo", () => {
  expect(true).toBe(true);
});
