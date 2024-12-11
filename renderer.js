const math = require('mathjs');

let matrixA = [];
let matrixB = [];

function createMatrix(rows, cols, containerId) {
    const container = document.getElementById(containerId);
    container.style.gridTemplateColumns = `repeat(${cols}, 60px)`;
    container.innerHTML = '';
    
    for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            input.value = '0';
            container.appendChild(input);
        }
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
    container.style.gridTemplateColumns = `repeat(${result[0].length}, 60px)`;
    
    for (let i = 0; i < result.length; i++) {
        for (let j = 0; j < result[0].length; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.className = 'matrix-cell';
            input.value = result[i][j];
            input.readOnly = true;
            container.appendChild(input);
        }
    }
}

function addMatrices() {
    try {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.add(matrixA, matrixB);
        displayResult(result);
    } catch (error) {
        alert('矩阵维度不匹配或输入无效！');
    }
}

function subtractMatrices() {
    try {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.subtract(matrixA, matrixB);
        displayResult(result);
    } catch (error) {
        alert('矩阵维度不匹配或输入无效！');
    }
}

function multiplyMatrices() {
    try {
        const matrixA = getMatrixValues('matrixA');
        const matrixB = getMatrixValues('matrixB');
        const result = math.multiply(matrixA, matrixB);
        displayResult(result);
    } catch (error) {
        alert('矩阵维度不匹配或输入无效！');
    }
}

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

// 初始化时创建默认矩阵
window.onload = () => {
    createMatrixA();
    createMatrixB();
}; 