// --- 0. 全局配置 ---
// 显式指定 PDF.js Worker 地址
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// --- 1. 状态与元素选择 ---
const state = {
    mode: 'pdf2word',
    files: [],
    isProcessing: false
};

const elements = {
    dropZone: document.getElementById('drop-zone'),
    fileInput: document.getElementById('file-input'),
    fileList: document.getElementById('file-list'),
    fileUl: document.getElementById('file-ul'),
    convertBtn: document.getElementById('convert-btn'),
    downloadBtn: document.getElementById('download-btn'),
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    progressText: document.getElementById('progress-text'),
    progressLabel: document.getElementById('progress-label'),
    errorMsg: document.getElementById('error-msg'),
    limitText: document.getElementById('limit-text'),
    wordContainer: document.getElementById('word-render-container'),
    btns: {
        pdf2img: document.getElementById('btn-pdf2img'),
        pdf2word: document.getElementById('btn-pdf2word'),
        img2pdf: document.getElementById('btn-img2pdf'),
        word2pdf: document.getElementById('btn-word2pdf'),
    }
};

// --- 2. 辅助函数 ---
const readFileAsync = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsArrayBuffer(file);
});

const readFileAsDataURL = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
});

const setupDownloadButton = (blob, filename) => {
    elements.downloadBtn.classList.remove('hidden');
    elements.downloadBtn.textContent = "下载文件";
    elements.downloadBtn.onclick = () => saveAs(blob, filename);
};

const updateProgress = (percent, label = '处理中...') => {
    elements.progressBar.style.width = `${percent}%`;
    elements.progressText.textContent = `${Math.round(percent)}%`;
    elements.progressLabel.textContent = label;
};

// --- 3. UI 逻辑 ---

// 初始化模式
switchMode('pdf2word');

// 暴露给全局 (因为 HTML 里 onclick 调用了 switchMode 和 clearFiles)
window.switchMode = function(mode) {
    state.mode = mode;
    state.files = []; 
    resetUI();
    
    // 更新按钮状态
    Object.keys(elements.btns).forEach(key => {
        const btn = elements.btns[key];
        if (key === mode) {
            btn.classList.add('mode-btn-active');
            btn.classList.remove('bg-white', 'text-slate-600');
        } else {
            btn.classList.remove('mode-btn-active');
            btn.classList.add('bg-white', 'text-slate-600');
        }
    });

    // 更新提示文案和文件类型限制
    if (mode === 'img2pdf') {
        elements.limitText.textContent = "支持 PNG, JPG (可多选)";
        elements.fileInput.accept = "image/png, image/jpeg, image/jpg";
        elements.fileInput.multiple = true;
    } else if (mode === 'word2pdf') {
        elements.limitText.textContent = "支持 Word .docx 文件";
        elements.fileInput.accept = ".docx";
        elements.fileInput.multiple = false;
    } else {
        elements.limitText.textContent = "支持 PDF 文件";
        elements.fileInput.accept = ".pdf";
        elements.fileInput.multiple = false;
    }
}

window.clearFiles = function() {
    state.files = [];
    resetUI();
}

function resetUI() {
    elements.fileUl.innerHTML = '';
    elements.fileList.classList.add('hidden');
    elements.convertBtn.classList.add('hidden');
    elements.downloadBtn.classList.add('hidden');
    elements.progressContainer.classList.add('hidden');
    elements.errorMsg.classList.add('hidden');
    elements.dropZone.classList.remove('hidden');
    elements.wordContainer.innerHTML = '';
    updateProgress(0);
}

function handleFiles(fileList) {
    if (fileList.length === 0) return;
    state.files = Array.from(fileList);
    renderFileList();
    elements.convertBtn.classList.remove('hidden');
    elements.downloadBtn.classList.add('hidden');
    elements.errorMsg.classList.add('hidden');
}

