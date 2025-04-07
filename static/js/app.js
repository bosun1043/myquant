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
            loadVisualizationData(selectedVisualization);
        });
    });

    // Function to load data for each visualization
    function loadVisualizationData(visualizationType) {
        fetch('/static/data/total_region.csv')
            .then(response => response.text())
            .then(data => {
                const rows = data.split('\n');
                const headers = rows[0].split(',');
                const dataRows = rows.slice(1).map(row => row.split(','));

                switch (visualizationType) {
                    case 'purpose':
                        loadPurposeData(dataRows, headers);
                        break;
                    case 'region':
                        loadRegionData(dataRows, headers);
                        break;
                    case 'school-type':
                        loadSchoolTypeData(dataRows, headers);
                        break;
                    case 'school-computers':
                        loadSchoolComputersData(dataRows, headers);
                        break;
                }
            })
            .catch(error => {
                console.error('Error loading data:', error);
            });
    }

    function loadPurposeData(dataRows, headers) {
        const tbody = document.getElementById('purpose-data');
        if (!tbody) return;

        tbody.innerHTML = '';
        const purposes = ['학생용', '교사용', '직원용', '기타'];
        const total = purposes.reduce((sum, purpose) => {
            const index = headers.indexOf(purpose);
            const value = parseFloat(dataRows[0][index]) || 0;
            return sum + value;
        }, 0);

        purposes.forEach(purpose => {
            const index = headers.indexOf(purpose);
            const value = parseFloat(dataRows[0][index]) || 0;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${purpose}</td>
                <td>${value.toFixed(1)}</td>
                <td>${percentage}%</td>
            `;
            tbody.appendChild(row);
        });
    }

    function loadRegionData(dataRows, headers) {
        const tbody = document.getElementById('region-data');
        if (!tbody) return;

        tbody.innerHTML = '';
        const total = dataRows.reduce((sum, row) => {
            const value = parseFloat(row[headers.indexOf('전체')]) || 0;
            return sum + value;
        }, 0);

        dataRows.forEach(row => {
            const region = row[headers.indexOf('구분')];
            const computers = parseFloat(row[headers.indexOf('전체')]) || 0;
            const percentage = total > 0 ? ((computers / total) * 100).toFixed(1) : '0.0';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${region}</td>
                <td>${computers.toFixed(1)}</td>
                <td>${percentage}%</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function loadSchoolTypeData(dataRows, headers) {
        const tbody = document.getElementById('school-type-data');
        if (!tbody) return;

        tbody.innerHTML = '';
        const totalSchools = dataRows.reduce((sum, row) => {
            const value = parseInt(row[headers.indexOf('학교 수')]) || 0;
            return sum + value;
        }, 0);

        dataRows.forEach(row => {
            const schoolType = row[headers.indexOf('구분')];
            const schoolCount = parseInt(row[headers.indexOf('학교 수')]) || 0;
            const percentage = totalSchools > 0 ? ((schoolCount / totalSchools) * 100).toFixed(1) : '0.0';

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${schoolType}</td>
                <td>${schoolCount.toLocaleString()}</td>
                <td>${percentage}%</td>
            `;
            tbody.appendChild(tr);
        });
    }

    function loadSchoolComputersData(dataRows, headers) {
        const tbody = document.getElementById('school-computers-data');
        if (!tbody) return;

        tbody.innerHTML = '';
        dataRows.forEach(row => {
            const schoolType = row[headers.indexOf('구분')];
            const total = parseFloat(row[headers.indexOf('전체')]) || 0;
            const student = parseFloat(row[headers.indexOf('학생용')]) || 0;
            const teacher = parseFloat(row[headers.indexOf('교사용')]) || 0;
            const staff = parseFloat(row[headers.indexOf('직원용')]) || 0;
            const other = parseFloat(row[headers.indexOf('기타')]) || 0;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${schoolType}</td>
                <td>${total.toFixed(1)}</td>
                <td>${student.toFixed(1)}</td>
                <td>${teacher.toFixed(1)}</td>
                <td>${staff.toFixed(1)}</td>
                <td>${other.toFixed(1)}</td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Load initial data
    loadVisualizationData('purpose');

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
                btn.classList.remove('active', 'btn-primary');
                btn.classList.add('btn-outline-primary');
            });
            
            // Add active class to clicked button
            this.classList.remove('btn-outline-primary');
            this.classList.add('active', 'btn-primary');

            const selectedSchool = this.getAttribute('data-school');
            console.log('Selected school:', selectedSchool);
            
            // Update image sources based on selected school
            visualizations.forEach(img => {
                const currentSrc = img.getAttribute('src');
                const basePath = currentSrc.substring(0, currentSrc.lastIndexOf('/') + 1);
                const fileName = currentSrc.substring(currentSrc.lastIndexOf('/') + 1);
                
                if (selectedSchool === 'all') {
                    // Reset to original images
                    img.src = currentSrc;
                } else {
                    // Update to filtered images
                    const newFileName = fileName.replace('.png', `_${selectedSchool}.png`);
                    img.src = basePath + newFileName;
                    console.log(`Loading image: ${basePath + newFileName}`); // Debug log
                }
            });
        });
    });
});
