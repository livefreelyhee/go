// 데이터 모델
let state = {
    companies: [
        { id: 'company1', name: '기업1' },
        { id: 'company2', name: '기업2' }
    ],
    folders: [
        { id: 'folder1', name: '폴더1', companyId: 'all' },
        { id: 'folder2', name: '폴더2', companyId: 'all' }
    ],
    cards: [],
    deletedCards: [],
    currentCompany: 'all',
    currentFolder: 'all',
    sortMode: 'default',
    questionsOnly: false,
    selectedCards: new Set(),
    history: [],
    historyIndex: -1,
    fontFamily: 'default',
    customFonts: [] // {id: string, name: string, fontFamily: string, data: string (base64)}
};

// 초기화
function init() {
    loadState();
    
    // 이벤트 리스너를 먼저 등록 (다른 이벤트 핸들러보다 먼저 실행되도록)
    setupGlobalEventListeners();
    
    renderCompanies();
    renderFolders();
    renderCards();
    setupEventListeners();
    setupFolderDragScroll();
    setupCompanyDragScroll();
    updateCardCount();
    updateTrashIcon();
    setupScrollbarGutter();
    updateQuestionsOnlyButton();
}

// 전역 이벤트 리스너 설정 (다른 이벤트 핸들러보다 먼저 실행)
function setupGlobalEventListeners() {
    // 질문만 보기, 일괄 추가, 실전 연습, 휴지통 - 이벤트 위임 사용 (캡처 단계)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'questionsOnlyBtn' || e.target.closest('#questionsOnlyBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            toggleQuestionsOnly();
            return;
        }
        if (e.target.id === 'batchAddBtn' || e.target.closest('#batchAddBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showBatchAddModal();
            return;
        }
        if (e.target.id === 'practiceBtn' || e.target.closest('#practiceBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showPracticeSettings();
            return;
        }
        if (e.target.id === 'trashBtn' || e.target.closest('#trashBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showTrashModal();
            return;
        }
        // 일괄 추가 모달의 추가 버튼
        if (e.target.id === 'batchAddSubmit' || e.target.closest('#batchAddSubmit')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            submitBatchAdd();
            return;
        }
        // 실전 연습 설정 모달의 시작 버튼
        if (e.target.id === 'practiceStartBtn' || e.target.closest('#practiceStartBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            startPractice();
            return;
        }
        // 실전 연습 모달의 버튼들
        if (e.target.id === 'pauseBtn' || e.target.closest('#pauseBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            togglePause();
            return;
        }
        if (e.target.id === 'resetBtn' || e.target.closest('#resetBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            resetTimer();
            return;
        }
        if (e.target.id === 'nextBtn' || e.target.closest('#nextBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            nextPracticeQuestion();
            return;
        }
        if (e.target.id === 'practiceClose' || e.target.closest('#practiceClose')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            stopTimer();
            document.getElementById('practiceModal').classList.remove('show');
            return;
        }
        // 휴지통 모달의 X 버튼
        if (e.target.id === 'trashClose' || e.target.closest('#trashClose')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.getElementById('trashModal').classList.remove('show');
            return;
        }
        // 폰트 버튼
        if (e.target.id === 'fontBtn' || e.target.closest('#fontBtn')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            showFontModal();
            return;
        }
        // 폰트 모달의 X 버튼
        if (e.target.id === 'fontClose' || e.target.closest('#fontClose')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.getElementById('fontModal').classList.remove('show');
            return;
        }
    }, true); // 캡처 단계에서 처리
    
    // Delete 키 - 선택된 카드 삭제
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Delete' && state.selectedCards.size > 0) {
            // 모달이 열려있지 않은 경우에만 삭제
            const openModals = document.querySelectorAll('.modal.show');
            if (openModals.length === 0) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                deleteSelectedCards();
            }
        }
    }, true); // 캡처 단계에서 처리
}

// 스크롤바 gutter 설정
// CSS의 scrollbar-gutter: stable과 overflow-y: scroll로 처리되므로
// JavaScript 추가 처리 불필요 (필요시 여기에 추가 로직 구현)
function setupScrollbarGutter() {
    // 현재는 CSS로만 처리
}

// localStorage 저장/로드
function saveState() {
    const stateToSave = {
        ...state,
        selectedCards: Array.from(state.selectedCards),
        history: state.history.slice(0, state.historyIndex + 1)
    };
    localStorage.setItem('interviewApp', JSON.stringify(stateToSave));
}

function loadState() {
    const saved = localStorage.getItem('interviewApp');
    if (saved) {
        const loaded = JSON.parse(saved);
        state.companies = loaded.companies || state.companies;
        state.folders = loaded.folders || state.folders;
        state.cards = loaded.cards || [];
        state.deletedCards = loaded.deletedCards || [];
        state.currentCompany = loaded.currentCompany || 'all';
        state.currentFolder = loaded.currentFolder || 'all';
        state.sortMode = loaded.sortMode || 'default';
        state.questionsOnly = loaded.questionsOnly || false;
        state.selectedCards = new Set(loaded.selectedCards || []);
        state.history = loaded.history || [];
        state.historyIndex = loaded.historyIndex !== undefined ? loaded.historyIndex : -1;
        state.fontFamily = loaded.fontFamily || 'default';
        state.customFonts = loaded.customFonts || [];
        
        // 기존 폴더에 companyId가 없으면 'all'로 설정 (마이그레이션)
        state.folders.forEach(folder => {
            if (!folder.companyId) {
                folder.companyId = 'all';
            }
        });
        
        // 커스텀 폰트 로드
        state.customFonts.forEach(font => {
            loadCustomFont(font);
        });
        
        // 폰트 적용
        applyFont(state.fontFamily);
    } else {
        // localStorage에 데이터가 없을 때 기본 폰트 적용
        applyFont('default');
    }
    // localStorage에 데이터가 없을 때는 기본 카드를 생성하지 않음
}


function generateId() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

// 히스토리 관리
function saveToHistory() {
    const historyItem = {
        companies: JSON.parse(JSON.stringify(state.companies)),
        folders: JSON.parse(JSON.stringify(state.folders)),
        cards: JSON.parse(JSON.stringify(state.cards)),
        timestamp: Date.now()
    };
    state.history = state.history.slice(0, state.historyIndex + 1);
    state.history.push(historyItem);
    state.historyIndex = state.history.length - 1;
    // 히스토리 크기 제한
    if (state.history.length > 50) {
        state.history.shift();
        state.historyIndex--;
    }
    saveState();
}

function undo() {
    if (state.historyIndex > 0) {
        state.historyIndex--;
        const historyItem = state.history[state.historyIndex];
        state.companies = JSON.parse(JSON.stringify(historyItem.companies));
        state.folders = JSON.parse(JSON.stringify(historyItem.folders));
        state.cards = JSON.parse(JSON.stringify(historyItem.cards));
        renderCompanies();
        renderFolders();
        renderCards();
        updateCardCount();
        saveState();
        showToast('실행 취소됨');
    }
}

function redo() {
    if (state.historyIndex < state.history.length - 1) {
        state.historyIndex++;
        const historyItem = state.history[state.historyIndex];
        state.companies = JSON.parse(JSON.stringify(historyItem.companies));
        state.folders = JSON.parse(JSON.stringify(historyItem.folders));
        state.cards = JSON.parse(JSON.stringify(historyItem.cards));
        renderCompanies();
        renderFolders();
        renderCards();
        updateCardCount();
        saveState();
        showToast('다시 실행됨');
    }
}

// 기업 렌더링
function renderCompanies() {
    const container = document.querySelector('.company-tabs');
    const allTab = container.querySelector('[data-company="all"]');
    const addBtn = container.querySelector('#addCompanyBtn');
    
    // 기존 기업 탭 제거 (전체 탭과 추가 버튼 제외)
    const existingTabs = container.querySelectorAll('.company-tab:not([data-company="all"])');
    existingTabs.forEach(tab => tab.remove());
    
    // 기업 탭 추가
    state.companies.forEach(company => {
        const tab = document.createElement('button');
        tab.className = 'company-tab';
        tab.dataset.company = company.id;
        tab.textContent = company.name;
        if (state.currentCompany === company.id) {
            tab.classList.add('active');
        }
        tab.addEventListener('click', (e) => {
            e.stopPropagation();
            switchCompany(company.id);
        });
        tab.addEventListener('dblclick', (e) => {
            e.stopPropagation();
            editCompany(company.id);
        });
        tab.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showContextMenu(e, 'company', company.id);
        });
        container.insertBefore(tab, addBtn);
    });
    
    // 전체 탭 활성화 상태 업데이트
    if (state.currentCompany === 'all') {
        allTab.classList.add('active');
    } else {
        allTab.classList.remove('active');
    }
}

// 폴더 렌더링
function renderFolders() {
    const container = document.querySelector('.folder-section');
    const allFolder = container.querySelector('[data-folder="all"]');
    const addBtn = container.querySelector('#addFolderBtn');
    const sortDropdown = container.querySelector('#sortDropdown');
    
    // 기존 폴더 버튼 제거 (전체 폴더와 추가 버튼, 드롭다운 제외)
    const existingFolders = container.querySelectorAll('.folder-btn:not([data-folder="all"])');
    existingFolders.forEach(btn => btn.remove());
    
    // 폴더 버튼 추가
    // 현재 기업에 맞는 폴더만 표시:
    // - companyId가 'all'이면 모든 기업에 표시
    // - companyId가 현재 기업 ID와 같으면 표시
    const visibleFolders = state.folders.filter(folder => {
        return folder.companyId === 'all' || folder.companyId === state.currentCompany;
    });
    
    visibleFolders.forEach(folder => {
        const btn = document.createElement('button');
        btn.className = 'folder-btn';
        btn.dataset.folder = folder.id;
        btn.textContent = folder.name;
        if (state.currentFolder === folder.id) {
            btn.classList.add('active');
        }
        btn.addEventListener('click', () => switchFolder(folder.id));
        btn.addEventListener('dblclick', () => editFolder(folder.id));
        btn.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            showContextMenu(e, 'folder', folder.id);
        });
        container.insertBefore(btn, addBtn);
    });
    
    // 전체 폴더 활성화 상태 업데이트
    if (state.currentFolder === 'all') {
        allFolder.classList.add('active');
    } else {
        allFolder.classList.remove('active');
    }
    
    // 정렬 모드 업데이트
    sortDropdown.value = state.sortMode;
}

// 카드 렌더링
function renderCards() {
    const grid = document.getElementById('cardsGrid');
    grid.innerHTML = '';
    
    // 필터링
    let filteredCards = state.cards.filter(card => {
        const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
        const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
        return companyMatch && folderMatch;
    });
    
    // 정렬
    if (state.sortMode === 'default') {
        filteredCards.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return (a.order || 0) - (b.order || 0);
        });
    } else if (state.sortMode === 'alphabetical') {
        // 가나다순 정렬 (질문 기준)
        filteredCards.sort((a, b) => {
            const questionA = (a.question || '').trim();
            const questionB = (b.question || '').trim();
            // 한글 정렬을 위해 localeCompare 사용
            return questionA.localeCompare(questionB, 'ko');
        });
    } else if (state.sortMode === 'random') {
        // 랜덤 모드에서는 모든 카드를 랜덤으로 섞음
        shuffleArray(filteredCards);
    } else if (state.sortMode === 'length') {
        // 글자수 정렬 (질문 + 답변 글자수 합산, 작은 것부터)
        filteredCards.sort((a, b) => {
            const lengthA = ((a.question || '').length + (a.answer || '').length);
            const lengthB = ((b.question || '').length + (b.answer || '').length);
            return lengthA - lengthB;
        });
    }
    
    // 질문만 보기 모드
    if (state.questionsOnly) {
        grid.classList.add('questions-only');
    } else {
        grid.classList.remove('questions-only');
    }
    
    // 카드 생성
    filteredCards.forEach((card, index) => {
        const cardEl = createCardElement(card);
        grid.appendChild(cardEl);
    });
    
    // 드래그 앤 드롭 설정 (기본 정렬 모드에서만)
    if (state.sortMode === 'default') {
        setupDragAndDrop();
    }
    
    // 카드 개수 업데이트
    updateCardCount();
    
}

