// Utility functions for CanteenApps
window.Utils = {
    // Format currency
    formatCurrency: function(amount) {
        if (typeof amount !== 'number') return 'Rp 0';
        
        if (amount >= 1000000) {
            return 'Rp ' + (amount / 1000000).toFixed(1).replace('.', ',') + ' Jt';
        } else if (amount >= 1000) {
            return 'Rp ' + amount.toLocaleString('id-ID');
        } else {
            return 'Rp ' + amount;
        }
    },

    // Format date
    formatDate: function(date) {
        const d = new Date(date);
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        return d.toLocaleDateString('id-ID', options);
    },

    // Show toast notification
    showToast: function(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'check-circle' :
                    type === 'error' ? 'exclamation-circle' :
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle';
        
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${icon} text-${type === 'success' ? 'green' : type === 'error' ? 'red' : type === 'warning' ? 'yellow' : 'blue'}-500 mr-3"></i>
                <span class="text-sm font-medium">${message}</span>
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    },

    // Get user initials
    getUserInitials: function(name) {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    },

    // Load HTML content
    loadHTML: async function(elementId, url) {
    try {
        const element = document.getElementById(elementId);
        if (!element) return;

        const response = await fetch(url);
        if (!response.ok) {
            console.warn(`Skip load: ${url}`);
            return; // ⬅️ PENTING
        }

        const html = await response.text();
        element.innerHTML = html;
    } catch (error) {
        console.error(`Error loading ${url}:`, error);
    }
}
};