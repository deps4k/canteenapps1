// Component Manager for CanteenApps
class ComponentManager {
    constructor() {
        this.components = new Map();
        this.initialized = false;
    }

    // Register a component
    register(name, component) {
        this.components.set(name, component);
    }

    // Initialize all components
    async init() {
        if (this.initialized) return;
        
        try {
            // Load HTML includes
            await this.loadIncludes();
            
            // Initialize each component
            for (const [name, component] of this.components) {
                if (typeof component.init === 'function') {
                    await component.init();
                }
            }
            
            this.initialized = true;
            console.log('All components initialized successfully');
            
        } catch (error) {
            console.error('Error initializing components:', error);
        }
    }

    // Load HTML includes
    async loadIncludes() {
        const includes = ['navbar', 'sidebar', 'footer', 'dashboard'];
        
        for (const include of includes) {
            try {
                const response = await fetch(`includes/${include}.html`);
                if (!response.ok) throw new Error(`Failed to load ${include}.html`);
                
                const html = await response.text();
                const container = document.getElementById(`${include}Container`) || 
                                document.getElementById(`${include}Page`);
                
                if (container) {
                    container.innerHTML = html;
                    
                    // Dispatch event for component loaded
                    container.dispatchEvent(new CustomEvent(`${include}:loaded`));
                }
            } catch (error) {
                console.error(`Error loading ${include}:`, error);
            }
        }
    }

    // Get a component
    get(name) {
        return this.components.get(name);
    }

    // Update component
    update(name, data) {
        const component = this.components.get(name);
        if (component && typeof component.update === 'function') {
            component.update(data);
        }
    }

    // Destroy component
    destroy(name) {
        const component = this.components.get(name);
        if (component && typeof component.destroy === 'function') {
            component.destroy();
        }
        this.components.delete(name);
    }
}

// Navbar Component
class NavbarComponent {
    constructor() {
        this.notifications = [
            {
                id: 1,
                type: 'order',
                title: 'Pesanan #0012 Selesai',
                message: 'Nasi Goreng Spesial telah selesai diproses',
                time: '2 menit lalu',
                icon: 'fa-shopping-cart',
                unread: true
            },
            {
                id: 2,
                type: 'stock',
                title: 'Stok Menipis',
                message: 'Nasi Goreng tersisa 3 porsi',
                time: '1 jam lalu',
                icon: 'fa-exclamation-triangle',
                unread: true
            },
            {
                id: 3,
                type: 'revenue',
                title: 'Pendapatan Naik',
                message: '+15% dari kemarin',
                time: '3 jam lalu',
                icon: 'fa-chart-line',
                unread: false
            }
        ];
    }

    async init() {
        // Wait for navbar to be loaded
        await this.waitForElement('#navbar');
        
        this.renderNotifications();
        this.setupEventListeners();
        this.updateUserInfo();
        
        console.log('Navbar component initialized');
    }

    waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve();
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    renderNotifications() {
        const notificationList = document.querySelector('.notification-list');
        if (!notificationList) return;

        notificationList.innerHTML = this.notifications.map(notif => `
            <div class="notification-item ${notif.unread ? 'unread' : ''}" data-id="${notif.id}">
                <div class="flex items-start gap-3">
                    <div class="notification-icon ${this.getNotificationColor(notif.type)}">
                        <i class="fas ${notif.icon}"></i>
                    </div>
                    <div class="flex-1">
                        <p class="notification-title">${notif.title}</p>
                        <p class="notification-message text-sm text-gray-600">${notif.message}</p>
                        <p class="notification-time text-xs text-gray-500">${notif.time}</p>
                    </div>
                    ${notif.unread ? 
                        '<div class="notification-dot w-2 h-2 bg-red-500 rounded-full mt-2"></div>' : 
                        ''
                    }
                </div>
            </div>
        `).join('');
    }

    getNotificationColor(type) {
        const colors = {
            order: 'bg-blue-100 text-blue-600',
            stock: 'bg-yellow-100 text-yellow-600',
            revenue: 'bg-green-100 text-green-600',
            system: 'bg-purple-100 text-purple-600'
        };
        return colors[type] || 'bg-gray-100 text-gray-600';
    }