function createCardElement(card) {
    const cardEl = document.createElement('div');
    cardEl.className = 'card';
    cardEl.dataset.cardId = card.id;
    // 랜덤 모드에서는 고정 표시 안함
    if (card.pinned && state.sortMode === 'default') cardEl.classList.add('pinned');
    if (state.selectedCards.has(card.id)) cardEl.classList.add('selected');
    
    const questionEl = document.createElement('div');
    questionEl.className = 'card-question';
    // 선택된 카드가 하나라도 있으면 모든 카드의 텍스트 편집 비활성화
    questionEl.contentEditable = state.selectedCards.size === 0;
    // 선택된 카드의 질문 영역만 드래그 가능하도록 설정
    questionEl.draggable = state.selectedCards.has(card.id);
    // 줄바꿈을 포함한 텍스트를 제대로 표시하기 위해 innerHTML 사용
    if (card.question) {
        questionEl.innerHTML = card.question.replace(/\n/g, '<br>');
    } else {
        questionEl.textContent = '';
    }
    questionEl.dataset.placeholder = '질문을 입력하세요';
    questionEl.spellcheck = false;
    questionEl.addEventListener('blur', () => {
        // innerText를 사용하면 줄바꿈이 자동으로 \n으로 변환됨
        // innerText가 없으면 textContent 사용 (구형 브라우저 대응)
        let text = '';
        if (typeof questionEl.innerText !== 'undefined') {
            text = questionEl.innerText;
        } else {
            // innerText를 지원하지 않는 경우: HTML의 <br>, <div> 등을 \n으로 변환
            text = questionEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/div><div>/gi, '\n')
                .replace(/<div>/gi, '')
                .replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '') // 나머지 HTML 태그 제거
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
        }
        // 앞뒤 공백과 줄바꿈만 제거 (중간 줄바꿈은 유지)
        card.question = text.replace(/^[\s\n]+|[\s\n]+$/g, '');
        saveToHistory();
        saveState();
    });
    // Enter 키는 줄바꿈으로 처리 (저장하지 않음)
    // 저장은 blur 이벤트에서만 처리
    
    const answerEl = document.createElement('div');
    answerEl.className = 'card-answer';
    // 선택된 카드가 하나라도 있으면 모든 카드의 텍스트 편집 비활성화
    answerEl.contentEditable = state.selectedCards.size === 0;
    // 선택된 카드의 답변 영역만 드래그 가능하도록 설정
    answerEl.draggable = state.selectedCards.has(card.id);
    // 줄바꿈을 포함한 텍스트를 제대로 표시하기 위해 innerHTML 사용
    if (card.answer) {
        answerEl.innerHTML = card.answer.replace(/\n/g, '<br>');
    } else {
        answerEl.textContent = '';
    }
    answerEl.dataset.placeholder = '답변을 입력하세요';
    answerEl.spellcheck = false;
    answerEl.addEventListener('blur', () => {
        // innerText를 사용하면 줄바꿈이 자동으로 \n으로 변환됨
        // innerText가 없으면 textContent 사용 (구형 브라우저 대응)
        let text = '';
        if (typeof answerEl.innerText !== 'undefined') {
            text = answerEl.innerText;
        } else {
            // innerText를 지원하지 않는 경우: HTML의 <br>, <div> 등을 \n으로 변환
            text = answerEl.innerHTML
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/div><div>/gi, '\n')
                .replace(/<div>/gi, '')
                .replace(/<\/div>/gi, '\n')
                .replace(/<[^>]+>/g, '') // 나머지 HTML 태그 제거
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"');
        }
        // 앞뒤 공백과 줄바꿈만 제거 (중간 줄바꿈은 유지)
        card.answer = text.replace(/^[\s\n]+|[\s\n]+$/g, '');
        saveToHistory();
        saveState();
    });
    // Enter 키는 줄바꿈으로 처리 (저장하지 않음)
    // 저장은 blur 이벤트에서만 처리
    
    cardEl.appendChild(questionEl);
    cardEl.appendChild(answerEl);
    
    // 드래그 핸들 제거됨 - 카드 전체에서 드래그 가능
    
    // 질문/답변 영역 클릭 시 편집 모드 또는 선택 처리
    // 단, 더블클릭은 상세 보기로 처리
    let clickTimer = null;
    questionEl.addEventListener('click', (e) => {
        // 선택된 카드가 하나라도 있으면 모든 카드의 텍스트 편집 방지 및 카드 선택으로 처리
        if (state.selectedCards.size > 0) {
            // 선택 상태에서는 편집 모드 진입 방지, 카드 선택으로 처리
            e.preventDefault();
            e.stopPropagation();
            // 카드 선택 처리 (handleCardClick과 동일한 로직)
            handleCardClick(e, card.id);
            return;
        }
        
        // 선택된 카드가 없을 때만 편집 모드 허용
        // 더블클릭 감지를 위해 약간의 지연
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            // 더블클릭으로 판단하여 상세 보기
            e.stopPropagation();
            showCardDetail(card.id);
            return;
        }
        
        // 단일 클릭은 약간의 지연 후 편집 모드로
        clickTimer = setTimeout(() => {
            clickTimer = null;
            // 선택 상태가 변경되지 않았는지 다시 확인
            if (state.selectedCards.size === 0) {
                e.stopPropagation();
                // 편집 모드로 들어가기 위해 포커스 설정
                if (document.activeElement !== questionEl) {
                    questionEl.focus();
                }
            }
        }, 200);
    });
    
    answerEl.addEventListener('click', (e) => {
        // 선택된 카드가 하나라도 있으면 모든 카드의 텍스트 편집 방지 및 카드 선택으로 처리
        if (state.selectedCards.size > 0) {
            // 선택 상태에서는 편집 모드 진입 방지, 카드 선택으로 처리
            e.preventDefault();
            e.stopPropagation();
            // 카드 선택 처리 (handleCardClick과 동일한 로직)
            handleCardClick(e, card.id);
            return;
        }
        
        // 선택된 카드가 없을 때만 편집 모드 허용
        // 더블클릭 감지를 위해 약간의 지연
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
            // 더블클릭으로 판단하여 상세 보기
            e.stopPropagation();
            showCardDetail(card.id);
            return;
        }
        
        // 단일 클릭은 약간의 지연 후 편집 모드로
        clickTimer = setTimeout(() => {
            clickTimer = null;
            // 선택 상태가 변경되지 않았는지 다시 확인
            if (state.selectedCards.size === 0) {
                e.stopPropagation();
                // 편집 모드로 들어가기 위해 포커스 설정
                if (document.activeElement !== answerEl) {
                    answerEl.focus();
                }
            }
        }, 200);
    });
    
    // 카드의 빈 공간 클릭 시 선택 처리
    cardEl.addEventListener('click', (e) => {
        // 질문/답변 영역이 아닌 카드의 빈 공간을 클릭한 경우만 선택
        if (e.target === cardEl) {
            handleCardClick(e, card.id);
        }
    });
    
    // 더블클릭 (상세 보기) - 카드 전체에서 작동
    cardEl.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        e.preventDefault();
        // 더블클릭 타이머 취소
        if (clickTimer) {
            clearTimeout(clickTimer);
            clickTimer = null;
        }
        showCardDetail(card.id);
    });
    
    // 우클릭
    cardEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showContextMenu(e, 'card', card.id);
    });
    
    return cardEl;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// 기업 관리
function switchCompany(companyId) {
    state.currentCompany = companyId;
    saveState();
    renderCompanies();
    renderCards();
    updateCardCount();
}

function addCompany() {
    const newId = generateId();
    const newCompany = { id: newId, name: '새 기업' };
    state.companies.push(newCompany);
    saveToHistory();
    saveState();
    renderCompanies();
    editCompany(newId);
}

function editCompany(companyId) {
    const company = state.companies.find(c => c.id === companyId);
    if (!company) return;
    
    const tab = document.querySelector(`[data-company="${companyId}"]`);
    if (!tab) return;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit';
    input.value = company.name;
    input.style.width = Math.max(100, Math.min(company.name.length * 12, 500)) + 'px';
    input.placeholder = '기업명';
    input.spellcheck = false;
    
    const originalText = tab.textContent;
    tab.textContent = '';
    tab.appendChild(input);
    input.focus();
    input.select();
    
    const finishEdit = () => {
        // 앞뒤 공백만 제거하고, 중간의 띄어쓰기는 유지
        const newName = input.value.trim();
        if (newName) {
            // 원본 값을 그대로 저장 (중간 띄어쓰기 포함)
            company.name = input.value.trim();
            saveToHistory();
            saveState();
            renderCompanies();
        } else {
            deleteCompany(companyId);
        }
    };
    
    const cancelEdit = () => {
        // 취소 시 원래 텍스트로 복원
        tab.textContent = originalText;
    };
    
    // 편집 상태 플래그 및 cleanup 상태 플래그
    let isEditing = true;
    let cleanupDone = false;
    
    // 이벤트 핸들러 정의
    let handleKeydown, handleBlur, handleOutsideClick;
    
    // cleanup 함수: 모든 이벤트 리스너 제거 및 상태 초기화
    const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        isEditing = false;
        
        // keydown 이벤트 리스너 제거
        if (handleKeydown) {
            input.removeEventListener('keydown', handleKeydown, true);
        }
        // blur 이벤트 리스너 제거
        if (handleBlur) {
            input.removeEventListener('blur', handleBlur);
        }
        // document의 mousedown 리스너 제거
        if (handleOutsideClick) {
            document.removeEventListener('mousedown', handleOutsideClick, true);
        }
    };
    
    // 완료 상태 플래그 (중복 처리 방지)
    let isFinishing = false;
    
    // blur 이벤트 핸들러: 포커스가 벗어나면 저장
    handleBlur = () => {
        // 이미 처리 중이거나 완료된 경우 무시
        if (!isEditing || cleanupDone || isFinishing) return;
        
        isFinishing = true;
        // cleanup을 먼저 호출하여 이벤트 리스너 제거
        cleanup();
        
        // 저장 처리
        finishEdit();
    };
    
    // 외부 클릭 핸들러: 외부 클릭 시 저장 및 편집 종료
    handleOutsideClick = (e) => {
        if (!isEditing || cleanupDone || isFinishing) return;
        
        // input 필드 자체나 그 내부를 클릭한 경우는 저장하지 않음
        // (편집 중에는 입력 필드를 다시 클릭해도 계속 수정할 수 있어야 함)
        if (input.contains(e.target) || e.target === input) {
            // 입력 필드 내부 클릭은 무시 (저장하지 않음)
            return;
        }
        
        // input 필드 외부를 클릭한 경우: 저장 및 편집 종료
        isFinishing = true;
        
        // cleanup을 먼저 호출하여 이벤트 리스너 제거 (blur 이벤트 발생 방지)
        cleanup();
        
        // 저장 처리
        finishEdit();
    };
    
    // Enter/ESC 키 처리 - 캡처 단계에서 먼저 처리하여 다른 이벤트보다 우선
    handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            cleanup();
            finishEdit();
            return false;
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            cleanup();
            cancelEdit();
            return false;
        } else if (e.key === ' ') {
            // 스페이스바 입력 시 버튼의 클릭 이벤트가 발생하지 않도록 방지
            // 스페이스바는 입력 필드에 공백을 입력하는 용도로만 사용
            e.stopPropagation();
            // preventDefault는 하지 않음 (공백 입력을 허용)
        }
        // 다른 키는 그냥 입력만 허용
    };
    
    // keydown 이벤트를 캡처 단계에서 먼저 처리
    input.addEventListener('keydown', handleKeydown, true);
    
    // 입력 필드 클릭 시 탭의 click 이벤트가 발생하지 않도록 방지
    // (이렇게 하면 입력 필드를 클릭해도 switchCompany가 호출되지 않음)
    input.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        // 입력 필드 클릭은 저장하지 않음 (계속 편집 가능)
    });
    
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        // 입력 필드 클릭은 저장하지 않음 (계속 편집 가능)
    });
    
    // blur 이벤트 리스너 추가: 포커스가 벗어나면 저장
    input.addEventListener('blur', handleBlur);
    
    // document에 mousedown 리스너 추가 (캡처 단계에서 먼저 처리)
    // 약간의 지연을 주어 input이 먼저 렌더링되도록 함
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick, true);
    }, 50);
    
    input.addEventListener('input', () => {
        // 띄어쓰기를 포함한 텍스트 길이에 따라 너비 조정
        // 충분한 여유 공간을 확보하여 띄어쓰기가 잘 보이도록 함
        const textWidth = input.value.length * 12; // 문자당 12px로 여유 있게 계산
        input.style.width = Math.max(100, Math.min(textWidth, 500)) + 'px';
    });
}

function deleteCompany(companyId) {
    if (confirm('이 기업의 모든 카드가 휴지통으로 이동됩니다. 계속하시겠습니까?')) {
        // 기업에 속한 카드들을 휴지통으로 이동
        const cardsToDelete = state.cards.filter(card => card.companyId === companyId);
        state.deletedCards.push(...cardsToDelete);
        
        // 기업 삭제 및 카드 제거
        state.companies = state.companies.filter(c => c.id !== companyId);
        state.cards = state.cards.filter(c => c.companyId !== companyId);
        
        if (state.currentCompany === companyId) {
            state.currentCompany = 'all';
        }
        saveToHistory();
        saveState();
        renderCompanies();
        renderCards();
        updateCardCount();
        updateTrashIcon();
    }
}

function duplicateCompany(companyId) {
    const company = state.companies.find(c => c.id === companyId);
    if (!company) return;
    
    // 새 기업 생성
    const newCompanyId = generateId();
    const newCompany = {
        id: newCompanyId,
        name: company.name + ' (복사본)'
    };
    state.companies.push(newCompany);
    
    // 원본 기업의 카드들을 복제
    // 폴더는 전역적으로 공유되므로, 같은 폴더 ID를 사용 (새 폴더 생성하지 않음)
    const originalCards = state.cards.filter(c => c.companyId === companyId);
    originalCards.forEach(originalCard => {
        const newCardId = generateId();
        const newCard = {
            id: newCardId,
            companyId: newCompanyId,
            folderId: originalCard.folderId, // 원본과 같은 폴더 사용
            question: originalCard.question,
            answer: originalCard.answer,
            pinned: originalCard.pinned,
            order: originalCard.order
        };
        state.cards.push(newCard);
    });
    
    saveToHistory();
    saveState();
    renderCompanies();
    renderFolders();
    renderCards();
    updateCardCount();
    
    // 복제된 기업으로 전환
    switchCompany(newCompanyId);
}

// 폴더 관리
function switchFolder(folderId) {
    state.currentFolder = folderId;
    saveState();
    renderFolders();
    renderCards();
    updateCardCount();
}

function addFolder() {
    const newId = generateId();
    // 현재 기업에 따라 폴더 companyId 설정
    // 'all'이면 모든 기업에 표시, 특정 기업이면 그 기업에만 표시
    const newFolder = { 
        id: newId, 
        name: '',
        companyId: state.currentCompany // 'all' 또는 특정 기업 ID
    };
    state.folders.push(newFolder);
    saveToHistory();
    saveState();
    renderFolders();
    editFolder(newId);
}

