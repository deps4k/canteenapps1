// Main Application
class CanteenApp {
    constructor() {
        this.charts = {};
        this.state = {
            currentUser: {
                name: "Admin Kantin",
                role: "admin",
                email: "admin@canteen.app"
            },
            dashboardData: {
                stats: {
                    revenue: 12500000,
                    orders: 24,
                    customers: 156,
                    menu: '38/42'
                },
                revenueChart: {
                    labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                    data: [1200000, 1900000, 1500000, 2200000, 1800000, 2500000, 2100000]
                },
                warungDistribution: {
                    labels: ['Kantin Utama', 'Kantin Minuman', 'Kantin Snack', 'Kantin Bakso', 'Kantin Soto', 'Kantin Mie'],
                    data: [35, 25, 15, 10, 8, 7],
                    colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
                }
            }
        };
    }

    async init() {
        try {
            // Load all includes
            await this.loadIncludes();
            
            // Initialize UI
            this.initUI();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Load initial data
            this.loadDashboardData();
            
           

            // Hide loading screen
            setTimeout(() => {
    const loading = document.getElementById('loadingScreen');
    const app = document.getElementById('appContainer');

    if (loading) loading.style.display = 'none';
    if (app) app.classList.remove('hidden');

    Utils.showToast('CanteenApps berhasil dimuat!', 'success');
}, 500);
            
        } catch (error) {
            console.error('Error initializing app:', error);
            Utils.showToast('Gagal memuat aplikasi', 'error');
        }
    }

    async loadIncludes() {
        // Load navbar
        await Utils.loadHTML('navbarContainer', 'includes/navbar.html');
        
        // Load sidebar
        await Utils.loadHTML('sidebarContainer', 'includes/sidebar.html');
        
        // Load footer
        await Utils.loadHTML('footerContainer', 'includes/footer.html');
        
        // Load dashboard (default page)
        await Utils.loadHTML('dashboardPage', 'includes/dashboard.html');
        
        // Load other pages initially (optional, can lazy load)
        await Utils.loadHTML('menuPage', 'includes/menu.html');
        await Utils.loadHTML('pesananPage', 'includes/pesanan.html');
        await Utils.loadHTML('strukPage', 'includes/struk.html');
    }

    initUI() {
        // Update user info
        this.updateUserInfo();
        
        // Update current date
        this.updateCurrentDate();
    }

    updateUserInfo() {
        const user = this.state.currentUser;
        const initials = Utils.getUserInitials(user.name);
        
        // Update avatar
        const avatar = document.getElementById('userAvatar');
        if (avatar) avatar.textContent = initials;
        
        // Update user name
        const userName = document.getElementById('userName');
        if (userName) userName.textContent = user.name;
        
        // Update user role
        const userRole = document.getElementById('userRole');
        if (userRole) userRole.textContent = user.role === 'admin' ? 'Administrator' : user.role;
        
        // Update dropdown
        const dropdownName = document.getElementById('dropdownUserName');
        if (dropdownName) dropdownName.textContent = user.name;
        
        const dropdownRole = document.getElementById('dropdownUserRole');
        if (dropdownRole) dropdownRole.textContent = user.role === 'admin' ? 'Administrator' : user.role;
    }

    updateCurrentDate() {
        const dateElement = document.getElementById('currentDate');
        if (dateElement) {
            dateElement.textContent = Utils.formatDate(new Date());
        }
    }

    loadDashboardData() {
        // Update stats
        const stats = this.state.dashboardData.stats;
        
        const revenueElement = document.getElementById('revenueAmount');
        if (revenueElement) revenueElement.textContent = Utils.formatCurrency(stats.revenue);
        
        const ordersElement = document.getElementById('ordersCount');
        if (ordersElement) ordersElement.textContent = stats.orders;
        
        const customersElement = document.getElementById('customersCount');
        if (customersElement) customersElement.textContent = stats.customers;
        
        const menuElement = document.getElementById('menuCount');
        if (menuElement) menuElement.textContent = stats.menu;
        
        // Update warung list
        this.updateWarungList();
        
        // Initialize charts
        this.initCharts();
    }

