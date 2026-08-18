# Project TODO

- [x] Motor de puntuación individual 0-10 para backend, frontend, utilidad, relevancia, potencial e identidad.
- [x] Gate estricto 3 nodos × 3 niveles: integridad, política y riesgo, con validaciones independientes.
- [x] Rechazar cualquier cambio que no alcance 10/10 en todos los criterios, nodos y niveles mediante todos los resultados reales.
- [x] Formulario de envío con nombre, descripción, diff/código y selección de criterios.
- [x] Persistencia de auditorías e historial con estado, puntuación y desglose.
- [x] Informe detallado con hash, evidencia textual por nivel, nodos aprobadores y motivos de rechazo.
- [x] Exportación JSON nativo para pipelines externos.
- [x] Landing pública e identidad visual distintiva de ProofMesh.
- [x] Pruebas Vitest del motor, router API y casos de aprobación/rechazo 10/10.
- [x] Verificación visual responsive del panel y landing.
- [x] README, licencia MIT, CI y release inicial para GitHub.

- [ ] Auditar críticamente la implementación publicada frente a los requisitos originales.
- [ ] Verificar que la puntuación representa evidencia real y no heurísticas engañosas.
- [ ] Verificar que el flujo de GitHub y la automatización solicitada existen realmente.
- [ ] Corregir todos los fallos confirmados y añadir pruebas de regresión.
- [ ] Revalidar la aplicación y publicar una corrección solo después de las pruebas.
- [ ] Corregir el CI publicado que falló por conflicto de versiones de pnpm.
- [ ] Dejar explícita la diferencia entre validadores deterministas locales y nodos independientes reales.
- [ ] Añadir un gate de Pull Request que ejecute la auditoría de ProofMesh de forma reproducible.
