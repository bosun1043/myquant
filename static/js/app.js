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

    // Overview tab visualization buttons
    const visualizationButtons = document.querySelectorAll('.visualization-btn');
    visualizationButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            visualizationButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('active', 'btn-primary');
            
            // Hide all visualization sections
            document.querySelectorAll('.visualization-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected visualization section
            const visualizationType = this.getAttribute('data-visualization');
            const targetSection = document.getElementById(`${visualizationType}-visualization`);
            if (targetSection) {
                targetSection.style.display = 'block';
                loadData(visualizationType);
            } else {
                console.error(`Visualization section not found for type: ${visualizationType}`);
            }
        });
    });

    // Function to load data and update table
    async function loadData(visualizationType) {
        const visualizationMap = {
            'purpose': 'computer_purpose',
            'region': 'regional',
            'school-type': 'school_type',
            'school-computers': 'average'
        };
        
        const apiParam = visualizationMap[visualizationType];
        if (!apiParam) {
            console.error(`No API parameter mapping found for visualization type: ${visualizationType}`);
            return;
        }
        
        try {
            // Fetch data from API
            const response = await fetch(`/api/overview/${apiParam}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            // Update table
            const tableContainer = document.querySelector(`#${visualizationType}-visualization .data-table`);
            if (tableContainer) {
                if (Array.isArray(data)) {
                    const table = createDataTable(data);
                    tableContainer.innerHTML = table;
                } else {
                    console.error('Data is not in the expected format:', data);
                    tableContainer.innerHTML = '<p class="text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>';
                }
            }
        } catch (error) {
            console.error('Error loading data:', error);
            const tableContainer = document.querySelector(`#${visualizationType}-visualization .data-table`);
            if (tableContainer) {
                tableContainer.innerHTML = '<p class="text-danger">데이터를 불러오는 중 오류가 발생했습니다.</p>';
            }
        }
    }

    // Function to create a data table
    function createDataTable(data) {
        if (!data || data.length === 0) return '<p>데이터가 없습니다.</p>';
        
        const headers = Object.keys(data[0]);
        let tableHTML = '<table class="table table-striped">';
        
        // Add headers
        tableHTML += '<thead><tr>';
        headers.forEach(header => {
            tableHTML += `<th>${header}</th>`;
        });
        tableHTML += '</tr></thead>';
        
        // Add data rows
        tableHTML += '<tbody>';
        data.forEach(row => {
            tableHTML += '<tr>';
            headers.forEach(header => {
                const value = row[header];
                tableHTML += `<td>${value !== null ? value : '-'}</td>`;
            });
            tableHTML += '</tr>';
        });
        tableHTML += '</tbody></table>';
        
        return tableHTML;
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

    // Load achievement data
    fetch('/static/data/grade/middle_school_comparison.csv')
        .then(response => response.text())
        .then(data => {
            const rows = data.split('\n');
            const headers = rows[0].split(',');
            
            // Create timeline visualization
            const timelineContainer = document.getElementById('achievement-timeline');
            if (timelineContainer) {
                let timelineHTML = '<div class="timeline">';
                
                // Skip header row
                for (let i = 1; i < rows.length; i++) {
                    const cells = rows[i].split(',');
                    if (cells.length > 1) {
                        timelineHTML += `
                            <div class="timeline-item">
                                <div class="timeline-year">${cells[0]}</div>
                                <div class="timeline-content">
                                    <h4>${cells[2]}</h4>
                                    <p>${cells[3]}</p>
                                </div>
                            </div>
                        `;
                    }
                }
                
                timelineHTML += '</div>';
                timelineContainer.innerHTML = timelineHTML;
            }
        })
        .catch(error => {
            console.error('Error loading achievement data:', error);
        });

    // Digital Resources tab visualization buttons
    const digitalResourceButtons = document.querySelectorAll('#digital-resources .btn-group .btn');
    digitalResourceButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            digitalResourceButtons.forEach(btn => {
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('active', 'btn-primary');
            
            // Hide all visualization sections
            document.querySelectorAll('#digital-resources .visualization-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected visualization section
            const visualizationType = this.getAttribute('data-visualization');
            const targetSection = document.getElementById(`${visualizationType}-visualization`);
            if (targetSection) {
                targetSection.style.display = 'block';
                loadDigitalResourceData(visualizationType);
            } else {
                console.error(`Visualization section not found for type: ${visualizationType}`);
            }
        });
    });

    // Function to load digital resource data
    function loadDigitalResourceData(visualizationType) {
        switch(visualizationType) {
            case 'trend':
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
                    .catch(error => console.error('Error loading trend data:', error));
                break;
            case 'usage':
                // Load usage data from CSV
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
                                    td.textContent = cell;
                                    row.appendChild(td);
                                });
                                tbody.appendChild(row);
                            }
                        }
                    })
                    .catch(error => console.error('Error loading usage data:', error));
                break;
        }
    }

    // Function to request analysis from Claude API
    async function requestAnalysis(data, summaryRequest) {
        try {
            const response = await fetch('/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    data: data,
                    summary_request: summaryRequest
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            
            if (result.success) {
                displayAnalysis(result.analysis);
            } else {
                console.error('Analysis failed:', result.error);
                alert('분석 중 오류가 발생했습니다: ' + result.error);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('서버 요청 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // Function to display the analysis
    function displayAnalysis(analysis) {
        const analysisContainer = document.getElementById('analysis-container');
        if (!analysisContainer) {
            console.error('Analysis container not found');
            return;
        }

        // Convert markdown headers to HTML
        const formattedAnalysis = analysis
            .replace(/## ([^\n]+)/g, '<h2>$1</h2>')
            .replace(/\n- /g, '<br>• ');

        analysisContainer.innerHTML = formattedAnalysis;
        analysisContainer.style.display = 'block';
    }

    // Add event listener for analysis button
    const analyzeButton = document.getElementById('analyze-button');
    if (analyzeButton) {
        analyzeButton.addEventListener('click', function() {
            // Get the current data displayed
            const dataContainer = document.getElementById('data-container');
            const data = dataContainer ? dataContainer.textContent : '';
            
            // Get the analysis request from the user
            const summaryRequest = "학교 유형별 컴퓨터 보유 현황을 분석하고, 교육 현장에서의 디지털 격차에 대해 설명해주세요.";
            
            // Request the analysis
            requestAnalysis(data, summaryRequest);
        });
    }
});
