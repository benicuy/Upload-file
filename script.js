// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const browseBtn = document.getElementById('browseBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const removeFile = document.getElementById('removeFile');
const uploadBtn = document.getElementById('uploadBtn');
const resultCard = document.getElementById('resultCard');
const fileLink = document.getElementById('fileLink');
const copyBtn = document.getElementById('copyBtn');
const previewName = document.getElementById('previewName');
const previewSize = document.getElementById('previewSize');
const downloadLink = document.getElementById('downloadLink');
const newUploadBtn = document.getElementById('newUploadBtn');
const filesList = document.getElementById('filesList');
const fileCount = document.getElementById('fileCount');
const loadingOverlay = document.getElementById('loadingOverlay');
const toast = document.getElementById('toast');
const previewIcon = document.getElementById('previewIcon');

// State
let selectedFile = null;
let uploadedFiles = [];

// Load saved files from localStorage
function loadSavedFiles() {
    const saved = localStorage.getItem('uploadedFiles');
    if (saved) {
        try {
            uploadedFiles = JSON.parse(saved);
            // Filter expired files (24 hours)
            const now = Date.now();
            uploadedFiles = uploadedFiles.filter(file => {
                const expired = now - file.timestamp > 24 * 60 * 60 * 1000;
                if (expired) {
                    // Remove from localStorage
                    localStorage.removeItem(`file_${file.id}`);
                }
                return !expired;
            });
            saveFiles();
            renderFilesList();
        } catch (e) {
            console.error('Error loading files:', e);
            uploadedFiles = [];
        }
    }
}

// Save files to localStorage
function saveFiles() {
    localStorage.setItem('uploadedFiles', JSON.stringify(uploadedFiles));
    updateFileCount();
}

// Update file count
function updateFileCount() {
    fileCount.textContent = uploadedFiles.length;
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Get file icon based on type
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const icons = {
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️',
        'mp4': '🎬', 'mov': '🎬', 'avi': '🎬',
        'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵',
        'pdf': '📕', 'doc': '📘', 'docx': '📘', 'txt': '📄',
        'zip': '🗜️', 'rar': '🗜️', '7z': '🗜️',
        'js': '📁', 'html': '📁', 'css': '📁', 'json': '📁'
    };
    return icons[ext] || '📄';
}

// Render files list
function renderFilesList() {
    if (uploadedFiles.length === 0) {
        filesList.innerHTML = `
            <div class="empty-files">
                <span style="font-size: 3rem;">📭</span>
                <p>Belum ada file yang diupload</p>
            </div>
        `;
        return;
    }

    filesList.innerHTML = uploadedFiles
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(file => {
            const date = new Date(file.timestamp);
            const timeLeft = Math.max(0, 24 - Math.floor((Date.now() - file.timestamp) / (60 * 60 * 1000)));
            
            return `
                <div class="file-item" data-id="${file.id}">
                    <span class="file-item-icon">${file.icon}</span>
                    <div class="file-item-info">
                        <div class="file-item-name">${file.name}</div>
                        <div class="file-item-meta">
                            <span>${file.size}</span>
                            <span>⏰ ${timeLeft} jam lagi</span>
                        </div>
                    </div>
                    <div class="file-item-actions">
                        <button class="file-item-btn copy-item" onclick="copyFileLink('${file.id}')" title="Copy link">
                            📋
                        </button>
                        <button class="file-item-btn delete-item" onclick="deleteFile('${file.id}')" title="Hapus">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        })
        .join('');
}

// Copy file link
window.copyFileLink = function(fileId) {
    const file = uploadedFiles.find(f => f.id === fileId);
    if (file) {
        navigator.clipboard.writeText(file.url).then(() => {
            showToast('Link berhasil disalin!');
        });
    }
};

// Delete file
window.deleteFile = function(fileId) {
    if (confirm('Hapus file ini?')) {
        uploadedFiles = uploadedFiles.filter(f => f.id !== fileId);
        localStorage.removeItem(`file_${fileId}`);
        saveFiles();
        renderFilesList();
        showToast('File berhasil dihapus');
    }
};

// Show toast notification
function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// Handle file selection
function handleFileSelect(file) {
    if (!file) return;

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
        alert('File terlalu besar! Maksimal 50MB');
        return;
    }

    selectedFile = file;
    
    // Update UI
    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.style.display = 'block';
    uploadBtn.disabled = false;
    
    // Preview
    previewName.textContent = file.name;
    previewSize.textContent = formatFileSize(file.size);
    previewIcon.textContent = getFileIcon(file.name);
}

// Handle upload
async function handleUpload() {
    if (!selectedFile) return;

    // Show loading
    loadingOverlay.style.display = 'flex';
    
    // Simulate upload process
    setTimeout(() => {
        // Generate unique ID
        const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2);
        
        // Create file data URL
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileData = e.target.result;
            
            // Save to localStorage
            localStorage.setItem(`file_${fileId}`, fileData);
            
            // Create file object
            const fileObj = {
                id: fileId,
                name: selectedFile.name,
                size: formatFileSize(selectedFile.size),
                type: selectedFile.type,
                timestamp: Date.now(),
                icon: getFileIcon(selectedFile.name),
                url: `#file-${fileId}` // In real app, this would be actual URL
            };
            
            uploadedFiles.push(fileObj);
            saveFiles();
            
            // Update result
            const fileUrl = `${window.location.origin}${window.location.pathname}?file=${fileId}`;
            fileLink.value = fileUrl;
            previewName.textContent = selectedFile.name;
            previewSize.textContent = formatFileSize(selectedFile.size);
            previewIcon.textContent = getFileIcon(selectedFile.name);
            downloadLink.href = fileData;
            downloadLink.download = selectedFile.name;
            
            // Hide loading, show result
            loadingOverlay.style.display = 'none';
            resultCard.style.display = 'block';
            document.querySelector('.upload-card').style.display = 'none';
            
            // Render files list
            renderFilesList();
            
            showToast('Upload berhasil!');
        };
        
        reader.readAsDataURL(selectedFile);
    }, 2000); // Simulate 2 second upload
}

