// search.js (V44.3 - 极简索引动态拼接路径版)
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const gameListContainer = document.getElementById('game-list-container');
    const paginationContainer = document.getElementById('pagination-container');
    
    if (!searchBox || !gameListContainer || !paginationContainer) {
        return;
    }

    const originalContent = gameListContainer.innerHTML;
    const originalPagination = paginationContainer.innerHTML;
    const RESULTS_PER_PAGE = 20;

    if (typeof allGames === 'undefined' || !allGames) {
        searchBox.placeholder = '搜索功能初始化失败!';
        searchBox.disabled = true;
        return;
    }

    let currentResults = [];
    let currentPage = 1;

    function displayResultsPage(page) {
        currentPage = page;
        const start = (page - 1) * RESULTS_PER_PAGE;
        const end = start + RESULTS_PER_PAGE;
        const paginatedItems = currentResults.slice(start, end);
        
        const isSubPage = window.location.pathname.includes('/archive_pages/');
        const pathPrefix = isSubPage ? '../' : '';

        // [最终修复] 只渲染一个简单的链接列表，路径动态拼接
        gameListContainer.innerHTML = paginatedItems.map(g => {
            const gamePath = `${pathPrefix}trophy_lists/trophy_list_${g.id}.html`;
            return `
            <li class="game-item search-result-item">
                <a href="${gamePath}" class="game-link-wrapper">
                    <div class="game-details">
                        <p class="game-title">${g.title}</p>
                    </div>
                </a>
            </li>`
        }).join('');

        paginationContainer.innerHTML = generateSearchPagination(currentResults.length);
    }

    function generateSearchPagination(totalItems) {
        const totalPages = Math.ceil(totalItems / RESULTS_PER_PAGE);
        if (totalPages <= 1) return '';
        
        let html = '<ul class="pagination">';
        for (let i = 1; i <= totalPages; i++) {
            html += `<li class="${i === currentPage ? 'current' : ''}"><a href="#" data-page="${i}">${i}</a></li>`;
        }
        html += '</ul>';
        return html;
    }

    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query === '') {
            gameListContainer.innerHTML = originalContent;
            paginationContainer.innerHTML = originalPagination;
            currentResults = [];
            return;
        }

        currentResults = allGames.filter(game => 
            game.title.toLowerCase().includes(query)
        );

        if (currentResults.length > 0) {
            displayResultsPage(1);
        } else {
            gameListContainer.innerHTML = `<li style="padding: 20px; text-align: center;">没有找到与 "<strong>${e.target.value}</strong>" 相关的游戏。</li>`;
            paginationContainer.innerHTML = '';
        }
    });
    
    paginationContainer.addEventListener('click', (e) => {
        if (searchBox.value.trim() !== '' && e.target.tagName === 'A' && e.target.dataset.page) {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page, 10);
            displayResultsPage(page);
        }
    });
});