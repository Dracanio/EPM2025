let posterElements = [];
let nextId = 1;

// Format Definitions
const FORMATS = {
    'a4-p': { width: 210, height: 297, name: 'A4 Hochformat' },
    'a4-l': { width: 297, height: 210, name: 'A4 Querformat' },
    'insta-story': { width: 108, height: 192, name: 'Insta Story (9:16)' },
    'insta-post': { width: 200, height: 200, name: 'Insta Post (1:1)' },
    'flyer': { width: 99, height: 210, name: 'Flyer' }
};
let currentFormatKey = 'a4-p';

// Image Library (Hardcoded)
const LIBRARY_IMAGES = [
    'th1.png',
    'th2.jpg',
    'th3.jpg'
];

// DOM Elements
const posterNode = document.getElementById('poster');
const elementListNode = document.getElementById('element-list');
const addTextBtn = document.getElementById('add-text-btn');
const addImageBtn = document.getElementById('add-image-btn');
const addLibraryImageBtn = document.getElementById('add-library-image-btn');
const imageUploadInput = document.getElementById('image-upload');
const printBtn = document.getElementById('print-btn');
const formatSelect = document.getElementById('format-select');
const dynamicPrintStyle = document.getElementById('dynamic-print-style');

const libraryModal = document.getElementById('library-modal');
const closeLibraryBtn = document.getElementById('close-library-btn');
const libraryGrid = document.getElementById('library-grid');


// Initialize
function init() {
    addTextBtn.addEventListener('click', addTextElement);
    addImageBtn.addEventListener('click', () => imageUploadInput.click());
    if (addLibraryImageBtn) {
        addLibraryImageBtn.addEventListener('click', openLibrary);
    }
    imageUploadInput.addEventListener('change', handleImageUpload);
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
    if (formatSelect) {
        formatSelect.addEventListener('change', (e) => setFormat(e.target.value));
        // Set initial format
        setFormat('a4-p');
    }
    
    if (closeLibraryBtn) {
        closeLibraryBtn.addEventListener('click', closeLibrary);
    }
    
    // Close modal on click outside
    window.addEventListener('click', (e) => {
        if (e.target === libraryModal) {
            closeLibrary();
        }
    });
    
    // Ensure modal is hidden initially
    closeLibrary();
    
    // Initial render
    render();
}

function setFormat(key) {
    if (!FORMATS[key]) return;
    currentFormatKey = key;
    const fmt = FORMATS[key];
    
    // Update Poster Dimensions
    posterNode.style.width = `${fmt.width}mm`;
    posterNode.style.height = `${fmt.height}mm`;
    
    // Update Print Style
    dynamicPrintStyle.textContent = `@media print { @page { size: ${fmt.width}mm ${fmt.height}mm; margin: 0; } }`;
}

// Library Functions
function openLibrary() {
    renderLibraryGrid();
    libraryModal.classList.remove('hidden');
    // For BS modal style
    libraryModal.classList.add('show');
    libraryModal.style.display = 'block';
}

function closeLibrary() {
    libraryModal.classList.add('hidden');
    // For BS modal style
    libraryModal.classList.remove('show');
    libraryModal.style.display = 'none';
}

function renderLibraryGrid() {
    libraryGrid.innerHTML = '';
    LIBRARY_IMAGES.forEach(filename => {
        const item = document.createElement('div');
        item.className = 'library-item';
        
        const img = document.createElement('img');
        const src = `assets/library/${filename}`;
        img.src = src;
        img.alt = filename;
        
        item.appendChild(img);
        
        item.onclick = () => {
            addLibraryImage(src);
            closeLibrary();
        };
        
        libraryGrid.appendChild(item);
    });
}

function addLibraryImage(src) {
    const newElement = {
        id: nextId++,
        type: 'image',
        name: 'Bild Element',
        src: src,
        x: 20,
        y: 20,
        width: 150,
        height: 'auto', 
        zIndex: posterElements.length + 1,
        isOpen: true
    };
    posterElements.push(newElement);
    render();
}


