// ===== GESTIÓN DE FEEDBACKS =====
class FeedbackManager {
    constructor() {
        this.feedbacks = this.loadFeedbacks();
        this.initializeEventListeners();
        this.renderFeedbacks();
    }

    // Cargar feedbacks del localStorage
    loadFeedbacks() {
        const stored = localStorage.getItem('feedbacks');
        return stored ? JSON.parse(stored) : [];
    }

    // Guardar feedbacks en localStorage
    saveFeedbacks() {
        localStorage.setItem('feedbacks', JSON.stringify(this.feedbacks));
    }

    // Inicializar event listeners
    initializeEventListeners() {
        const form = document.getElementById('feedbackForm');
        const starsContainer = document.getElementById('starsContainer');
        const ratingInput = document.getElementById('rating');

        // Event listener para el formulario
        if (form) {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        }

        // Event listeners para las estrellas
        if (starsContainer) {
            const stars = starsContainer.querySelectorAll('.star');
            stars.forEach(star => {
                star.addEventListener('click', (e) => this.setRating(e.target.dataset.value));
                star.addEventListener('mouseover', (e) => this.previewRating(e.target.dataset.value));
            });
            starsContainer.addEventListener('mouseout', () => this.resetStarPreview());
        }
    }

    // Establecer calificación
    setRating(value) {
        document.getElementById('rating').value = value;
        this.updateStars(value, true);
        document.getElementById('ratingText').textContent = `${value} de 5 estrellas`;
    }

    // Vista previa de calificación
    previewRating(value) {
        this.updateStars(value, false);
    }

    // Resetear vista previa de estrellas
    resetStarPreview() {
        const currentRating = document.getElementById('rating').value;
        this.updateStars(currentRating, true);
    }

    // Actualizar visualización de estrellas
    updateStars(value, isActive) {
        const stars = document.querySelectorAll('.star');
        stars.forEach((star, index) => {
            if (index < value) {
                if (isActive) {
                    star.classList.add('active');
                } else {
                    star.style.color = 'var(--accent-color)';
                }
            } else {
                if (isActive) {
                    star.classList.remove('active');
                } else {
                    star.style.color = 'var(--border-color)';
                }
            }
        });
    }

    // Manejar envío del formulario
    handleSubmit(e) {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const email = document.getElementById('email').value.trim();
        const empresa = document.getElementById('empresa').value.trim();
        const rating = parseInt(document.getElementById('rating').value);
        const mensaje = document.getElementById('mensaje').value.trim();

        // Validar que se haya seleccionado una calificación
        if (rating === 0) {
            this.showNotification('Por favor, selecciona una calificación', 'error');
            return;
        }

        // Crear objeto de feedback
        const feedback = {
            id: Date.now(),
            nombre,
            email,
            empresa: empresa || 'No especificada',
            rating,
            mensaje,
            fecha: new Date().toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        };

        // Agregar feedback a la lista
        this.feedbacks.unshift(feedback);
        this.saveFeedbacks();

        // Mostrar notificación de éxito
        this.showNotification('¡Feedback enviado correctamente!', 'success');

        // Limpiar formulario
        document.getElementById('feedbackForm').reset();
        document.getElementById('rating').value = 0;
        document.getElementById('ratingText').textContent = 'Selecciona una calificación';
        this.updateStars(0, true);

        // Renderizar feedbacks
        this.renderFeedbacks();

        // Scroll a la sección de feedbacks
        setTimeout(() => {
            document.getElementById('feedbacksList').scrollIntoView({ behavior: 'smooth' });
        }, 500);
    }

    // Renderizar lista de feedbacks
    renderFeedbacks() {
        const feedbacksList = document.getElementById('feedbacksList');

        if (this.feedbacks.length === 0) {
            feedbacksList.innerHTML = '<p class="empty-message">No hay feedbacks aún. ¡Sé el primero en dejar uno!</p>';
            return;
        }

        feedbacksList.innerHTML = this.feedbacks.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div>
                        <div class="feedback-author">${this.escapeHtml(feedback.nombre)}</div>
                        <div class="feedback-company">${this.escapeHtml(feedback.empresa)}</div>
                    </div>
                    <div class="feedback-rating">${'★'.repeat(feedback.rating)}${'☆'.repeat(5 - feedback.rating)}</div>
                </div>
                <div class="feedback-message">"${this.escapeHtml(feedback.mensaje)}"</div>
                <div class="feedback-date">${feedback.fecha}</div>
            </div>
        `).join('');
    }

    // Mostrar notificación
    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Escapar caracteres HTML para prevenir XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// ===== FUNCIONES DE NAVEGACIÓN =====

// Scroll suave a secciones
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar el gestor de feedbacks
    const feedbackManager = new FeedbackManager();

    // Agregar funcionalidad de scroll suave a los enlaces de navegación
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                scrollToSection(href.substring(1));
            }
        });
    });

    // Efecto de animación al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar observador a elementos animables
    const animatableElements = document.querySelectorAll('.skill-card, .project-card, .feedback-item');
    animatableElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// ===== FUNCIONES ADICIONALES =====

// Exportar feedbacks como JSON
function exportFeedbacksAsJSON() {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const dataStr = JSON.stringify(feedbacks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbacks_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
}

// Exportar feedbacks como CSV
function exportFeedbacksAsCSV() {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    if (feedbacks.length === 0) {
        alert('No hay feedbacks para exportar');
        return;
    }

    // Crear encabezados
    const headers = ['Nombre', 'Email', 'Empresa', 'Calificación', 'Mensaje', 'Fecha'];
    const csvContent = [
        headers.join(','),
        ...feedbacks.map(fb => [
            `"${fb.nombre}"`,
            `"${fb.email}"`,
            `"${fb.empresa}"`,
            fb.rating,
            `"${fb.mensaje.replace(/"/g, '""')}"`,
            `"${fb.fecha}"`
        ].join(','))
    ].join('\n');

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `feedbacks_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
}

// Obtener estadísticas de feedbacks
function getFeedbacksStats() {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    if (feedbacks.length === 0) {
        return {
            total: 0,
            promedio: 0,
            distribucion: {}
        };
    }

    const total = feedbacks.length;
    const promedio = (feedbacks.reduce((sum, fb) => sum + fb.rating, 0) / total).toFixed(2);
    
    const distribucion = {};
    for (let i = 1; i <= 5; i++) {
        distribucion[i] = feedbacks.filter(fb => fb.rating === i).length;
    }

    return {
        total,
        promedio,
        distribucion
    };
}

// Limpiar todos los feedbacks (requiere confirmación)
function clearAllFeedbacks() {
    if (confirm('¿Estás seguro de que deseas eliminar todos los feedbacks? Esta acción no se puede deshacer.')) {
        localStorage.removeItem('feedbacks');
        location.reload();
    }
}

// Buscar feedbacks por palabra clave
function searchFeedbacks(keyword) {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    const lowerKeyword = keyword.toLowerCase();
    
    return feedbacks.filter(fb => 
        fb.nombre.toLowerCase().includes(lowerKeyword) ||
        fb.empresa.toLowerCase().includes(lowerKeyword) ||
        fb.mensaje.toLowerCase().includes(lowerKeyword)
    );
}

// Filtrar feedbacks por calificación
function filterFeedbacksByRating(minRating) {
    const feedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    return feedbacks.filter(fb => fb.rating >= minRating);
}
