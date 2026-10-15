/* --- ОБНОВЛЕНИЕ ВРЕМЕНИ (Главная, Оплата, Тарифы) --- */
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { hour12: false });
    
    // Обновляем время на главной странице
    const mainTime = document.getElementById('current-time');
    if (mainTime) { mainTime.textContent = timeString; }
    
    // Обновляем время в окне выбора оплаты
    const paymentTime = document.getElementById('payment-current-time');
    if (paymentTime) { paymentTime.textContent = timeString; }

    // Обновляем время в окне выбора тарифа
    const tariffTime = document.getElementById('tariff-current-time');
    if (tariffTime) { tariffTime.textContent = timeString; }
}

// Запускаем обновление каждую секунду
setInterval(updateTime, 1000);
// Вызываем сразу при загрузке, чтобы не было задержки
updateTime();

/* --- ПЕРЕМЕННЫЕ --- */
let currentUserID = null;
let selectedTariffType = null; // Хранит выбранный тариф (7days, 14days, forever)

/* --- ГЕНЕРАЦИЯ ID --- */
function generateUserID() {
    if (!currentUserID) {
        currentUserID = Math.floor(Date.now() / 1000).toString(36) + Math.random().toString(36).substr(2, 5).toUpperCase();
    }
    return currentUserID;
}

/* --- ФУНКЦИИ УПРАВЛЕНИЯ МОДАЛЬНЫМИ ОКНАМИ --- */
function openModal(modalId) { 
    document.getElementById(modalId).style.display = 'flex'; 
}
function closeModal(modalId) { 
    document.getElementById(modalId).style.display = 'none'; 
}

/* --- УВЕДОМЛЕНИЕ (Красная плашка) --- */
function showNotification() {
    const bar = document.getElementById('notification-bar');
    if (bar) { 
        bar.style.display = 'block'; 
        setTimeout(() => bar.style.display = 'none', 15000); // Висит 15 секунд
    }
}

/* --- ОТКРЫТИЕ ОКНА "НЕТ ПОДПИСКИ" --- */
function openAccessModal(moduleName) {
    document.getElementById('modal-module-title').textContent = `МОДУЛЬ "${moduleName}"`;
    openModal('accessModal');
}

/* --- ВЫБОР ТАРИФА (подсветка) --- */
function selectTariff(element, type) {
    selectedTariffType = type; // Сохраняем выбор
    document.querySelectorAll('.pricing-option').forEach(el => el.classList.remove('selected'));
    element.classList.add('selected');
}

