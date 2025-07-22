 
document.addEventListener('DOMContentLoaded', () => {
    const searchBox = document.getElementById('search-box');
    const topicListContainer = document.getElementById('topic-list-container');
    const paginationContainer = document.getElementById('pagination-container');
    
 
    if (!searchBox || !topicListContainer || !paginationContainer) {
        console.error("缺少必要的HTML元素(search-box, topic-list-container, pagination-container)。");
        return;
    }

    const originalContent = topicListContainer.innerHTML;
    const originalPagination = paginationContainer.innerHTML;
    const RESULTS_PER_PAGE = 40; // 与Python脚本中的TOPICS_PER_PAGE保持一致

    if (typeof allTopics === 'undefined' || !allTopics) {
        console.error('搜索数据 (allTopics) 未在页面中定义。');
        searchBox.placeholder = '搜索功能初始化失败!';
        searchBox.disabled = true;
        return;
    }

    let currentResults = [];
    let currentPage = 1;

    // --- 核心函数：显示指定页的搜索结果 ---
    function displayResultsPage(page) {
        currentPage = page;
        topicListContainer.innerHTML = ''; // 清空当前列表
        
        const start = (page - 1) * RESULTS_PER_PAGE;
        const end = start + RESULTS_PER_PAGE;
        const paginatedItems = currentResults.slice(start, end);
        
        const isSubPage = window.location.pathname.includes('/archive_pages/');
        const pathPrefix = isSubPage ? '../' : '';

        topicListContainer.innerHTML = paginatedItems.map(topic => {
            const localPath = `${pathPrefix}${OUTPUT_DIR}/${topic.path}`.replace(/\\/g, '/');
            const avatarPath = topic.avatar_src.startsWith('http') ? topic.avatar_src : `${pathPrefix}${topic.avatar_src}`;
            return `
            <li>
                <img src="${avatarPath}" alt="${topic.author}" class="author-avatar" onerror="this.style.display='none'">
                <div class="topic-content">
                    <div class="topic-title"><span class="reply-count">${topic.reply_count}</span><a href="${localPath}" target="_blank">${topic.title}</a></div>
                    <div class="topic-meta-info"><span>${topic.author}</span><span>${topic.date}</span></div>
                </div>
            </li>`;
        }).join('');

        // 生成并显示搜索结果的分页导航
        paginationContainer.innerHTML = generateSearchPagination(currentResults.length);
    }

    // --- 核心函数：生成搜索结果的分页导航 ---
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

    // --- 事件监听 ---
    searchBox.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();

        if (query === '') {
            topicListContainer.innerHTML = originalContent;
            paginationContainer.innerHTML = originalPagination;
            currentResults = [];
            return;
        }

        currentResults = allTopics.filter(topic => 
            topic.title.toLowerCase().includes(query) || 
            topic.author.toLowerCase().includes(query)
        );

        if (currentResults.length > 0) {
            displayResultsPage(1); // 默认显示第一页结果
        } else {
            topicListContainer.innerHTML = `<li>没有找到与 "<strong>${e.target.value}</strong>" 相关的帖子。</li>`;
            paginationContainer.innerHTML = '';
        }
    });
    
    // 使用事件委托处理搜索分页点击
    paginationContainer.addEventListener('click', (e) => {
 
        if (searchBox.value.trim() !== '' && e.target.tagName === 'A' && e.target.dataset.page) {
            e.preventDefault();
            const page = parseInt(e.target.dataset.page, 10);
            displayResultsPage(page);
        }
    });
});