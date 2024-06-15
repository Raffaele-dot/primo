document.addEventListener('DOMContentLoaded', function() {
    fetchColumns();

    document.getElementById('applyFilters').addEventListener('click', function() {
        applyFilters();
    });
});

function fetchColumns() {
    fetch('/api/columns')
        .then(response => response.json())
        .then(columns => {
            createFilterInputs(columns);
            createTableHeaders(columns);
        })
        .catch(error => console.error('Error:', error));
}

function createFilterInputs(columns) {
    const filterContainer = document.getElementById('filterContainer');
    filterContainer.innerHTML = ''; // Clear existing inputs
    columns.forEach(column => {
        const label = document.createElement('label');
        label.htmlFor = column;
        label.innerText = `Filter by ${column}:`;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.id = column;
        input.name = column;
        
        filterContainer.appendChild(label);
        filterContainer.appendChild(input);
    });
}

function createTableHeaders(columns) {
    const thead = document.querySelector('#data-table thead tr');
    thead.innerHTML = ''; // Clear existing headers
    columns.forEach(column => {
        const th = document.createElement('th');
        th.innerText = column;
        thead.appendChild(th);
    });
}

function applyFilters() {
    const filterInputs = document.querySelectorAll('#filterContainer input');
    const params = new URLSearchParams();
    filterInputs.forEach(input => {
        if (input.value) {
            params.append(input.name, input.value);
        }
    });

    const url = new URL('/api/filter', window.location.origin);

    fetch(`${url}?${params}`)
        .then(response => response.json())
        .then(data => {
            populateTable(data);
        })
        .catch(error => console.error('Error:', error));
}

function populateTable(data) {
    const tbody = document.querySelector('#data-table tbody');
    tbody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.colSpan = document.querySelectorAll('#data-table thead th').length;
        td.innerText = 'No data found';
        tr.appendChild(td);
        tbody.appendChild(tr);
    } else {
        data.forEach(row => {
            const tr = document.createElement('tr');
            Object.values(row).forEach(cell => {
                const td = document.createElement('td');
                td.innerText = cell;
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
    }
}