// Data Actions
function addTextElement() {
    const newElement = {
        id: nextId++,
        type: 'text',
        name: 'Text Element',
        content: 'Neuer Text',
        x: 10,
        y: 10,
        width: 150,
        
        // Style properties
        color: '#000000',
        fontSize: 24,
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'normal',
        fontStyle: 'normal',
        backgroundColor: 'transparent',
        textAlign: 'left', // New
        lineHeight: 1.2,   // New
        
        zIndex: posterElements.length + 1,
        
        // UI State
        isOpen: true
    };
    posterElements.push(newElement);
    render();
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const newElement = {
            id: nextId++,
            type: 'image',
            name: 'Bild Element',
            src: event.target.result,
            x: 20,
            y: 20,
            width: 150,
            height: 'auto', 
            zIndex: posterElements.length + 1,
            isOpen: true
        };
        posterElements.push(newElement);
        imageUploadInput.value = '';
        render();
    };
    reader.readAsDataURL(file);
}

function updateElement(id, key, value, renderSidebarFlag = true) {
    const element = posterElements.find(el => el.id === id);
    if (element) {
        element[key] = value;
        renderPoster();
        if (renderSidebarFlag) {
            renderSidebar();
        }
    }
}

function removeElement(id) {
    posterElements = posterElements.filter(el => el.id !== id);
    render();
}

function moveElement(id, direction) {
    const index = posterElements.findIndex(el => el.id === id);
    if (index === -1) return;

    if (direction === 'up' && index < posterElements.length - 1) {
        [posterElements[index], posterElements[index + 1]] = [posterElements[index + 1], posterElements[index]];
    } else if (direction === 'down' && index > 0) {
        [posterElements[index], posterElements[index - 1]] = [posterElements[index - 1], posterElements[index]];
    }
    
    render();
}

function toggleElementOpen(id) {
    const element = posterElements.find(el => el.id === id);
    if (element) {
        element.isOpen = !element.isOpen;
        renderSidebar();
    }
}

// Rendering Logic
function render() {
    renderPoster();
    renderSidebar();
}

function renderPoster() {
    posterNode.innerHTML = '';
    
    posterElements.forEach((el, index) => {
        const domEl = document.createElement('div');
        domEl.className = 'poster-element';
        domEl.style.left = `${el.x}mm`;
        domEl.style.top = `${el.y}mm`;
        domEl.style.zIndex = index;
        
        if (el.type === 'text') {
            domEl.textContent = el.content;
            domEl.style.color = el.color;
            domEl.style.fontSize = `${el.fontSize}pt`;
            domEl.style.fontFamily = el.fontFamily;
            domEl.style.fontWeight = el.fontWeight;
            domEl.style.fontStyle = el.fontStyle;
            domEl.style.textAlign = el.textAlign || 'left';
            domEl.style.lineHeight = el.lineHeight || 1.2;
            
            domEl.style.backgroundColor = el.backgroundColor === 'transparent' ? 'transparent' : el.backgroundColor;
            domEl.style.width = `${el.width}mm`;
            
            if (el.backgroundColor && el.backgroundColor !== 'transparent') {
                domEl.style.padding = '5px';
            }
            
        } else if (el.type === 'image') {
            const img = document.createElement('img');
            img.src = el.src;
            domEl.style.width = `${el.width}mm`;
            if (el.height !== 'auto') {
                domEl.style.height = `${el.height}mm`;
            }
            domEl.appendChild(img);
        }
        
        posterNode.appendChild(domEl);
    });
}

