export function parseCsv(input: string) {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let insideQuotes = false;

  for (let index = 0; index < input.length; index += 1) {
    const char = input[index];
    const nextChar = input[index + 1];

    if (insideQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        index += 1;
        continue;
      }

      if (char === '"') {
        insideQuotes = false;
        continue;
      }

      currentField += char;
      continue;
    }

    if (char === '"') {
      insideQuotes = true;
      continue;
    }

    if (char === ",") {
      currentRow.push(currentField);
      currentField = "";
      continue;
    }

    if (char === "\n") {
      currentRow.push(currentField.replace(/\r$/, ""));
      rows.push(currentRow);
      currentRow = [];
      currentField = "";
      continue;
    }

    currentField += char;
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.replace(/\r$/, ""));
    rows.push(currentRow);
  }

  if (rows.length === 0) {
    return [];
  }

  const [header, ...dataRows] = rows;
  return dataRows
    .filter((row) => row.some((field) => field.trim().length > 0))
    .map((row) =>
      Object.fromEntries(
        header.map((columnName, index) => [columnName.replace(/^\ufeff/, "").trim(), row[index]?.trim() ?? ""]),
      ),
    );
}

function escapeCsvField(value: string) {
  if (/["\n,]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export function stringifyCsvRows(rows: Array<Record<string, string>>) {
  if (rows.length === 0) {
    return "";
  }

  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const lines = [
    headers.map((header) => escapeCsvField(header)).join(","),
    ...rows.map((row) => headers.map((header) => escapeCsvField(row[header] ?? "")).join(",")),
  ];

  return lines.join("\n");
}
