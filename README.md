# ProofMesh

ProofMesh es una plataforma **evidence-first** para auditar cambios de código antes de publicarlos. Cada auditoría calcula seis puntuaciones —backend, frontend, utilidad, relevancia, potencial e identidad— y las confronta mediante tres nodos y tres niveles: integridad, política y riesgo.

> **Regla de aprobación:** un cambio solo pasa si los seis criterios alcanzan 10/10 y los nueve controles de cada criterio pasan en los tres nodos. No existe una vía de excepción.

## Flujo de auditoría

```text
Nombre + descripción + diff/código + criterios
                         ↓
             Hash SHA-256 del payload
                         ↓
        6 criterios × 3 nodos × 3 niveles
                         ↓
                Gate estricto 10/10
                         ↓
          Aprobado/rechazado + informe JSON
```

El backend utiliza React 19, TypeScript, tRPC, Express, Drizzle y MySQL/TiDB. La interfaz pública presenta el método, el formulario de envío y el historial autenticado. Los informes guardan el hash del payload, evidencia textual por nivel, estado de cada nodo, puntuación global y motivo de rechazo.

## Inicio local

```bash
pnpm install
pnpm check
pnpm test
pnpm build
pnpm dev
```

La variable `DATABASE_URL` permite persistir auditorías. La autenticación utiliza el flujo OAuth incluido en el template de ProofMesh. No se incluyen secretos en el repositorio.

## Contrato de exportación JSON

El procedimiento `audits.exportJson` devuelve un objeto JSON nativo apto para consumo directo por pipelines. El informe contiene `payloadHash`, `globalScore`, `status`, `criteria`, `approverNodes`, `rejectionReason` y `createdAt`. Cada criterio contiene los resultados de `node-a`, `node-b` y `node-c`, y cada nodo conserva los niveles `integrity`, `policy` y `risk`.

## Licencia

ProofMesh se distribuye bajo licencia MIT. Consulta [LICENSE](LICENSE), [SECURITY.md](SECURITY.md) y [CONTRIBUTING.md](CONTRIBUTING.md) para las normas del proyecto.
