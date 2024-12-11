const math = require('mathjs');

// 全局配置
const CONFIG = {
    maxMatrixSize: 10,
    defaultValue: 0,
    roundDecimals: 4,
    animationDuration: 300
};

// 错误消息
const ERROR_MESSAGES = {
    dimensionMismatch: '矩阵维度不匹配',
    notSquare: '只能对方阵进行此操作',
    invalidInput: '输入无效',
    singular: '矩阵是奇异的（不可逆）',
    generic: '操作失败'
};

// 工具函数
const utils = {
    validateDimensions: (rows, cols) => {
        if (rows < 1 || cols < 1 || rows > CONFIG.maxMatrixSize || cols > CONFIG.maxMatrixSize) {
            throw new Error(`矩阵维度必须在 1 到 ${CONFIG.maxMatrixSize} 之间`);
        }
    },
    
    showNotification: (message, type = 'error') => {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // 添加动画效果
        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), CONFIG.animationDuration);
        }, 3000);
    }
};

let matrixA = [];
let matrixB = [];

function createMatrix(rows, cols, containerId) {
    try {
        utils.validateDimensions(rows, cols);
        const container = document.getElementById(containerId);
        container.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
        container.innerHTML = '';
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-cell';
                input.value = CONFIG.defaultValue;
                input.dataset.row = i;
                input.dataset.col = j;
                
                // 添加键盘导航
                input.addEventListener('keydown', (e) => handleMatrixNavigation(e, rows, cols));
                container.appendChild(input);
            }
        }
    } catch (error) {
        utils.showNotification(error.message);
    }
}

function handleMatrixNavigation(event, rows, cols) {
    const input = event.target;
    const currentRow = parseInt(input.dataset.row);
    const currentCol = parseInt(input.dataset.col);
    
    switch (event.key) {
        case 'ArrowRight':
            if (currentCol < cols - 1) {
                input.parentElement.children[currentRow * cols + currentCol + 1].focus();
            }
            break;
        case 'ArrowLeft':
            if (currentCol > 0) {
                input.parentElement.children[currentRow * cols + currentCol - 1].focus();
            }
            break;
        case 'ArrowUp':
            if (currentRow > 0) {
                input.parentElement.children[(currentRow - 1) * cols + currentCol].focus();
            }
            break;
        case 'ArrowDown':
            if (currentRow < rows - 1) {
                input.parentElement.children[(currentRow + 1) * cols + currentCol].focus();
            }
            break;
    }
}

function createMatrixA() {
    const rows = parseInt(document.getElementById('rowsA').value);
    const cols = parseInt(document.getElementById('colsA').value);
    createMatrix(rows, cols, 'matrixA');
}

function createMatrixB() {
    const rows = parseInt(document.getElementById('rowsB').value);
    const cols = parseInt(document.getElementById('colsB').value);
    createMatrix(rows, cols, 'matrixB');
}

function getMatrixValues(containerId) {
    const container = document.getElementById(containerId);
    const inputs = container.getElementsByTagName('input');
    const rows = containerId === 'matrixA' ? 
        parseInt(document.getElementById('rowsA').value) : 
        parseInt(document.getElementById('rowsB').value);
    const cols = containerId === 'matrixA' ? 
        parseInt(document.getElementById('colsA').value) : 
        parseInt(document.getElementById('colsB').value);
    
    const matrix = [];
    let index = 0;
    
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            row.push(parseFloat(inputs[index].value) || 0);
            index++;
        }
        matrix.push(row);
    }
    
    return matrix;
}

function displayResult(result) {
    const container = document.getElementById('result');
    container.innerHTML = '';
    
    if (!Array.isArray(result) || !Array.isArray(result[0])) {
        utils.showNotification(ERROR_MESSAGES.invalidInput);
        return;
    }
    
    try {
        container.style.gridTemplateColumns = `repeat(${result[0].length}, 60px)`;
        
        // 添加渐入动画效果
        container.style.opacity = '0';
        
        for (let i = 0; i < result.length; i++) {
            for (let j = 0; j < result[0].length; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-cell result-cell';
                input.value = math.round(result[i][j], CONFIG.roundDecimals);
                input.readOnly = true;
                container.appendChild(input);
            }
        }
        
        // 触发动画
        setTimeout(() => {
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        }, 50);
    } catch (error) {
        utils.showNotification(ERROR_MESSAGES.generic);
    }
}

// 矩阵操作的错误处理包装器
function matrixOperationWrapper(operation, errorMessage) {
    return (...args) => {
        try {
            return operation(...args);
        } catch (error) {
            utils.showNotification(errorMessage || error.message);
            return null;
        }
    };
}

