# 📅 Guia de Atualização do Quadro de Horários (Template para os Próximos Anos)

Este documento foi criado para que você possa, a qualquer momento nos próximos anos, atualizar todo o quadro de horários, professores e disciplinas. Você pode simplesmente enviar a imagem do novo quadro e este arquivo para qualquer IA (como eu) e dizer: 

> *"Leia a nova imagem do quadro de horários e atualize as variáveis em `src/data/scheduleData.ts` seguindo as regras e o template de `INSTRUCOES_ATUALIZACAO_HORARIO.md`"*

---

## 🛠️ Como o Quadro está Organizado

Toda a lógica e os dados do aplicativo estão centralizados em [`src/data/scheduleData.ts`](file:///c:/Users/Escola/Downloads/product_for_asperustech/renatos-daily-clock/src/data/scheduleData.ts). Ele possui três partes principais que precisam ser atualizadas:

1. **Lista de Professores e Cores** (`TEACHER_METADATA`):
   Define as cores dos botões de cada professor e as matérias específicas que ele leciona.
2. **Matrizes Diárias** (`SEGUNDA_RAW`, `TERCA_RAW`, etc.):
   Tabelas simplificadas no formato de texto (linhas = tempos, colunas = turmas).
3. **Mapeamento de Horários e Tempos**:
   Horários dos tempos letivos (1º ao 7º tempo), recreio e almoço.

---

## 📝 Templates de Dados (Copiar e Colar para Atualizar)

### 1. Cadastro de Professores (`TEACHER_METADATA`)
Para cada professor novo, adicione ou remova no array de objetos seguindo a estrutura:

```typescript
export interface TeacherMeta {
  name: string;      // Nome em MAIÚSCULAS
  color: string;     // Cor em Hexadecimal (use tons vibrantes)
  subjects: string[]; // ['Principal', 'PIC', 'EO', 'PV', 'CL', etc.]
}
```

### 2. Matriz Simplificada de Horários (Segunda a Sexta)
Os horários diários são representados por arrays bidimensionais em que cada linha representa um tempo de aula e cada coluna representa uma turma na seguinte ordem de colunas:
**Colunas (Turmas):** `['701', '702', '801', '802', '901', '902']`

Exemplo de estrutura de um dia letivo:

```typescript
const SEGUNDA_RAW = [
  // 1º tempo: aulas de cada turma (701, 702, 801, 802, 901, 902)
  ['RENATO', 'JAQUELINE', 'MÁRCIA', 'LEANDRO', 'THAYANE PIC', 'THAÍS'],
  // 2º tempo
  ['RENATO', 'MÁRCIA', 'JAQUELINE', 'LEANDRO', 'THAÍS', 'THAYANE PIC'],
  // 3º tempo (após recreio)
  ['JAQUELINE', 'RENATO', 'LEANDRO', 'THAYANE', 'THAÍS', 'MÁRCIA'],
  // 4º tempo
  ['LEANDRO', 'RENATO', 'THAYANE', 'JAQUELINE', 'MÁRCIA', 'THAÍS'],
  // 5º tempo
  ['LEANDRO', 'THAYANE', 'RENATO', 'MÁRCIA', 'JAQUELINE', 'VAGO'],
  // 6º tempo (após almoço)
  ['THAYANE', 'LEANDRO', 'MÁRCIA', 'RENATO', 'VAGO', 'JAQUELINE'],
  // 7º tempo
  ['MÁRCIA', 'LEANDRO', 'THAYANE', 'VAGO', 'JAQUELINE', 'RENATO']
];
```

*Nota: Se a aula for uma disciplina complementar, inclua a sigla após o nome do professor separada por um espaço (ex: `'RENATO PIC'`, `'JULIA EO'`). Se a turma não tiver aula, escreva `'VAGO'` ou `'-'`.*

---

## 🤖 Prompt para Enviar à IA no Futuro

Quando você tiver a imagem ou tabela do novo horário, envie uma mensagem à IA com a imagem anexada usando este texto:

```text
Olá! Preciso atualizar o quadro de horários escolares do Ginásio Educacional Tecnológico Venezuela para o novo ano letivo. 

1. Leia a imagem anexa com a nova tabela de horários.
2. Identifique os professores de cada turma (colunas) em cada tempo (linhas).
3. Mapeie novos professores e suas cores no array TEACHER_METADATA.
4. Substitua as matrizes cruas (SEGUNDA_RAW, TERCA_RAW, etc.) no arquivo `src/data/scheduleData.ts`.
5. Use como referência as regras de parser do arquivo `INSTRUCOES_ATUALIZACAO_HORARIO.md`.
```

Qualquer IA lerá as imagens, aplicará a formatação exata e fará a substituição direta sem quebrar a lógica PWA ou 3D do seu app!
