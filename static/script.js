document.addEventListener("DOMContentLoaded", function () {
    const openFilterModalButton = document.getElementById("openFilterModal");
    const filterModal = document.getElementById("filterModal");
    const valueModal = document.getElementById("valueModal");
    const columnContainer = document.getElementById("columnContainer");
    const valueContainer = document.getElementById("valueContainer");
    const keywordInput = document.getElementById("keywordInput");
    const deselectAllButton = document.getElementById("deselectAllButton");
    const notButton = document.getElementById("notButton");
    const applyFilterButton = document.getElementById("applyFilterButton");
    const tilesContainer = document.getElementById("tiles-container");
    let selectedColumn = '';
    let selectedValues = [];

    openFilterModalButton.addEventListener("click", async function () {
        filterModal.style.display = "block";
        columnContainer.innerHTML = '';

        const response = await fetch('/api/columns');
        const columns = await response.json();

        columns.forEach(column => {
            const button = document.createElement('button');
            button.textContent = column;
            button.addEventListener('click', () => selectColumn(column));
            columnContainer.appendChild(button);
        });
    });

    document.querySelectorAll('.close').forEach(span => {
        span.addEventListener('click', () => {
            filterModal.style.display = "none";
            valueModal.style.display = "none";
        });
    });

    deselectAllButton.addEventListener('click', () => {
        selectedValues = [];
        valueContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    notButton.addEventListener('click', () => {
        valueModal.dataset.include = valueModal.dataset.include === 'true' ? 'false' : 'true';
        notButton.textContent = valueModal.dataset.include === 'true' ? 'Include' : 'Exclude';
    });

    applyFilterButton.addEventListener('click', applyFilter);

    async function selectColumn(column) {
        selectedColumn = column;
        filterModal.style.display = "none";
        valueModal.style.display = "block";
        valueContainer.innerHTML = '';
        valueModal.dataset.include = 'true';
        notButton.textContent = 'Include';

        const response = await fetch(`/api/column_values?column=${column}`);
        const values = await response.json();

        values.forEach(value => {
            const div = document.createElement('div');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = value;
            div.appendChild(checkbox);
            div.appendChild(document.createTextNode(value));
            valueContainer.appendChild(div);
        });
    }

    function applyFilter() {
        selectedValues = [];
        valueContainer.querySelectorAll('input[type="checkbox"]:checked').forEach(checkbox => {
            selectedValues.push(checkbox.value);
        });

        const queryParams = {};
        queryParams[selectedColumn] = selectedValues.map(value => {
            return valueModal.dataset.include === 'true' ? value : `!${value}`;
        }).join('|');

        fetch('/api/filter', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(queryParams)
        })
        .then(response => response.json())
        .then(data => populateTiles(data))
        .catch(error => console.error('Error applying filters:', error));

        valueModal.style.display = "none";
    }

    function populateTiles(data) {
        tilesContainer.innerHTML = '';

        data.forEach(item => {
            const tile = document.createElement('div');
            tile.className = 'tile';

            Object.keys(item).forEach(key => {
                const element = document.createElement('p');
                element.textContent = `${key}: ${item[key]}`;
                tile.appendChild(element);
            });

            tilesContainer.appendChild(tile);
        });
    }
});