function renderFileList() {
    elements.fileList.classList.remove('hidden');
    elements.fileUl.innerHTML = '';
    state.files.forEach(file => {
        const li = document.createElement('li');
        li.className = "flex items-center justify-between p-3 hover:bg-slate-50";
        li.innerHTML = `
            <div class="flex items-center truncate">
                <span class="ml-2 text-sm font-medium text-slate-900 truncate">${file.name}</span>
            </div>
            <span class="text-xs font-semibold text-brand-600 bg-brand-100 py-1 px-2 rounded">Ready</span>
        `;
        elements.fileUl.appendChild(li);
    });
}

// 事件监听
elements.dropZone.addEventListener('dragover', (e) => { e.preventDefault(); elements.dropZone.classList.add('drag-active'); });
elements.dropZone.addEventListener('dragleave', () => elements.dropZone.classList.remove('drag-active'));
elements.dropZone.addEventListener('drop', (e) => { e.preventDefault(); elements.dropZone.classList.remove('drag-active'); handleFiles(e.dataTransfer.files); });
elements.dropZone.addEventListener('click', () => elements.fileInput.click());
elements.fileInput.addEventListener('change', (e) => { handleFiles(e.target.files); elements.fileInput.value = ''; });

// --- 4. 核心转换逻辑入口 ---

elements.convertBtn.addEventListener('click', async () => {
    if (state.isProcessing || state.files.length === 0) return;
    state.isProcessing = true;
    elements.convertBtn.disabled = true;
    elements.convertBtn.textContent = '处理中...';
    elements.progressContainer.classList.remove('hidden');
    elements.errorMsg.classList.add('hidden');

    try {
        if (state.mode === 'pdf2img') await processPdfToImg();
        else if (state.mode === 'pdf2word') await processPdfToWordSmart(); // V3.0 智能版
        else if (state.mode === 'img2pdf') await processImgToPdf();
        else if (state.mode === 'word2pdf') await processWordToPdf();
    } catch (err) {
        console.error(err);
        elements.errorMsg.innerHTML = `<strong>转换出错:</strong> ${err.message}`;
        elements.errorMsg.classList.remove('hidden');
    } finally {
        state.isProcessing = false;
        elements.convertBtn.disabled = false;
        elements.convertBtn.textContent = '重新转换';
    }
});

// --- 5. 具体转换函数实现 ---

// A. PDF -> Word (智能格式版)
async function processPdfToWordSmart() {
    const file = state.files[0];
    const arrayBuffer = await readFileAsync(file);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const totalPages = pdf.numPages;
    
    // 从全局 docx 对象解构
    const { Document, Packer, Paragraph, TextRun } = docx;
    const sectionsChildren = [];

    const LINE_HEIGHT_TOLERANCE = 5; 
    const PARAGRAPH_BREAK_THRESHOLD = 15;

    for (let i = 1; i <= totalPages; i++) {
        updateProgress((i / totalPages) * 80, `解析排版 第 ${i}/${totalPages} 页`);
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const items = textContent.items.map(item => ({
            str: item.str,
            x: item.transform[4],
            y: item.transform[5],
            height: item.height,
            width: item.width,
            fontName: item.fontName
        }));

        items.sort((a, b) => {
            const yDiff = b.y - a.y;
            if (Math.abs(yDiff) < LINE_HEIGHT_TOLERANCE) return a.x - b.x;
            return yDiff;
        });

        let currentLineY = -1;
        let currentParagraphLines = [];
        let currentLineItems = [];

        const flushLineToParagraph = () => {
            if (currentLineItems.length === 0) return;
            
            let lineStringParts = [];
            let lastX = -1;
            
            currentLineItems.forEach(item => {
                const fontSize = Math.max(16, Math.round(item.height * 1.8)); 
                const isBold = item.fontName.toLowerCase().includes('bold');
                let prefix = "";
                if (lastX !== -1 && (item.x - lastX) > 10) prefix = " ";

                lineStringParts.push(new TextRun({
                    text: prefix + item.str,
                    size: fontSize,
                    bold: isBold,
                    font: "Microsoft YaHei"
                }));
                lastX = item.x + item.width;
            });
            
            currentParagraphLines.push(lineStringParts);
            currentLineItems = [];
        };

        const flushParagraphToDoc = () => {
            if (currentParagraphLines.length === 0) return;

            const combinedRuns = [];
            currentParagraphLines.forEach((lineRuns, index) => {
                combinedRuns.push(...lineRuns);
                if (index < currentParagraphLines.length - 1) {
                    combinedRuns.push(new TextRun({ text: " " }));
                }
            });

            sectionsChildren.push(new Paragraph({
                children: combinedRuns,
                spacing: { after: 200, line: 360 }
            }));

            currentParagraphLines = [];
        };

        items.forEach(item => {
            if (item.str.trim() === '') return;
            if (currentLineY === -1) currentLineY = item.y;

            if (Math.abs(item.y - currentLineY) > LINE_HEIGHT_TOLERANCE) {
                flushLineToParagraph();
                if ((currentLineY - item.y) > PARAGRAPH_BREAK_THRESHOLD) {
                    flushParagraphToDoc();
                }
                currentLineY = item.y;
            }
            currentLineItems.push(item);
        });

        flushLineToParagraph();
        flushParagraphToDoc();

        if (i < totalPages) {
            sectionsChildren.push(new Paragraph({ children: [new TextRun({ text: "", break: 1 })] }));
        }
    }

    updateProgress(90, '正在生成 Word...');
    const doc = new Document({ sections: [{ children: sectionsChildren }] });
    const blob = await Packer.toBlob(doc);
    setupDownloadButton(blob, `${file.name.replace('.pdf', '')}_smart.docx`);
    updateProgress(100, '完成！');
}