// 包装现有的矩阵操作函数
const addMatrices = matrixOperationWrapper(
    () => {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.add(matrixA, matrixB);
        displayResult(result);
    },
    ERROR_MESSAGES.dimensionMismatch
);

const subtractMatrices = matrixOperationWrapper(
    () => {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.subtract(matrixA, matrixB);
        displayResult(result);
    },
    ERROR_MESSAGES.dimensionMismatch
);

const multiplyMatrices = matrixOperationWrapper(
    () => {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.multiply(matrixA, matrixB);
        displayResult(result);
    },
    ERROR_MESSAGES.dimensionMismatch
);

function transposeMatrix(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        const result = math.transpose(matrix);
        displayResult(result);
    } catch (error) {
        alert('操作失败！');
    }
}

function calculateDeterminant(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        if (matrix.length !== matrix[0].length) {
            throw new Error('计算行列式需要方阵');
        }
        const result = math.det(matrix);
        displayScalarResult(result, '行列式');
    } catch (error) {
        alert('计算行列式失败：' + error.message);
    }
}

function calculateInverse(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        if (matrix.length !== matrix[0].length) {
            throw new Error('只能计算方阵的逆矩阵');
        }
        const result = math.inv(matrix);
        displayResult(result);
    } catch (error) {
        alert('计算逆矩阵失败：' + error.message);
    }
}

function calculateEigenvalues(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        if (matrix.length !== matrix[0].length) {
            throw new Error('只能计算方阵的特征值');
        }
        const eigs = math.eigs(matrix);
        const eigenvalues = eigs.values;
        displayScalarResult(eigenvalues, '特征值');
    } catch (error) {
        alert('计算特征值失败：' + error.message);
    }
}

function calculateRank(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        const result = math.rank(matrix);
        displayScalarResult(result, '矩阵的秩');
    } catch (error) {
        alert('计算矩阵的秩失败：' + error.message);
    }
}

function calculateLU(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        const { L, U } = math.lup(matrix);
        displayMultipleResults([
            { matrix: L, label: 'L (下三角矩阵)' },
            { matrix: U, label: 'U (上三角矩阵)' }
        ]);
    } catch (error) {
        alert('LU分解失败：' + error.message);
    }
}

function calculateQR(matrixId) {
    try {
        const matrix = getMatrixValues(`matrix${matrixId}`);
        const { Q, R } = math.qr(matrix);
        displayMultipleResults([
            { matrix: Q, label: 'Q (正交矩阵)' },
            { matrix: R, label: 'R (上三角矩阵)' }
        ]);
    } catch (error) {
        alert('QR分解失败：' + error.message);
    }
}

function displayScalarResult(value, label) {
    const container = document.getElementById('result');
    container.innerHTML = `<div class="scalar-result">
        <h4>${label}</h4>
        <p>${Array.isArray(value) ? value.join(', ') : value}</p>
    </div>`;
}

function displayMultipleResults(results) {
    const container = document.getElementById('result');
    container.innerHTML = '';
    
    results.forEach(({ matrix, label }) => {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'matrix-result';
        
        const labelElement = document.createElement('h4');
        labelElement.textContent = label;
        resultDiv.appendChild(labelElement);
        
        const matrixDiv = document.createElement('div');
        matrixDiv.className = 'matrix-grid';
        matrixDiv.style.gridTemplateColumns = `repeat(${matrix[0].length}, 60px)`;
        
        for (let i = 0; i < matrix.length; i++) {
            for (let j = 0; j < matrix[0].length; j++) {
                const input = document.createElement('input');
                input.type = 'number';
                input.className = 'matrix-cell';
                input.value = math.round(matrix[i][j], 4);
                input.readOnly = true;
                matrixDiv.appendChild(input);
            }
        }
        
        resultDiv.appendChild(matrixDiv);
        container.appendChild(resultDiv);
    });
}

// 初始化
window.onload = () => {
    createMatrixA();
    createMatrixB();
    
    // 添加维度输入的验证
    ['rowsA', 'colsA', 'rowsB', 'colsB'].forEach(id => {
        const input = document.getElementById(id);
        input.addEventListener('change', () => {
            const value = parseInt(input.value);
            if (value < 1 || value > CONFIG.maxMatrixSize) {
                input.value = Math.min(Math.max(1, value), CONFIG.maxMatrixSize);
                utils.showNotification(`矩阵维度必须在 1 到 ${CONFIG.maxMatrixSize} 之间`);
            }
        });
    });
}; 