export const capitalizeWords = (str: string): string => {
    if (!str) return "";
    return str
        .split(" ")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        )
        .join(" ");
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-GB", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
    } catch (e) {
        return "Invalid Date";
    }
};

export const formatDateTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

interface TableRow {
    values: Record<string, any>; // Represents the row.values object from react-table
    // other properties if needed, but 'values' is key here
  }
  
export const customFilterFunction = (
    rows: TableRow[],
    columnIds: string[],
    filterValue: string
): TableRow[] => {
    const lowercasedFilter = filterValue.toLowerCase();
    return rows.filter((row) => {
        return columnIds.some((columnId) => {
            const rowValue = row.values[columnId];
            return rowValue
                ? String(rowValue).toLowerCase().includes(lowercasedFilter)
                : false;
        });
    });
};