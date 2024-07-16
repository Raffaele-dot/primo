document.addEventListener("DOMContentLoaded", function () {
    // Apply filters and populate the results
    async function applyMultipleFilters() {
        const queryParams = {};
        const filters = document.querySelectorAll('.filter');

        filters.forEach(filter => {
            const column = filter.dataset.column;
            const value = filter.value.trim();
            if (value) {
                queryParams[column] = value;
            }
        });

        try {
            const response = await fetch('/api/filter', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(queryParams)
            });

            const data = await response.json();

            if (!Array.isArray(data)) {
                console.error('Error applying filters:', data);
                return;
            }

            populateTiles(data);
        } catch (error) {
            console.error('Error applying filters:', error);
        }
    }

    // Function to populate tiles with filtered data
    function populateTiles(data) {
        const tilesContainer = document.getElementById('tiles');
        tilesContainer.innerHTML = '';

        data.forEach(item => {
            const tile = document.createElement('div');
            tile.className = 'tile';

            // Create elements for the tile based on data properties
            for (const key in item) {
                if (item.hasOwnProperty(key)) {
                    const element = document.createElement('p');
                    element.textContent = `${key}: ${item[key]}`;
                    tile.appendChild(element);
                }
            }

            tilesContainer.appendChild(tile);
        });
    }

    // Attach event listener to the filter apply button
    document.getElementById('apply-filters').addEventListener('click', applyMultipleFilters);
});
