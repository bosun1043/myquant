document.addEventListener('DOMContentLoaded', function() {
    // Initialize Bootstrap tabs
    var triggerTabList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tab"]'))
    triggerTabList.forEach(function(triggerEl) {
        var tabTrigger = new bootstrap.Tab(triggerEl)
        
        // Add shown.bs.tab event listener
        triggerEl.addEventListener('shown.bs.tab', function(event) {
            if (event.target.id === 'achievement-tab') {
                setTimeout(createAchievementChart, 100);
            }
        });
    });

    // Create achievement chart function
    function createAchievementChart() {
        const subjectData = {
            years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
            국어: [3.2, 1.4, 1.0, 1.3, 2.0, 2.6, 2.0, 2.6, 4.4, 4.1, 6.4, 5.9, 11.3, 9.1],
            수학: [5.9, 4.0, 5.0, 5.2, 5.7, 4.6, 4.9, 7.1, 11.1, 11.8, 13.4, 11.6, 13.2, 13.0],
            영어: [3.9, 5.1, 2.1, 3.4, 3.3, 3.4, 4.0, 3.2, 5.3, 3.3, 7.1, 5.9, 8.8, 6.0]
        };

        const traces = [
            {
                x: subjectData.years,
                y: subjectData.국어,
                name: '국어',
                type: 'scatter',
                mode: 'lines+markers',
                line: { width: 2 }
            },
            {
                x: subjectData.years,
                y: subjectData.수학,
                name: '수학',
                type: 'scatter',
                mode: 'lines+markers',
                line: { width: 2 }
            },
            {
                x: subjectData.years,
                y: subjectData.영어,
                name: '영어',
                type: 'scatter',
                mode: 'lines+markers',
                line: { width: 2 }
            }
        ];

        const layout = {
            title: '중3 교과별 성취수준 (%)',
            xaxis: {
                title: '연도',
                tickangle: -45
            },
            yaxis: {
                title: '성취수준 (%)',
                range: [0, 15]
            },
            showlegend: true,
            legend: {
                x: 1,
                xanchor: 'right',
                y: 1
            },
            margin: {
                l: 50,
                r: 50,
                b: 100,
                t: 50,
                pad: 4
            },
            width: 800,
            height: 500
        };

        const chartDiv = document.getElementById('achievement-chart');
        if (chartDiv) {
            Plotly.newPlot('achievement-chart', traces, layout);

            // Populate the table
            const tbody = document.getElementById('achievement-data');
            if (tbody) {
                tbody.innerHTML = ''; // Clear existing content
                subjectData.years.forEach((year, index) => {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${year}</td>
                        <td>${subjectData.국어[index].toFixed(1)}%</td>
                        <td>${subjectData.수학[index].toFixed(1)}%</td>
                        <td>${subjectData.영어[index].toFixed(1)}%</td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    }

    // Create chart if achievement tab is initially active
    if (document.querySelector('#achievement-tab.active')) {
        setTimeout(createAchievementChart, 100);
    }

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

    // Load initial data for overview section
    document.querySelectorAll('.visualization-section').forEach(section => {
        const visualizationType = section.getAttribute('data-visualization');
        if (visualizationType) {
            loadData(visualizationType);
        }
    });

    // Navigation functionality
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            if (section) {
                // Hide all sections
                document.querySelectorAll('.dashboard-section').forEach(s => {
                    s.style.display = 'none';
                });
                // Show selected section
                const targetSection = document.getElementById(section);
                if (targetSection) {
                    targetSection.style.display = 'block';
                }
                // Update active state
                document.querySelectorAll('.nav-link').forEach(l => {
                    l.classList.remove('active');
                });
                this.classList.add('active');
            }
        });
    });

    // Initialize filters
    const regionFilter = document.getElementById('regionFilter');
    const yearFilter = document.getElementById('yearFilter');
    const schoolSearch = document.getElementById('schoolSearch');

    if (regionFilter) {
        regionFilter.addEventListener('change', updateData);
    }
    if (yearFilter) {
        yearFilter.addEventListener('change', updateData);
    }
    if (schoolSearch) {
        schoolSearch.addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                updateData();
            }
        });
    }

    // Function to update data based on filters
    function updateData() {
        const region = regionFilter ? regionFilter.value : '';
        const year = yearFilter ? yearFilter.value : '';
        const search = schoolSearch ? schoolSearch.value : '';

        // Update visualizations with filter values
        const activeSection = document.querySelector('.dashboard-section[style*="block"]');
        if (activeSection) {
            const sectionId = activeSection.id;
            loadSectionData(sectionId, { region, year, search });
        }
    }

    // Function to load section-specific data
    function loadSectionData(sectionId, filters) {
        switch(sectionId) {
            case 'overview':
                loadOverviewData(filters);
                break;
            case 'digital-resources':
                loadDigitalResourcesData(filters);
                break;
            case 'achievement':
                loadAchievementData(filters);
                break;
            case 'correlation':
                loadCorrelationData(filters);
                break;
            case 'policy':
                loadPolicyData(filters);
                break;
        }
    }

    // Load initial data for visible section
    const initialSection = document.querySelector('.dashboard-section[style*="block"]');
    if (initialSection) {
        loadSectionData(initialSection.id, {});
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
                        td.textContent = cell;
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
    const sendButton = document.getElementById('send-button');

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
                // Just display the response without any analysis text
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
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendMessage();
            }
        });
    }

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

    class EducationDashboard {
        constructor() {
            this.initializeEventListeners();
            this.loadData();
        }

        initializeEventListeners() {
            // Tab change event listeners
            document.querySelectorAll('.nav-link').forEach(tab => {
                tab.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetId = tab.getAttribute('href').substring(1);
                    this.showSection(targetId);
                });
            });

            // Button group event listeners
            document.querySelectorAll('.btn-group .btn').forEach(button => {
                button.addEventListener('click', (e) => {
                    const group = button.closest('.btn-group');
                    group.querySelectorAll('.btn').forEach(btn => {
                        btn.classList.remove('active', 'btn-primary');
                        btn.classList.add('btn-outline-primary');
                    });
                    button.classList.remove('btn-outline-primary');
                    button.classList.add('active', 'btn-primary');
                    
                    const visualization = button.getAttribute('data-visualization');
                    if (button.closest('#achievement')) {
                        this.updateAchievementVisualization(visualization);
                    } else {
                        this.updateVisualization(visualization);
                    }
                });
            });
        }

        async loadData() {
            try {
                // 학업 성취도 데이터 로드
                const middleSchoolResponse = await fetch('/static/data/grade/middle_school_comparison.csv');
                const highSchoolResponse = await fetch('/static/data/grade/high_school_comparison.csv');
                
                const middleSchoolText = await middleSchoolResponse.text();
                const highSchoolText = await highSchoolResponse.text();
                
                this.middleSchoolData = this.parseCSV(middleSchoolText);
                this.highSchoolData = this.parseCSV(highSchoolText);
                
                // 초기 시각화 생성
                this.createAchievementTimeline();
                this.createDigitalInfraChart();
                this.createDigitalUsageChart();
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        parseCSV(csvText) {
            const lines = csvText.trim().split('\n');
            const headers = lines[0].split(',');
            const data = [];
            
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',');
                const row = {};
                headers.forEach((header, index) => {
                    row[header.trim()] = values[index].trim();
                });
                data.push(row);
            }
            
            return data;
        }

        createAchievementTimeline() {
            const timelineContainer = document.getElementById('achievement-timeline');
            if (!timelineContainer) return;

            // Create subject achievement chart
            const subjectData = {
                years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
                국어: [3.2, 1.4, 1.0, 1.3, 2.0, 2.6, 2.0, 2.6, 4.4, 4.1, 6.4, 5.9, 11.3, 9.1],
                수학: [5.9, 4.0, 5.0, 5.2, 5.7, 4.6, 4.9, 7.1, 11.1, 11.8, 13.4, 11.6, 13.2, 13.0],
                영어: [3.9, 5.1, 2.1, 3.4, 3.3, 3.4, 4.0, 3.2, 5.3, 3.3, 7.1, 5.9, 8.8, 6.0]
            };

            // Create traces for each subject
            const traces = [
                {
                    x: subjectData.years,
                    y: subjectData.국어,
                    name: '국어',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                },
                {
                    x: subjectData.years,
                    y: subjectData.수학,
                    name: '수학',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                },
                {
                    x: subjectData.years,
                    y: subjectData.영어,
                    name: '영어',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                }
            ];

            const layout = {
                title: '중3 교과별 성취수준 (%)',
                xaxis: {
                    title: '연도',
                    tickangle: -45
                },
                yaxis: {
                    title: '성취수준 (%)',
                    range: [0, 15]
                },
                showlegend: true,
                legend: {
                    x: 1,
                    xanchor: 'right',
                    y: 1
                },
                margin: {
                    l: 50,
                    r: 50,
                    b: 100,
                    t: 50,
                    pad: 4
                }
            };

            Plotly.newPlot('achievement-chart', traces, layout);

            // Rest of the timeline code...
            let html = '<div class="timeline">';
            html += '<h3>중학교 성취도 변화</h3>';
            html += '<table class="table table-striped">';
            html += '<thead><tr><th>연도</th><th>성취도</th></tr></thead><tbody>';
            
            this.middleSchoolData.forEach(row => {
                html += `<tr><td>${row.Year}</td><td>${row.Key_Metrics}</td></tr>`;
            });
            
            html += '</tbody></table>';
            
            html += '<h3 class="mt-4">고등학교 성취도 변화</h3>';
            html += '<table class="table table-striped">';
            html += '<thead><tr><th>연도</th><th>성취도</th></tr></thead><tbody>';
            
            this.highSchoolData.forEach(row => {
                html += `<tr><td>${row.Year}</td><td>${row.Key_Metrics}</td></tr>`;
            });
            
            html += '</tbody></table>';
            html += '</div>';
            
            timelineContainer.innerHTML = html;
        }

        showSection(sectionId) {
            document.querySelectorAll('.tab-pane').forEach(section => {
                section.classList.remove('show', 'active');
            });
            document.getElementById(sectionId).classList.add('show', 'active');
        }

        updateVisualization(type) {
            const visualizations = document.querySelectorAll('.visualization-section');
            visualizations.forEach(vis => {
                vis.style.display = 'none';
            });
            
            const targetVis = document.getElementById(`${type}-visualization`);
            if (targetVis) {
                targetVis.style.display = 'block';
            }
        }

        updateAchievementVisualization(type) {
            // Hide all visualization sections
            document.querySelectorAll('#achievement .visualization-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected visualization section
            const targetSection = document.getElementById(`${type}-visualization`);
            if (targetSection) {
                targetSection.style.display = 'block';
                
                // If this is the timeline visualization, create the achievement chart
                if (type === 'timeline') {
                    this.createAchievementChart();
                }
            }
        }

        createDigitalInfraChart() {
            const infraData = {
                '초등학교': {
                    '컴퓨터': 15000,
                    '인터넷': 95,
                    '스마트교실': 250,
                    '디지털교과서': 1200
                },
                '중학교': {
                    '컴퓨터': 12000,
                    '인터넷': 98,
                    '스마트교실': 180,
                    '디지털교과서': 800
                },
                '고등학교': {
                    '컴퓨터': 18000,
                    '인터넷': 99,
                    '스마트교실': 220,
                    '디지털교과서': 1500
                }
            };

            const tbody = document.getElementById('infra-data');
            if (!tbody) return;

            tbody.innerHTML = '';
            Object.entries(infraData).forEach(([school, data]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${school}</td>
                    <td>${data['컴퓨터'].toLocaleString()}</td>
                    <td>${data['인터넷']}%</td>
                    <td>${data['스마트교실']}</td>
                    <td>${data['디지털교과서']}</td>
                `;
                tbody.appendChild(row);
            });

            // Create chart using Plotly
            const traces = Object.keys(infraData[Object.keys(infraData)[0]]).map(metric => ({
                x: Object.keys(infraData),
                y: Object.values(infraData).map(d => d[metric]),
                type: 'bar',
                name: metric
            }));

            const layout = {
                title: '학교급별 디지털 인프라 현황',
                yaxis: { title: '보유 수량' },
                barmode: 'group'
            };

            Plotly.newPlot('digitalInfraChart', traces, layout);
        }

        createDigitalUsageChart() {
            const usageData = {
                '초등학교': {
                    '수업활용': 85,
                    '학생활용': 78,
                    '교사활용': 92
                },
                '중학교': {
                    '수업활용': 82,
                    '학생활용': 75,
                    '교사활용': 88
                },
                '고등학교': {
                    '수업활용': 79,
                    '학생활용': 72,
                    '교사활용': 85
                }
            };

            const tbody = document.getElementById('usage-data');
            if (!tbody) return;

            tbody.innerHTML = '';
            Object.entries(usageData).forEach(([school, data]) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${school}</td>
                    <td>${data['수업활용']}%</td>
                    <td>${data['학생활용']}%</td>
                    <td>${data['교사활용']}%</td>
                `;
                tbody.appendChild(row);
            });

            // Create chart using Plotly
            const traces = ['수업활용', '학생활용', '교사활용'].map(type => ({
                x: Object.keys(usageData),
                y: Object.values(usageData).map(d => d[type]),
                type: 'bar',
                name: type
            }));

            const layout = {
                title: '학교급별 디지털 자원 활용도',
                yaxis: { title: '활용률 (%)' },
                barmode: 'group'
            };

            Plotly.newPlot('digitalUsageChart', traces, layout);
        }

        createAchievementChart() {
            const subjectData = {
                years: ['2010', '2011', '2012', '2013', '2014', '2015', '2016', '2017', '2018', '2019', '2020', '2021', '2022', '2023'],
                국어: [3.2, 1.4, 1.0, 1.3, 2.0, 2.6, 2.0, 2.6, 4.4, 4.1, 6.4, 5.9, 11.3, 9.1],
                수학: [5.9, 4.0, 5.0, 5.2, 5.7, 4.6, 4.9, 7.1, 11.1, 11.8, 13.4, 11.6, 13.2, 13.0],
                영어: [3.9, 5.1, 2.1, 3.4, 3.3, 3.4, 4.0, 3.2, 5.3, 3.3, 7.1, 5.9, 8.8, 6.0]
            };

            // Create traces for the plot
            const traces = [
                {
                    x: subjectData.years,
                    y: subjectData.국어,
                    name: '국어',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                },
                {
                    x: subjectData.years,
                    y: subjectData.수학,
                    name: '수학',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                },
                {
                    x: subjectData.years,
                    y: subjectData.영어,
                    name: '영어',
                    type: 'scatter',
                    mode: 'lines+markers',
                    line: { width: 2 }
                }
            ];

            const layout = {
                title: '중3 교과별 성취수준 (%)',
                xaxis: {
                    title: '연도',
                    tickangle: -45
                },
                yaxis: {
                    title: '성취수준 (%)',
                    range: [0, 15]
                },
                showlegend: true,
                legend: {
                    x: 1,
                    xanchor: 'right',
                    y: 1
                },
                margin: {
                    l: 50,
                    r: 50,
                    b: 100,
                    t: 50,
                    pad: 4
                }
            };

            // Create the plot
            const chartDiv = document.getElementById('achievement-chart');
            if (chartDiv) {
                Plotly.newPlot('achievement-chart', traces, layout);

                // Populate the table
                const tbody = document.getElementById('achievement-data');
                if (tbody) {
                    tbody.innerHTML = ''; // Clear existing content
                    subjectData.years.forEach((year, index) => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${year}</td>
                            <td>${subjectData.국어[index].toFixed(1)}%</td>
                            <td>${subjectData.수학[index].toFixed(1)}%</td>
                            <td>${subjectData.영어[index].toFixed(1)}%</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    }

    // Initialize dashboard
    const dashboard = new EducationDashboard();

    // Create initial achievement chart when the page loads
    document.addEventListener('DOMContentLoaded', function() {
        const achievementTab = document.getElementById('achievement-tab');
        if (achievementTab) {
            achievementTab.addEventListener('shown.bs.tab', function() {
                dashboard.createAchievementChart();
            });
        }
    });

    // Achievement visualization handler
    function initializeAchievementSection() {
        const achievementButtons = document.querySelectorAll('#achievement .btn-group .btn');
        achievementButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                achievementButtons.forEach(btn => {
                    btn.classList.remove('active', 'btn-primary');
                    btn.classList.add('btn-outline-primary');
                });
                
                // Add active class to clicked button
                this.classList.remove('btn-outline-primary');
                this.classList.add('active', 'btn-primary');
                
                // Hide all visualization sections
                document.querySelectorAll('#achievement .visualization-section').forEach(section => {
                    section.style.display = 'none';
                });
                
                // Show selected visualization section
                const visualizationType = this.getAttribute('data-visualization');
                const targetSection = document.getElementById(`${visualizationType}-visualization`);
                if (targetSection) {
                    targetSection.style.display = 'block';
                    if (visualizationType === 'timeline') {
                        createAchievementChart();
                    }
                }
            });
        });
    }

    // Create chart when achievement section is shown
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section === 'achievement') {
                setTimeout(createAchievementChart, 100);
            }
        });
    });

    // Create chart if achievement section is initially visible
    if (document.getElementById('achievement').style.display !== 'none') {
        createAchievementChart();
    }

    // 상관관계 분석 섹션 버튼 이벤트
    document.querySelectorAll('[data-visualization]').forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            document.querySelectorAll('[data-visualization]').forEach(btn => {
                btn.classList.remove('active');
                btn.classList.remove('btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.add('active');
            this.classList.remove('btn-outline-primary');
            this.classList.add('btn-primary');
            
            // Hide all visualization sections
            document.querySelectorAll('.visualization-section').forEach(section => {
                section.style.display = 'none';
            });
            
            // Show selected visualization
            const visualizationId = this.getAttribute('data-visualization') + '-visualization';
            document.getElementById(visualizationId).style.display = 'block';
        });
    });
});