/* --- ГЛАВНАЯ ЛОГИКА СТРАНИЦЫ --- */
document.addEventListener('DOMContentLoaded', function() {
    
    /* 1. Заполняем ID в окне оплаты картой */
    document.getElementById('user-id-display').textContent = generateUserID();

    /* 2. Кнопки модулей на странице "Функции" */
    document.querySelectorAll('.module-btn').forEach(btn => {
        btn.addEventListener('click', function() { 
            openAccessModal(this.dataset.module); 
        });
    });

    /* 3. Окно: "Отсутствует подписка" */
    document.getElementById('btn-buy-access').addEventListener('click', () => { 
        closeModal('accessModal'); 
        openModal('tariffModal'); 
    });
    document.getElementById('btn-later').addEventListener('click', () => closeModal('accessModal'));

    /* 4. Окно: "Выбор тарифа" */
    document.getElementById('btn-confirm-tariff').addEventListener('click', () => {
        if (selectedTariffType) {
            openModal('paymentMethodModal');
        } else {
            alert('Пожалуйста, выберите период подписки');
        }
    });
    document.getElementById('btn-back-from-tariff').addEventListener('click', () => { 
        closeModal('tariffModal'); 
        openModal('accessModal'); 
    });

    /* 5. Окно: "Выбор оплаты" */
    document.getElementById('btn-pay-card').addEventListener('click', () => { 
        closeModal('paymentMethodModal'); 
        openModal('paymentCardModal'); 
        setTimeout(showNotification, 300000); 
    });
    
    document.getElementById('btn-pay-crypto').addEventListener('click', () => { 
        const links = { 
            '7days': 'https://t.me/send?start=IVYTXAAn2D1B', 
            '14days': 'https://t.me/send?start=IVfbAVucNMpO', 
            'forever': 'https://t.me/send?start=IV7nIah3TQle' 
        };
        // Проверяем, выбран ли тариф, и открываем ссылку
        if (selectedTariffType && links[selectedTariffType]) {
            window.open(links[selectedTariffType], '_blank'); 
        } else {
            alert('Сначала выберите тариф');
        }
    });

    document.getElementById('btn-back-from-payment').addEventListener('click', () => { 
        closeModal('paymentMethodModal'); 
        openModal('tariffModal'); 
    });

    /* 6. Окно: "Оплата картой" */
    document.getElementById('btn-back-from-card').addEventListener('click', () => { 
        closeModal('paymentCardModal'); 
        openModal('paymentMethodModal'); 
    });
    document.getElementById('btn-check-payment').addEventListener('click', showNotification);

    /* 7. Универсальное закрытие окон на крестик */
    document.querySelectorAll('.modal-close').forEach(b => {
        b.addEventListener('click', () => {
            b.closest('.modal-overlay').style.display = 'none'; 
        });
    });

    /* 8. Закрытие по клику на фон (оверлей) */
    document.getElementById('tariffModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            selectedTariffType = null;
            document.querySelectorAll('.pricing-option').forEach(el => el.classList.remove('selected'));
            closeModal('tariffModal');
        }
    });
    document.getElementById('paymentMethodModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal('paymentMethodModal');
        }
    });
    document.getElementById('paymentCardModal').addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            closeModal('paymentCardModal');
            openModal('paymentMethodModal');
        }
    });

    /* 9. ИНИЦИАЛИЗАЦИЯ ЗВЕЗДНОГО НЕБА (Версия 2.0) */
    const config = {
        farStars: 200,  // Количество далеких звезд (больше для плотности)
        nearStars: 60,  // Количество близких (крупных) звезд
        minSize: 0.5,   // Минимальный размер в пикселях
        maxSize: 2.5,   // Максимальный размер
        driftDistance: 50 // На сколько пикселей звезда может уплыть
    };

    function createStars(count, containerClass, isNear) {
        const container = document.getElementById(containerClass);
        
        for (let i = 0; i < count; i++) {
            const star = document.createElement('div');
            star.classList.add('star');

            // Случайный размер
            const size = (Math.random() * (config.maxSize - config.minSize) + config.minSize).toFixed(2);
            star.style.width = `${size}px`;
            star.style.height = `${size}px`;

            // Случайная позиция
            const x = Math.random() * 100; // vw
            const y = Math.random() * 100; // vh
            star.style.left = `${x}vw`;
            star.style.top = `${y}vh`;

            // Для анимации дрейфа задаем случайные CSS-переменные
            const dx = (Math.random() * config.driftDistance * 2 - config.driftDistance).toFixed(2);
            const dy = (Math.random() * config.driftDistance * 2 - config.driftDistance).toFixed(2);
            
            // Близкие звезды в конце пути должны немного увеличиваться (эффект приближения)
            const endScale = isNear ? (1 + Math.random() * 0.5).toFixed(2) : 1;

            star.style.setProperty('--dx', `${dx}px`);
            star.style.setProperty('--dy', `${dy}px`);
            star.style.setProperty('--end-scale', endScale);

            // Случайная задержка и длительность для рассинхрона
            star.style.animationDelay = `${Math.random() * 10}s`;
            star.style.animationDuration = `${(Math.random() * 40 + 20).toFixed(1)}s`; // от 20 до 60 секунд

            container.appendChild(star);
        }
    }

    // Создаем слои звезд после загрузки DOM
    createStars(config.farStars, 'layerFar', false);
    createStars(config.nearStars, 'layerNear', true);
});