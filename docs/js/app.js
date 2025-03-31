class EducationDashboard {
    constructor() {
        this.currentData = null;
        this.setupEventListeners();
        this.loadData();
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        // Search
        document.getElementById('searchButton').addEventListener('click', () => {
            this.handleSearch();
        });

        // Region filter
        document.getElementById('regionFilter').addEventListener('change', () => {
            this.handleRegionFilter();
        });
    }

    async loadData() {
        try {
            // Load integrated education data
            const response = await fetch('data/integrated_education_data.csv');
            const csvText = await response.text();
            this.currentData = this.parseCSV(csvText);
            
            // Update dashboard
            this.updateOverview();
            this.updateInfrastructure();
            this.updateTextbooks();
            this.updateKess();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    parseCSV(csvText) {
        const lines = csvText.split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            return headers.reduce((obj, header, index) => {
                obj[header.trim()] = values[index]?.trim();
                return obj;
            }, {});
        });
    }

    switchSection(sectionId) {
        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.section === sectionId) {
                link.classList.add('active');
            }
        });

        // Show/hide sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.style.display = section.id === sectionId ? 'block' : 'none';
        });
    }

    handleSearch() {
        const searchTerm = document.getElementById('schoolSearch').value.toLowerCase();
        if (!searchTerm) return;

        const filteredData = this.currentData.filter(school => 
            school.school_name?.toLowerCase().includes(searchTerm) ||
            school.school_code?.includes(searchTerm)
        );

        this.updateChartsWithFilteredData(filteredData);
    }

    handleRegionFilter() {
        const selectedRegion = document.getElementById('regionFilter').value;
        if (!selectedRegion) {
            this.updateChartsWithFilteredData(this.currentData);
            return;
        }

        const filteredData = this.currentData.filter(school => 
            school.region === selectedRegion
        );

        this.updateChartsWithFilteredData(filteredData);
    }

    updateOverview() {
        if (!this.currentData) return;

        // Update statistics
        document.getElementById('totalSchools').textContent = this.currentData.length;
        document.getElementById('totalStudents').textContent = this.calculateTotalStudents();
        document.getElementById('avgComputers').textContent = this.calculateAverageComputers();
        document.getElementById('avgKess').textContent = this.calculateAverageKess();

        // Create region distribution chart
        const regionData = this.calculateRegionDistribution();
        this.createRegionChart(regionData);

        // Create infrastructure overview chart
        const infraData = this.calculateInfrastructureOverview();
        this.createInfraChart(infraData);
    }

    updateInfrastructure() {
        if (!this.currentData) return;

        const schoolInfraData = this.calculateSchoolInfrastructure();
        this.createSchoolInfraChart(schoolInfraData);
    }

    updateTextbooks() {
        if (!this.currentData) return;

        const textbookData = this.calculateTextbookStats();
        this.createTextbookChart(textbookData);
    }

    updateKess() {
        if (!this.currentData) return;

        const kessData = this.calculateKessTrends();
        this.createKessChart(kessData);
    }

    // Helper methods for calculations
    calculateTotalStudents() {
        return this.currentData.reduce((sum, school) => 
            sum + (parseInt(school.total_students) || 0), 0
        ).toLocaleString();
    }

    calculateAverageComputers() {
        const total = this.currentData.reduce((sum, school) => 
            sum + (parseInt(school.computer_count) || 0), 0
        );
        return (total / this.currentData.length).toFixed(1);
    }

    calculateAverageKess() {
        const total = this.currentData.reduce((sum, school) => 
            sum + (parseFloat(school.kess_score) || 0), 0
        );
        return (total / this.currentData.length).toFixed(2);
    }

    calculateRegionDistribution() {
        const distribution = {};
        this.currentData.forEach(school => {
            const region = school.region || '기타';
            distribution[region] = (distribution[region] || 0) + 1;
        });
        return distribution;
    }

    calculateInfrastructureOverview() {
        const overview = {
            '컴퓨터': 0,
            '인터넷': 0,
            '스마트교실': 0
        };

        this.currentData.forEach(school => {
            overview['컴퓨터'] += parseInt(school.computer_count) || 0;
            overview['인터넷'] += parseInt(school.internet_speed) || 0;
            overview['스마트교실'] += parseInt(school.smart_classroom_count) || 0;
        });

        return overview;
    }

    calculateSchoolInfrastructure() {
        return this.currentData.map(school => ({
            name: school.school_name,
            computers: parseInt(school.computer_count) || 0,
            internet: parseInt(school.internet_speed) || 0,
            smartClassrooms: parseInt(school.smart_classroom_count) || 0
        }));
    }

    calculateTextbookStats() {
        const stats = {
            '수정': 0,
            '보완': 0,
            '신규': 0
        };

        this.currentData.forEach(school => {
            stats['수정'] += parseInt(school.textbook_modifications) || 0;
            stats['보완'] += parseInt(school.textbook_improvements) || 0;
            stats['신규'] += parseInt(school.textbook_new) || 0;
        });

        return stats;
    }

    calculateKessTrends() {
        const trends = {
            years: [],
            scores: []
        };

        // Assuming we have KESS data for multiple years
        const years = [...new Set(this.currentData.map(school => school.year))].sort();
        years.forEach(year => {
            const yearData = this.currentData.filter(school => school.year === year);
            const avgScore = yearData.reduce((sum, school) => 
                sum + (parseFloat(school.kess_score) || 0), 0
            ) / yearData.length;

            trends.years.push(year);
            trends.scores.push(avgScore);
        });

        return trends;
    }

    // Chart creation methods
    createRegionChart(data) {
        const trace = {
            values: Object.values(data),
            labels: Object.keys(data),
            type: 'pie',
            hole: 0.4
        };

        const layout = {
            title: '지역별 학교 분포',
            showlegend: true,
            height: 400
        };

        Plotly.newPlot('regionChart', [trace], layout);
    }

    createInfraChart(data) {
        const trace = {
            x: Object.keys(data),
            y: Object.values(data),
            type: 'bar'
        };

        const layout = {
            title: '디지털 인프라 현황',
            yaxis: { title: '수량' },
            height: 400
        };

        Plotly.newPlot('infraChart', [trace], layout);
    }

    createSchoolInfraChart(data) {
        const trace = {
            x: data.map(school => school.name),
            y: data.map(school => school.computers),
            type: 'bar',
            name: '컴퓨터 수'
        };

        const layout = {
            title: '학교별 컴퓨터 보유 현황',
            yaxis: { title: '컴퓨터 수' },
            height: 400
        };

        Plotly.newPlot('schoolInfraChart', [trace], layout);
    }

    createTextbookChart(data) {
        const trace = {
            x: Object.keys(data),
            y: Object.values(data),
            type: 'bar'
        };

        const layout = {
            title: '교과서 수정 보완 현황',
            yaxis: { title: '수량' },
            height: 400
        };

        Plotly.newPlot('textbookChart', [trace], layout);
    }

    createKessChart(data) {
        const trace = {
            x: data.years,
            y: data.scores,
            type: 'scatter',
            mode: 'lines+markers'
        };

        const layout = {
            title: 'KESS 지표 추이',
            yaxis: { title: 'KESS 점수' },
            xaxis: { title: '연도' },
            height: 400
        };

        Plotly.newPlot('kessChart', [trace], layout);
    }

    updateChartsWithFilteredData(filteredData) {
        this.currentData = filteredData;
        this.updateOverview();
        this.updateInfrastructure();
        this.updateTextbooks();
        this.updateKess();
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EducationDashboard();
}); 