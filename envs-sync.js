const fs = require('fs');
const path = require('path');

// Configurações
const diretoriosIgnorados = ['node_modules', 'dist', '.git', '.vscode', '.env', '.env.example'];
const padroesParaManter = ['AAAA'];
const diretorioRaiz = path.resolve(process.argv[2] || '.');
const caminhoEnvExample = path.join(diretorioRaiz, '.env.example');

// Regex para encontrar qualquer coisa que iniciar com process env
const regexProcessEnv = /process\.env\.([A-Za-z0-9_]+)/g;

function obterArquivosValidos(diretorioAtual) {
    const arquivosValidos = [];

    const itens = fs.readdirSync(diretorioAtual);

    for (const item of itens) {
        const caminho = path.join(diretorioAtual, item);
        const stat = fs.statSync(caminho);

        if (stat.isDirectory()) {
            if (diretoriosIgnorados.includes(item)) continue;

            arquivosValidos.push(...obterArquivosValidos(caminho));
        }

        if (item.endsWith('.ts') || item.endsWith('.js')) {
            arquivosValidos.push(caminho);
        }
    }

    return arquivosValidos;
}

function obterVariaveisDosArquivos(arquivos) {
    const variaveis = new Set();

    for (const caminho of arquivos) {
        const conteudo = fs.readFileSync(caminho, 'utf-8');

        let match;
        while ((match = regexProcessEnv.exec(conteudo)) !== null) {
            variaveis.add(match[1]);
        }
    }

    return variaveis;
}

function obterVariaveisDoExample() {
    try {
        const conteudo = fs.readFileSync(caminhoEnvExample, 'utf-8');
        return conteudo
            .split('\n')
            .filter(linha => linha.trim() !== '')
            .map(linha => {
                const variavel = linha.split('=')[0].trim();

                return { variavel, linha };
            });
    } catch {
        return [];
    }
}

function deveManter(variavel) {
    return padroesParaManter.some(padrao => variavel.includes(padrao));
}

function sincronizarEnvExample() {
    const arquivos = obterArquivosValidos(diretorioRaiz);
    const variaveisUsadas = obterVariaveisDosArquivos(arquivos);
    const variaveisDoExample = obterVariaveisDoExample();
    const variaveisDoExampleSet = new Set(variaveisDoExample.map(v => v.variavel));

    const novasVariaveis = [...variaveisUsadas].filter(v => !variaveisDoExampleSet.has(v));
    const linhasMantidas = [];

    let temEnvParaRemover = false;

    for (const { variavel, linha } of variaveisDoExample) {
        const isComentario = linha.trim().startsWith('#');

        if (variaveisUsadas.has(variavel) || deveManter(variavel) || isComentario) {
            linhasMantidas.push(linha);
        } else {
            temEnvParaRemover = true;
        }
    }

    if (novasVariaveis.length > 0 || temEnvParaRemover) {
        const novasLinhas = novasVariaveis.map(variavel => `${variavel}=`);

        const novoExample = [
            ...linhasMantidas,
            '',
            `# Variáveis adicionadas automaticamente em ${new Date().toISOString()}`,
            ...novasLinhas
        ].join('\n');

        fs.writeFileSync(caminhoEnvExample, novoExample, 'utf-8');
        
        console.log(`[.env.example] atualizado com ${novasVariaveis.length} nova(s) variável(is).`);
    } else {
        console.log('[.env.example] já está sincronizado.');
    }
}

sincronizarEnvExample();
