document.addEventListener('DOMContentLoaded', function() {
    fetchColumns();

    document.getElementById('openFilterModal').addEventListener('click', function() {
        openModal('filterModal');
    });

    document.getElementById('keywordInput').addEventListener('input', function() {
        filterColumnValues();
    });

    document.getElementById('selectAllButton').addEventListener('click', function() {
        selectAllValues();
    });

    document.getElementById('applyFilterButton').addEventListener('click', function() {
        applyMultipleFilters();
        closeModal('valueModal');
    });
});

let columns = [];
let currentColumn = '';
let currentValues = [];

function fetchColumns() {
    fetch('/api/columns')
        .then(response => response.json())
        .then(fetchedColumns => {
            columns = fetchedColumns;
            createColumnButtons(columns);
            createTableHeaders(columns);
        })
        .catch(error => console.error('Error:', error));
}

function createColumnButtons(columns) {
    const columnContainer = document.getElementById('columnContainer');
    columnContainer.innerHTML = ''; // Clear existing buttons
    columns.forEach(column => {
        const button = document.createElement('button');
        button.innerText = column;
        button.addEventListener('click', function() {
            currentColumn = column;
            fetchColumnValues(column);
            closeModal('filterModal');
            openModal('valueModal');
        });
        columnContainer.appendChild(button);
    });
}

function createTableHeaders(columns) {
    const thead = document.querySelector('#data-table thead tr');
    thead.innerHTML = '<th>#</th>'; // Add row count header
    columns.forEach(column => {
        const th = document.createElement('th');
        th.innerText = column;
        thead.appendChild(th);
    });
}

function fetchColumnValues(column) {
    fetch(`/api/column_values?column=${column}`)
        .then(response => response.json())
        .then(values => {
            currentValues = values;
            createValueButtons(values);
        })
        .catch(error => console.error('Error:', error));
}

function createValueButtons(values) {
    const valueContainer = document.getElementById('valueContainer');
    valueContainer.innerHTML = ''; // Clear existing buttons
    values.forEach(value => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        div.appendChild(checkbox);

        const label = document.createElement('label');
        label.innerText = value;
        div.appendChild(label);

        valueContainer.appendChild(div);
    });
}

function filterColumnValues() {
    const keyword = document.getElementById('keywordInput').value.trim().toLowerCase();
    const filteredValues = currentValues.filter(value => value.toLowerCase().includes(keyword));
    createValueButtons(filteredValues);
}

function selectAllValues() {
    const checkboxes = document.querySelectorAll('#valueContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
}

function applyMultipleFilters() {
    const selectedValues = Array.from(document.querySelectorAll('#valueContainer input[type="checkbox"]:checked'))
                                .map(checkbox => checkbox.value);

    if (selectedValues.length > 0) {
        const params = new URLSearchParams();
        params.append(currentColumn, selectedValues.join('|'));

        const url = new URL('/api/filter', window.location.origin);

        fetch(`${url}?${params}`)
            .then(response => response.json())
            .then(data => {
                console.log('Filtered Data:', data); // Log the filtered data
                populateTable(data);
            })
            .catch(error => console.error('Error:', error));
    }
}

function populateTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = columns.length + 1; // Adjust for row count column
        td.innerText = 'No data found';
        tr.appendChild(td);
        tbody.appendChild(tr);
    } else {
        data.forEach((row, index) => {
            const tr = document.createElement('tr');
            const tdIndex = document.createElement('td');
            tdIndex.innerText = index + 1;
            tdIndex.style.padding = '5px';
            tr.appendChild(tdIndex);
            columns.forEach(column => {
                const td = document.createElement('td');
                let cellContent = row[column] !== null ? row[column].toString() : '';
                if (column === 'Linkedin_URL' && cellContent) {
                    td.innerHTML = `<a href="${cellContent}" target="_blank">Go to the page</a>`;
                } else {
                    if (cellContent.length > 500) {
                        cellContent = cellContent.substring(0, 500) + ' ...[]';
                    }
                    td.innerText = cellContent;
                }
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }
}

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

document.querySelectorAll('.modal .close').forEach(closeButton => {
    closeButton.addEventListener('click', function() {
        closeModal(this.closest('.modal').id);
    });
});

window.addEventListener('click', function(event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });
});