function editFolder(folderId) {
    const folder = state.folders.find(f => f.id === folderId);
    if (!folder) return;
    
    const btn = document.querySelector(`[data-folder="${folderId}"]`);
    if (!btn) return;
    
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'inline-edit';
    input.value = folder.name;
    input.style.width = Math.max(80, Math.min((folder.name || '').length * 12, 300)) + 'px';
    input.placeholder = '폴더명';
    input.spellcheck = false;
    
    const originalText = btn.textContent;
    btn.textContent = '';
    btn.appendChild(input);
    input.focus();
    input.select();
    
    const finishEdit = () => {
        // 앞뒤 공백만 제거하고, 중간의 띄어쓰기는 유지
        const newName = input.value.trim();
        if (newName) {
            folder.name = input.value.trim();
            saveToHistory();
            saveState();
        } else {
            // 빈 값이면 원래 이름 유지
            // 새 폴더이고 원래 이름이 없었던 경우는 삭제
            if (!folder.name) {
                deleteFolder(folderId);
                return;
            }
            // 원래 이름이 있던 경우는 원래 이름 유지
        }
        
        // 편집 상태 종료: renderFolders 호출하여 버튼을 다시 렌더링
        renderFolders();
    };
    
    const cancelEdit = () => {
        // 취소 시 원래 텍스트로 복원
        if (!folder.name) {
            // 원래 이름이 없었던 경우 (새 폴더)는 삭제
            deleteFolder(folderId);
        } else {
            renderFolders();
        }
    };
    
    // 편집 상태 플래그 및 cleanup 상태 플래그
    let isEditing = true;
    let cleanupDone = false;
    
    // 이벤트 핸들러 정의
    let handleKeydown, handleBlur, handleOutsideClick;
    
    // cleanup 함수: 모든 이벤트 리스너 제거 및 상태 초기화
    const cleanup = () => {
        if (cleanupDone) return;
        cleanupDone = true;
        isEditing = false;
        
        // keydown 이벤트 리스너 제거
        if (handleKeydown) {
            input.removeEventListener('keydown', handleKeydown, true);
        }
        // blur 이벤트 리스너 제거
        if (handleBlur) {
            input.removeEventListener('blur', handleBlur);
        }
        // document의 mousedown 리스너 제거
        if (handleOutsideClick) {
            document.removeEventListener('mousedown', handleOutsideClick, true);
        }
    };
    
    // 완료 상태 플래그 (중복 처리 방지)
    let isFinishing = false;
    
    // blur 이벤트 핸들러: 포커스가 벗어나면 저장
    handleBlur = () => {
        // 이미 처리 중이거나 완료된 경우 무시
        if (!isEditing || cleanupDone || isFinishing) return;
        
        isFinishing = true;
        // cleanup을 먼저 호출하여 이벤트 리스너 제거
        cleanup();
        
        // 저장 처리 (renderFolders 호출로 편집 상태 종료)
        finishEdit();
    };
    
    // 외부 클릭 핸들러: 외부 클릭 시 저장 및 편집 종료
    handleOutsideClick = (e) => {
        if (!isEditing || cleanupDone || isFinishing) return;
        
        // input 필드 자체나 그 내부를 클릭한 경우는 저장하지 않음
        // (편집 중에는 입력 필드를 다시 클릭해도 계속 수정할 수 있어야 함)
        if (input.contains(e.target) || e.target === input) {
            // 입력 필드 내부 클릭은 무시 (저장하지 않음)
            return;
        }
        
        // input 필드 외부를 클릭한 경우: 저장 및 편집 종료
        isFinishing = true;
        
        // cleanup을 먼저 호출하여 이벤트 리스너 제거 (blur 이벤트 발생 방지)
        cleanup();
        
        // 저장 처리 (finishEdit에서 renderFolders 호출로 편집 상태 종료)
        finishEdit();
    };
    
    // Enter/ESC 키 처리 - 캡처 단계에서 먼저 처리하여 다른 이벤트보다 우선
    handleKeydown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            cleanup();
            finishEdit();
            return false;
        } else if (e.key === 'Escape') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            cleanup();
            cancelEdit();
            return false;
        } else if (e.key === ' ') {
            // 스페이스바 입력 시 버튼의 클릭 이벤트가 발생하지 않도록 방지
            // 스페이스바는 입력 필드에 공백을 입력하는 용도로만 사용
            e.stopPropagation();
            // preventDefault는 하지 않음 (공백 입력을 허용)
        }
        // 다른 키는 그냥 입력만 허용
    };
    
    // keydown 이벤트를 캡처 단계에서 먼저 처리
    input.addEventListener('keydown', handleKeydown, true);
    
    // 입력 필드 클릭 시 버튼의 click 이벤트가 발생하지 않도록 방지
    // (이렇게 하면 입력 필드를 클릭해도 switchFolder가 호출되지 않음)
    input.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        // 입력 필드 클릭은 저장하지 않음 (계속 편집 가능)
    });
    
    input.addEventListener('click', (e) => {
        e.stopPropagation();
        // 입력 필드 클릭은 저장하지 않음 (계속 편집 가능)
    });
    
    // blur 이벤트 리스너 추가: 포커스가 벗어나면 저장
    input.addEventListener('blur', handleBlur);
    
    // document에 mousedown 리스너 추가 (캡처 단계에서 먼저 처리)
    // 약간의 지연을 주어 input이 먼저 렌더링되도록 함
    setTimeout(() => {
        document.addEventListener('mousedown', handleOutsideClick, true);
    }, 50);
    
    input.addEventListener('input', () => {
        // 띄어쓰기를 포함한 텍스트 길이에 따라 너비 조정
        // 충분한 여유 공간을 확보하여 띄어쓰기가 잘 보이도록 함
        const textWidth = input.value.length * 12; // 문자당 12px로 여유 있게 계산
        input.style.width = Math.max(80, Math.min(textWidth, 300)) + 'px';
    });
}

function deleteFolder(folderId) {
    if (confirm('폴더를 삭제하시겠습니까? 폴더 안의 모든 카드가 휴지통으로 이동됩니다.')) {
        // 폴더에 속한 카드들을 휴지통으로 이동
        const cardsToDelete = state.cards.filter(card => card.folderId === folderId);
        state.deletedCards.push(...cardsToDelete);
        
        // 폴더 삭제 및 카드 제거
        state.folders = state.folders.filter(f => f.id !== folderId);
        state.cards = state.cards.filter(card => card.folderId !== folderId);
        
        if (state.currentFolder === folderId) {
            state.currentFolder = 'all';
        }
        saveToHistory();
        saveState();
        renderFolders();
        renderCards();
        updateCardCount();
        updateTrashIcon();
    }
}

// 카드 관리
function addCard() {
    const newId = generateId();
    const maxOrder = state.cards.length > 0 
        ? Math.max(...state.cards.map(c => c.order || 0))
        : -1;
    const newCard = {
        id: newId,
        companyId: state.currentCompany === 'all' ? state.companies[0]?.id || 'company1' : state.currentCompany,
        folderId: state.currentFolder,
        question: '',
        answer: '',
        pinned: false,
        order: maxOrder + 1
    };
    state.cards.push(newCard);
    saveToHistory();
    saveState();
    renderCards();
    updateCardCount();
    
    // 질문 영역에 포커스
    setTimeout(() => {
        const cardEl = document.querySelector(`[data-card-id="${newId}"]`);
        if (cardEl) {
            const questionEl = cardEl.querySelector('.card-question');
            questionEl.focus();
        }
    }, 100);
}

function deleteSelectedCards() {
    if (state.selectedCards.size === 0) return;
    
    if (confirm(`${state.selectedCards.size}개의 카드를 삭제하시겠습니까?`)) {
        // 삭제할 카드들을 휴지통으로 이동
        const cardsToDelete = state.cards.filter(c => state.selectedCards.has(c.id));
        state.deletedCards.push(...cardsToDelete);
        
        // cards에서 삭제
        state.cards = state.cards.filter(c => !state.selectedCards.has(c.id));
        state.selectedCards.clear();
        saveToHistory();
        saveState();
        renderCards();
        updateCardCount();
        updateTrashIcon();
    }
}

function handleCardClick(e, cardId) {
    // 카드 클릭 플래그 설정 (document 레벨 클릭 핸들러에서 사용)
    e.cardClicked = true;
    
    if (e.shiftKey) {
        // 범위 선택
        const cardIds = Array.from(document.querySelectorAll('.card')).map(c => c.dataset.cardId);
        const currentIndex = cardIds.indexOf(cardId);
        const lastSelected = Array.from(state.selectedCards).pop();
        const lastIndex = lastSelected ? cardIds.indexOf(lastSelected) : -1;
        
        if (lastIndex >= 0) {
            const start = Math.min(currentIndex, lastIndex);
            const end = Math.max(currentIndex, lastIndex);
            for (let i = start; i <= end; i++) {
                state.selectedCards.add(cardIds[i]);
            }
        } else {
            state.selectedCards.add(cardId);
        }
    } else if (e.ctrlKey || e.metaKey) {
        // 개별 토글
        if (state.selectedCards.has(cardId)) {
            state.selectedCards.delete(cardId);
        } else {
            state.selectedCards.add(cardId);
        }
    } else {
        // 일반 클릭: 이미 선택된 카드를 다시 클릭하면 선택 해제
        if (state.selectedCards.has(cardId)) {
            // 선택된 카드를 다시 클릭한 경우
            if (state.selectedCards.size === 1) {
                // 단일 선택 상태면 모두 해제
                state.selectedCards.clear();
            } else {
                // 다중 선택 상태면 해당 카드만 해제
                state.selectedCards.delete(cardId);
            }
        } else {
            // 선택되지 않은 카드를 클릭한 경우: 기존 선택 해제하고 새로 선택
            state.selectedCards.clear();
            state.selectedCards.add(cardId);
        }
    }
    
    renderCards();
}

function toggleCardPin(cardId) {
    const card = state.cards.find(c => c.id === cardId);
    if (card) {
        card.pinned = !card.pinned;
        saveToHistory();
        saveState();
        renderCards();
    }
}

function moveCardToFolder(cardIds) {
    // cardIds가 배열이 아니면 단일 카드로 처리
    const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
    if (ids.length === 0) return;
    
    const modal = document.getElementById('moveFolderModal');
    const list = document.getElementById('moveFolderList');
    list.innerHTML = '';
    
    // 전체 옵션
    const allItem = document.createElement('div');
    allItem.className = 'folder-item';
    allItem.textContent = '전체';
    allItem.addEventListener('click', () => {
        ids.forEach(cardId => {
            const card = state.cards.find(c => c.id === cardId);
            if (card) {
                card.folderId = 'all';
            }
        });
        saveToHistory();
        saveState();
        renderCards();
        updateCardCount();
        modal.classList.remove('show');
    });
    list.appendChild(allItem);
    
    // 폴더 옵션 (현재 기업에 표시되는 폴더만)
    const visibleFolders = state.folders.filter(folder => {
        return folder.companyId === 'all' || folder.companyId === state.currentCompany;
    });
    
    visibleFolders.forEach(folder => {
        const item = document.createElement('div');
        item.className = 'folder-item';
        item.textContent = folder.name;
        item.addEventListener('click', () => {
            ids.forEach(cardId => {
                const card = state.cards.find(c => c.id === cardId);
                if (card) {
                    card.folderId = folder.id;
                }
            });
            saveToHistory();
            saveState();
            renderCards();
            updateCardCount();
            modal.classList.remove('show');
        });
        list.appendChild(item);
    });
    
    modal.classList.add('show');
}

function copyCardToCompany(cardIds) {
    // cardIds가 배열이 아니면 단일 카드로 처리
    const ids = Array.isArray(cardIds) ? cardIds : [cardIds];
    if (ids.length === 0) return;
    
    // 첫 번째 카드의 기업 ID 확인 (모든 카드가 같은 기업에 있는지 확인)
    const firstCard = state.cards.find(c => c.id === ids[0]);
    if (!firstCard) return;
    
    const modal = document.getElementById('copyCompanyModal');
    const list = document.getElementById('copyCompanyList');
    list.innerHTML = '';
    
    state.companies.forEach(company => {
        if (company.id === firstCard.companyId) return; // 같은 기업은 제외
        
        const item = document.createElement('div');
        item.className = 'company-item';
        item.textContent = company.name;
        item.addEventListener('click', () => {
            const maxOrder = state.cards.length > 0 
                ? Math.max(...state.cards.map(c => c.order || 0))
                : -1;
            
            // 모든 선택된 카드를 복사
            ids.forEach((cardId, index) => {
                const card = state.cards.find(c => c.id === cardId);
                if (card) {
                    const newId = generateId();
                    const newCard = {
                        ...card,
                        id: newId,
                        companyId: company.id,
                        order: maxOrder + 1 + index
                    };
                    state.cards.push(newCard);
                }
            });
            
            saveToHistory();
            saveState();
            renderCards();
            updateCardCount();
            modal.classList.remove('show');
        });
        list.appendChild(item);
    });
    
    modal.classList.add('show');
}

// 드래그 앤 드롭 (새로 구현)
let draggedCards = new Set(); // 선택된 카드들의 ID 집합
let draggedCardElements = []; // 드래그 중인 카드 요소들
let dropTargetIndex = null; // 드롭될 위치 인덱스
let dragPreviewElements = []; // 드래그 미리보기 요소들 (마우스를 따라 움직임)
let isDragging = false; // 드래그 중인지 여부
let dragOffsetX = 0; // 드래그 시작 시 마우스 오프셋 X
let dragOffsetY = 0; // 드래그 시작 시 마우스 오프셋 Y
let originalCardPositions = new Map(); // 카드들의 원래 위치 저장
let currentDropTarget = null; // 현재 드롭 타겟 카드 요소

// 드래그 미리보기 요소 생성 (마우스를 따라 움직일 요소)
function createDragPreview(cardElement) {
    const preview = cardElement.cloneNode(true);
    preview.classList.add('drag-preview');
    preview.style.position = 'fixed';
    preview.style.pointerEvents = 'none';
    preview.style.zIndex = '10000';
    preview.style.opacity = '0.9';
    preview.style.transform = 'rotate(0deg)';
    preview.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
    document.body.appendChild(preview);
    return preview;
}