    setupEventListeners() {
        // Toggle notification dropdown
        document.addEventListener('click', (e) => {
            const notificationBtn = e.target.closest('#notificationBtn');
            const notificationDropdown = document.querySelector('.notification-dropdown-content');
            
            if (notificationBtn && notificationDropdown) {
                notificationDropdown.classList.toggle('show');
                e.stopPropagation();
            }
            
            // Close dropdowns when clicking outside
            if (!e.target.closest('.notification-dropdown-content') && 
                !e.target.closest('#notificationBtn')) {
                document.querySelectorAll('.notification-dropdown-content.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Toggle user dropdown
        document.addEventListener('click', (e) => {
            const userMenuBtn = e.target.closest('.user-menu');
            const userDropdown = document.querySelector('.user-dropdown');
            
            if (userMenuBtn && userDropdown) {
                userDropdown.classList.toggle('show');
                e.stopPropagation();
            }
            
            // Close dropdowns when clicking outside
            if (!e.target.closest('.user-dropdown') && 
                !e.target.closest('.user-menu')) {
                document.querySelectorAll('.user-dropdown.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });

        // Search functionality
        const searchInput = document.querySelector('.search-input');
        const searchClear = document.querySelector('.search-clear');
        
        if (searchInput && searchClear) {
            searchInput.addEventListener('input', (e) => {
                searchClear.style.display = e.target.value ? 'block' : 'none';
            });

            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchClear.style.display = 'none';
                searchInput.focus();
            });
        }

        // Mark all notifications as read
        const markAllRead = document.querySelector('.mark-all-read');
        if (markAllRead) {
            markAllRead.addEventListener('click', () => {
                this.markAllAsRead();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleLogout();
            });
        }
    }

    markAllAsRead() {
        this.notifications = this.notifications.map(notif => ({
            ...notif,
            unread: false
        }));
        
        this.renderNotifications();
        
        // Update badge
        const badge = document.querySelector('.notification-badge');
        if (badge) {
            badge.textContent = '0';
            badge.classList.remove('animate-pulse');
        }
        
        Utils.showToast('Semua notifikasi ditandai sebagai dibaca', 'success');
    }

    handleLogout() {
        if (confirm('Apakah Anda yakin ingin keluar?')) {
            Utils.showToast('Berhasil keluar dari sistem', 'success');
            
            // Reset user state
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        }
    }

    updateUserInfo() {
        const user = window.AppState?.currentUser;
        if (!user) return;

        // Update user initials
        const initials = Utils.getUserInitials(user.name);
        document.querySelectorAll('.user-avatar, .user-dropdown-avatar').forEach(el => {
            el.textContent = initials;
        });

        // Update user name
        document.querySelectorAll('.user-name, .user-dropdown-name').forEach(el => {
            el.textContent = user.name;
        });

        // Update user role
        const roleMap = {
            admin: 'Administrator',
            kasir: 'Kasir',
            pelanggan: 'Pelanggan',
            koki: 'Koki'
        };
        
        document.querySelectorAll('.user-role, .user-dropdown-email').forEach(el => {
            el.textContent = roleMap[user.role] || user.role;
        });
    }
}

// Sidebar Component
class SidebarComponent {
    async init() {
        await this.waitForElement('#sidebar');
        this.setupEventListeners();
        this.highlightActiveMenu();
        console.log('Sidebar component initialized');
    }

    waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve();
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    setupEventListeners() {
        // Toggle sidebar on mobile
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => {
                document.querySelector('.sidebar').classList.toggle('open');
            });
        }

        // Menu item clicks
        document.addEventListener('click', (e) => {
            const menuItem = e.target.closest('.menu-item');
            if (menuItem && !menuItem.classList.contains('active')) {
                // Remove active class from all menu items
                document.querySelectorAll('.menu-item.active').forEach(item => {
                    item.classList.remove('active');
                });
                
                // Add active class to clicked item
                menuItem.classList.add('active');
                
                // Load corresponding page
                const page = menuItem.getAttribute('data-page');
                if (page) {
                    this.loadPage(page);
                }
            }
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.querySelector('.sidebar');
                const sidebarToggle = document.querySelector('.sidebar-toggle');
                
                if (sidebar && sidebar.classList.contains('open') && 
                    !sidebar.contains(e.target) && 
                    !sidebarToggle?.contains(e.target)) {
                    sidebar.classList.remove('open');
                }
            }
        });
    }

    highlightActiveMenu() {
        const currentPage = window.location.hash.substring(1) || 'dashboard';
        const menuItem = document.querySelector(`.menu-item[data-page="${currentPage}"]`);
        
        if (menuItem) {
            document.querySelectorAll('.menu-item.active').forEach(item => {
                item.classList.remove('active');
            });
            menuItem.classList.add('active');
        }
    }

    async loadPage(page) {
        try {
            // Show loading
            Utils.showLoading();
            
            // Load page content
            const response = await fetch(`pages/${page}.html`);
            if (!response.ok) throw new Error(`Failed to load ${page}.html`);
            
            const html = await response.text();
            const container = document.querySelector('.page-content');
            
            if (container) {
                container.innerHTML = html;
                
                // Update URL
                window.history.pushState({ page }, '', `#${page}`);
                
                // Initialize page-specific components
                this.initializePageComponents(page);
                
                // Dispatch event
                container.dispatchEvent(new CustomEvent('page:loaded', { detail: { page } }));
                
                Utils.showToast(`Halaman ${page} dimuat`, 'success');
            }
            
        } catch (error) {
            console.error('Error loading page:', error);
            Utils.showToast('Gagal memuat halaman', 'error');
        } finally {
            Utils.hideLoading();
        }
    }

    initializePageComponents(page) {
        switch (page) {
            case 'dashboard':
                window.initializeDashboard?.();
                break;
            case 'orders':
                window.initializeOrders?.();
                break;
            case 'menu':
                window.initializeMenu?.();
                break;
            case 'reports':
                window.initializeReports?.();
                break;
        }
    }
}

// Dashboard Component
class DashboardComponent {
    constructor() {
        this.stats = {
            revenue: 12500000,
            orders: 24,
            customers: 156,
            menu: '38/42',
            pending: 4,
            completed: 18,
            newCustomers: 5,
            topSelling: 45
        };
        
        this.chartData = {
            revenue: {
                labels: ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'],
                data: [1200000, 1900000, 1500000, 2200000, 1800000, 2500000, 2100000]
            },
            warung: {
                labels: ['Kantin Utama', 'Kantin Minuman', 'Kantin Snack', 'Kantin Bakso', 'Kantin Soto', 'Kantin Mie'],
                data: [35, 25, 15, 10, 8, 7],
                colors: ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444', '#06B6D4']
            }
        };
    }

    async init() {
        await this.waitForElement('#dashboardPage');
        
        this.renderStats();
        this.renderCharts();
        this.renderWarungList();
        this.setupEventListeners();
        
        console.log('Dashboard component initialized');
    }

    waitForElement(selector) {
        return new Promise(resolve => {
            if (document.querySelector(selector)) {
                return resolve();
            }

            const observer = new MutationObserver(() => {
                if (document.querySelector(selector)) {
                    observer.disconnect();
                    resolve();
                }
            });

            observer.observe(document.body, {
                childList: true,
                subtree: true
            });
        });
    }

    renderStats() {
        const statsGrid = document.getElementById('statsGrid');
        if (!statsGrid) return;

        const stats = [
            {
                title: 'Pendapatan Bulan Ini',
                value: Utils.formatCurrency(this.stats.revenue),
                trend: '+12.5%',
                trendType: 'up',
                icon: 'fa-coins',
                color: 'primary'
            },
            {
                title: 'Pesanan Hari Ini',
                value: this.stats.orders,
                trend: `${this.stats.completed} selesai`,
                trendType: 'success',
                icon: 'fa-shopping-cart',
                color: 'success'
            },
            {
                title: 'Total Pelanggan',
                value: this.stats.customers,
                trend: `+${this.stats.newCustomers} baru`,
                trendType: 'up',
                icon: 'fa-users',
                color: 'warning'
            },
            {
                title: 'Menu Aktif',
                value: this.stats.menu,
                trend: `${this.stats.topSelling} terjual`,
                trendType: 'success',
                icon: 'fa-utensils',
                color: 'accent'
            }
        ];

        statsGrid.innerHTML = stats.map(stat => `
            <div class="stat-card ${stat.color}">
                <div class="stat-header">
                    <div>
                        <p class="stat-title">${stat.title}</p>
                        <h3 class="stat-value">${stat.value}</h3>
                    </div>
                    <div class="stat-icon ${stat.color}">
                        <i class="fas ${stat.icon}"></i>
                    </div>
                </div>
                <div class="stat-trend ${stat.trendType === 'up' ? 'trend-up' : 'trend-down'}">
                    <i class="fas fa-arrow-${stat.trendType === 'up' ? 'up' : 'down'}"></i>
                    <span>${stat.trend}</span>
                </div>
            </div>
        `).join('');
    }

    renderCharts() {
        // Revenue chart will be initialized in charts.js
        // Warung chart will be initialized in charts.js
    }

    renderWarungList() {
        const warungList = document.getElementById('warungList');
        if (!warungList) return;

        const warungs = this.chartData.warung.labels.map((label, index) => ({
            label,
            value: this.chartData.warung.data[index],
            color: this.chartData.warung.colors[index]
        }));

        warungList.innerHTML = warungs.map(warung => `
            <div class="warung-item">
                <div class="warung-info">
                    <div class="warung-color" style="background: ${warung.color}"></div>
                    <span class="warung-name">${warung.label}</span>
                </div>
                <div class="warung-stats">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${warung.value}%; background: ${warung.color}"></div>
                    </div>
                    <span class="warung-percentage">${warung.value}%</span>
                </div>
            </div>
        `).join('');
    }

    setupEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Chart filter
        const chartFilter = document.getElementById('chartFilter');
        if (chartFilter) {
            chartFilter.addEventListener('change', (e) => {
                this.updateChartData(e.target.value);
            });
        }

        // Quick action buttons
        document.addEventListener('click', (e) => {
            const quickAction = e.target.closest('.quick-action-btn');
            if (quickAction) {
                const action = quickAction.getAttribute('data-action');
                this.handleQuickAction(action);
            }
        });
    }

    refreshData() {
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const icon = refreshBtn.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Simulate API call
            setTimeout(() => {
                // Update stats with random variations
                this.stats.revenue += Math.floor(Math.random() * 1000000) - 500000;
                this.stats.orders += Math.floor(Math.random() * 5) - 2;
                this.stats.customers += Math.floor(Math.random() * 3) - 1;
                
                // Update charts
                this.chartData.revenue.data = this.chartData.revenue.data.map(value => 
                    Math.max(1000000, value + Math.floor(Math.random() * 500000) - 250000)
                );
                
                // Re-render
                this.renderStats();
                
                // Update chart if it exists
                if (window.revenueChart) {
                    window.revenueChart.data.datasets[0].data = this.chartData.revenue.data;
                    window.revenueChart.update();
                }
                
                icon.classList.remove('fa-spin');
                Utils.showToast('Data berhasil diperbarui', 'success');
            }, 1000);
        }
    }

    updateChartData(filter) {
        let labels, data;
        
        switch (filter) {
            case '30days':
                labels = Array.from({length: 30}, (_, i) => `Hari ${i + 1}`);
                data = Array.from({length: 30}, () => Math.floor(Math.random() * 3000000) + 1000000);
                break;
            case 'month':
                labels = ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'];
                data = [4500000, 5200000, 4800000, 5500000];
                break;
            default:
                labels = this.chartData.revenue.labels;
                data = this.chartData.revenue.data;
        }
        
        // Update chart if it exists
        if (window.revenueChart) {
            window.revenueChart.data.labels = labels;
            window.revenueChart.data.datasets[0].data = data;
            window.revenueChart.update();
        }
        
        Utils.showToast(`Filter diubah ke ${filter}`, 'info');
    }

    handleQuickAction(action) {
        const actions = {
            addMenu: () => {
                Utils.showToast('Fitur Tambah Menu akan segera hadir', 'info');
            },
            manageOrders: () => {
                Utils.showToast('Membuka halaman Pesanan', 'info');
                window.location.hash = 'orders';
            },
            generateReport: () => {
                Utils.showToast('Membuka halaman Laporan', 'info');
                window.location.hash = 'reports';
            },
            manageUsers: () => {
                Utils.showToast('Fitur Kelola Pengguna akan segera hadir', 'info');
            }
        };
        
        if (actions[action]) {
            actions[action]();
        }
    }
}

// Export components globally
window.ComponentManager = new ComponentManager();
window.NavbarComponent = NavbarComponent;
window.SidebarComponent = SidebarComponent;
window.DashboardComponent = DashboardComponent;