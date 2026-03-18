document.addEventListener('DOMContentLoaded', () => {

    // --- Navbar scroll ---
    const nav = document.getElementById('nav');
    window.addEventListener('scroll', () => {
        nav.classList.toggle('nav--scrolled', window.scrollY > 40);
    });

    // --- Mobile burger ---
    const burger = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    burger.addEventListener('click', () => {
        mobileMenu.classList.toggle('mobile-menu--open');
        document.body.style.overflow = mobileMenu.classList.contains('mobile-menu--open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            mobileMenu.classList.remove('mobile-menu--open');
            document.body.style.overflow = '';
        });
    });

    // --- Animated counters ---
    const counters = document.querySelectorAll('[data-count]');
    let countersDone = false;
    function animateCounters() {
        if (countersDone) return;
        counters.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.9) {
                countersDone = true;
                const target = +el.dataset.count;
                const dur = 1200;
                const start = performance.now();
                const tick = (now) => {
                    const p = Math.min((now - start) / dur, 1);
                    const ease = 1 - Math.pow(1 - p, 3);
                    el.textContent = Math.round(target * ease);
                    if (p < 1) requestAnimationFrame(tick);
                };
                requestAnimationFrame(tick);
            }
        });
    }
    window.addEventListener('scroll', animateCounters);
    animateCounters();

    // --- FAQ accordion ---
    document.querySelectorAll('.faq__question').forEach(btn => {
        btn.addEventListener('click', () => {
            const item = btn.parentElement;
            const answer = item.querySelector('.faq__answer');
            const isOpen = item.classList.contains('faq__item--open');

            document.querySelectorAll('.faq__item--open').forEach(openItem => {
                openItem.classList.remove('faq__item--open');
                openItem.querySelector('.faq__answer').style.maxHeight = null;
            });

            if (!isOpen) {
                item.classList.add('faq__item--open');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });

    // --- Fade-up on scroll ---
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => observer.observe(el));

    // --- Interactive demo bot ---
    const chat = document.getElementById('demoChat');
    if (chat) {
        chat.querySelectorAll('.chat-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const drink = btn.dataset.reply;
                if (!drink) return;

                const buttonsBlock = btn.closest('.chat-bubble--buttons');
                if (buttonsBlock) buttonsBlock.remove();

                addBubble('user', drink + ', пожалуйста!');

                setTimeout(() => {
                    addBubble('bot', 'Отлично! ' + drink + ' будет готов через 5 минут. Ждём вас!');
                }, 600);

                setTimeout(() => {
                    addBubble('bot', 'Хотите добавить десерт? 🍰');
                    const btns = document.createElement('div');
                    btns.className = 'chat-bubble chat-bubble--buttons';
                    btns.innerHTML =
                        '<span class="chat-btn" data-reply="Круассан">🥐 Круассан — 120 ₽</span>' +
                        '<span class="chat-btn" data-reply="Чизкейк">🍰 Чизкейк — 180 ₽</span>';
                    chat.appendChild(btns);
                    btns.style.animation = 'bubbleIn .4s ease both';
                    chat.scrollTop = chat.scrollHeight;

                    btns.querySelectorAll('.chat-btn').forEach(b => {
                        b.addEventListener('click', () => {
                            const d = b.dataset.reply;
                            btns.remove();
                            addBubble('user', d + '!');
                            setTimeout(() => {
                                addBubble('bot', 'Добавили ' + d + ' к заказу. Итого с ' + drink + ': приходите забирать! 😊');
                            }, 500);
                        });
                    });
                }, 1400);
            });
        });
    }

    function addBubble(type, text) {
        const div = document.createElement('div');
        div.className = 'chat-bubble chat-bubble--' + type;
        div.textContent = text;
        div.style.animation = 'bubbleIn .4s ease both';
        chat.appendChild(div);
        chat.scrollTop = chat.scrollHeight;
    }

    // --- Service cards 3D tilt ---
    document.querySelectorAll('.service-card, .price-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `perspective(800px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });

    // --- Form submission via bot API ---
    const API_URL = 'https://maxcode-bot-production.up.railway.app/api/lead';
    const API_SECRET = 'maxcode2026';

    const form = document.getElementById('contactForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = form.querySelector('button[type="submit"]');
        btn.textContent = 'Отправляем...';
        btn.disabled = true;

        const data = new FormData(form);
        const payload = {
            name: data.get('name'),
            phone: data.get('phone'),
            service: data.get('service') || 'Не указано',
            message: data.get('message') || 'Не указано',
        };

        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Secret': API_SECRET,
                },
                body: JSON.stringify(payload),
            });
        } catch (err) { /* silent */ }

        form.innerHTML =
            '<div style="text-align:center;padding:40px 20px">' +
            '<div style="font-size:3rem;margin-bottom:16px">✅</div>' +
            '<h3 style="font-size:1.4rem;font-weight:800;margin-bottom:8px;color:#fff">Заявка отправлена!</h3>' +
            '<p style="color:rgba(255,255,255,.5)">Мы свяжемся с вами в течение 15 минут</p>' +
            '</div>';
    });

    // --- Smooth scroll ---
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id === '#') return;
            const el = document.querySelector(id);
            if (el) {
                e.preventDefault();
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

});