function renderSidebar() {
    elementListNode.innerHTML = '';
    
    const reversedElements = [...posterElements].reverse();

    reversedElements.forEach(el => {
        // Card Container
        const card = document.createElement('div');
        card.className = 'card mb-3';
        
        // Header
        const cardHeader = document.createElement('div');
        cardHeader.className = 'card-header d-flex align-items-center justify-content-between py-2';
        cardHeader.style.cursor = 'pointer';
        cardHeader.onclick = () => toggleElementOpen(el.id);

        const headerLeft = document.createElement('div');
        headerLeft.className = 'd-flex align-items-center gap-2 flex-grow-1';
        
        // Icon
        const icon = document.createElement('i');
        icon.className = `bi ${el.type === 'text' ? 'bi-type-text' : 'bi-image'} fs-5`;
        headerLeft.appendChild(icon);

        // Name Input (Editable Name)
        const nameInput = document.createElement('input');
        nameInput.type = 'text';
        nameInput.className = 'form-control form-control-sm border-0 bg-transparent p-0 fw-bold';
        nameInput.value = el.name || (el.type === 'text' ? 'Text Element' : 'Bild Element');
        nameInput.onclick = (e) => e.stopPropagation();
        nameInput.onchange = (e) => updateElement(el.id, 'name', e.target.value, false);
        nameInput.oninput = (e) => {
            updateElement(el.id, 'name', e.target.value, false);
        };
        headerLeft.appendChild(nameInput);
        
        cardHeader.appendChild(headerLeft);

        // Toggle Icon
        const toggleIcon = document.createElement('i');
        toggleIcon.className = `bi ${el.isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`;
        cardHeader.appendChild(toggleIcon);
        
        card.appendChild(cardHeader);

        // Body (Collapsible)
        if (el.isOpen) {
            const cardBody = document.createElement('div');
            cardBody.className = 'card-body p-3';
            
            // X, Y, Width Row
            const dimRow = document.createElement('div');
            dimRow.className = 'row g-2 mb-3';
            dimRow.appendChild(createBSInputCol('X (mm)', el.x, (v) => updateElement(el.id, 'x', v, false)));
            dimRow.appendChild(createBSInputCol('Y (mm)', el.y, (v) => updateElement(el.id, 'y', v, false)));
            dimRow.appendChild(createBSInputCol('Breite', el.width, (v) => updateElement(el.id, 'width', v, false)));
            cardBody.appendChild(dimRow);

            if (el.type === 'text') {
                // Content
                cardBody.appendChild(createBSTextarea('Inhalt', el.content, (v) => updateElement(el.id, 'content', v, false)));
                
                // Font & Size Row
                const fontRow = document.createElement('div');
                fontRow.className = 'row g-2 mb-3';
                
                // Font Family
                const fontOptions = [
                    { value: 'Arial, sans-serif', label: 'Arial' },
                    { value: 'Inter, sans-serif', label: 'Inter' },
                    { value: 'Times New Roman, serif', label: 'Times New Roman' },
                    { value: 'Courier New, monospace', label: 'Courier' },
                    { value: 'Georgia, serif', label: 'Georgia' },
                    { value: 'Verdana, sans-serif', label: 'Verdana' }
                ];
                fontRow.appendChild(createBSSelectCol('Schriftart', fontOptions, el.fontFamily, (v) => updateElement(el.id, 'fontFamily', v, false)));
                
                // Font Size
                fontRow.appendChild(createBSInputCol('Größe (pt)', el.fontSize, (v) => updateElement(el.id, 'fontSize', v, false)));
                cardBody.appendChild(fontRow);

                // Alignment & Line Height Row
                const alignRow = document.createElement('div');
                alignRow.className = 'row g-2 mb-3 align-items-end';
                
                // Alignment
                const alignCol = document.createElement('div');
                alignCol.className = 'col-6';
                alignCol.innerHTML = '<label class="form-label small text-muted">Ausrichtung</label>';
                const btnGroup = document.createElement('div');
                btnGroup.className = 'btn-group w-100 btn-group-sm';
                ['left', 'center', 'right'].forEach(align => {
                    const btn = document.createElement('button');
                    btn.className = `btn btn-outline-secondary ${el.textAlign === align ? 'active' : ''}`;
                    btn.innerHTML = `<i class="bi bi-text-${align}"></i>`;
                    btn.onclick = () => updateElement(el.id, 'textAlign', align, true); // Re-render to update active state
                    btnGroup.appendChild(btn);
                });
                alignCol.appendChild(btnGroup);
                alignRow.appendChild(alignCol);

                // Line Height
                alignRow.appendChild(createBSInputCol('Zeilenhöhe', el.lineHeight || 1.2, (v) => updateElement(el.id, 'lineHeight', v, false), 0.1));
                
                cardBody.appendChild(alignRow);

                // Styles Row (Bold, Italic, Color)
                const styleRow = document.createElement('div');
                styleRow.className = 'd-flex gap-3 mb-3 align-items-center';
                
                // Bold Check
                styleRow.appendChild(createBSCheck('Fett', el.fontWeight === 'bold', (c) => updateElement(el.id, 'fontWeight', c ? 'bold' : 'normal', false)));
                // Italic Check
                styleRow.appendChild(createBSCheck('Kursiv', el.fontStyle === 'italic', (c) => updateElement(el.id, 'fontStyle', c ? 'italic' : 'normal', false)));
                
                cardBody.appendChild(styleRow);

                // Colors
                cardBody.appendChild(createBSColorControl('Schriftfarbe', el.color, (v) => updateElement(el.id, 'color', v, false)));
                
                // Background Color
                cardBody.appendChild(createBSBgColorControl(el.backgroundColor, (v) => updateElement(el.id, 'backgroundColor', v, false)));

            }

            // Footer Actions (Move, Delete)
            const cardFooter = document.createElement('div');
            cardFooter.className = 'mt-3 pt-3 border-top d-flex gap-2 justify-content-end';
            
            const btnGroup = document.createElement('div');
            btnGroup.className = 'btn-group btn-group-sm';
            
            const upBtn = document.createElement('button');
            upBtn.className = 'btn btn-outline-secondary';
            upBtn.innerHTML = '<i class="bi bi-arrow-up"></i>';
            upBtn.title = 'Nach vorne';
            upBtn.onclick = (e) => { e.stopPropagation(); moveElement(el.id, 'up'); };

            const downBtn = document.createElement('button');
            downBtn.className = 'btn btn-outline-secondary';
            downBtn.innerHTML = '<i class="bi bi-arrow-down"></i>';
            downBtn.title = 'Nach hinten';
            downBtn.onclick = (e) => { e.stopPropagation(); moveElement(el.id, 'down'); };
            
            btnGroup.appendChild(upBtn);
            btnGroup.appendChild(downBtn);
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-outline-danger btn-sm';
            deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
            deleteBtn.title = 'Löschen';
            deleteBtn.onclick = (e) => { e.stopPropagation(); removeElement(el.id); };

            cardFooter.appendChild(btnGroup);
            cardFooter.appendChild(deleteBtn);
            
            cardBody.appendChild(cardFooter);
            card.appendChild(cardBody);
        }

        elementListNode.appendChild(card);
    });
}

