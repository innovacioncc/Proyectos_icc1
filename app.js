document.addEventListener('DOMContentLoaded', () => {
    // 1. Inicialización y Gestión de localStorage para Likes y Comentarios
    const initLocalStorage = () => {
        // Inicializar Likes si no existen en localStorage
        if (!localStorage.getItem('biotech_likes')) {
            const initialLikes = {};
            // Inicializar contadores para los 13 proyectos
            for (let i = 1; i <= 13; i++) {
                initialLikes[`project_${i}`] = Math.floor(Math.random() * 15) + 5; // Valores iniciales aleatorios realistas
            }
            localStorage.setItem('biotech_likes', JSON.stringify(initialLikes));
        }

        // Inicializar estado de liked por usuario
        if (!localStorage.getItem('biotech_user_liked')) {
            localStorage.setItem('biotech_user_liked', JSON.stringify({}));
        }

        // Inicializar Comentarios si no existen en localStorage
        if (!localStorage.getItem('biotech_comments')) {
            const initialComments = {
                // Comentarios semilla de demostración para algunos proyectos
                'project_1': [
                    { text: "Excelente iniciativa de código abierto. Hacía falta un biorreactor accesible en LATAM.", author: "Dr. Carlos Mendoza", date: "10/06/2026, 10:15 a. m." },
                    { text: "Me interesa para el laboratorio de nuestra facultad. ¿Cómo podemos colaborar?", author: "Prof. Ana María Gómez", date: "11/06/2026, 4:30 p. m." }
                ],
                'project_2': [
                    { text: "La nanoencapsulación lipídica es el futuro de las hormonas de crecimiento. Gran propuesta.", author: "Dra. Sofía Reyes", date: "09/06/2026, 11:20 a. m." }
                ],
                'project_6': [
                    { text: "El modelado in silico acelera meses de experimentación en el laboratorio de cepas. ¡Mucho éxito!", author: "M. en C. Roberto Díaz", date: "12/06/2026, 9:00 a. m." }
                ]
            };
            localStorage.setItem('biotech_comments', JSON.stringify(initialComments));
        }
    };

    initLocalStorage();

    // 2. Elementos del DOM e Interactividad de Likes
    const likesData = JSON.parse(localStorage.getItem('biotech_likes'));
    const userLikedData = JSON.parse(localStorage.getItem('biotech_user_liked'));
    const commentsData = JSON.parse(localStorage.getItem('biotech_comments'));

    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const projectId = card.getAttribute('data-id');
        const projectKey = `project_${projectId}`;

        // Configurar contador de likes inicial
        const likeCounterSpan = card.querySelector('.like-counter span');
        const currentLikes = likesData[projectKey] || 0;
        likeCounterSpan.textContent = currentLikes;

        // Configurar estado del botón de Like
        const likeBtn = card.querySelector('.like-btn');
        if (userLikedData[projectKey]) {
            likeBtn.classList.add('liked');
            likeBtn.querySelector('span').textContent = 'Te gusta';
        }

        // Evento de clic en Me gusta (Toggle)
        likeBtn.addEventListener('click', () => {
            const isLiked = likeBtn.classList.contains('liked');
            const updatedLikesData = JSON.parse(localStorage.getItem('biotech_likes'));
            const updatedUserLikedData = JSON.parse(localStorage.getItem('biotech_user_liked'));

            if (isLiked) {
                // Quitar Like
                updatedLikesData[projectKey] = Math.max(0, (updatedLikesData[projectKey] || 1) - 1);
                delete updatedUserLikedData[projectKey];
                likeBtn.classList.remove('liked');
                likeBtn.querySelector('span').textContent = 'Me gusta';
            } else {
                // Dar Like
                updatedLikesData[projectKey] = (updatedLikesData[projectKey] || 0) + 1;
                updatedUserLikedData[projectKey] = true;
                likeBtn.classList.add('liked');
                likeBtn.querySelector('span').textContent = 'Te gusta';
            }

            // Guardar cambios en localStorage
            localStorage.setItem('biotech_likes', JSON.stringify(updatedLikesData));
            localStorage.setItem('biotech_user_liked', JSON.stringify(updatedUserLikedData));

            // Actualizar interfaz
            likeCounterSpan.textContent = updatedLikesData[projectKey];
        });

        // 3. Renderizado y Envío de Comentarios (opcional, si los elementos locales existen)
        const commentsListContainer = card.querySelector('.comments-list-container');
        const commentCountSpan = card.querySelector('.comment-count');
        const commentForm = card.querySelector('.comment-form');
        const commentInput = card.querySelector('.comment-input');

        if (commentsListContainer && commentCountSpan && commentForm && commentInput) {
            const renderComments = () => {
                const allComments = JSON.parse(localStorage.getItem('biotech_comments'));
                const projectComments = allComments[projectKey] || [];
                commentsListContainer.innerHTML = '';
                commentCountSpan.textContent = projectComments.length;

                if (projectComments.length === 0) {
                    commentsListContainer.innerHTML = '<div class="no-comments">No hay comentarios aún. ¡Sé el primero!</div>';
                    return;
                }

                projectComments.forEach(comment => {
                    const commentElement = document.createElement('div');
                    commentElement.className = 'comment-item';
                    commentElement.innerHTML = `
                        <div class="comment-header">
                            <span class="comment-author">${comment.author || 'Visitante'}</span>
                            <span class="comment-date">${comment.date}</span>
                        </div>
                        <div class="comment-text">${comment.text}</div>
                    `;
                    commentsListContainer.appendChild(commentElement);
                });
            };

            // Renderizar al inicio
            renderComments();

            // Enviar nuevo comentario
            commentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const text = commentInput.value.trim();
                if (!text) return;

                const allComments = JSON.parse(localStorage.getItem('biotech_comments'));
                if (!allComments[projectKey]) {
                    allComments[projectKey] = [];
                }

                const now = new Date();
                const dateStr = now.toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });

                // Guardamos el comentario como "Usuario" (simulado para local)
                const newComment = {
                    text: text,
                    author: 'Tú (Visitante)',
                    date: dateStr
                };

                allComments[projectKey].push(newComment);
                localStorage.setItem('biotech_comments', JSON.stringify(allComments));

                commentInput.value = '';
                renderComments();

                // Abrir automáticamente el acordeón de comentarios si estaba cerrado para que el usuario vea su comentario
                const commentsAccordion = card.querySelector('.comments-accordion');
                if (commentsAccordion) {
                    commentsAccordion.open = true;
                }
            });
        }
    });

    // 4. Filtrado Dinámico de Categorías (Navbar + Botones de Filtro)
    const filterButtons = document.querySelectorAll('.filter-btn');
    const navLinks = document.querySelectorAll('.nav-menu .nav-item a');
    const navItems = document.querySelectorAll('.nav-menu .nav-item');

    const filterProjects = (category) => {
        projectCards.forEach(card => {
            if (category === 'all') {
                card.style.display = 'flex';
                setTimeout(() => {
                    card.classList.remove('hidden');
                }, 50);
            } else {
                if (card.classList.contains(category)) {
                    card.style.display = 'flex';
                    setTimeout(() => {
                        card.classList.remove('hidden');
                    }, 50);
                } else {
                    card.classList.add('hidden');
                    // Esperar a la animación de desvanecido para aplicar el display none
                    setTimeout(() => {
                        if (card.classList.contains('hidden')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            }
        });
    };

    // Sincronizar clases activas en los botones de filtro de la cuadrícula
    const updateActiveFilterButton = (category) => {
        filterButtons.forEach(btn => {
            if (btn.getAttribute('data-filter') === category) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    // Sincronizar clases activas en el menú de navegación
    const updateActiveNavLink = (category) => {
        navItems.forEach(item => {
            const link = item.querySelector('a');
            if (link.getAttribute('data-filter') === category) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    };

    // Manejar clics en los botones de la sección de filtros
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.getAttribute('data-filter');
            updateActiveFilterButton(category);
            updateActiveNavLink(category);
            filterProjects(category);
        });
    });

    // Manejar clics en los enlaces de la barra de navegación (Header)
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const category = link.getAttribute('data-filter');
            
            // Si es un filtro del portafolio, manejamos el filtrado
            if (category) {
                e.preventDefault();
                updateActiveFilterButton(category);
                updateActiveNavLink(category);
                filterProjects(category);

                // Desplazarse suavemente a la cuadrícula de proyectos
                const targetSection = document.querySelector('.projects-section');
                if (targetSection) {
                    targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    // 5. Barra de Progreso de Lectura y Efecto Header Scrolled
    const scrollBar = document.getElementById('scrollBar');
    const mainHeader = document.getElementById('mainHeader');

    window.addEventListener('scroll', () => {
        // Progreso de lectura
        const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        scrollBar.style.width = scrolled + '%';

        // Efecto scroll en el Header
        if (winScroll > 50) {
            mainHeader.classList.add('scrolled');
        } else {
            mainHeader.classList.remove('scrolled');
        }
    });
});
