import fs from "node:fs";

export function parseCsv(input) {
  const rows = [];
  let row = [];
  let cell = "";
  let inQuotes = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    const next = input[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        cell += '"';
        i += 1;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
      continue;
    }

    if (char === ",") {
      row.push(cell);
      cell = "";
      continue;
    }

    if (char === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    if (char === "\r") {
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows.filter((candidate) => candidate.some((value) => value.trim().length > 0));
}

export function readCatalogCsv(csvPath) {
  const raw = fs.readFileSync(csvPath, "utf8").replace(/^\uFEFF/, "");
  const rows = parseCsv(raw);
  if (rows.length < 2) {
    throw new Error("Catalog CSV must include a header row and at least one data row");
  }

  const [header, ...body] = rows;
  const headers = header.map((value) => value.trim());

  return {
    headers,
    records: body.map((values) => Object.fromEntries(headers.map((key, columnIndex) => [key, values[columnIndex] ?? ""])))
  };
}

function escapeCsvValue(value) {
  const normalized = String(value ?? "");
  if (!/[",\n\r]/.test(normalized)) {
    return normalized;
  }
  return `"${normalized.replace(/"/g, '""')}"`;
}

export function writeCatalogCsv(csvPath, headers, records) {
  const lines = [
    headers.map(escapeCsvValue).join(","),
    ...records.map((record) => headers.map((header) => escapeCsvValue(record[header] ?? "")).join(","))
  ];

  fs.writeFileSync(csvPath, `${lines.join("\n")}\n`);
}