// Bootstrap UI Helpers
function createBSInputCol(label, value, onChange, step = 1) {
    const col = document.createElement('div');
    col.className = 'col';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label small text-muted mb-1';
    labelEl.textContent = label;
    
    const input = document.createElement('input');
    input.type = 'number';
    input.className = 'form-control form-control-sm';
    input.value = value;
    input.step = step;
    input.oninput = (e) => onChange(parseFloat(e.target.value) || 0);
    
    col.appendChild(labelEl);
    col.appendChild(input);
    return col;
}

function createBSTextarea(label, value, onChange) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label small text-muted mb-1';
    labelEl.textContent = label;
    
    const input = document.createElement('textarea');
    input.className = 'form-control form-control-sm';
    input.rows = 2;
    input.value = value;
    input.oninput = (e) => onChange(e.target.value);
    
    container.appendChild(labelEl);
    container.appendChild(input);
    return container;
}

function createBSSelectCol(label, options, selectedValue, onChange) {
    const col = document.createElement('div');
    col.className = 'col-sm-8'; // Make it wider in the row
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label small text-muted mb-1';
    labelEl.textContent = label;
    
    const select = document.createElement('select');
    select.className = 'form-select form-select-sm';
    
    options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt.value;
        option.textContent = opt.label;
        if (opt.value === selectedValue) option.selected = true;
        select.appendChild(option);
    });
    
    select.onchange = (e) => onChange(e.target.value);
    
    col.appendChild(labelEl);
    col.appendChild(select);
    return col;
}