// 드래그 중 카드 위치 업데이트 (근처 카드들이 실시간으로 위치 조정)
function updateCardPositions(insertIndex) {
    const grid = document.getElementById('cardsGrid');
    const allCards = Array.from(document.querySelectorAll('.card:not(.dragging)'));
    
    if (allCards.length === 0) return;
    
    // 현재 필터링된 카드 목록 가져오기
    let filteredCards = state.cards.filter(c => {
        const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
        const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
        return companyMatch && folderMatch;
    });
    
    filteredCards.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return (a.order || 0) - (b.order || 0);
    });
    
    // 선택된 카드들의 원래 인덱스
    const selectedIndices = Array.from(draggedCards).map(id => {
        const c = filteredCards.find(card => card.id === id);
        return c ? filteredCards.indexOf(c) : -1;
    }).filter(idx => idx >= 0).sort((a, b) => a - b);
    
    if (selectedIndices.length === 0) return;
    
    const minSelectedIndex = Math.min(...selectedIndices);
    const maxSelectedIndex = Math.max(...selectedIndices);
    
    // insertIndex 조정 (선택된 카드들을 제외한 인덱스)
    // insertIndex는 선택된 카드들을 포함한 전체 배열 기준 인덱스
    // adjustedInsertIndex는 선택된 카드들이 제거된 후의 인덱스
    let adjustedInsertIndex = insertIndex;
    if (insertIndex > minSelectedIndex && insertIndex <= maxSelectedIndex + 1) {
        // 선택된 카드 범위 내로 드롭하려는 경우, 선택된 카드들 앞으로 이동
        adjustedInsertIndex = minSelectedIndex;
    } else if (insertIndex > maxSelectedIndex) {
        // 선택된 카드들보다 뒤로 드롭하려는 경우, 선택된 카드 개수만큼 빼기
        adjustedInsertIndex = insertIndex - selectedIndices.length;
    }
    
    // 모든 카드의 원래 위치 저장 (한 번만)
    allCards.forEach((card, index) => {
        if (!originalCardPositions.has(card)) {
            const rect = card.getBoundingClientRect();
            originalCardPositions.set(card, {
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
                index: index
            });
        }
    });
    
    // DOM 카드와 필터링된 카드 데이터 매칭
    const cardToDataIndex = new Map();
    allCards.forEach((cardEl, domIndex) => {
        const cardId = cardEl.dataset.cardId;
        const dataIndex = filteredCards.findIndex(c => c.id === cardId);
        if (dataIndex >= 0) {
            cardToDataIndex.set(cardEl, dataIndex);
        }
    });
    
    // 각 카드의 새 위치 계산
    // 드래그 중인 카드가 들어갈 위치를 기준으로 다른 카드들이 이동해야 함
    allCards.forEach((card, domIndex) => {
        const originalPos = originalCardPositions.get(card);
        if (!originalPos) return;
        
        const dataIndex = cardToDataIndex.get(card);
        if (dataIndex === undefined) return;
        
        // 선택된 카드 범위 내의 카드는 이동하지 않음 (드래그 중이므로)
        if (dataIndex >= minSelectedIndex && dataIndex <= maxSelectedIndex) {
            card.style.transform = '';
            card.style.transition = '';
            return;
        }
        
        // 새 위치 계산
        // 드래그 중인 카드가 원래 위치에서 제거되고, adjustedInsertIndex 위치로 이동
        // 예: 1 2 3 4에서 2를 4 자리로 드래그하면
        // - 2가 원래 위치(1)에서 제거됨
        // - 3, 4가 왼쪽으로 이동 (인덱스 2->1, 3->2)
        // - 2는 4 자리(인덱스 3)로 이동 중
        
        let newDataIndex = dataIndex;
        
        if (dataIndex < minSelectedIndex) {
            // 선택된 카드들보다 위에 있는 카드
            // adjustedInsertIndex가 현재 카드보다 뒤에 있으면 그대로 유지
            // adjustedInsertIndex가 현재 카드보다 앞에 있으면 선택된 카드 개수만큼 오른쪽으로 이동
            if (adjustedInsertIndex <= dataIndex) {
                newDataIndex = dataIndex + selectedIndices.length;
            }
        } else if (dataIndex > maxSelectedIndex) {
            // 선택된 카드들보다 아래에 있는 카드
            // adjustedInsertIndex가 현재 카드보다 앞에 있으면 그대로 유지
            // adjustedInsertIndex가 현재 카드보다 뒤에 있으면 선택된 카드 개수만큼 왼쪽으로 이동
            // adjustedInsertIndex는 선택된 카드들이 제거된 후의 인덱스이므로,
            // 원래 배열 기준으로는 adjustedInsertIndex + selectedIndices.length 위치
            const originalInsertIndex = adjustedInsertIndex < minSelectedIndex 
                ? adjustedInsertIndex 
                : adjustedInsertIndex + selectedIndices.length;
            
            if (originalInsertIndex <= dataIndex) {
                newDataIndex = dataIndex - selectedIndices.length;
            }
        }
        
        // 새 위치에 해당하는 DOM 카드 찾기
        // newDataIndex는 선택된 카드들이 제거된 후의 배열 기준 인덱스
        // 실제 filteredCards 배열에서 찾을 때는 선택된 카드들을 고려해야 함
        if (newDataIndex !== dataIndex) {
            let targetCardData = null;
            
            if (newDataIndex < minSelectedIndex) {
                // 선택된 카드들보다 위에 있는 위치
                targetCardData = filteredCards[newDataIndex];
            } else {
                // 선택된 카드들보다 아래에 있는 위치
                // 선택된 카드 개수만큼 인덱스 조정하여 실제 배열에서 찾기
                const actualIndex = newDataIndex + selectedIndices.length;
                if (actualIndex >= 0 && actualIndex < filteredCards.length) {
                    targetCardData = filteredCards[actualIndex];
                }
            }
            
            if (targetCardData) {
                const targetCardEl = allCards.find(c => c.dataset.cardId === targetCardData.id);
                const targetPos = targetCardEl ? originalCardPositions.get(targetCardEl) : null;
                
                if (targetPos) {
                    const translateY = targetPos.top - originalPos.top;
                    if (Math.abs(translateY) > 1) {
                        card.style.transition = 'transform 0.2s ease';
                        card.style.transform = `translateY(${translateY}px)`;
                    } else {
                        card.style.transform = '';
                        card.style.transition = '';
                    }
                } else {
                    card.style.transform = '';
                    card.style.transition = '';
                }
            } else {
                card.style.transform = '';
                card.style.transition = '';
            }
        } else {
            // 원래 위치로
            card.style.transform = '';
            card.style.transition = '';
        }
    });
}