// B. Word -> PDF
async function processWordToPdf() {
    const file = state.files[0];
    updateProgress(10, '读取文件...');
    const arrayBuffer = await readFileAsync(file);
    
    updateProgress(30, '解析排版...');
    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
    elements.wordContainer.innerHTML = result.value;
    
    updateProgress(50, '渲染 PDF...');
    const opt = {
        margin: 15, 
        filename: `${file.name.replace('.docx', '')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] } 
    };
    
    // html2pdf save() 返回 Promise
    const worker = html2pdf().set(opt).from(elements.wordContainer).toPdf().get('pdf');
    await worker.save().then(() => {
         updateProgress(100, '完成！');
         elements.downloadBtn.classList.remove('hidden');
         elements.downloadBtn.textContent = "手动下载";
         elements.downloadBtn.onclick = () => html2pdf().set(opt).from(elements.wordContainer).save();
    });
}

// C. PDF -> Image
async function processPdfToImg() {
    const file = state.files[0];
    const arrayBuffer = await readFileAsync(file);
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const zip = new JSZip();
    
    for (let i = 1; i <= pdf.numPages; i++) {
        updateProgress((i / pdf.numPages) * 90, `渲染第 ${i} 页`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: context, viewport: viewport }).promise;
        zip.file(`page-${i}.jpg`, canvas.toDataURL('image/jpeg', 0.8).split(',')[1], {base64: true});
    }
    
    const content = await zip.generateAsync({type:"blob"});
    setupDownloadButton(content, "images.zip");
    updateProgress(100, '完成！');
}

// D. Image -> PDF
async function processImgToPdf() {
    const sorted = state.files.sort((a, b) => a.name.localeCompare(b.name));
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    for (let i = 0; i < sorted.length; i++) {
        updateProgress((i / sorted.length) * 90);
        const data = await readFileAsDataURL(sorted[i]);
        const props = doc.getImageProperties(data);
        const h = (props.height * doc.internal.pageSize.getWidth()) / props.width;
        if (i > 0) doc.addPage();
        doc.addImage(data, 'JPEG', 0, 0, doc.internal.pageSize.getWidth(), h);
    }
    
    setupDownloadButton(doc.output('blob'), "combined.pdf");
    updateProgress(100, '完成！');
}