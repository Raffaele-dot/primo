document.addEventListener('DOMContentLoaded', function() {
    fetchColumns();
    fetchData();

    document.getElementById('openFilterModal').addEventListener('click', function() {
        openModal('filterModal');
    });

    document.getElementById('keywordInput').addEventListener('input', function() {
        filterColumnValues();
    });

    document.getElementById('deselectAllButton').addEventListener('click', function() {
        deselectAllValues();
    });

    document.getElementById('applyFilterButton').addEventListener('click', function() {
        applyFilters();
        closeModal('valueModal');
    });

    document.getElementById('notButton').addEventListener('click', function() {
        toggleNotFilter();
        filterColumnValues();
    });
});

let columns = [];
let data = [];
let filteredData = [];
let currentColumn = '';
let currentValues = [];
let isNotFilter = false;
let filters = {};

function fetchColumns() {
    fetch('/api/columns')
        .then(response => response.json())
        .then(fetchedColumns => {
            columns = fetchedColumns;
            createColumnButtons(columns);
        })
        .catch(error => console.error('Error fetching columns:', error));
}

function fetchData() {
    fetch('/api/data')
        .then(response => response.json())
        .then(fetchedData => {
            data = fetchedData;
            filteredData = fetchedData;
            console.log("Total rows in the dataset:", data.length);
            populateTiles(fetchedData);
        })
        .catch(error => console.error('Error fetching data:', error));
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
    currentValues = [...new Set(data.map(row => row[column]).filter(value => value !== null))];
    console.log(`Total unique values in the ${column} column:`, currentValues.length);
    createValueButtons(currentValues);
}

function createValueButtons(values) {
    const valueContainer = document.getElementById('valueContainer');
    valueContainer.innerHTML = ''; // Clear existing buttons
    values.forEach(value => {
        const div = document.createElement('div');
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.value = value;
        checkbox.checked = true; // Select all by default
        div.appendChild(checkbox);

        const label = document.createElement('label');
        label.innerText = value;
        div.appendChild(label);

        valueContainer.appendChild(div);
    });
}

function filterColumnValues() {
    const keyword = document.getElementById('keywordInput').value.trim().toLowerCase();
    const filteredValues = currentValues.filter(value => {
        const lowerValue = value.toLowerCase();
        return lowerValue.includes(keyword);
    });
    createValueButtons(filteredValues);
    if (isNotFilter) {
        const checkboxes = document.querySelectorAll('#valueContainer input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            if (checkbox.value.toLowerCase().includes(keyword)) {
                checkbox.checked = false;
            }
        });
    }
}

function deselectAllValues() {
    const checkboxes = document.querySelectorAll('#valueContainer input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

function toggleNotFilter() {
    isNotFilter = !isNotFilter;
    const notButton = document.getElementById('notButton');
    notButton.classList.toggle('active', isNotFilter);
    notButton.innerText = isNotFilter ? 'Not' : 'Include';
}

function applyFilters() {
    const selectedValues = Array.from(document.querySelectorAll('#valueContainer input[type="checkbox"]:checked'))
                                .map(checkbox => checkbox.value.toLowerCase());

    if (!filters[currentColumn]) {
        filters[currentColumn] = {
            include: [],
            exclude: []
        };
    }

    if (isNotFilter) {
        filters[currentColumn].exclude = selectedValues;
    } else {
        filters[currentColumn].include = selectedValues;
    }

    filteredData = data.filter(row => {
        return Object.keys(filters).every(column => {
            const cellValue = row[column]?.toLowerCase() || '';
            const { include, exclude } = filters[column];

            const isIncluded = include.length === 0 || include.includes(cellValue);
            const isExcluded = exclude.length > 0 && exclude.includes(cellValue);

            return isIncluded && !isExcluded;
        });
    });

    console.log("Filtered data after applying filters:", filteredData);
    console.log("Included values:", filters[currentColumn].include);
    console.log("Excluded values:", filters[currentColumn].exclude);
    console.log(`Unique values in the ${currentColumn} column after applying filters:`, [...new Set(filteredData.map(row => row[currentColumn]))]);

    populateTiles(filteredData);
    updateFilterPreview();
}

function updateFilterPreview() {
    columns.forEach(column => {
        if (filters[column]) {
            fetchColumnValues(column);
        }
    });
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
            const tileWrapper = document.createElement('div');
            tileWrapper.className = 'tile-wrapper';

            const backgroundTile = document.createElement('div');
            backgroundTile.className = 'background-tile';

            const applyDiv = document.createElement('div');
            applyDiv.className = 'apply';
            applyDiv.innerText = 'Apply';

            const trashDiv = document.createElement('div');
            trashDiv.className = 'trash';
            trashDiv.innerText = 'Trash it';

            backgroundTile.appendChild(applyDiv);
            backgroundTile.appendChild(trashDiv);

            const tile = document.createElement('div');
            tile.className = 'tile';
            tile.dataset.link = row['Linkedin_URL'];

            columns.forEach(column => {
                const content = document.createElement('div');
                if (column === 'Title') {
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

            addSwipeListeners(tile, tileWrapper);

            tileWrapper.appendChild(backgroundTile);
            tileWrapper.appendChild(tile);
            container.appendChild(tileWrapper);
        });
    }
}

function addSwipeListeners(tile, tileWrapper) {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    tile.addEventListener('touchstart', function(event) {
        startX = event.touches[0].clientX;
        startY = event.touches[0].clientY;
        isSwiping = true;
    });

    tile.addEventListener('touchmove', function(event) {
        if (!isSwiping) return;

        const diffX = event.touches[0].clientX - startX;
        const diffY = event.touches[0].clientY - startY;

        if (Math.abs(diffX) > Math.abs(diffY)) {
            event.preventDefault(); // Prevent vertical scrolling
            const maxTranslate = tileWrapper.offsetWidth * 0.5;
            if (Math.abs(diffX) <= maxTranslate) {
                tile.style.transform = `translateX(${diffX}px)`;
            }
        }
    });

    tile.addEventListener('touchend', function(event) {
        if (!isSwiping) return;
        isSwiping = false;

        const diffX = event.changedTouches[0].clientX - startX;
        const maxTranslate = tileWrapper.offsetWidth * 0.5;

        if (Math.abs(diffX) >= maxTranslate) {
            if (diffX > 0) {
                // Swipe right
                const link = tile.dataset.link;
                if (link) {
                    window.open(link, '_blank');
                }
            } else {
                // Swipe left
                tileWrapper.style.display = 'none';
            }
        } else {
            // Reset position if swipe not far enough
            tile.style.transform = 'translateX(0)';
        }
    });
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