function setupDragAndDrop() {
    const cards = document.querySelectorAll('.card');
    const grid = document.getElementById('cardsGrid');
    
    cards.forEach(card => {
        const cardId = card.dataset.cardId;
        const isSelected = state.selectedCards.has(cardId);
        
        // 선택된 카드만 드래그 가능하도록 설정
        if (isSelected && state.selectedCards.size > 0) {
            card.draggable = true;
        } else {
            card.draggable = false;
        }
        
        // mousedown 이벤트로 드래그 시작 감지
        let dragStartX = 0;
        let dragStartY = 0;
        let isMouseDown = false;
        let hasMoved = false;
        
        const handleMouseDown = (e) => {
            // 선택된 카드가 아니면 무시
            if (!state.selectedCards.has(cardId)) return;
            
            // 텍스트 선택이 있으면 드래그 막음
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                return;
            }
            
            // 왼쪽 마우스 버튼만 처리
            if (e.button !== 0) return;
            
            isMouseDown = true;
            hasMoved = false;
            dragStartX = e.clientX;
            dragStartY = e.clientY;
            
            // mousemove 이벤트로 드래그 시작 감지
            const handleMouseMove = (e) => {
                if (!isMouseDown) return;
                
                const deltaX = Math.abs(e.clientX - dragStartX);
                const deltaY = Math.abs(e.clientY - dragStartY);
                
                // 일정 거리 이상 이동하면 드래그 시작
                if (deltaX > 5 || deltaY > 5) {
                    hasMoved = true;
                    isMouseDown = false;
                    
                    // 드래그 시작
                    startDrag(e, card);
                    
                    // 이벤트 리스너 제거
                    document.removeEventListener('mousemove', handleMouseMove);
                    document.removeEventListener('mouseup', handleMouseUp);
                }
            };
            
            const handleMouseUp = () => {
                isMouseDown = false;
                document.removeEventListener('mousemove', handleMouseMove);
                document.removeEventListener('mouseup', handleMouseUp);
            };
            
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        };
        
        // 드래그 시작 함수
        const startDrag = (e, sourceCard) => {
            // 드래그 상태 초기화
            isDragging = true;
            draggedCards = new Set(state.selectedCards);
            draggedCardElements = Array.from(document.querySelectorAll('.card.selected'));
            dragPreviewElements = [];
            originalCardPositions.clear();
            
            // 드래그 시작 시 마우스 오프셋 계산
            const rect = sourceCard.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // 모든 선택된 카드에 dragging 클래스 추가 및 미리보기 생성
            draggedCardElements.forEach((el, index) => {
                el.classList.add('dragging');
                el.style.opacity = '0.5';
                
                // 드래그 미리보기 생성 (마우스를 따라 움직일 요소)
                const preview = createDragPreview(el);
                const cardRect = el.getBoundingClientRect();
                preview.style.left = (e.clientX - dragOffsetX) + 'px';
                preview.style.top = (e.clientY - dragOffsetY + index * (cardRect.height + 20)) + 'px';
                preview.style.width = cardRect.width + 'px';
                dragPreviewElements.push(preview);
            });
            
            // mousemove로 미리보기 업데이트 및 드롭 위치 계산
            const handleDragMove = (e) => {
                if (!isDragging) return;
                
                // 미리보기 위치 업데이트
                draggedCardElements.forEach((el, index) => {
                    const preview = dragPreviewElements[index];
                    if (preview) {
                        const cardRect = el.getBoundingClientRect();
                        preview.style.left = (e.clientX - dragOffsetX) + 'px';
                        preview.style.top = (e.clientY - dragOffsetY + index * (cardRect.height + 20)) + 'px';
                    }
                });
                
                // 드롭 위치 계산 (dragover와 동일한 로직)
                const elementBelow = document.elementFromPoint(e.clientX, e.clientY);
                const targetCard = elementBelow?.closest('.card:not(.dragging)');
                
                // 이전 타겟 카드의 점선 테두리 제거
                if (currentDropTarget && currentDropTarget !== targetCard) {
                    currentDropTarget.classList.remove('drop-target');
                    currentDropTarget = null;
                }
                
                if (targetCard && !draggedCards.has(targetCard.dataset.cardId)) {
                    // 새 타겟 카드에 점선 테두리 추가
                    if (currentDropTarget !== targetCard) {
                        targetCard.classList.add('drop-target');
                        currentDropTarget = targetCard;
                    }
                    
                    // 현재 필터링된 카드 목록 가져오기
                    let filteredCards = state.cards.filter(c => {
                        const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                        const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                        return companyMatch && folderMatch;
                    });
                    
                    filteredCards.sort((a, b) => {
                        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                        return (a.order || 0) - (b.order || 0);
                    });
                    
                    const targetCardData = filteredCards.find(c => c.id === targetCard.dataset.cardId);
                    if (targetCardData) {
                        const targetIndex = filteredCards.indexOf(targetCardData);
                        
                        // 선택된 카드들의 원래 인덱스
                        const selectedIndices = Array.from(draggedCards).map(id => {
                            const c = filteredCards.find(card => card.id === id);
                            return c ? filteredCards.indexOf(c) : -1;
                        }).filter(idx => idx >= 0).sort((a, b) => a - b);
                        
                        let insertIndex;
                        if (selectedIndices.length > 0) {
                            const minSelectedIndex = Math.min(...selectedIndices);
                            const maxSelectedIndex = Math.max(...selectedIndices);
                            
                            // 앞에서 뒤로 갈 때: 타겟 카드 뒤에 드롭
                            // 뒤에서 앞으로 갈 때: 타겟 카드 위치에 드롭
                            if (maxSelectedIndex < targetIndex) {
                                // 앞에서 뒤로: 타겟 뒤에 (타겟 인덱스 + 1)
                                insertIndex = targetIndex + 1;
                            } else if (minSelectedIndex > targetIndex) {
                                // 뒤에서 앞으로: 타겟 위치에
                                insertIndex = targetIndex;
                            } else {
                                // 선택된 카드 범위 내: 타겟 위치에
                                insertIndex = targetIndex;
                            }
                        } else {
                            insertIndex = targetIndex;
                        }
                        
                        dropTargetIndex = insertIndex;
                        updateCardPositions(insertIndex);
                    }
                } else {
                    // 그리드 영역에 드롭 (타겟 카드가 없을 때)
                    if (currentDropTarget) {
                        currentDropTarget.classList.remove('drop-target');
                        currentDropTarget = null;
                    }
                    const allCards = Array.from(document.querySelectorAll('.card:not(.dragging)'));
                    dropTargetIndex = allCards.length;
                    updateCardPositions(dropTargetIndex);
                }
            };
            
            // mouseup으로 드롭 처리
            const handleDragEnd = (e) => {
                if (!isDragging) return;
                
                isDragging = false;
                
                // 점선 테두리 제거
                if (currentDropTarget) {
                    currentDropTarget.classList.remove('drop-target');
                    currentDropTarget = null;
                }
                
                // 드롭 처리
                if (dropTargetIndex !== null && draggedCards.size > 0) {
                    // 현재 필터링된 카드 목록 가져오기
                    let filteredCards = state.cards.filter(c => {
                        const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                        const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                        return companyMatch && folderMatch;
                    });
                    
                    filteredCards.sort((a, b) => {
                        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                        return (a.order || 0) - (b.order || 0);
                    });
                    
                    // 선택된 카드들 찾기
                    const selectedCards = filteredCards.filter(c => draggedCards.has(c.id));
                    if (selectedCards.length > 0) {
                        // 선택된 카드들의 원래 인덱스
                        const selectedIndices = selectedCards.map(c => filteredCards.indexOf(c)).sort((a, b) => a - b);
                        const minSelectedIndex = Math.min(...selectedIndices);
                        const maxSelectedIndex = Math.max(...selectedIndices);
                        
                        // 선택된 카드들을 배열에서 제거
                        selectedCards.forEach(c => {
                            const index = filteredCards.indexOf(c);
                            if (index >= 0) filteredCards.splice(index, 1);
                        });
                        
                        // dropTargetIndex 조정
                        // dropTargetIndex는 선택된 카드들을 포함한 전체 배열 기준 인덱스
                        // 선택된 카드들을 제거한 후의 인덱스로 조정해야 함
                        let adjustedInsertIndex = dropTargetIndex;
                        
                        if (maxSelectedIndex < dropTargetIndex) {
                            // 앞에서 뒤로: 선택된 카드들보다 뒤에 드롭
                            // dropTargetIndex가 선택된 카드들보다 뒤에 있으므로, 선택된 카드 개수만큼 빼기
                            adjustedInsertIndex = dropTargetIndex - selectedCards.length;
                        } else if (minSelectedIndex > dropTargetIndex) {
                            // 뒤에서 앞으로: 선택된 카드들보다 앞에 드롭
                            // dropTargetIndex가 선택된 카드들보다 앞에 있으므로, 그대로 유지
                            adjustedInsertIndex = dropTargetIndex;
                        } else {
                            // 선택된 카드 범위 내에 드롭: 선택된 카드들 앞으로
                            adjustedInsertIndex = minSelectedIndex;
                        }
                        
                        adjustedInsertIndex = Math.max(0, Math.min(adjustedInsertIndex, filteredCards.length));
                        
                        // 새 위치에 삽입
                        filteredCards.splice(adjustedInsertIndex, 0, ...selectedCards);
                        
                        // 필터링되지 않은 카드들
                        const nonFilteredCards = state.cards.filter(c => {
                            const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                            const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                            return !(companyMatch && folderMatch);
                        });
                        
                        // 필터링된 카드들의 order 업데이트
                        filteredCards.forEach((c, i) => {
                            c.order = i;
                        });
                        
                        // state.cards 재정렬
                        const maxOrder = Math.max(...filteredCards.map(c => c.order || 0), -1);
                        nonFilteredCards.forEach((c, i) => {
                            c.order = maxOrder + 1 + i;
                        });
                        
                        state.cards.sort((a, b) => {
                            return (a.order || 0) - (b.order || 0);
                        });
                        
                        saveToHistory();
                        saveState();
                        renderCards();
                    }
                }
                
                // 드래그 미리보기 제거
                dragPreviewElements.forEach(preview => {
                    if (preview && preview.parentNode) {
                        preview.remove();
                    }
                });
                dragPreviewElements = [];
                
                // 모든 드래그 중인 카드 복원
                draggedCardElements.forEach(el => {
                    el.classList.remove('dragging');
                    el.style.opacity = '';
                    el.style.pointerEvents = '';
                    el.style.transform = '';
                    el.style.transition = '';
                });
                
                // 모든 카드의 변환 효과 제거
                document.querySelectorAll('.card').forEach(c => {
                    c.style.transform = '';
                    c.style.transition = '';
                    c.style.zIndex = '';
                });
                
                // 원래 위치 정보 초기화
                originalCardPositions.clear();
                
                draggedCards.clear();
                draggedCardElements = [];
                dropTargetIndex = null;
                
                // 이벤트 리스너 제거
                document.removeEventListener('mousemove', handleDragMove);
                document.removeEventListener('mouseup', handleDragEnd);
            };
            
            document.addEventListener('mousemove', handleDragMove);
            document.addEventListener('mouseup', handleDragEnd);
        };
        
        // mousedown 이벤트 추가 (카드 전체)
        card.addEventListener('mousedown', handleMouseDown);
        
        // HTML5 drag 이벤트도 처리 (백업용)
        const handleDragStart = (e) => {
            // 선택된 카드가 아니면 드래그 막음
            if (!state.selectedCards.has(cardId)) {
                e.preventDefault();
                return;
            }
            
            // 이미 mousedown으로 시작했으면 무시
            if (isDragging) return;
            
            // 텍스트 선택이 있으면 드래그 막음
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                e.preventDefault();
                e.stopPropagation();
                return;
            }
            
            // 드래그 상태 초기화
            isDragging = true;
            draggedCards = new Set(state.selectedCards);
            draggedCardElements = Array.from(document.querySelectorAll('.card.selected'));
            dragPreviewElements = [];
            originalCardPositions.clear();
            
            // 드래그 시작 시 마우스 오프셋 계산
            const rect = card.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            
            // 모든 선택된 카드에 dragging 클래스 추가 및 미리보기 생성
            draggedCardElements.forEach((el, index) => {
                el.classList.add('dragging');
                el.style.opacity = '0.5';
                
                // 드래그 미리보기 생성 (마우스를 따라 움직일 요소)
                const preview = createDragPreview(el);
                const cardRect = el.getBoundingClientRect();
                preview.style.left = (e.clientX - dragOffsetX) + 'px';
                preview.style.top = (e.clientY - dragOffsetY + index * (cardRect.height + 20)) + 'px';
                preview.style.width = cardRect.width + 'px';
                dragPreviewElements.push(preview);
            });
            
            // 드래그 이미지 숨기기 (커스텀 미리보기 사용)
            const dragImage = document.createElement('div');
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-1000px';
            dragImage.style.width = '1px';
            dragImage.style.height = '1px';
            document.body.appendChild(dragImage);
            e.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => dragImage.remove(), 0);
            
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', '');
        };
        
        // HTML5 드래그 이벤트 처리
        card.addEventListener('dragstart', handleDragStart);
        
        // 드래그 종료
        const handleDragEnd = () => {
            isDragging = false;
            
            // 드래그 미리보기 제거
            dragPreviewElements.forEach(preview => {
                if (preview && preview.parentNode) {
                    preview.remove();
                }
            });
            dragPreviewElements = [];
            
            // 모든 드래그 중인 카드 복원
            draggedCardElements.forEach(el => {
                el.classList.remove('dragging');
                el.style.opacity = '';
                el.style.pointerEvents = '';
                el.style.transform = '';
                el.style.transition = '';
            });
            
            // 모든 카드의 변환 효과 제거 및 원래 위치로 복원
            document.querySelectorAll('.card').forEach(c => {
                c.style.transform = '';
                c.style.transition = '';
                c.style.zIndex = '';
            });
            
            // 원래 위치 정보 초기화
            originalCardPositions.clear();
            
            draggedCards.clear();
            draggedCardElements = [];
            dropTargetIndex = null;
        };
        
        // 카드 전체에만 dragend 이벤트 추가
        card.addEventListener('dragend', handleDragEnd);
        
        // 드래그 오버
        card.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'move';
            
            // 드래그 미리보기 위치 업데이트 (마우스를 따라 움직임)
            if (isDragging && dragPreviewElements.length > 0) {
                draggedCardElements.forEach((el, index) => {
                    const preview = dragPreviewElements[index];
                    if (preview) {
                        const cardRect = el.getBoundingClientRect();
                        preview.style.left = (e.clientX - dragOffsetX) + 'px';
                        preview.style.top = (e.clientY - dragOffsetY + index * (cardRect.height + 20)) + 'px';
                    }
                });
            }
            
            // 선택된 카드 중 하나인지 확인
            if (draggedCards.has(card.dataset.cardId)) return;
            
            // 현재 필터링된 카드 목록 가져오기
            let filteredCards = state.cards.filter(c => {
                const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                return companyMatch && folderMatch;
            });
            
            filteredCards.sort((a, b) => {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                return (a.order || 0) - (b.order || 0);
            });
            
            // 현재 카드의 인덱스 찾기
            const targetCard = filteredCards.find(c => c.id === card.dataset.cardId);
            if (!targetCard) return;
            
            const targetIndex = filteredCards.indexOf(targetCard);
            
            // 선택된 카드들의 인덱스
            const selectedIndices = Array.from(draggedCards).map(id => {
                const c = filteredCards.find(card => card.id === id);
                return c ? filteredCards.indexOf(c) : -1;
            }).filter(idx => idx >= 0).sort((a, b) => a - b);
            
            if (selectedIndices.length === 0) return;
            
            // 드롭 위치 결정 (카드의 중앙을 기준으로 위/아래 결정)
            const rect = card.getBoundingClientRect();
            const mouseY = e.clientY;
            const cardMiddleY = rect.top + rect.height / 2;
            
            let insertIndex;
            if (mouseY < cardMiddleY) {
                // 카드 위에 삽입
                insertIndex = targetIndex;
            } else {
                // 카드 아래에 삽입
                insertIndex = targetIndex + 1;
            }
            
            dropTargetIndex = insertIndex;
            
            // 근처 카드들의 위치 실시간 업데이트
            updateCardPositions(insertIndex);
        });
        
        // 드래그 리브
        card.addEventListener('dragleave', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX;
            const y = e.clientY;
            
            if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
                // 카드 영역 밖으로 나간 경우
            }
        });
        
        // 드롭
        card.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            if (draggedCards.size === 0 || dropTargetIndex === null) return;
            
            // 현재 필터링된 카드 목록 가져오기
            let filteredCards = state.cards.filter(c => {
                const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                return companyMatch && folderMatch;
            });
            
            filteredCards.sort((a, b) => {
                if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                return (a.order || 0) - (b.order || 0);
            });
            
            // 선택된 카드들 찾기
            const selectedCards = filteredCards.filter(c => draggedCards.has(c.id));
            if (selectedCards.length === 0) return;
            
            // 선택된 카드들의 원래 인덱스
            const selectedIndices = selectedCards.map(c => filteredCards.indexOf(c)).sort((a, b) => a - b);
            const minSelectedIndex = Math.min(...selectedIndices);
            const maxSelectedIndex = Math.max(...selectedIndices);
            
            // 선택된 카드들을 배열에서 제거
            selectedCards.forEach(c => {
                const index = filteredCards.indexOf(c);
                if (index >= 0) filteredCards.splice(index, 1);
            });
            
            // dropTargetIndex 조정 (제거된 카드들 고려)
            let adjustedInsertIndex = dropTargetIndex;
            if (dropTargetIndex > minSelectedIndex) {
                adjustedInsertIndex = dropTargetIndex - selectedCards.length;
            }
            adjustedInsertIndex = Math.max(0, Math.min(adjustedInsertIndex, filteredCards.length));
            
            // 새 위치에 삽입
            filteredCards.splice(adjustedInsertIndex, 0, ...selectedCards);
            
            // 필터링되지 않은 카드들
            const nonFilteredCards = state.cards.filter(c => {
                const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                return !(companyMatch && folderMatch);
            });
            
            // 필터링된 카드들의 order 업데이트
            filteredCards.forEach((c, i) => {
                c.order = i;
            });
            
            // state.cards 재정렬
            const maxOrder = Math.max(...filteredCards.map(c => c.order || 0), -1);
            nonFilteredCards.forEach((c, i) => {
                c.order = maxOrder + 1 + i;
            });
            
            state.cards.sort((a, b) => {
                return (a.order || 0) - (b.order || 0);
            });
            
            saveToHistory();
            saveState();
            renderCards();
        });
    });
    
    // 그리드에 드롭 (빈 공간)
    if (grid) {
        grid.addEventListener('dragover', (e) => {
            // 그리드 영역이거나 카드가 아닌 곳에 드래그 오버
            if (e.target === grid || (!e.target.closest('.card') && e.target !== grid)) {
                e.preventDefault();
                e.stopPropagation();
                e.dataTransfer.dropEffect = 'move';
                
                // 드래그 미리보기 위치 업데이트
                if (isDragging && dragPreviewElements.length > 0) {
                    draggedCardElements.forEach((el, index) => {
                        const preview = dragPreviewElements[index];
                        if (preview) {
                            const cardRect = el.getBoundingClientRect();
                            preview.style.left = (e.clientX - dragOffsetX) + 'px';
                            preview.style.top = (e.clientY - dragOffsetY + index * (cardRect.height + 20)) + 'px';
                        }
                    });
                }
                
                // 마지막 위치에 삽입
                const allCards = Array.from(document.querySelectorAll('.card:not(.dragging)'));
                const insertIndex = allCards.length;
                
                dropTargetIndex = insertIndex;
                updateCardPositions(insertIndex);
            }
        });
        
        grid.addEventListener('drop', (e) => {
            if (e.target === grid || e.target.classList.contains('drag-placeholder')) {
                e.preventDefault();
                e.stopPropagation();
                
                if (draggedCards.size === 0 || dropTargetIndex === null) return;
                
                // 현재 필터링된 카드 목록 가져오기
                let filteredCards = state.cards.filter(c => {
                    const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                    const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                    return companyMatch && folderMatch;
                });
                
                filteredCards.sort((a, b) => {
                    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
                    return (a.order || 0) - (b.order || 0);
                });
                
                const selectedCards = filteredCards.filter(c => draggedCards.has(c.id));
                if (selectedCards.length === 0) return;
                
                const selectedIndices = selectedCards.map(c => filteredCards.indexOf(c)).sort((a, b) => a - b);
                const minSelectedIndex = Math.min(...selectedIndices);
                
                selectedCards.forEach(c => {
                    const index = filteredCards.indexOf(c);
                    if (index >= 0) filteredCards.splice(index, 1);
                });
                
                let adjustedInsertIndex = dropTargetIndex;
                if (dropTargetIndex > minSelectedIndex) {
                    adjustedInsertIndex = dropTargetIndex - selectedCards.length;
                }
                adjustedInsertIndex = Math.max(0, Math.min(adjustedInsertIndex, filteredCards.length));
                
                filteredCards.splice(adjustedInsertIndex, 0, ...selectedCards);
                
                const nonFilteredCards = state.cards.filter(c => {
                    const companyMatch = state.currentCompany === 'all' || c.companyId === state.currentCompany;
                    const folderMatch = state.currentFolder === 'all' || c.folderId === state.currentFolder;
                    return !(companyMatch && folderMatch);
                });
                
                filteredCards.forEach((c, i) => {
                    c.order = i;
                });
                
                const maxOrder = Math.max(...filteredCards.map(c => c.order || 0), -1);
                nonFilteredCards.forEach((c, i) => {
                    c.order = maxOrder + 1 + i;
                });
                
                state.cards.sort((a, b) => {
                    return (a.order || 0) - (b.order || 0);
                });
                
                saveToHistory();
                saveState();
                renderCards();
            }
        });
    }
}

// 정렬
function changeSortMode() {
    const dropdown = document.getElementById('sortDropdown');
    const newMode = dropdown.value;
    
    // 모드 전환 시 고정 상태는 유지 (랜덤/가나다순 모드에서는 표시만 안 함)
    // 고정 상태를 실제로 변경하지 않음
    
    state.sortMode = newMode;
    saveState();
    renderCards();
}

// 질문만 보기 버튼 상태 업데이트
function updateQuestionsOnlyButton() {
    const btn = document.getElementById('questionsOnlyBtn');
    if (!btn) return;
    if (state.questionsOnly) {
        btn.style.background = '#2d5016';
        btn.style.color = 'white';
    } else {
        btn.style.background = 'white';
        btn.style.color = '#333';
    }
}

