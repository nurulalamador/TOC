function columnRowTable(table) {
    let row;
    let rows = table.rows;
    let baseRow = rows[0];
    let data = {};
    let obj = {};

    for (let i=1; i<rows.length; i++) {
        row = rows[i];
        obj = {};
        
        for(let j=1; j<row.cells.length; j++) {
            obj[baseRow.cells[j].textContent] = row.cells[j].textContent;
        }
        data[row.cells[0].textContent] = obj;
    }

    return data;
}