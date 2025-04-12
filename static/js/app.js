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

    // Overview visualization buttons
    const overviewButtons = document.querySelectorAll('[data-visualization]');
    const visualizationSections = document.querySelectorAll('.visualization-section');

    overviewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            overviewButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('active', 'btn-primary');

            const selectedVisualization = this.getAttribute('data-visualization');
            
            // Hide all visualization sections
            visualizationSections.forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected visualization section
            const targetSection = document.getElementById(`${selectedVisualization}-visualization`);
            if (targetSection) {
                targetSection.style.display = 'block';
            }

            // Load data for the selected visualization
            loadData(selectedVisualization);
        });
    });

    // Function to load data and update table
    async function loadData(visualization) {
        try {
            // Map visualization IDs to API parameters
            const visualizationMap = {
                'computer_purpose': 'purpose',
                'regional': 'regional',
                'school_type': 'school_type',
                'average': 'school_type'
            };

            const apiVisualization = visualizationMap[visualization] || visualization;
            const response = await fetch(`/data?visualization=${apiVisualization}`);
            const data = await response.json();
            
            // Get the table container for this visualization
            const tableContainer = document.querySelector(`.visualization-section[data-visualization="${visualization}"] .data-table`);
            if (!tableContainer) {
                console.error(`Table container not found for visualization: ${visualization}`);
                return;
            }
            
            // Create table HTML
            let tableHTML = '<table class="data-table">';
            tableHTML += '<thead><tr>';
            tableHTML += '<th>구분</th>';
            tableHTML += '<th>학교 수</th>';
            tableHTML += '<th>전체</th>';
            tableHTML += '<th>학생용</th>';
            tableHTML += '<th>교사용</th>';
            tableHTML += '<th>직원용</th>';
            tableHTML += '<th>기타</th>';
            tableHTML += '</tr></thead>';
            tableHTML += '<tbody>';
            
            // Add data rows
            data.forEach(row => {
                tableHTML += '<tr>';
                tableHTML += `<td>${row['구분']}</td>`;
                tableHTML += `<td>${row['학교 수']}</td>`;
                tableHTML += `<td>${row['전체']}</td>`;
                tableHTML += `<td>${row['학생용']}</td>`;
                tableHTML += `<td>${row['교사용']}</td>`;
                tableHTML += `<td>${row['직원용']}</td>`;
                tableHTML += `<td>${row['기타']}</td>`;
                tableHTML += '</tr>';
            });
            
            tableHTML += '</tbody></table>';
            tableContainer.innerHTML = tableHTML;
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    // Function to update visualizations based on selected school type
    function updateVisualizations(selectedSchool) {
        // Update images
        document.querySelectorAll('.visualization-section').forEach(section => {
            const img = section.querySelector('img');
            if (img) {
                const basePath = '/static/data/overview/';
                const fileName = img.src.split('/').pop();
                const newFileName = fileName.replace('.png', `_${selectedSchool}.png`);
                img.src = basePath + newFileName;
                console.log(`Loading image: ${basePath + newFileName}`); // Debug log
            }
            
            // Load corresponding data for the table
            const visualizationType = section.getAttribute('data-visualization');
            loadData(visualizationType);
        });
    }

    // Load initial data
    document.querySelectorAll('.visualization-section').forEach(section => {
        const visualizationType = section.getAttribute('data-visualization');
        loadData(visualizationType);
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

    // Chat functionality
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const sendButton = document.getElementById('send-message');

    function addMessage(message, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${isUser ? 'user-message' : 'assistant-message'}`;
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.textContent = message;
        
        const messageTime = document.createElement('div');
        messageTime.className = 'message-time';
        messageTime.textContent = new Date().toLocaleTimeString();
        
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageTime);
        chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLoadingAnimation() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chat-message assistant-message';
        loadingDiv.innerHTML = `
            <div class="loading">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        chatMessages.appendChild(loadingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return loadingDiv;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        // Add user message
        addMessage(message, true);
        chatInput.value = '';

        // Add loading animation
        const loadingDiv = addLoadingAnimation();

        try {
            const response = await fetch('/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });

            const data = await response.json();
            
            // Remove loading animation
            loadingDiv.remove();

            if (data.status === 'success') {
                addMessage(data.response);
            } else {
                addMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.');
            }
        } catch (error) {
            console.error('Error:', error);
            loadingDiv.remove();
            addMessage('죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }

    // Event listeners
    sendButton.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // School level filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    const visualizations = document.querySelectorAll('.visualization img');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('active');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Get selected school type
            const selectedSchool = this.getAttribute('data-school');
            
            // Update visualizations
            updateVisualizations(selectedSchool);
        });
    });
});
