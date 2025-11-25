# Субагенты проекта Notes

## Матрица агентов

| Агент | Назначение | Приоритет | Когда использовать |
|-------|------------|-----------|-------------------|
| `admin-lab-builder` | Timing calibration tool | CRITICAL | Spacebar capture, timeline editor |
| `player-enhancer` | Waveform, animations | HIGH | Web Audio API, touch gestures |
| `data-integrator` | API, dynamic routing | HIGH | CRUD, file upload, Prisma |
| `test-engineer` | Test suite >80% | MEDIUM | Unit/integration tests |
| `design-polisher` | Accessibility, polish | MEDIUM | WCAG, responsive, UX |

## Использование

```
Запусти <agent-name> для <задача>
```

Примеры:
- `Запусти admin-lab-builder для создания timing calibration tool`
- `Запусти player-enhancer для добавления waveform visualization`
- `Запусти data-integrator для fix dynamic routing`

## Общие правила всех агентов

### MCP File System (обязательно)
```
✅ Read(file_path)      - чтение файлов
✅ Grep(pattern, path)  - поиск в коде
✅ Glob(pattern)        - поиск файлов
✅ Write(file_path)     - создание файлов
✅ Edit(file_path)      - редактирование

❌ НЕ использовать Bash для:
- cat/head/tail → Read()
- grep/rg → Grep()
- find/ls → Glob()
- echo > → Write()
```

### Workflow
1. Analyze - прочитать связанные файлы
2. Plan - составить план изменений
3. Test First - написать тесты (TDD)
4. Implement - реализовать
5. Verify - проверить (npm test, npm run dev)
6. Report - устно в чат (НЕ .md файлы!)

### Safety
- Минимальные diffs
- Не ломать существующий функционал
- Не редактировать .env

## Рекомендуемый порядок

**Phase 1: Foundation**
1. `data-integrator` - fix API и routing
2. `test-engineer` - setup test infrastructure

**Phase 2: Core**
3. `admin-lab-builder` - timing calibration
4. `player-enhancer` - waveform и gestures

**Phase 3: Polish**
5. `design-polisher` - accessibility и polish
