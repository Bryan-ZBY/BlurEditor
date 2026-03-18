document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('editor');
    const statusbar = document.getElementById('statusbar');
    const charCount = document.getElementById('char-count');
    const wordCount = document.getElementById('word-count');
    const lineCount = document.getElementById('line-count');
    const cursorPosition = document.getElementById('cursor-position');
    const lastSaved = document.getElementById('last-saved');
    const showHistoryBtn = document.getElementById('show-history');
    const showFavoritesBtn = document.getElementById('show-favorites');
    const closeHistoryBtn = document.getElementById('close-history');
    const historyPanel = document.getElementById('history-panel');
    const historyList = document.getElementById('history-list');
    const favoriteList = document.getElementById('favorite-list');
    const historyModal = document.getElementById('history-modal');
    const favoriteModal = document.getElementById('favorite-modal');
    const historyPreview = document.getElementById('history-preview');
    const favoritePreview = document.getElementById('favorite-preview');
    const closeModalBtn = document.getElementById('close-modal');
    const closeFavoriteModalBtn = document.getElementById('close-favorite-modal');
    const applyHistoryBtn = document.getElementById('apply-history');
    const applyFavoriteBtn = document.getElementById('apply-favorite');
    const deleteHistoryBtn = document.getElementById('delete-history');
    const deleteFavoriteBtn = document.getElementById('delete-favorite');
    const historyTime = document.getElementById('history-time');
    const favoriteTime = document.getElementById('favorite-time');
    const copyContentBtn = document.getElementById('copy-content');
    const copyFavoriteBtn = document.getElementById('copy-favorite');
    const historyTab = document.getElementById('history-tab');
    const favoritesTab = document.getElementById('favorites-tab');
    const historyTabContent = document.getElementById('history-tab-content');
    const favoritesTabContent = document.getElementById('favorites-tab-content');
    const modalTitle = document.getElementById('modal-title');
    const favoriteModalTitle = document.getElementById('favorite-modal-title');

    // ESC键双击检测变量
    let lastEscPressTime = 0;
    const escDoublePressThreshold = 300; // 300毫秒内按两次ESC视为双击

    // 历史记录相关变量
    const HISTORY_KEY = 'editor_history';
    const FAVORITES_KEY = 'editor_favorites';
    const MAX_HISTORY_ITEMS = 50; // 最多保存50条历史记录
    let history = JSON.parse(localStorage.getItem(HISTORY_KEY)) || [];
    let favorites = JSON.parse(localStorage.getItem(FAVORITES_KEY)) || [];
    let autoSaveTimer;
    const AUTO_SAVE_INTERVAL = 10000; // 10秒自动保存一次
    let currentHistoryId = null; // 当前查看的历史记录ID
    let currentFavoriteId = null; // 当前查看的收藏ID
    let currentModalType = null; // 当前查看的模态框类型: 'history' 或 'favorite'

    // 更新状态栏信息
    function updateStatus() {
        // 字符数
        const text = editor.value;
        charCount.textContent = `${text.length} 字符`;

        // 单词数
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        wordCount.textContent = `${words} 单词`;

        // 行数
        const lines = text ? text.split('\n').length : 1;
        lineCount.textContent = `${lines} 行`;

        // 光标位置
        const cursorPos = editor.selectionStart;
        const textToCursor = text.substring(0, cursorPos);
        const currentLine = textToCursor.split('\n').length;
        const currentColumn = textToCursor.split('\n').pop().length + 1;
        cursorPosition.textContent = `行:${currentLine}, 列:${currentColumn}`;
    }

    // 更新保存时间
    function updateSavedTime() {
        const now = new Date();
        lastSaved.textContent = `保存于 ${now.toLocaleTimeString()}`;
    }

    // 显示状态栏
    function showStatusbar() {
        statusbar.classList.add('statusbar-visible');
    }

    // 隐藏状态栏
    function hideStatusbar() {
        statusbar.classList.remove('statusbar-visible');
    }

    // 添加历史记录
    function addHistoryRecord() {
        const now = new Date();
        const content = editor.value;

        // 如果内容为空则不保存
        if (!content.trim()) return;

        // 如果与上一条历史记录内容相同则不保存
        if (history.length > 0 && history[0].content === content) return;

        const record = {
            id: Date.now(),
            content: content,
            timestamp: now.getTime(),
            date: now.toLocaleString(),
            charCount: content.length,
            wordCount: content.trim() ? content.trim().split(/\s+/).length : 0
        };

        // 添加到历史记录数组开头
        history.unshift(record);

        // 限制历史记录数量
        if (history.length > MAX_HISTORY_ITEMS) {
            history = history.slice(0, MAX_HISTORY_ITEMS);
        }

        // 保存到本地存储
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));

        // 更新历史记录面板
        renderHistory();
    }

    // 添加收藏
    function addFavorite() {
        const now = new Date();
        const content = editor.value;

        // 如果内容为空则不保存
        if (!content.trim()) {
            alert('内容为空，无法添加到收藏！');
            return;
        }

        // 检查是否已经收藏过相同内容
        const isAlreadyFavorite = favorites.some(fav => fav.content === content);
        if (isAlreadyFavorite) {
            alert('该内容已经存在于收藏列表中！');
            return;
        }

        const record = {
            id: Date.now(),
            content: content,
            timestamp: now.getTime(),
            date: now.toLocaleString(),
            charCount: content.length,
            wordCount: content.trim() ? content.trim().split(/\s+/).length : 0
        };

        // 添加到收藏数组开头
        favorites.unshift(record);

        // 保存到本地存储（无数量限制）
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));

        // 更新收藏面板
        renderFavorites();

        // 显示收藏提示
        const toast = document.getElementById('favorite-toast');
        toast.classList.remove('opacity-0', 'translate-y-[-20px]');
        toast.classList.add('opacity-100', 'translate-y-0');

        // 3秒后自动隐藏提示
        setTimeout(() => {
            toast.classList.remove('opacity-100', 'translate-y-0');
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
        }, 3000);
    }

    // 删除历史记录
    function deleteHistoryRecord(id) {
        history = history.filter(record => record.id !== id);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
        renderHistory();

        // 如果删除的是当前查看的记录，关闭模态框
        if (currentHistoryId === id && currentModalType === 'history') {
            hideHistoryModal();
        }
    }

    // 删除收藏
    function deleteFavoriteRecord(id) {
        favorites = favorites.filter(record => record.id !== id);
        localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
        renderFavorites();

        // 如果删除的是当前查看的记录，关闭模态框
        if (currentFavoriteId === id && currentModalType === 'favorite') {
            hideFavoriteModal();
        }
    }

    // 渲染历史记录
    function renderHistory() {
        historyList.innerHTML = '';

        if (history.length === 0) {
            historyList.innerHTML = '<p class="text-gray-500 text-center py-4">暂无历史记录</p>';
            return;
        }

        history.forEach(record => {
            const item = document.createElement('div');
            item.className = 'history-item p-3 rounded cursor-pointer bg-history-bg';
            item.innerHTML = `
<div class="flex justify-between items-start">
    <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-400">${record.date}</span>
            <div class="flex space-x-2">
                <span class="history-badge text-xs px-2 py-1 rounded">${record.charCount}字</span>
                <span class="history-badge text-xs px-2 py-1 rounded">${record.wordCount}词</span>
            </div>
        </div>
        <div class="history-content text-sm text-gray-200 mt-1">${record.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <button class="delete-btn ml-2 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition" data-id="${record.id}" title="删除记录">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </button>
</div>
`;

            // 点击项目主体查看详情
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，则不触发查看详情
                if (e.target.closest('.delete-btn')) return;
                showHistoryModal(record);
            });

            // 点击删除按钮
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteHistoryRecord(id);
            });

            historyList.appendChild(item);
        });
    }

    // 渲染收藏列表
    function renderFavorites() {
        favoriteList.innerHTML = '';

        if (favorites.length === 0) {
            favoriteList.innerHTML = '<p class="text-gray-500 text-center py-4">暂无收藏内容</p>';
            return;
        }

        favorites.forEach(record => {
            const item = document.createElement('div');
            item.className = 'favorite-item p-3 rounded cursor-pointer bg-favorite-bg';
            item.innerHTML = `
<div class="flex justify-between items-start">
    <div class="flex-1">
        <div class="flex items-center justify-between mb-1">
            <span class="text-xs text-gray-400">${record.date}</span>
            <div class="flex space-x-2">
                <span class="favorite-badge text-xs px-2 py-1 rounded">${record.charCount}字</span>
                <span class="favorite-badge text-xs px-2 py-1 rounded">${record.wordCount}词</span>
            </div>
        </div>
        <div class="favorite-content text-sm text-gray-200 mt-1">${record.content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
    </div>
    <button class="delete-btn ml-2 text-xs px-2 py-1 rounded hover:bg-red-900/30 transition" data-id="${record.id}" title="删除记录">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    </button>
</div>
`;

            // 点击项目主体查看详情
            item.addEventListener('click', (e) => {
                // 如果点击的是删除按钮，则不触发查看详情
                if (e.target.closest('.delete-btn')) return;
                showFavoriteModal(record);
            });

            // 点击删除按钮
            item.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                const id = parseInt(e.currentTarget.getAttribute('data-id'));
                deleteFavoriteRecord(id);
            });

            favoriteList.appendChild(item);
        });
    }

    // 显示历史记录面板
    function showHistoryPanel() {
        historyPanel.classList.add('history-panel-visible');
        renderHistory();
        renderFavorites();
        // 默认显示历史记录标签
        historyTab.classList.add('active');
        favoritesTab.classList.remove('active');
        historyTabContent.classList.add('active');
        favoritesTabContent.classList.remove('active');
    }

    // 隐藏历史记录面板
    function hideHistoryPanel() {
        historyPanel.classList.remove('history-panel-visible');
    }

    // 显示历史记录模态框
    function showHistoryModal(record) {
        currentModalType = 'history';
        currentHistoryId = record.id;
        historyPreview.textContent = record.content;
        historyTime.textContent = `保存时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`;
        modalTitle.textContent = '历史记录预览';
        historyModal.classList.add('modal-visible');
    }

    // 显示收藏模态框
    function showFavoriteModal(record) {
        currentModalType = 'favorite';
        currentFavoriteId = record.id;
        favoritePreview.textContent = record.content;
        favoriteTime.textContent = `收藏时间: ${record.date} | ${record.charCount} 字符 | ${record.wordCount} 单词`;
        favoriteModalTitle.textContent = '收藏预览';
        favoriteModal.classList.add('modal-visible');
    }

    // 隐藏历史记录模态框
    function hideHistoryModal() {
        historyModal.classList.remove('modal-visible');
        currentHistoryId = null;
        currentModalType = null;
    }

    // 隐藏收藏模态框
    function hideFavoriteModal() {
        favoriteModal.classList.remove('modal-visible');
        currentFavoriteId = null;
        currentModalType = null;
    }

    // 应用历史记录到编辑器
    function applyHistory() {
        if (currentModalType === 'history' && currentHistoryId) {
            const record = history.find(r => r.id === currentHistoryId);
            if (record) {
                editor.value = record.content;
                updateStatus();
                hideHistoryModal();

                // 聚焦编辑器并移除模糊效果
                editor.focus();
                editor.classList.remove('blur-effect');
                editor.classList.add('no-blur');
                showStatusbar();
            }
        } else if (currentModalType === 'favorite' && currentFavoriteId) {
            const record = favorites.find(r => r.id === currentFavoriteId);
            if (record) {
                editor.value = record.content;
                updateStatus();
                hideFavoriteModal();

                // 聚焦编辑器并移除模糊效果
                editor.focus();
                editor.classList.remove('blur-effect');
                editor.classList.add('no-blur');
                showStatusbar();
            }
        }
    }

    // 复制内容到剪贴板
    function copyToClipboard() {
        let content = '';

        if (currentModalType === 'history' && currentHistoryId) {
            const record = history.find(r => r.id === currentHistoryId);
            if (record) content = record.content;
        } else if (currentModalType === 'favorite' && currentFavoriteId) {
            const record = favorites.find(r => r.id === currentFavoriteId);
            if (record) content = record.content;
        }

        if (!content) return;

        navigator.clipboard.writeText(content).then(() => {
            const copyBtn = currentModalType === 'history' ? copyContentBtn : copyFavoriteBtn;
            const originalText = copyBtn.innerHTML;

            copyBtn.innerHTML = `
<span class="copy-success">已复制</span>
<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 copy-success" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
</svg>
`;

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);
        });
    }

    // 删除当前记录
    function deleteCurrentRecord() {
        if (currentModalType === 'history' && currentHistoryId) {
            deleteHistoryRecord(currentHistoryId);
        } else if (currentModalType === 'favorite' && currentFavoriteId) {
            deleteFavoriteRecord(currentFavoriteId);
        }
    }

    // 添加 i 键快速进入编辑模式
    document.addEventListener('keydown', (e) => {
        // 当编辑器有模糊效果且按下 i 键时
        if (e.key === 'i' && editor.classList.contains('blur-effect')) {
            e.preventDefault();
            editor.focus();
            editor.classList.remove('blur-effect');
            editor.classList.add('no-blur');
            showStatusbar();
        }
    });

    // 监听键盘事件
    editor.addEventListener('keydown', (e) => {
        // 检查是否是 Alt+H (Mac上是 Cmd+H)
        if (e.altKey && e.key === 'h') {
            e.preventDefault(); // 阻止浏览器默认行为
            showHistoryPanel();
        }

        // 检查是否是 Ctrl+D 添加收藏
        if (e.ctrlKey && e.key === 'd') {
            e.preventDefault();
            addFavorite();
        }

        if(e.ctrlKey && e.key === 's'){
            e.preventDefault();
            addHistoryRecord();

            // 显示保存提示
            const toast = document.getElementById('save-toast');
            toast.classList.remove('opacity-0', 'translate-y-[-20px]');
            toast.classList.add('opacity-100', 'translate-y-0');

            // 3秒后自动隐藏提示
            setTimeout(() => {
                toast.classList.remove('opacity-100', 'translate-y-0');
                toast.classList.add('opacity-0', 'translate-y-[-20px]');
            }, 3000);
        }

        if (e.key === 'Escape') {
            if(historyPanel.classList.contains('history-panel-visible')) {
                // 隐藏历史记录面板
                hideHistoryPanel();
            }

            const now = Date.now();
            if (now - lastEscPressTime < escDoublePressThreshold) {
                // 检测到ESC键双击
                editor.blur(); // 手动触发失焦
                hideHistoryPanel(); // 同时隐藏历史记录面板
                hideHistoryModal(); // 同时隐藏历史记录预览
                hideFavoriteModal(); // 同时隐藏收藏预览
            }
            lastEscPressTime = now;
        }
    });

    // 输入时更新状态
    editor.addEventListener('input', () => {
        updateStatus();
        localStorage.setItem(STORAGE_KEY, editor.value);
        updateSavedTime();

        // 重置自动保存计时器
        clearTimeout(autoSaveTimer);
        autoSaveTimer = setTimeout(() => {
            addHistoryRecord();
        }, AUTO_SAVE_INTERVAL);
    });

    // 光标移动时更新位置信息
    editor.addEventListener('click', updateStatus);
    editor.addEventListener('keyup', updateStatus);

    // 聚焦时移除模糊效果并显示状态栏
    editor.addEventListener('focus', () => {
        editor.classList.remove('blur-effect');
        editor.classList.add('no-blur');
        showStatusbar();
    });

    // 失去焦点时添加模糊效果并隐藏状态栏
    editor.addEventListener('blur', () => {
        editor.classList.remove('no-blur');
        editor.classList.add('blur-effect');
        hideStatusbar();

        // 保存历史记录
        addHistoryRecord();
    });

    // 当页面隐藏时（切换标签页或最小化窗口）添加模糊效果
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            editor.classList.remove('no-blur');
            editor.classList.add('blur-effect');
            hideStatusbar();

            // 保存历史记录
            addHistoryRecord();
        } else {
            // 只有当编辑器本身有焦点时才移除模糊
            if (document.activeElement === editor) {
                editor.classList.remove('blur-effect');
                editor.classList.add('no-blur');
                showStatusbar();
            }
        }
    });

    // 调整内边距以适应不同屏幕尺寸
    function adjustPadding() {
        const width = window.innerWidth;
        if (width < 640) {
            editor.classList.remove('p-6', 'p-10');
            editor.classList.add('p-4');
        } else if (width < 768) {
            editor.classList.remove('p-4', 'p-10');
            editor.classList.add('p-6');
        } else {
            editor.classList.remove('p-4', 'p-6');
            editor.classList.add('p-10');
        }
    }

    // 初始化和窗口大小变化时调整
    adjustPadding();
    window.addEventListener('resize', adjustPadding);

    // 本地存储自动保存
    const STORAGE_KEY = 'editor_content';

    // 加载保存的内容
    const savedContent = localStorage.getItem(STORAGE_KEY);
    if (savedContent) {
        editor.value = savedContent;
        updateStatus();
        updateSavedTime();
    }

    // 加载收藏列表
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
        favorites = JSON.parse(savedFavorites);
    }

    // 历史记录按钮事件
    showHistoryBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        showHistoryPanel();
    });

    // 收藏列表按钮事件
    showFavoritesBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        showHistoryPanel();
        // 切换到收藏标签
        historyTab.classList.remove('active');
        favoritesTab.classList.add('active');
        historyTabContent.classList.remove('active');
        favoritesTabContent.classList.add('active');
    });

    closeHistoryBtn.addEventListener('click', hideHistoryPanel);

    // 标签切换事件
    historyTab.addEventListener('click', () => {
        historyTab.classList.add('active');
        favoritesTab.classList.remove('active');
        historyTabContent.classList.add('active');
        favoritesTabContent.classList.remove('active');
    });

    favoritesTab.addEventListener('click', () => {
        historyTab.classList.remove('active');
        favoritesTab.classList.add('active');
        historyTabContent.classList.remove('active');
        favoritesTabContent.classList.add('active');
    });

    // 模态框按钮事件
    closeModalBtn.addEventListener('click', hideHistoryModal);
    closeFavoriteModalBtn.addEventListener('click', hideFavoriteModal);
    applyHistoryBtn.addEventListener('click', applyHistory);
    applyFavoriteBtn.addEventListener('click', applyHistory);
    deleteHistoryBtn.addEventListener('click', deleteCurrentRecord);
    deleteFavoriteBtn.addEventListener('click', deleteCurrentRecord);

    // 复制内容按钮事件
    copyContentBtn.addEventListener('click', copyToClipboard);
    copyFavoriteBtn.addEventListener('click', copyToClipboard);

    // 点击状态栏时保持编辑器聚焦
    statusbar.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 阻止默认行为
        editor.focus(); // 保持编辑器聚焦
    });

    // 点击编辑区域时收起历史记录列表
    editor.addEventListener('click', () => {
        hideHistoryPanel();
    });

    // 点击面板外部关闭历史记录
    document.addEventListener('click', (e) => {
        // 只有当点击关闭按钮时才关闭历史记录面板
        if (e.target === closeHistoryBtn) {
            hideHistoryPanel();
        }

        if (e.target === historyModal) {
            hideHistoryModal();
        }

        if (e.target === favoriteModal) {
            hideFavoriteModal();
        }
    });

    // 初始渲染
    renderHistory();
    renderFavorites();
});
