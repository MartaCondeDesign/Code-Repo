# Design Repo — reglas de diseño

## Tipografía

- La interfaz utiliza Inter como tipografía principal.
- El código utiliza la familia monoespaciada definida en `--font-code`.
- Cuando la persona activa la ayuda de lectura, el contenido de interfaz utiliza OpenDyslexic; el código conserva su tipografía monoespaciada.
- El tamaño de lectura personalizado debe provocar wrap y crecimiento de los contenedores, nunca solapamiento ni texto oculto.

## Etiquetas grises pequeñas

Las etiquetas que nombran una capa, sección o tipo de contenido forman una sola categoría visual. Incluye, entre otras:

- `REPOSITORY`
- `VISUAL MAP`
- `FOUNDATIONS`
- `WHAT IT IS`
- `WHAT IT DOES`
- `CODE FILE`
- `RELATED TO`
- `PROJECT GUIDE`

Todas deben usar el estándar centralizado en `src/map.css`:

| Propiedad | Valor |
| --- | --- |
| Tamaño | `8px` |
| Peso | `800` |
| Interletrado | `1px` |
| Altura de línea | `1.25` |
| Color | `#6b7280` |
| Caja | Mayúsculas |

Los valores se almacenan en las variables `--meta-label-*`. No deben duplicarse ni alterarse de forma independiente en un componente.

## Botones

### Botón primario
El botón de acción principal (Mapear repositorio) usa fondo azul sólido `#2563eb` con texto blanco. Clase `.repo-btn`.

### Botón secundario
Los botones secundarios de acción auxiliar (Guide, Explícamelo de otra manera) tienen:

| Propiedad | Valor |
| --- | --- |
| Fondo | `#fff` |
| Borde | `1px solid #bfdbfe` (azul claro) |
| Texto | `#1d4ed8` |
| Hover borde | `#2563eb` |
| Hover fondo | `#eaf2ff` |

Ambos botones deben ser visualmente idénticos. No usar borde azul saturado en botones secundarios.

## Paneles redimensionables

Los paneles del workspace (árbol de repositorio y panel inspector) son redimensionables. Las barras de redimensionado son funcionales pero **no muestran ningún indicador visual** en estado de reposo. Solo cambia el cursor a `col-resize` al posicionarse sobre ellas.

## Comportamiento responsive

- Todo texto de interfaz debe poder hacer wrap dentro de su contenedor.
- Una traducción más larga puede aumentar la altura de su contenedor, pero no cambiar la tipografía ni desplazar otros controles fuera de la pantalla.
- Los paneles deben mantener scroll vertical cuando el contenido supera la altura disponible.
- Los bloques de código usan `pre-wrap` y nunca generan scroll horizontal.