function createBSCheck(label, checked, onChange) {
    const container = document.createElement('div');
    container.className = 'form-check';
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.className = 'form-check-input';
    input.checked = checked;
    input.onchange = (e) => onChange(e.target.checked);
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-check-label small';
    labelEl.textContent = label;
    labelEl.onclick = () => { input.click(); };
    
    container.appendChild(input);
    container.appendChild(labelEl);
    return container;
}

function createBSColorControl(label, value, onChange) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label small text-muted mb-1';
    labelEl.textContent = label;
    
    const inputGroup = document.createElement('div');
    inputGroup.className = 'input-group input-group-sm';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'form-control form-control-color';
    colorInput.value = value;
    colorInput.oninput = (e) => onChange(e.target.value);
    
    inputGroup.appendChild(colorInput);
    container.appendChild(labelEl);
    container.appendChild(inputGroup);
    
    // Swatches
    const swatches = createBSSwatches((c) => {
        colorInput.value = c;
        onChange(c);
    });
    container.appendChild(swatches);
    
    return container;
}

function createBSBgColorControl(value, onChange) {
    const container = document.createElement('div');
    container.className = 'mb-3';
    
    const header = document.createElement('div');
    header.className = 'd-flex justify-content-between align-items-center mb-1';
    
    const labelEl = document.createElement('label');
    labelEl.className = 'form-label small text-muted mb-0';
    labelEl.textContent = 'Hintergrundfarbe';
    
    // Toggle Switch
    const formCheck = document.createElement('div');
    formCheck.className = 'form-check form-switch';
    const checkInput = document.createElement('input');
    checkInput.className = 'form-check-input';
    checkInput.type = 'checkbox';
    checkInput.checked = value !== 'transparent';
    
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.className = 'form-control form-control-color form-control-sm';
    colorInput.value = value === 'transparent' ? '#ffffff' : value;
    colorInput.disabled = value === 'transparent';
    
    checkInput.onchange = (e) => {
        if (e.target.checked) {
            colorInput.disabled = false;
            onChange(colorInput.value);
        } else {
            colorInput.disabled = true;
            onChange('transparent');
        }
    };
    
    colorInput.oninput = (e) => onChange(e.target.value);
    
    formCheck.appendChild(checkInput);
    header.appendChild(labelEl);
    header.appendChild(formCheck);
    container.appendChild(header);
    
    const inputWrapper = document.createElement('div');
    inputWrapper.appendChild(colorInput);
    container.appendChild(inputWrapper);
    
    // Swatches
    const swatches = createBSSwatches((c) => {
        if (!checkInput.checked) {
            checkInput.checked = true;
            checkInput.dispatchEvent(new Event('change'));
        }
        colorInput.value = c;
        onChange(c);
    });
    container.appendChild(swatches);

    return container;
}

function createBSSwatches(onSelect) {
    const palette = ['#000000', '#CF1820', '#EC6525', '#AF368C']; 
    const container = document.createElement('div');
    container.className = 'd-flex gap-1 mt-2';
    
    palette.forEach(color => {
        const btn = document.createElement('button');
        btn.className = 'btn p-0 border';
        btn.style.width = '20px';
        btn.style.height = '20px';
        btn.style.backgroundColor = color;
        btn.onclick = () => onSelect(color);
        container.appendChild(btn);
    });
    return container;
}

init();
