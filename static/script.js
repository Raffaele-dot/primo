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

    document.getElementById('notButton').addEventListener('click', function() {
        toggleNotFilter();
    });
});

let columns = [];
let currentColumn = '';
let currentValues = [];
let isNotFilter = false;

function fetchColumns() {
    fetch('/api/columns')
        .then(response => response.json())
        .then(fetchedColumns => {
            columns = fetchedColumns;
            createColumnButtons(columns);
        })
        .catch(error => console.error('Error fetching columns:', error));
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

function fetchColumnValues(column) {
    fetch(`/api/column_values?column=${column}`)
        .then(response => response.json())
        .then(values => {
            currentValues = values;
            createValueButtons(values);
        })
        .catch(error => console.error('Error fetching column values:', error));
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

function toggleNotFilter() {
    isNotFilter = !isNotFilter;
    const notButton = document.getElementById('notButton');
    notButton.classList.toggle('active', isNotFilter);
    notButton.innerText = isNotFilter ? 'Not' : 'Include';
}

function applyMultipleFilters() {
    const selectedValues = Array.from(document.querySelectorAll('#valueContainer input[type="checkbox"]:checked'))
                                .map(checkbox => checkbox.value);

    if (selectedValues.length > 0) {
        const params = new URLSearchParams();
        let filterValue = selectedValues.join('|');
        if (isNotFilter) {
            filterValue = `!${filterValue}`;
        }
        params.append(currentColumn, filterValue);

        const url = new URL('/api/filter', window.location.origin);

        fetch(`${url}?${params}`)
            .then(response => response.json())
            .then(data => {
                console.log('Filtered Data:', data); // Log the filtered data
                populateTiles(data);
            })
            .catch(error => console.error('Error applying filters:', error));
    }
}

function populateTiles(data) {
    const container = document.getElementById('tiles-container');
    if (!container) {
        console.error('Could not find tiles-container element');
        return;
    }

    container.innerHTML = ''; // Clear existing tiles

    if (data.length === 0) {
        const message = document.createElement('div');
        message.innerText = 'No data found';
        container.appendChild(message);
    } else {
        data.forEach(row => {
            const tile = document.createElement('div');
            tile.className = 'tile';

            columns.forEach(column => {
                const content = document.createElement('div');
                if (column === 'title') {
                    const title = document.createElement('h3');
                    title.innerText = row[column];
                    tile.appendChild(title);
                } else {
                    const text = document.createElement('p');
                    let cellContent = row[column] !== null ? row[column].toString() : '';
                    if (column === 'Linkedin_URL' && cellContent) {
                        cellContent = `<a href="${cellContent}" target="_blank">Go to the page</a>`;
                    } else if (cellContent.length > 500) {
                        cellContent = cellContent.substring(0, 500) + ' ...[]';
                    }
                    text.innerHTML = cellContent;
                    tile.appendChild(text);
                }
            });

            container.appendChild(tile);
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