// Event Listeners
browseBtn.addEventListener('click', () => {
    fileInput.click();
});

uploadArea.addEventListener('click', (e) => {
    if (e.target !== browseBtn) {
        fileInput.click();
    }
});

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFileSelect(file);
    }
});

removeFile.addEventListener('click', () => {
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadBtn.disabled = true;
});

uploadBtn.addEventListener('click', handleUpload);

copyBtn.addEventListener('click', () => {
    fileLink.select();
    navigator.clipboard.writeText(fileLink.value).then(() => {
        copyBtn.classList.add('copied');
        copyBtn.innerHTML = '<span class="copy-icon">✓</span><span class="copy-text">Copied!</span>';
        
        setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyBtn.innerHTML = '<span class="copy-icon">📋</span><span class="copy-text">Copy</span>';
        }, 2000);
        
        showToast('Link disalin!');
    });
});

newUploadBtn.addEventListener('click', () => {
    resultCard.style.display = 'none';
    document.querySelector('.upload-card').style.display = 'block';
    selectedFile = null;
    fileInput.value = '';
    fileInfo.style.display = 'none';
    uploadBtn.disabled = true;
});

// Check for shared file in URL
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const fileId = urlParams.get('file');
    
    if (fileId) {
        const fileData = localStorage.getItem(`file_${fileId}`);
        const fileInfo = uploadedFiles.find(f => f.id === fileId);
        
        if (fileData && fileInfo) {
            // Show download page
            document.querySelector('.upload-card').style.display = 'none';
            resultCard.style.display = 'block';
            
            fileLink.value = window.location.href;
            previewName.textContent = fileInfo.name;
            previewSize.textContent = fileInfo.size;
            previewIcon.textContent = fileInfo.icon;
            downloadLink.href = fileData;
            downloadLink.download = fileInfo.name;
        }
    }
    
    // Load saved files
    loadSavedFiles();
});

// Clean up expired files every hour
setInterval(() => {
    const now = Date.now();
    uploadedFiles = uploadedFiles.filter(file => {
        const expired = now - file.timestamp > 24 * 60 * 60 * 1000;
        if (expired) {
            localStorage.removeItem(`file_${file.id}`);
        }
        return !expired;
    });
    saveFiles();
    renderFilesList();
}, 60 * 60 * 1000); // Every hour

// Initialize
loadSavedFiles();
