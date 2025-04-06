document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tabs
    var triggerTabList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tab"]'))
    triggerTabList.forEach(function(triggerEl) {
        var tabTrigger = new bootstrap.Tab(triggerEl)
        triggerEl.addEventListener('click', function(event) {
            event.preventDefault()
            tabTrigger.show()
        })
    })

    // Handle visualization button clicks in digital resources section
    const visualizationButtons = document.querySelectorAll('[data-visualization]');
    const visualizationSections = document.querySelectorAll('.visualization-section');

    visualizationButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            visualizationButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Hide all visualization sections
            visualizationSections.forEach(section => section.style.display = 'none');
            // Show selected visualization section
            const targetSection = document.getElementById(`${button.dataset.visualization}-visualization`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // Handle correlation button clicks
    const correlationButtons = document.querySelectorAll('[data-correlation]');
    const correlationSections = document.querySelectorAll('.correlation-section');

    correlationButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            correlationButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Hide all correlation sections
            correlationSections.forEach(section => section.style.display = 'none');
            // Show selected section
            const targetSection = document.getElementById(`${button.dataset.correlation}-section`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });

    // Load trend data from CSV
    fetch('/static/data/digital_resources/digital_resources_summary.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const tbody = document.getElementById('trend-data');
            if (!tbody) return;
            
            tbody.innerHTML = ''; // Clear existing content
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].split(',');
                if (cells.length > 1) {
                    const row = document.createElement('tr');
                    cells.forEach(cell => {
                        const td = document.createElement('td');
                        td.textContent = cell;
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                }
            }
        })
        .catch(error => {
            console.error('Error loading trend data:', error);
        });

    // Load region laptop data
    fetch('/static/data/digital_resources/region_laptop_summary.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const tbody = document.getElementById('region-data');
            if (!tbody) return;
            
            tbody.innerHTML = ''; // Clear existing content
            
            // Skip header row
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].split(',');
                if (cells.length > 1) {
                    const row = document.createElement('tr');
                    cells.forEach(cell => {
                        const td = document.createElement('td');
                        if (!isNaN(cell) && cell.includes('.')) {
                            td.textContent = parseFloat(cell).toFixed(1) + '%';
                        } else if (!isNaN(cell)) {
                            td.textContent = parseInt(cell).toLocaleString('ko-KR');
                        } else {
                            td.textContent = cell;
                        }
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                }
            }
        })
        .catch(error => {
            console.error('Error loading region laptop data:', error);
        });

    // Load correlation summary data
    fetch('/static/data/correlation/correlation_summary.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const table = document.getElementById('correlation-summary');
            if (!table) return;
            
            table.innerHTML = ''; // Clear existing content
            
            // Create header row
            const thead = document.createElement('thead');
            const headerRow = document.createElement('tr');
            rows[0].split(',').forEach(header => {
                const th = document.createElement('th');
                th.textContent = header;
                headerRow.appendChild(th);
            });
            thead.appendChild(headerRow);
            table.appendChild(thead);
            
            // Create body
            const tbody = document.createElement('tbody');
            for (let i = 1; i < rows.length; i++) {
                const cells = rows[i].split(',');
                if (cells.length > 1) {
                    const row = document.createElement('tr');
                    cells.forEach(cell => {
                        const td = document.createElement('td');
                        if (!isNaN(cell) && cell.includes('.')) {
                            td.textContent = parseFloat(cell).toFixed(3);
                        } else {
                            td.textContent = cell;
                        }
                        row.appendChild(td);
                    });
                    tbody.appendChild(row);
                }
            }
            table.appendChild(tbody);
        })
        .catch(error => {
            console.error('Error loading correlation summary data:', error);
        });

    // Handle usage button clicks
    const usageButtons = document.querySelectorAll('[data-usage]');
    const usageSections = document.querySelectorAll('.usage-section');

    usageButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            usageButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');

            // Hide all usage sections
            usageSections.forEach(section => section.style.display = 'none');
            // Show selected section
            const targetSection = document.getElementById(`usage-${button.dataset.usage}`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }
        });
    });
});
