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

        // Year filter
        document.getElementById('yearFilter').addEventListener('change', () => {
            this.handleYearFilter();
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
            this.updateDigitalResources();
            this.updateAchievement();
            this.updateCorrelation();
            this.updatePolicy();
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

    handleYearFilter() {
        const selectedYear = document.getElementById('yearFilter').value;
        if (!selectedYear) {
            this.updateChartsWithFilteredData(this.currentData);
            return;
        }

        const filteredData = this.currentData.filter(school => 
            school.year === selectedYear
        );

        this.updateChartsWithFilteredData(filteredData);
    }

    updateOverview() {
        if (!this.currentData) return;

        // Update statistics
        document.getElementById('totalSchools').textContent = this.currentData.length;
        document.getElementById('totalStudents').textContent = this.calculateTotalStudents();
        document.getElementById('avgDigitalScore').textContent = this.calculateAverageDigitalScore();
        document.getElementById('avgMathScore').textContent = this.calculateAverageMathScore();

        // Create region distribution charts
        const regionDigitalData = this.calculateRegionDigitalDistribution();
        this.createRegionDigitalChart(regionDigitalData);

        const regionMathData = this.calculateRegionMathDistribution();
        this.createRegionMathChart(regionMathData);
    }

    updateDigitalResources() {
        if (!this.currentData) return;

        const digitalInfraData = this.calculateDigitalInfrastructure();
        this.createDigitalInfraChart(digitalInfraData);

        const digitalUsageData = this.calculateDigitalUsage();
        this.createDigitalUsageChart(digitalUsageData);
    }

    updateAchievement() {
        if (!this.currentData) return;

        const achievementDistData = this.calculateAchievementDistribution();
        this.createAchievementDistChart(achievementDistData);

        const achievementTrendData = this.calculateAchievementTrends();
        this.createAchievementTrendChart(achievementTrendData);
    }

    updateCorrelation() {
        if (!this.currentData) return;

        const correlationData = this.calculateCorrelation();
        this.createCorrelationChart(correlationData);
    }

    updatePolicy() {
        if (!this.currentData) return;

        const policyEffectData = this.calculatePolicyEffect();
        this.createPolicyEffectChart(policyEffectData);

        const policyRegionData = this.calculatePolicyRegionEffect();
        this.createPolicyRegionChart(policyRegionData);
    }

    // Helper methods for calculations
    calculateTotalStudents() {
        return this.currentData.reduce((sum, school) => 
            sum + (parseInt(school.total_students) || 0), 0
        ).toLocaleString();
    }

    calculateAverageDigitalScore() {
        const total = this.currentData.reduce((sum, school) => 
            sum + (parseFloat(school.digital_score) || 0), 0
        );
        return (total / this.currentData.length).toFixed(2);
    }

    calculateAverageMathScore() {
        const total = this.currentData.reduce((sum, school) => 
            sum + (parseFloat(school.math_score) || 0), 0
        );
        return (total / this.currentData.length).toFixed(2);
    }

    calculateRegionDigitalDistribution() {
        const distribution = {};
        this.currentData.forEach(school => {
            const region = school.region || '기타';
            distribution[region] = (distribution[region] || 0) + parseFloat(school.digital_score) || 0;
        });
        return distribution;
    }

    calculateRegionMathDistribution() {
        const distribution = {};
        this.currentData.forEach(school => {
            const region = school.region || '기타';
            distribution[region] = (distribution[region] || 0) + parseFloat(school.math_score) || 0;
        });
        return distribution;
    }

    calculateDigitalInfrastructure() {
        return {
            '컴퓨터': this.currentData.reduce((sum, school) => sum + (parseInt(school.computer_count) || 0), 0),
            '인터넷': this.currentData.reduce((sum, school) => sum + (parseInt(school.internet_speed) || 0), 0),
            '스마트교실': this.currentData.reduce((sum, school) => sum + (parseInt(school.smart_classroom_count) || 0), 0),
            '디지털교과서': this.currentData.reduce((sum, school) => sum + (parseInt(school.digital_textbook_count) || 0), 0)
        };
    }

    calculateDigitalUsage() {
        return {
            '수업활용': this.currentData.reduce((sum, school) => sum + (parseFloat(school.class_usage_rate) || 0), 0) / this.currentData.length,
            '학생활용': this.currentData.reduce((sum, school) => sum + (parseFloat(school.student_usage_rate) || 0), 0) / this.currentData.length,
            '교사활용': this.currentData.reduce((sum, school) => sum + (parseFloat(school.teacher_usage_rate) || 0), 0) / this.currentData.length
        };
    }

    calculateAchievementDistribution() {
        const scores = this.currentData.map(school => parseFloat(school.math_score) || 0);
        return {
            scores: scores,
            bins: Array.from({length: 10}, (_, i) => i * 10)
        };
    }

    calculateAchievementTrends() {
        const years = [...new Set(this.currentData.map(school => school.year))].sort();
        const trends = {
            years: years,
            scores: years.map(year => {
                const yearData = this.currentData.filter(school => school.year === year);
                return yearData.reduce((sum, school) => sum + (parseFloat(school.math_score) || 0), 0) / yearData.length;
            })
        };
        return trends;
    }

    calculateCorrelation() {
        const digitalScores = this.currentData.map(school => parseFloat(school.digital_score) || 0);
        const mathScores = this.currentData.map(school => parseFloat(school.math_score) || 0);
        return {
            x: digitalScores,
            y: mathScores
        };
    }

    calculatePolicyEffect() {
        const years = [...new Set(this.currentData.map(school => school.year))].sort();
        return {
            years: years,
            before: years.map(year => {
                const yearData = this.currentData.filter(school => school.year === year && school.policy_status === 'before');
                return yearData.reduce((sum, school) => sum + (parseFloat(school.math_score) || 0), 0) / yearData.length;
            }),
            after: years.map(year => {
                const yearData = this.currentData.filter(school => school.year === year && school.policy_status === 'after');
                return yearData.reduce((sum, school) => sum + (parseFloat(school.math_score) || 0), 0) / yearData.length;
            })
        };
    }

    calculatePolicyRegionEffect() {
        const regions = [...new Set(this.currentData.map(school => school.region))];
        return regions.map(region => {
            const regionData = this.currentData.filter(school => school.region === region);
            return {
                region: region,
                before: regionData.filter(school => school.policy_status === 'before')
                    .reduce((sum, school) => sum + (parseFloat(school.math_score) || 0), 0) / regionData.length,
                after: regionData.filter(school => school.policy_status === 'after')
                    .reduce((sum, school) => sum + (parseFloat(school.math_score) || 0), 0) / regionData.length
            };
        });
    }

    // Chart creation methods
    createRegionDigitalChart(data) {
        const trace = {
            values: Object.values(data),
            labels: Object.keys(data),
            type: 'pie',
            hole: 0.4
        };

        const layout = {
            title: '지역별 디지털 접근성 분포',
            showlegend: true,
            height: 400
        };

        Plotly.newPlot('regionDigitalChart', [trace], layout);
    }

    createRegionMathChart(data) {
        const trace = {
            values: Object.values(data),
            labels: Object.keys(data),
            type: 'pie',
            hole: 0.4
        };

        const layout = {
            title: '지역별 수학 성취도 분포',
            showlegend: true,
            height: 400
        };

        Plotly.newPlot('regionMathChart', [trace], layout);
    }

    createDigitalInfraChart(data) {
        const trace = {
            x: Object.keys(data),
            y: Object.values(data),
            type: 'bar'
        };

        const layout = {
            title: '디지털 인프라 구성',
            yaxis: { title: '수량' },
            height: 400
        };

        Plotly.newPlot('digitalInfraChart', [trace], layout);
    }

    createDigitalUsageChart(data) {
        const trace = {
            x: Object.keys(data),
            y: Object.values(data),
            type: 'bar'
        };

        const layout = {
            title: '디지털 자원 활용도',
            yaxis: { title: '활용률 (%)' },
            height: 400
        };

        Plotly.newPlot('digitalUsageChart', [trace], layout);
    }

    createAchievementDistChart(data) {
        const trace = {
            x: data.scores,
            type: 'histogram',
            nbinsx: 10
        };

        const layout = {
            title: '수학 성취도 분포',
            xaxis: { title: '성취도 점수' },
            yaxis: { title: '학교 수' },
            height: 400
        };

        Plotly.newPlot('achievementDistChart', [trace], layout);
    }

    createAchievementTrendChart(data) {
        const trace = {
            x: data.years,
            y: data.scores,
            type: 'scatter',
            mode: 'lines+markers'
        };

        const layout = {
            title: '연도별 수학 성취도 추이',
            xaxis: { title: '연도' },
            yaxis: { title: '평균 성취도' },
            height: 400
        };

        Plotly.newPlot('achievementTrendChart', [trace], layout);
    }

    createCorrelationChart(data) {
        const trace = {
            x: data.x,
            y: data.y,
            type: 'scatter',
            mode: 'markers'
        };

        const layout = {
            title: '디지털 접근성과 수학 성취도 상관관계',
            xaxis: { title: '디지털 접근성 지수' },
            yaxis: { title: '수학 성취도' },
            height: 400
        };

        Plotly.newPlot('correlationChart', [trace], layout);
    }

    createPolicyEffectChart(data) {
        const beforeTrace = {
            x: data.years,
            y: data.before,
            type: 'scatter',
            mode: 'lines+markers',
            name: '정책 시행 전'
        };

        const afterTrace = {
            x: data.years,
            y: data.after,
            type: 'scatter',
            mode: 'lines+markers',
            name: '정책 시행 후'
        };

        const layout = {
            title: '정책 시행 전후 수학 성취도 비교',
            xaxis: { title: '연도' },
            yaxis: { title: '평균 성취도' },
            height: 400
        };

        Plotly.newPlot('policyEffectChart', [beforeTrace, afterTrace], layout);
    }

    createPolicyRegionChart(data) {
        const beforeTrace = {
            x: data.map(d => d.region),
            y: data.map(d => d.before),
            type: 'bar',
            name: '정책 시행 전'
        };

        const afterTrace = {
            x: data.map(d => d.region),
            y: data.map(d => d.after),
            type: 'bar',
            name: '정책 시행 후'
        };

        const layout = {
            title: '지역별 정책 효과',
            xaxis: { title: '지역' },
            yaxis: { title: '평균 성취도' },
            height: 400
        };

        Plotly.newPlot('policyRegionChart', [beforeTrace, afterTrace], layout);
    }

    updateChartsWithFilteredData(filteredData) {
        this.currentData = filteredData;
        this.updateOverview();
        this.updateDigitalResources();
        this.updateAchievement();
        this.updateCorrelation();
        this.updatePolicy();
    }
}

// Initialize the dashboard when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EducationDashboard();
}); 