// 내보내기
function exportCards() {
    // 현재 필터된 카드들 수집
    const filteredCards = state.cards.filter(card => {
        const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
        const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
        return companyMatch && folderMatch;
    });
    
    if (filteredCards.length === 0) {
        alert('내보낼 카드가 없습니다.');
        return;
    }
    
    // 정렬
    let sortedCards = [...filteredCards];
    if (state.sortMode === 'default') {
        sortedCards.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return (a.order || 0) - (b.order || 0);
        });
    } else if (state.sortMode === 'alphabetical') {
        sortedCards.sort((a, b) => {
            const questionA = (a.question || '').trim();
            const questionB = (b.question || '').trim();
            return questionA.localeCompare(questionB, 'ko');
        });
    } else if (state.sortMode === 'random') {
        shuffleArray(sortedCards);
    } else if (state.sortMode === 'length') {
        sortedCards.sort((a, b) => {
            const lengthA = ((a.question || '').length + (a.answer || '').length);
            const lengthB = ((b.question || '').length + (b.answer || '').length);
            return lengthA - lengthB;
        });
    }
    
    // TXT 파일로 내보내기
    let txtContent = '';
    
    if (state.questionsOnly) {
        // 질문만 보기 모드: 질문만 내보내기, 카드 사이 빈 줄 1개
        txtContent = sortedCards.map(card => {
            return (card.question || '').trim();
        }).join('\n\n');
    } else {
        // 일반 모드: 질문과 답변 모두 내보내기, 질문-답변 사이 빈 줄 0개, 카드 사이 빈 줄 1개
        txtContent = sortedCards.map(card => {
            const question = (card.question || '').trim();
            const answer = (card.answer || '').trim();
            return `${question}\n${answer}`;
        }).join('\n\n');
    }
    
    // Blob 생성 및 다운로드
    const blob = new Blob([txtContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    // 파일명 생성 (현재 날짜 포함)
    const dateStr = new Date().toISOString().split('T')[0];
    const companyName = state.currentCompany === 'all' ? '전체' : 
        (state.companies.find(c => c.id === state.currentCompany)?.name || '기업');
    const folderName = state.currentFolder === 'all' ? '전체' : 
        (state.folders.find(f => f.id === state.currentFolder)?.name || '폴더');
    link.download = `면접질문_${companyName}_${folderName}_${dateStr}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast('내보내기가 완료되었습니다.');
}

// 질문만 보기
function toggleQuestionsOnly() {
    state.questionsOnly = !state.questionsOnly;
    saveState();
    renderCards();
    updateQuestionsOnlyButton();
    // 카드 상세보기가 열려있으면 답변 표시 상태도 업데이트
    const modal = document.getElementById('cardDetailModal');
    if (modal.classList.contains('show')) {
        displayCardDetail();
    }
}

// 일괄 추가
function showBatchAddModal() {
    const modal = document.getElementById('batchAddModal');
    const textarea = document.getElementById('batchAddTextarea');
    textarea.value = '';
    modal.classList.add('show');
    textarea.focus();
}

function submitBatchAdd() {
    const textarea = document.getElementById('batchAddTextarea');
    // 줄바꿈으로 분리하고, 빈 줄과 공백만 있는 줄을 모두 제거
    const questions = textarea.value
        .split('\n')
        .map(q => q.trim())
        .filter(q => q.length > 0); // 빈 문자열 제거
    
    if (questions.length === 0) {
        alert('질문을 입력해주세요.');
        return;
    }
    
    const maxOrder = state.cards.length > 0 
        ? Math.max(...state.cards.map(c => c.order || 0))
        : -1;
    
    const companyId = state.currentCompany === 'all' 
        ? state.companies[0]?.id || 'company1' 
        : state.currentCompany;
    
    questions.forEach((question, index) => {
        const newCard = {
            id: generateId(),
            companyId: companyId,
            folderId: state.currentFolder,
            question: question, // 이미 trim() 처리됨
            answer: '',
            pinned: false,
            order: maxOrder + 1 + index
        };
        state.cards.push(newCard);
    });
    
    saveToHistory();
    saveState();
    renderCards();
    updateCardCount();
    
    document.getElementById('batchAddModal').classList.remove('show');
}

// 실전 연습
let practiceState = {
    questions: [],
    currentIndex: 0,
    timer: null,
    startTime: null,
    paused: false,
    pausedTime: 0
};

function showPracticeSettings() {
    const modal = document.getElementById('practiceSettingsModal');
    const modalContent = modal.querySelector('.modal-content');
    const folderCounts = document.getElementById('folderCounts');
    const modeRadios = document.querySelectorAll('input[name="practiceMode"]');
    
    modeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'folder') {
                folderCounts.style.display = 'block';
                renderFolderCounts();
            } else {
                folderCounts.style.display = 'none';
            }
            // 모달 크기 재조정
            setTimeout(() => resizePracticeSettingsModal(), 10);
        });
    });
    
    modal.classList.add('show');
    
    // 모달 크기 조정
    setTimeout(() => resizePracticeSettingsModal(), 10);
}

function resizePracticeSettingsModal() {
    const modal = document.getElementById('practiceSettingsModal');
    const modalContent = modal.querySelector('.modal-content');
    const modalBody = modalContent.querySelector('.modal-body');
    
    if (!modalContent || !modalBody) return;
    
    // 일시적으로 스타일을 리셋하여 실제 크기 측정
    modalContent.style.width = 'auto';
    modalContent.style.height = 'auto';
    
    // 실제 내용의 너비와 높이 측정
    const bodyRect = modalBody.getBoundingClientRect();
    const headerRect = modalContent.querySelector('.modal-header').getBoundingClientRect();
    const footerRect = modalContent.querySelector('.modal-footer').getBoundingClientRect();
    
    // 패딩 고려 (modal-body의 padding 20px * 2 = 40px, modal-header/footer도 고려)
    const headerHeight = headerRect.height;
    const footerHeight = footerRect.height;
    const bodyPadding = 40; // modal-body padding 좌우
    const headerPadding = 40; // modal-header padding 좌우
    const footerPadding = 40; // modal-footer padding 좌우
    
    // 실제 내용 너비 (더 긴 쪽)
    const contentWidth = Math.max(
        bodyRect.width,
        headerRect.width,
        footerRect.width
    );
    
    // 실제 내용 높이
    const contentHeight = headerHeight + bodyRect.height + footerHeight;
    
    // 둘 중 더 긴 쪽을 기준으로 정사각형 크기 결정
    const squareSize = Math.max(contentWidth, contentHeight);
    
    // 최소 크기 제한 (너무 작지 않게)
    const minSize = 250;
    // 최대 크기 제한 (화면 크기의 90%를 넘지 않게)
    const maxSize = Math.min(window.innerWidth * 0.9, window.innerHeight * 0.9);
    
    // 최종 크기 결정
    const finalSize = Math.max(minSize, Math.min(squareSize, maxSize));
    
    // 정사각형 크기 적용
    modalContent.style.width = finalSize + 'px';
    modalContent.style.height = finalSize + 'px';
}

function showToast(message) {
    // 기존 토스트가 있으면 제거
    const existingToast = document.getElementById('toast');
    if (existingToast) {
        existingToast.remove();
    }
    
    // 토스트 메시지 표시
    const toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // 약간의 지연 후 show 클래스 추가 (애니메이션을 위해)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // 3초 후 자동으로 숨김
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 300);
    }, 3000);
}

function renderFolderCounts() {
    const container = document.getElementById('folderCounts');
    container.innerHTML = '';
    
    // 현재 기업에 표시되는 폴더만 필터링
    const visibleFolders = state.folders.filter(folder => {
        return folder.companyId === 'all' || folder.companyId === state.currentCompany;
    });
    
    visibleFolders.forEach(folder => {
        // 해당 폴더의 실제 질문 개수 계산
        const folderCards = state.cards.filter(card => {
            const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
            return companyMatch && card.folderId === folder.id && card.question.trim();
        });
        const maxCount = folderCards.length;
        
        const item = document.createElement('div');
        item.className = 'folder-count-item';
        
        const label = document.createElement('label');
        label.textContent = folder.name + ': ';
        
        const input = document.createElement('input');
        input.type = 'number';
        input.min = '0';
        input.max = maxCount.toString();
        input.value = '0';
        input.dataset.folderId = folder.id;
        input.dataset.maxCount = maxCount.toString();
        
        // 입력 값이 최대값을 넘으면 토스트 알림 표시 및 값 조정
        input.addEventListener('input', (e) => {
            const value = parseInt(e.target.value) || 0;
            const max = parseInt(e.target.dataset.maxCount) || 0;
            
            if (value > max) {
                e.target.value = max;
                showToast(`최대 ${max}개까지만 가능합니다.`);
            } else if (value < 0) {
                e.target.value = 0;
            }
        });
        
        // blur 이벤트에서도 체크 (직접 입력 후 포커스가 벗어날 때)
        input.addEventListener('blur', (e) => {
            const value = parseInt(e.target.value) || 0;
            const max = parseInt(e.target.dataset.maxCount) || 0;
            
            if (value > max) {
                e.target.value = max;
                showToast(`최대 ${max}개까지만 가능합니다.`);
            } else if (value < 0) {
                e.target.value = 0;
            }
        });
        
        label.appendChild(input);
        item.appendChild(label);
        container.appendChild(item);
    });
    
    // 폴더 목록이 업데이트된 후 모달 크기 재조정
    setTimeout(() => resizePracticeSettingsModal(), 10);
}

function startPractice() {
    const mode = document.querySelector('input[name="practiceMode"]:checked').value;
    const modal = document.getElementById('practiceSettingsModal');
    modal.classList.remove('show');
    
    // 질문 수집
    let questions = [];
    
    if (mode === 'random') {
        // 완전 랜덤
        questions = state.cards.filter(card => {
            const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
            const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
            return companyMatch && folderMatch && card.question.trim();
        });
        shuffleArray(questions);
    } else {
        // 폴더별 개수
        const folderCounts = {};
        document.querySelectorAll('#folderCounts input').forEach(input => {
            const count = parseInt(input.value) || 0;
            if (count > 0) {
                folderCounts[input.dataset.folderId] = count;
            }
        });
        
        Object.keys(folderCounts).forEach(folderId => {
            const folderCards = state.cards.filter(card => {
                const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
                return companyMatch && card.folderId === folderId && card.question.trim();
            });
            shuffleArray(folderCards);
            questions.push(...folderCards.slice(0, folderCounts[folderId]));
        });
    }
    
    if (questions.length === 0) {
        alert('연습할 질문이 없습니다.');
        return;
    }
    
    practiceState.questions = questions;
    practiceState.currentIndex = 0;
    practiceState.paused = false;
    practiceState.pausedTime = 0;
    practiceState.startTime = Date.now();
    
    // 일시정지 버튼 아이콘을 일시정지 아이콘으로 초기화
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseImg = pauseBtn.querySelector('img');
    if (pauseImg) {
        pauseImg.src = 'pause-icon.svg';
    }
    
    showPracticeModal();
    startTimer();
    displayPracticeQuestion();
}

function showPracticeModal() {
    const modal = document.getElementById('practiceModal');
    modal.classList.add('show');
}

function displayPracticeQuestion() {
    const questionEl = document.getElementById('practiceQuestion');
    if (practiceState.currentIndex < practiceState.questions.length) {
        const card = practiceState.questions[practiceState.currentIndex];
        questionEl.textContent = card.question;
        if (state.questionsOnly) {
            // 질문만 보기 모드
        }
        // 타이머는 계속 진행 - 리셋하지 않음
    } else {
        // 모든 질문 완료
        if (document.querySelector('input[name="practiceMode"]:checked').value === 'random') {
            // 재섞기
            shuffleArray(practiceState.questions);
            practiceState.currentIndex = 0;
            displayPracticeQuestion();
            // 재섞기 시에도 타이머는 계속 진행
        } else {
            // 종료
            stopTimer();
            alert('모든 질문을 완료했습니다!');
            document.getElementById('practiceModal').classList.remove('show');
        }
    }
}

function startTimer() {
    // 이미 타이머가 실행 중이면 중복 시작하지 않음
    if (practiceState.timer) {
        return;
    }
    
    // startTime이 아직 설정되지 않았을 때만 초기화
    if (!practiceState.startTime) {
        practiceState.startTime = Date.now();
        practiceState.pausedTime = 0;
    } else {
        // startTime이 이미 있으면 pausedTime을 고려하여 조정
        practiceState.startTime = Date.now() - practiceState.pausedTime;
        practiceState.pausedTime = 0;
    }
    
    practiceState.timer = setInterval(() => {
        if (!practiceState.paused) {
            const elapsed = Date.now() - practiceState.startTime;
            const minutes = Math.floor(elapsed / 60000);
            const seconds = Math.floor((elapsed % 60000) / 1000);
            document.getElementById('stopwatch').textContent = 
                String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
        }
    }, 100);
}

function resetTimer() {
    // 타이머 정지
    stopTimer();
    
    // 타이머 상태 초기화
    practiceState.startTime = Date.now();
    practiceState.pausedTime = 0;
    practiceState.paused = false;
    
    // 일시정지 버튼 아이콘을 일시정지 아이콘으로 초기화
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseImg = pauseBtn.querySelector('img');
    if (pauseImg) {
        pauseImg.src = 'pause-icon.svg';
    }
    
    // 화면에 00:00 표시
    document.getElementById('stopwatch').textContent = '00:00';
    
    // 타이머 재시작
    startTimer();
}

function stopTimer() {
    if (practiceState.timer) {
        clearInterval(practiceState.timer);
        practiceState.timer = null;
    }
}

function togglePause() {
    practiceState.paused = !practiceState.paused;
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseImg = pauseBtn.querySelector('img');
    
    if (practiceState.paused) {
        // 일시정지 상태: 재생 아이콘(next-icon.svg)으로 변경
        stopTimer();
        if (practiceState.startTime) {
            practiceState.pausedTime = Date.now() - practiceState.startTime;
        }
        if (pauseImg) {
            pauseImg.src = 'next-icon.svg';
        }
    } else {
        // 재생 상태: 일시정지 아이콘으로 변경
        if (pauseImg) {
            pauseImg.src = 'pause-icon.svg';
        }
        if (practiceState.startTime) {
            practiceState.startTime = Date.now() - practiceState.pausedTime;
            practiceState.pausedTime = 0;
        }
        startTimer();
    }
}

function nextPracticeQuestion() {
    practiceState.currentIndex++;
    
    // 스톱워치 리셋
    practiceState.startTime = Date.now();
    practiceState.pausedTime = 0;
    practiceState.paused = false;
    
    // 일시정지 버튼 아이콘을 일시정지 아이콘으로 설정
    const pauseBtn = document.getElementById('pauseBtn');
    const pauseImg = pauseBtn.querySelector('img');
    if (pauseImg) {
        pauseImg.src = 'pause-icon.svg';
    }
    
    // 스톱워치 표시 리셋
    document.getElementById('stopwatch').textContent = '00:00';
    
    displayPracticeQuestion();
}

// 카드 상세 보기
let detailCardIndex = -1;
let detailCards = [];

function showCardDetail(cardId) {
    // 현재 필터된 카드들 수집
    detailCards = state.cards.filter(card => {
        const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
        const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
        return companyMatch && folderMatch;
    });
    
    // 정렬
    if (state.sortMode === 'default') {
        detailCards.sort((a, b) => {
            if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
            return (a.order || 0) - (b.order || 0);
        });
    } else if (state.sortMode === 'alphabetical') {
        detailCards.sort((a, b) => {
            const questionA = (a.question || '').trim();
            const questionB = (b.question || '').trim();
            return questionA.localeCompare(questionB, 'ko');
        });
    } else if (state.sortMode === 'random') {
        shuffleArray(detailCards);
    } else if (state.sortMode === 'length') {
        detailCards.sort((a, b) => {
            const lengthA = ((a.question || '').length + (a.answer || '').length);
            const lengthB = ((b.question || '').length + (b.answer || '').length);
            return lengthA - lengthB;
        });
    }
    
    detailCardIndex = detailCards.findIndex(c => c.id === cardId);
    if (detailCardIndex === -1) detailCardIndex = 0;
    
    displayCardDetail();
    
    const modal = document.getElementById('cardDetailModal');
    modal.classList.add('show');
    
    // 모달이 열릴 때마다 이벤트 리스너 다시 등록
    setupCardDetailListeners();
    
    // 키보드 이벤트 리스너도 다시 등록
    setupCardDetailKeyboardListeners();
}

function setupCardDetailKeyboardListeners() {
    // 기존 키보드 이벤트 리스너 제거 (중복 방지)
    document.removeEventListener('keydown', handleCardDetailKeyboard);
    
    // 새 키보드 이벤트 리스너 등록
    document.addEventListener('keydown', handleCardDetailKeyboard, true);
}

function handleCardDetailKeyboard(e) {
    const detailModal = document.getElementById('cardDetailModal');
    if (!detailModal || !detailModal.classList.contains('show')) {
        return;
    }
    
    // 다른 모달이 열려있지 않은지 확인
    const otherModals = document.querySelectorAll('.modal.show');
    const isOnlyDetailModal = otherModals.length === 1 && otherModals[0] === detailModal;
    
    if (!isOnlyDetailModal) {
        return;
    }
    
    if (e.key === 'ArrowLeft' || e.key === '<' || e.keyCode === 37) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        prevCardDetail();
        return false;
    } else if (e.key === 'ArrowRight' || e.key === '>' || e.keyCode === 39) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        nextCardDetail();
        return false;
    }
}

function setupCardDetailListeners() {
    // 기존 리스너 제거를 위해 클론 후 재등록
    const closeBtn = document.getElementById('cardDetailClose');
    const prevBtn = document.getElementById('prevCardBtn');
    const nextBtn = document.getElementById('nextCardBtn');
    
    // 기존 이벤트 리스너 제거를 위해 새 요소로 교체
    if (closeBtn) {
        const newCloseBtn = closeBtn.cloneNode(true);
        closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
        newCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            document.getElementById('cardDetailModal').classList.remove('show');
        });
    }
    
    if (prevBtn) {
        const newPrevBtn = prevBtn.cloneNode(true);
        prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
        newPrevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            prevCardDetail();
        });
    }
    
    if (nextBtn) {
        const newNextBtn = nextBtn.cloneNode(true);
        nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);
        newNextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            nextCardDetail();
        });
    }
}

function displayCardDetail() {
    if (detailCardIndex < 0 || detailCardIndex >= detailCards.length) return;
    
    const card = detailCards[detailCardIndex];
    const questionEl = document.getElementById('detailQuestion');
    // 줄바꿈을 포함한 텍스트 표시
    if (card.question) {
        questionEl.innerHTML = (card.question || '(질문 없음)').replace(/\n/g, '<br>');
    } else {
        questionEl.textContent = '(질문 없음)';
    }
    
    const answerEl = document.getElementById('detailAnswer');
    // 답변 내용은 항상 설정 (질문만보기 모드에서도 공간 유지)
    if (card.answer) {
        answerEl.innerHTML = (card.answer || '(답변 없음)').replace(/\n/g, '<br>');
    } else {
        answerEl.textContent = '(답변 없음)';
    }
    
    // 질문만보기 모드일 때는 답변 텍스트만 숨김 (섹션은 유지)
    if (state.questionsOnly) {
        answerEl.style.visibility = 'hidden';
        answerEl.style.opacity = '0';
    } else {
        answerEl.style.visibility = 'visible';
        answerEl.style.opacity = '1';
    }
}

function prevCardDetail() {
    if (detailCardIndex > 0) {
        detailCardIndex--;
        displayCardDetail();
    }
}

function nextCardDetail() {
    if (detailCardIndex < detailCards.length - 1) {
        detailCardIndex++;
        displayCardDetail();
    }
}

// 우클릭 메뉴
let contextMenuTarget = null;
let contextMenuType = null;

function showContextMenu(e, type, id) {
    e.preventDefault(); // 기본 우클릭 메뉴 방지
    e.stopPropagation(); // 이벤트 전파 방지
    
    const menu = document.getElementById('contextMenu');
    menu.innerHTML = '';
    contextMenuTarget = id;
    contextMenuType = type;
    
    if (type === 'company') {
        menu.appendChild(createMenuItem('수정', () => editCompany(id)));
        menu.appendChild(createMenuItem('복제', () => duplicateCompany(id)));
        menu.appendChild(createMenuItem('삭제', () => deleteCompany(id)));
    } else if (type === 'folder') {
        menu.appendChild(createMenuItem('수정', () => editFolder(id)));
        menu.appendChild(createMenuItem('삭제', () => deleteFolder(id)));
    } else if (type === 'card') {
        // 선택된 카드들 확인 (다중 선택 지원)
        const selectedCardIds = state.selectedCards.size > 0 ? Array.from(state.selectedCards) : [id];
        const isMultiple = selectedCardIds.length > 1;
        
        // 보기: 첫 번째 선택된 카드 또는 우클릭한 카드만
        menu.appendChild(createMenuItem('보기', () => showCardDetail(selectedCardIds[0])));
        
        // 고정/해제: 모든 선택된 카드에 적용
        const firstCard = state.cards.find(c => c.id === selectedCardIds[0]);
        const allPinned = selectedCardIds.every(cardId => {
            const card = state.cards.find(c => c.id === cardId);
            return card?.pinned;
        });
        const pinText = allPinned ? '고정 해제' : '고정';
        menu.appendChild(createMenuItem(pinText, () => {
            selectedCardIds.forEach(cardId => toggleCardPin(cardId));
        }));
        
        // 기업 복사: 모든 선택된 카드에 적용
        menu.appendChild(createMenuItem('기업 복사', () => copyCardToCompany(selectedCardIds)));
        
        // 폴더 이동: 모든 선택된 카드에 적용
        menu.appendChild(createMenuItem('폴더 이동', () => moveCardToFolder(selectedCardIds)));
        
        // 삭제: 모든 선택된 카드에 적용
        menu.appendChild(createMenuItem('삭제', () => {
            // 선택된 모든 카드를 휴지통으로 이동
            selectedCardIds.forEach(cardId => {
                const card = state.cards.find(c => c.id === cardId);
                if (card) {
                    state.deletedCards.push(card);
                    state.cards = state.cards.filter(c => c.id !== cardId);
                }
            });
            state.selectedCards.clear();
            saveToHistory();
            saveState();
            renderCards();
            updateCardCount();
            updateTrashIcon();
        }));
    }
    
    // 메뉴 위치 설정 (우클릭한 위치)
    const x = e.clientX; // 뷰포트 기준 X 좌표
    const y = e.clientY; // 뷰포트 기준 Y 좌표
    
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';
    
    // 메뉴가 화면 밖으로 나가지 않도록 조정
    setTimeout(() => {
        const rect = menu.getBoundingClientRect();
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        if (rect.right > windowWidth) {
            menu.style.left = (windowWidth - rect.width - 10) + 'px';
        }
        if (rect.bottom > windowHeight) {
            menu.style.top = (windowHeight - rect.height - 10) + 'px';
        }
        if (rect.left < 0) {
            menu.style.left = '10px';
        }
        if (rect.top < 0) {
            menu.style.top = '10px';
        }
    }, 0);
    
    menu.classList.add('show');
}

function createMenuItem(text, onClick) {
    const item = document.createElement('div');
    item.className = 'context-menu-item';
    item.textContent = text;
    item.addEventListener('click', () => {
        onClick();
        document.getElementById('contextMenu').classList.remove('show');
    });
    return item;
}

// 카드 개수 업데이트
function updateCardCount() {
    const count = state.cards.filter(card => {
        const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
        const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
        return companyMatch && folderMatch;
    }).length;
    document.getElementById('cardCount').textContent = count + '개';
}

// 휴지통 아이콘 업데이트
function updateTrashIcon() {
    const trashBtn = document.getElementById('trashBtn');
    trashBtn.textContent = '휴지통';
}

// 휴지통 모달 표시
function showTrashModal() {
    const modal = document.getElementById('trashModal');
    renderTrashCards();
    modal.classList.add('show');
}

// 휴지통 카드 목록 렌더링
function renderTrashCards() {
    const trashCardList = document.getElementById('trashCardList');
    trashCardList.innerHTML = '';
    
    if (state.deletedCards.length === 0) {
        const emptyMsg = document.createElement('div');
        emptyMsg.textContent = '휴지통이 비어있습니다.';
        emptyMsg.style.textAlign = 'center';
        emptyMsg.style.padding = '40px';
        emptyMsg.style.color = '#999';
        trashCardList.appendChild(emptyMsg);
        return;
    }
    
    state.deletedCards.forEach(card => {
        const cardItem = document.createElement('div');
        cardItem.style.border = '1px solid #e0e0e0';
        cardItem.style.borderRadius = '8px';
        cardItem.style.padding = '16px';
        cardItem.style.backgroundColor = '#f9f9f9';
        cardItem.style.display = 'flex';
        cardItem.style.justifyContent = 'space-between';
        cardItem.style.alignItems = 'flex-start';
        cardItem.style.gap = '16px';
        
        const cardContent = document.createElement('div');
        cardContent.style.flex = '1';
        
        const question = document.createElement('div');
        question.textContent = card.question || '(질문 없음)';
        question.style.fontWeight = '500';
        question.style.marginBottom = '8px';
        question.style.wordBreak = 'keep-all';
        question.style.overflowWrap = 'normal';
        question.style.whiteSpace = 'normal';
        
        const answer = document.createElement('div');
        answer.textContent = card.answer || '(답변 없음)';
        answer.style.color = '#666';
        answer.style.fontSize = '14px';
        answer.style.wordBreak = 'keep-all';
        answer.style.overflowWrap = 'normal';
        answer.style.whiteSpace = 'normal';
        
        cardContent.appendChild(question);
        cardContent.appendChild(answer);
        
        const cardActions = document.createElement('div');
        cardActions.style.display = 'flex';
        cardActions.style.gap = '8px';
        cardActions.style.flexShrink = '0';
        
        const restoreBtn = document.createElement('button');
        restoreBtn.textContent = '복원';
        restoreBtn.className = 'modal-btn';
        restoreBtn.style.padding = '6px 12px';
        restoreBtn.style.fontSize = '14px';
        restoreBtn.addEventListener('click', () => restoreCard(card.id));
        
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '완전 삭제';
        deleteBtn.className = 'modal-btn';
        deleteBtn.style.padding = '6px 12px';
        deleteBtn.style.fontSize = '14px';
        deleteBtn.style.backgroundColor = '#dc3545';
        deleteBtn.addEventListener('click', () => {
            if (confirm('이 카드를 완전히 삭제하시겠습니까? 복원할 수 없습니다.')) {
                permanentlyDeleteCard(card.id);
            }
        });
        
        cardActions.appendChild(restoreBtn);
        cardActions.appendChild(deleteBtn);
        
        cardItem.appendChild(cardContent);
        cardItem.appendChild(cardActions);
        
        trashCardList.appendChild(cardItem);
    });
}

// 카드 복원
function restoreCard(cardId) {
    const card = state.deletedCards.find(c => c.id === cardId);
    if (!card) return;
    
    // 휴지통에서 제거
    state.deletedCards = state.deletedCards.filter(c => c.id !== cardId);
    
    // cards에 복원
    state.cards.push(card);
    
    saveToHistory();
    saveState();
    renderTrashCards();
    renderCards();
    updateCardCount();
    updateTrashIcon();
}

// 카드 완전 삭제
function permanentlyDeleteCard(cardId) {
    state.deletedCards = state.deletedCards.filter(c => c.id !== cardId);
    
    saveToHistory();
    saveState();
    renderTrashCards();
    updateTrashIcon();
    
    if (state.deletedCards.length === 0) {
        // 휴지통이 비어있으면 모달 닫기
        document.getElementById('trashModal').classList.remove('show');
    }
}

// 휴지통 비우기
function emptyTrash() {
    if (state.deletedCards.length === 0) return;
    
    if (confirm(`휴지통에 있는 ${state.deletedCards.length}개의 카드를 모두 완전히 삭제하시겠습니까? 복원할 수 없습니다.`)) {
        state.deletedCards = [];
        
        saveToHistory();
        saveState();
        renderTrashCards();
        updateTrashIcon();
        document.getElementById('trashModal').classList.remove('show');
    }
}

// 폴더 섹션 드래그 스크롤 설정
function setupFolderDragScroll() {
    const folderSection = document.querySelector('.folder-section');
    if (!folderSection) return;
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - folderSection.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절 (2배)
        folderSection.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
        if (isDown) {
            isDown = false;
            folderSection.classList.remove('dragging');
        }
    };
    
    folderSection.addEventListener('mousedown', (e) => {
        // 폴더 버튼이나 추가 버튼, 드롭다운을 클릭한 경우는 드래그 스크롤 방지
        if (e.target.closest('.folder-btn') || 
            e.target.closest('#addFolderBtn') || 
            e.target.closest('#sortDropdown')) {
            return;
        }
        
        isDown = true;
        folderSection.classList.add('dragging');
        startX = e.pageX - folderSection.offsetLeft;
        scrollLeft = folderSection.scrollLeft;
        e.preventDefault();
    });
    
    folderSection.addEventListener('mouseleave', () => {
        if (isDown) {
            isDown = false;
            folderSection.classList.remove('dragging');
        }
    });
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// 기업 탭 드래그 스크롤 설정
function setupCompanyDragScroll() {
    const companyTabs = document.querySelector('.company-tabs');
    if (!companyTabs) return;
    
    // 기존 이벤트 리스너 제거를 위한 플래그
    let isDown = false;
    let startX;
    let scrollLeft;
    
    const handleMouseMove = (e) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - companyTabs.offsetLeft;
        const walk = (x - startX) * 2; // 스크롤 속도 조절 (2배)
        companyTabs.scrollLeft = scrollLeft - walk;
    };
    
    const handleMouseUp = () => {
        if (isDown) {
            isDown = false;
            companyTabs.classList.remove('dragging');
        }
    };
    
    // 기존 이벤트 리스너 제거 후 재등록
    const handleMouseDown = (e) => {
        // 기업 탭 버튼이나 추가 버튼을 클릭한 경우는 드래그 스크롤 방지
        if (e.target.closest('.company-tab') || 
            e.target.closest('#addCompanyBtn') ||
            e.target.closest('.add-company-btn')) {
            return;
        }
        
        isDown = true;
        companyTabs.classList.add('dragging');
        startX = e.pageX - companyTabs.offsetLeft;
        scrollLeft = companyTabs.scrollLeft;
        e.preventDefault();
    };
    
    const handleMouseLeave = () => {
        if (isDown) {
            isDown = false;
            companyTabs.classList.remove('dragging');
        }
    };
    
    // 이벤트 리스너 등록
    companyTabs.addEventListener('mousedown', handleMouseDown);
    companyTabs.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 기업 추가
    document.getElementById('addCompanyBtn').addEventListener('click', addCompany);
    
    // 폴더 추가
    document.getElementById('addFolderBtn').addEventListener('click', addFolder);
    
    // 전체 탭/폴더
    document.querySelector('[data-company="all"]').addEventListener('click', () => switchCompany('all'));
    document.querySelector('[data-folder="all"]').addEventListener('click', () => switchFolder('all'));
    
    // 정렬
    document.getElementById('sortDropdown').addEventListener('change', changeSortMode);
    
    // 카드 추가/삭제
    const addCardBtn = document.getElementById('addCardBtn');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            addCard();
        });
    }
    const deleteCardBtn = document.getElementById('deleteCardBtn');
    if (deleteCardBtn) {
        deleteCardBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            deleteSelectedCards();
        });
    }
    // 휴지통은 setupGlobalEventListeners에서 처리됨
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            undo();
        });
    }
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            redo();
        });
    }
    
    // 휴지통 모달 - trashClose는 setupGlobalEventListeners에서 처리됨
    document.getElementById('trashEmptyBtn').addEventListener('click', emptyTrash);
    
    // 폰트 선택 - fontBtn과 fontClose는 setupGlobalEventListeners에서 처리됨
    
    // 폰트 추가 버튼 (+ 버튼)
    document.addEventListener('click', (e) => {
        if (e.target.id === 'fontAddBtn' || e.target.closest('#fontAddBtn')) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('fontFileInput').click();
        }
    });
    
    // 폰트 파일 선택 시 바로 업로드
    document.getElementById('fontFileInput').addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFontUpload();
        }
    });
    
    // 폰트 옵션 클릭 (이벤트 위임)
    document.getElementById('fontOptionsList').addEventListener('click', (e) => {
        const fontOption = e.target.closest('.font-option');
        if (fontOption && !fontOption.classList.contains('font-add-btn')) {
            const font = fontOption.dataset.font;
            if (font) {
                changeFont(font);
                // 선택된 폰트 표시 업데이트
                document.querySelectorAll('.font-option').forEach(option => {
                    if (option.dataset.font === font) {
                        option.classList.add('selected');
                    } else {
                        option.classList.remove('selected');
                    }
                });
                // 모달은 X 버튼으로만 닫히도록 함
            }
        }
    });
    
    // 폰트 옵션 우클릭 메뉴 (이벤트 위임)
    document.getElementById('fontOptionsList').addEventListener('contextmenu', (e) => {
        const fontOption = e.target.closest('.font-option[data-font-id]');
        if (fontOption && !fontOption.classList.contains('font-add-btn')) {
            e.preventDefault();
            e.stopPropagation();
            const fontId = fontOption.dataset.fontId;
            if (!fontId) return;
            
            const contextMenu = document.getElementById('contextMenu');
            contextMenu.innerHTML = '<div class="context-menu-item" data-action="delete-font">삭제</div>';
            contextMenu.style.left = e.pageX + 'px';
            contextMenu.style.top = e.pageY + 'px';
            contextMenu.classList.add('show');
            
            // 메뉴 항목 클릭 이벤트
            const deleteItem = contextMenu.querySelector('[data-action="delete-font"]');
            const deleteHandler = () => {
                deleteCustomFont(fontId);
                contextMenu.classList.remove('show');
                deleteItem.removeEventListener('click', deleteHandler);
            };
            deleteItem.addEventListener('click', deleteHandler);
            
            // 다른 곳 클릭 시 메뉴 닫기
            const closeMenu = (e) => {
                if (!contextMenu.contains(e.target)) {
                    contextMenu.classList.remove('show');
                    document.removeEventListener('click', closeMenu);
                }
            };
            setTimeout(() => {
                document.addEventListener('click', closeMenu);
            }, 10);
        }
    });
    
    // 질문만 보기, 일괄 추가, 실전 연습은 setupGlobalEventListeners에서 처리됨
    
    // 내보내기
    document.getElementById('exportBtn').addEventListener('click', exportCards);
    // batchAddSubmit과 practiceStartBtn은 setupGlobalEventListeners에서 처리됨
    document.getElementById('batchAddCancel').addEventListener('click', () => {
        document.getElementById('batchAddModal').classList.remove('show');
    });
    // batchAddClose는 setupGlobalEventListeners에서 처리됨
    document.getElementById('practiceSettingsCancel').addEventListener('click', () => {
        document.getElementById('practiceSettingsModal').classList.remove('show');
    });
    
    // 실전 연습 모달 버튼들은 setupGlobalEventListeners에서 처리됨
    
    // 카드 상세 보기 이벤트 리스너는 showCardDetail에서 등록됨
    
    // 폴더 이동 모달
    document.getElementById('moveFolderClose').addEventListener('click', () => {
        document.getElementById('moveFolderModal').classList.remove('show');
    });
    document.getElementById('moveFolderCancel').addEventListener('click', () => {
        document.getElementById('moveFolderModal').classList.remove('show');
    });
    
    // 기업 복사 모달
    document.getElementById('copyCompanyClose').addEventListener('click', () => {
        document.getElementById('copyCompanyModal').classList.remove('show');
    });
    document.getElementById('copyCompanyCancel').addEventListener('click', () => {
        document.getElementById('copyCompanyModal').classList.remove('show');
    });
    
    // 모달 외부 클릭 시 닫기
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            // X 버튼, 모달 내부 요소, 이전/다음 버튼을 클릭한 경우는 무시
            if (e.target.closest('.modal-close') || 
                e.target.closest('.modal-content') || 
                e.target.closest('.detail-nav-btn')) {
                return;
            }
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    });
    
    // 우클릭 메뉴 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
        // 헤더 버튼이나 카드 컨트롤 버튼을 클릭한 경우는 무시
        if (e.target.closest('.header-actions') || 
            e.target.closest('.action-btn') || 
            e.target.closest('.card-controls') || 
            e.target.closest('.card-control-btn')) {
            return;
        }
        document.getElementById('contextMenu').classList.remove('show');
    });
    
    // 빈 공간 클릭 시 선택 해제 - 카드와 X 버튼만 제외
    // setTimeout을 사용하여 카드 클릭 핸들러가 먼저 실행되도록 함
    document.addEventListener('click', (e) => {
        setTimeout(() => {
            // 카드나 카드 내부 요소를 클릭한 경우 무시
            const clickedCard = e.target.closest('.card');
            if (clickedCard) return;
            
            // 삭제 버튼(X)을 클릭한 경우 무시
            if (e.target.id === 'deleteCardBtn' || e.target.closest('#deleteCardBtn')) return;
            
            // 헤더 버튼들을 클릭한 경우 무시
            if (e.target.closest('.header-actions') || e.target.closest('.action-btn')) return;
            
            // 카드 컨트롤 버튼들을 클릭한 경우 무시
            if (e.target.closest('.card-controls') || e.target.closest('.card-control-btn')) return;
            
            // 모달 내부 요소나 모달 버튼을 클릭한 경우 무시
            if (e.target.closest('.modal') || e.target.closest('.detail-nav-btn')) return;
            
            // 선택된 카드가 있으면 선택 해제
            if (state.selectedCards.size > 0) {
                state.selectedCards.clear();
                renderCards();
            }
        }, 10);
    });
    
    // 키보드 단축키
    document.addEventListener('keydown', (e) => {
        // ESC: 모달 닫기
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.show').forEach(modal => {
                modal.classList.remove('show');
            });
            document.getElementById('contextMenu').classList.remove('show');
        }
        
        // Delete: 선택된 카드 삭제 (setupGlobalEventListeners에서 처리됨)
        
        // Ctrl+A: 전체 선택
        if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
            e.preventDefault();
            const filteredCards = state.cards.filter(card => {
                const companyMatch = state.currentCompany === 'all' || card.companyId === state.currentCompany;
                const folderMatch = state.currentFolder === 'all' || card.folderId === state.currentFolder;
                return companyMatch && folderMatch;
            });
            state.selectedCards = new Set(filteredCards.map(c => c.id));
            renderCards();
        }
        
        // 카드 상세 보기에서 < > 키
        const detailModal = document.getElementById('cardDetailModal');
        if (detailModal && detailModal.classList.contains('show')) {
            // 다른 모달이 열려있지 않은지 확인
            const otherModals = document.querySelectorAll('.modal.show');
            const isOnlyDetailModal = otherModals.length === 1 && otherModals[0] === detailModal;
            
            if (isOnlyDetailModal) {
                if (e.key === 'ArrowLeft' || e.key === '<' || e.keyCode === 37) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    prevCardDetail();
                    return false;
                } else if (e.key === 'ArrowRight' || e.key === '>' || e.keyCode === 39) {
                    e.preventDefault();
                    e.stopPropagation();
                    e.stopImmediatePropagation();
                    nextCardDetail();
                    return false;
                }
            }
        }
    });
}

// 폰트 변경
function showFontModal() {
    const modal = document.getElementById('fontModal');
    modal.classList.add('show');
    
    // 커스텀 폰트 목록 렌더링
    renderFontOptions();
    
    // 현재 선택된 폰트 표시
    document.querySelectorAll('.font-option').forEach(option => {
        if (option.dataset.font === state.fontFamily) {
            option.classList.add('selected');
        } else {
            option.classList.remove('selected');
        }
    });
}

function renderFontOptions() {
    const fontOptionsList = document.getElementById('fontOptionsList');
    
    // 기본 폰트만
    const defaultFont = { id: 'default', name: '기본', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif" };
    
    // 기본 폰트 HTML 생성
    let html = `
        <div class="font-option" data-font="${defaultFont.id}">
            <div class="font-preview" style="font-family: ${defaultFont.fontFamily};">${defaultFont.name}</div>
        </div>
    `;
    
    // 커스텀 폰트 HTML 생성
    html += state.customFonts.map(font => `
        <div class="font-option" data-font="${font.id}" data-font-id="${font.id}">
            <div class="font-preview" style="font-family: '${font.fontFamily}', sans-serif;">${font.name}</div>
        </div>
    `).join('');
    
    // + 버튼 추가
    html += `
        <div class="font-option font-add-btn" id="fontAddBtn" style="border: 2px dashed #ddd; display: flex; align-items: center; justify-content: center; cursor: pointer; min-height: 60px;">
            <div style="font-size: 24px; color: #999;">+</div>
        </div>
    `;
    
    fontOptionsList.innerHTML = html;
}

function handleFontUpload() {
    const fileInput = document.getElementById('fontFileInput');
    const file = fileInput.files[0];
    
    if (!file) {
        return;
    }
    
    // 파일 확장자 확인
    const validExtensions = ['.ttf', '.otf', '.woff', '.woff2'];
    const fileName = file.name.toLowerCase();
    const hasValidExtension = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!hasValidExtension) {
        alert('TTF, OTF, WOFF, WOFF2 파일만 업로드 가능합니다.');
        return;
    }
    
    // 파일을 base64로 변환
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64Data = e.target.result;
        const fontName = file.name.replace(/\.[^/.]+$/, ''); // 확장자 제거
        const fontId = 'custom_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const fontFamily = fontName.replace(/[^a-zA-Z0-9가-힣]/g, ''); // 특수문자 제거
        
        // 폰트 객체 생성
        const customFont = {
            id: fontId,
            name: fontName,
            fontFamily: fontFamily,
            data: base64Data,
            mimeType: file.type || 'font/ttf'
        };
        
        // 커스텀 폰트 로드
        loadCustomFont(customFont);
        
        // state에 추가
        state.customFonts.push(customFont);
        saveState();
        
        // 폰트 목록 다시 렌더링
        renderFontOptions();
        
        // 파일 입력 초기화
        fileInput.value = '';
        
        showToast('폰트가 추가되었습니다.');
    };
    
    reader.readAsDataURL(file);
}

function loadCustomFont(font) {
    // 이미 로드된 폰트인지 확인
    if (document.querySelector(`style[data-font-id="${font.id}"]`)) {
        return;
    }
    
    // @font-face 스타일 생성
    const style = document.createElement('style');
    style.setAttribute('data-font-id', font.id);
    
    // MIME 타입에 따라 format 지정
    let format = 'truetype';
    if (font.mimeType) {
        if (font.mimeType.includes('woff2')) format = 'woff2';
        else if (font.mimeType.includes('woff')) format = 'woff';
        else if (font.mimeType.includes('opentype') || font.mimeType.includes('otf')) format = 'opentype';
    } else if (font.data.includes('data:font/woff2')) format = 'woff2';
    else if (font.data.includes('data:font/woff')) format = 'woff';
    else if (font.data.includes('data:font/otf')) format = 'opentype';
    
    style.textContent = `
        @font-face {
            font-family: '${font.fontFamily}';
            src: url('${font.data}') format('${format}');
            font-display: swap;
        }
    `;
    
    document.head.appendChild(style);
}

function deleteCustomFont(fontId) {
    if (!confirm('이 폰트를 삭제하시겠습니까?')) {
        return;
    }
    
    // state에서 제거
    state.customFonts = state.customFonts.filter(font => font.id !== fontId);
    
    // 현재 사용 중인 폰트가 삭제된 폰트면 기본 폰트로 변경
    if (state.fontFamily === fontId) {
        state.fontFamily = 'default';
        applyFont('default');
    }
    
    // 스타일에서 제거
    const style = document.querySelector(`style[data-font-id="${fontId}"]`);
    if (style) {
        style.remove();
    }
    
    saveState();
    renderFontOptions();
    showToast('폰트가 삭제되었습니다.');
}

function changeFont(font) {
    state.fontFamily = font;
    applyFont(font);
    saveState();
}

function applyFont(font) {
    let fontFamily;
    
    if (font.startsWith('custom_')) {
        // 커스텀 폰트
        const customFont = state.customFonts.find(f => f.id === font);
        if (customFont) {
            fontFamily = `'${customFont.fontFamily}', sans-serif`;
        } else {
            fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";
        }
    } else {
        // 기본 폰트만
        fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif";
    }
    
    // CSS 변수를 사용하여 모든 요소에 폰트 적용
    document.documentElement.style.setProperty('--app-font-family', fontFamily);
    
    // body와 html에 직접 적용하여 상속 보장
    document.documentElement.style.fontFamily = fontFamily;
    document.body.style.fontFamily = fontFamily;
    
    // 헤더 요소들에 직접 적용 (상속이 제대로 되지 않는 경우 대비)
    requestAnimationFrame(() => {
        const headerElements = document.querySelectorAll('.header, .header *');
        headerElements.forEach(el => {
            if (el.tagName !== 'SCRIPT' && el.tagName !== 'STYLE') {
                el.style.fontFamily = fontFamily;
            }
        });
    });
}

// 초기화 실행
init();

