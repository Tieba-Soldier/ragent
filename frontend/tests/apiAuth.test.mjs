import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = readFileSync(new URL("../src/services/api.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source.replace("import.meta.env.VITE_API_BASE_URL", '""'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
}).outputText;

function loadApi() {
  let token = "test-token";
  const api = {
    defaults: { headers: { common: {} } },
    interceptors: {
      request: {
        use(handler) {
          this.handler = handler;
        }
      },
      response: {
        use(success, failure) {
          this.success = success;
          this.failure = failure;
        }
      }
    }
  };
  const storage = {
    getToken: () => token,
    clearAuth: () => {
      token = null;
    }
  };
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    require(name) {
      if (name === "axios") return { __esModule: true, default: { create: () => api } };
      if (name === "sonner") return { toast: { error() {} } };
      if (name === "@/utils/storage") return { storage };
      throw new Error(`Unexpected import: ${name}`);
    },
    window: { location: { pathname: "/login", href: "/login" } }
  });
  return {
    api,
    setAuthToken: exports.setAuthToken,
    clearToken: () => {
      token = null;
    }
  };
}

test("HTTP 401 clears Authorization before another request", async () => {
  const { api, setAuthToken } = loadApi();
  setAuthToken("test-token");
  await assert.rejects(
    api.interceptors.response.failure({ response: { status: 401 }, message: "expired" })
  );
  assert.equal(api.defaults.headers.common.Authorization, undefined);
  const next = api.interceptors.request.handler({ headers: { Authorization: "test-token" } });
  assert.equal(next.headers.Authorization, undefined);
});

test("application auth expiry clears Authorization", async () => {
  const { api, setAuthToken } = loadApi();
  setAuthToken("test-token");
  await assert.rejects(
    api.interceptors.response.success({ data: { code: "401", message: "未登录" } })
  );
  assert.equal(api.defaults.headers.common.Authorization, undefined);
});

test("missing stored token removes a stale request header", () => {
  const { api, clearToken } = loadApi();
  clearToken();
  const next = api.interceptors.request.handler({ headers: { Authorization: "test-token" } });
  assert.equal(next.headers.Authorization, undefined);
});
