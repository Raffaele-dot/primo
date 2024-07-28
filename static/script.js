document.addEventListener('DOMContentLoaded', function () {
    let currentColumn = null;
    let data = [];
    let filteredData = [];
    let filters = {};
    let isNotFilter = false;

    function fetchColumnValues(column) {
        const uniqueValues = [...new Set(filteredData.map(row => row[column] ? row[column].toString().toLowerCase() : ''))];
        const container = document.getElementById('valueContainer');
        container.innerHTML = '';

        uniqueValues.forEach(value => {
            const label = document.createElement('label');
            label.innerHTML = `
                <input type="checkbox" value="${value}" checked>
                ${value}
            `;
            container.appendChild(label);
        });
    }

    function populateTiles(dataToDisplay) {
        // Your logic to display data on the page
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

        console.log(`Filters applied for column ${currentColumn}:`, filters);

        // Apply filters to the data
        filteredData = data.filter(row => {
            return Object.keys(filters).every(column => {
                const cellValue = row[column] ? row[column].toString().toLowerCase() : '';
                const { include, exclude } = filters[column];

                const isIncluded = include.length === 0 || include.some(value => cellValue.includes(value));
                const isExcluded = exclude.some(value => cellValue.includes(value));

                return isIncluded && !isExcluded;
            });
        });

        console.log("Filtered data after applying filters:", filteredData);
        console.log("Included values:", filters[currentColumn].include);
        console.log("Excluded values:", filters[currentColumn].exclude);

        populateTiles(filteredData);

        // Reflect the applied filters in the preview
        Object.keys(filters).forEach(column => {
            fetchColumnValues(column);
        });
    }

    function fetchData() {
        // Fetch data logic here
        // For example: fetch('data.json').then(response => response.json()).then(jsonData => { data = jsonData; filteredData = data; populateTiles(data); });

        // Dummy data for testing
        data = [
            { Title: "Investment Transactions Analyst (m/f/d)", Linkedin_URL: "", Company: "", Location: "Vienna", Hiring_activity: "", Date_of_posting: "", Job_Description: "", Job_Level: "", Type_of_contract: "", Industry: "", Industry2: "", Summary: "", Salary: "€45,000 p.a.", Languages: "- English: Mandatory: Mandatory; - German: Mandatory: Mandatory" },
            // More dummy data
        ];
        filteredData = data;
        populateTiles(data);

        // Initial fetch of unique values for columns
        const columns = Object.keys(data[0]);
        console.log('Fetched columns:', columns);
        columns.forEach(column => fetchColumnValues(column));
    }

    document.getElementById('applyFilterButton').addEventListener('click', function () {
        applyFilters();
    });

    document.getElementById('includeButton').addEventListener('click', function () {
        isNotFilter = false;
        applyFilters();
    });

    document.getElementById('excludeButton').addEventListener('click', function () {
        isNotFilter = true;
        applyFilters();
    });

    document.getElementById('deselectAllButton').addEventListener('click', function () {
        document.querySelectorAll('#valueContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    document.getElementById('selectAllButton').addEventListener('click', function () {
        document.querySelectorAll('#valueContainer input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
    });

    // Column header click event
    document.querySelectorAll('.column-header').forEach(header => {
        header.addEventListener('click', function () {
            currentColumn = header.dataset.column;
            fetchColumnValues(currentColumn);
            document.getElementById('filterModal').style.display = 'block';
        });
    });

    // Close modal
    document.getElementById('closeModalButton').addEventListener('click', function () {
        document.getElementById('filterModal').style.display = 'none';
    });

    // Initial data fetch
    fetchData();
});