    updateWarungList() {
        const container = document.getElementById('warungList');
        if (!container) return;
        
        const data = this.state.dashboardData.warungDistribution;
        const total = data.data.reduce((a, b) => a + b, 0);
        
        container.innerHTML = data.labels.map((label, index) => {
            const percentage = ((data.data[index] / total) * 100).toFixed(1);
            return `
                <div class="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                    <div class="flex items-center space-x-3">
                        <div class="w-3 h-3 rounded-full" style="background-color: ${data.colors[index]}"></div>
                        <span class="text-sm font-medium">${label}</span>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div class="h-full rounded-full" style="width: ${percentage}%; background-color: ${data.colors[index]}"></div>
                        </div>
                        <span class="text-sm font-bold">${percentage}%</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    initCharts() {
        // Revenue Chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            const data = this.state.dashboardData.revenueChart;
            
            this.charts.revenue = new Chart(revenueCtx, {
                type: 'line',
                data: {
                    labels: data.labels,
                    datasets: [{
                        label: 'Pendapatan',
                        data: data.data,
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderColor: 'rgba(59, 130, 246, 1)',
                        borderWidth: 3,
                        pointRadius: 5,
                        pointBackgroundColor: 'rgba(59, 130, 246, 1)',
                        pointBorderColor: '#ffffff',
                        pointHoverRadius: 7,
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return 'Rp ' + value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
        
        // Warung Chart
        const warungCtx = document.getElementById('warungChart');
        if (warungCtx) {
            const data = this.state.dashboardData.warungDistribution;
            
            this.charts.warung = new Chart(warungCtx, {
                type: 'doughnut',
                data: {
                    labels: data.labels,
                    datasets: [{
                        data: data.data,
                        backgroundColor: data.colors,
                        borderWidth: 2,
                        borderColor: '#ffffff'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    cutout: '65%',
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
    }

    setupEventListeners() {
        // Sidebar toggle
        document.addEventListener('click', (e) => {
            if (e.target.closest('.sidebar-toggle')) {
                document.querySelector('.sidebar').classList.toggle('open');
            }
        });
        
        // User dropdown
        document.addEventListener('click', (e) => {
            if (e.target.closest('#userMenuBtn')) {
                const dropdown = document.getElementById('userDropdown');
                dropdown.classList.toggle('hidden');
            }
        });
        
        // Notification dropdown
        document.addEventListener('click', (e) => {
            if (e.target.closest('#notificationBtn')) {
                Utils.showToast('Notifikasi belum tersedia', 'info');
            }
        });
        
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin keluar?')) {
                    Utils.showToast('Berhasil keluar dari sistem', 'success');
                    // In a real app, you would redirect to login page
                }
            });
        }
        
        // Navigation
        document.addEventListener('click', (e) => {
            // Menu items
            const menuItem = e.target.closest('.menu-item');
            if (menuItem && menuItem.href) {
                e.preventDefault();
                const page = menuItem.href.split('#')[1];
                this.navigateTo(page);
            }
            
            // Role tabs
            const roleTab = e.target.closest('.role-tab');
            if (roleTab) {
                e.preventDefault();
                document.querySelectorAll('.role-tab').forEach(tab => {
                    tab.classList.remove('active', 'bg-primary', 'text-white');
                    tab.classList.add('text-gray-600');
                });
                roleTab.classList.add('active', 'bg-primary', 'text-white');
                roleTab.classList.remove('text-gray-600');
                
                const role = roleTab.textContent.trim();
                Utils.showToast(`Berhasil beralih ke mode ${role}`, 'success');
            }
            
            // Order tabs
            const orderTab = e.target.closest('.order-tab');
            if (orderTab) {
                e.preventDefault();
                document.querySelectorAll('.order-tab').forEach(tab => {
                    tab.classList.remove('active', 'bg-primary', 'text-white');
                    tab.classList.add('text-gray-600');
                });
                orderTab.classList.add('active', 'bg-primary', 'text-white');
                orderTab.classList.remove('text-gray-600');
            }
            
            // Quick action buttons
            const quickAction = e.target.closest('.quick-action-btn');
            if (quickAction) {
                Utils.showToast('Fitur ini akan segera hadir!', 'info');
            }
        });
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                const icon = refreshBtn.querySelector('i');
                icon.classList.add('fa-spin');
                
                // Simulate refresh
                setTimeout(() => {
                    this.loadDashboardData();
                    icon.classList.remove('fa-spin');
                    Utils.showToast('Data berhasil diperbarui', 'success');
                }, 1000);
            });
        }
        
        // Chart filter
        const chartFilter = document.getElementById('chartFilter');
        if (chartFilter) {
            chartFilter.addEventListener('change', (e) => {
                Utils.showToast(`Filter diubah ke ${e.target.options[e.target.selectedIndex].text}`, 'info');
            });
        }
        
        // Handle hash changes for SPA navigation
        window.addEventListener('hashchange', () => {
            const page = window.location.hash.substring(1) || 'dashboard';
            this.navigateTo(page);
        });
        
        // Initial navigation
        const initialPage = window.location.hash.substring(1) || 'dashboard';
        this.navigateTo(initialPage);
    }

    navigateTo(page) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
            p.classList.add('hidden');
        });
        
        // Show target page
        const targetPage = document.getElementById(`${page}Page`);
        if (targetPage) {
            targetPage.classList.remove('hidden');
            setTimeout(() => {
                targetPage.classList.add('active');
            }, 10);
        }
        
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('bg-primary', 'bg-opacity-10', 'text-primary');
            item.classList.add('text-gray-700', 'hover:bg-gray-100');
        });
        
        const activeItem = document.querySelector(`.menu-item[href="#${page}"]`);
        if (activeItem) {
            activeItem.classList.add('bg-primary', 'bg-opacity-10', 'text-primary');
            activeItem.classList.remove('text-gray-700', 'hover:bg-gray-100');
        }
        
        // Scroll to top
        window.scrollTo(0, 0);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new CanteenApp();
    app.init();
    
    // Make app available globally
    window.CanteenApp = app;
});